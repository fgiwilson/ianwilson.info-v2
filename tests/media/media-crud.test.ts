import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';
import { server } from '../setup';
import { renderWithUser, testData, mockAuthSession } from '../utils/test-utils';
import { goto } from '$app/navigation';

// Mock the Prisma client
vi.mock('$lib/server/db.js', () => ({
  prisma: {
    media: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

// Mock the S3 client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn()
  })),
  DeleteObjectCommand: vi.fn()
}));

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: vi.fn(() => ({
    done: vi.fn().mockResolvedValue({ Location: 'https://test-bucket.s3.amazonaws.com/test-image.jpg' })
  }))
}));

// Mock the sharp image processing library
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('test-image-data'))
  }))
}));

describe('Media CRUD Operations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Upload Media', () => {
    it('should upload a new media file', async () => {
      // Mock the server response for media upload
      server.use(
        http.post('/api/media/upload', () => {
          return jsonResponse({ 
            success: true, 
            media: testData.media
          });
        })
      );

      // Create a mock file
      const file = new File(['test file content'], 'test-image.jpg', { type: 'image/jpeg' });
      
      const mockFormData = new FormData();
      mockFormData.append('files', file);
      mockFormData.append('alt', 'Test image');
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.media.filename).toBe('test-image.jpg');
    });

    it('should return error for invalid file type', async () => {
      // Mock the server response for invalid file type
      server.use(
        http.post('/api/media/upload', () => {
          return errorResponse('Invalid file type. Only images are allowed.', 400);
        })
      );

      // Create a mock file with invalid type
      const file = new File(['test file content'], 'test-document.pdf', { type: 'application/pdf' });
      
      const mockFormData = new FormData();
      mockFormData.append('files', file);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid file type');
    });
  });

  describe('Get Media', () => {
    it('should fetch all media files', async () => {
      // Mock the server response for fetching media
      server.use(
        http.get('/api/media', () => {
          return jsonResponse({ media: [testData.media] });
        })
      );

      const response = await fetch('/api/media');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.media).toHaveLength(1);
      expect(data.media[0].filename).toBe('test-image.jpg');
    });

    it('should fetch a single media file by id', async () => {
      // Mock the server response for fetching a single media file
      server.use(
        http.get('/api/media/test-media-id', () => {
          return jsonResponse({ media: testData.media });
        })
      );

      const response = await fetch('/api/media/test-media-id');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.media.id).toBe('test-media-id');
    });

    it('should return 404 for non-existent media', async () => {
      // Mock the server response for non-existent media
      server.use(
        http.get('/api/media/non-existent', () => {
          return HttpResponse.json({ message: 'Media not found' }, { status: 404 });
        })
      );

      const response = await fetch('/api/media/non-existent');
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.message).toBe('Media not found');
    });
  });

  describe('Update Media', () => {
    it('should update media metadata', async () => {
      const updatedMedia = {
        ...testData.media,
        alt: 'Updated alt text'
      };
      
      // Mock the server response for updating media
      server.use(
        http.put('/api/media/test-media-id', () => {
          return jsonResponse({ 
              success: true, 
              media: updatedMedia
            });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('alt', 'Updated alt text');
      
      const response = await fetch('/api/media/test-media-id', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.media.alt).toBe('Updated alt text');
    });
  });

  describe('Delete Media', () => {
    it('should delete a media file', async () => {
      // Mock the server response for deleting media
      server.use(
        http.delete('/api/media/test-media-id', () => {
          return jsonResponse({ success: true });
        })
      );

      const response = await fetch('/api/media/test-media-id', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('S3 Integration', () => {
    it('should handle S3 uploads correctly', async () => {
      // Mock the server response for S3 upload
      server.use(
        http.post('/api/media/upload', () => {
          return jsonResponse({ 
              success: true, 
              media: {
                ...testData.media,
                path: 'https://test-bucket.s3.amazonaws.com/uploads/test-image.jpg',
                thumbnailPath: 'https://test-bucket.s3.amazonaws.com/uploads/thumbnails/test-image.jpg',
                mediumPath: 'https://test-bucket.s3.amazonaws.com/uploads/medium/test-image.jpg'
              }
            });
        })
      );

      // Create a mock file
      const file = new File(['test file content'], 'test-image.jpg', { type: 'image/jpeg' });
      
      const mockFormData = new FormData();
      mockFormData.append('files', file);
      mockFormData.append('alt', 'Test image');
      mockFormData.append('useS3', 'true');
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.media.path).toContain('s3.amazonaws.com');
      expect(data.media.thumbnailPath).toContain('thumbnails');
    });
  });
});
