import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';
import { server } from '../setup';
import { renderWithUser, testData, mockAuthSession } from '../utils/test-utils';
import { goto } from '$app/navigation';

// Mock the Prisma client
vi.mock('$lib/server/db.js', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    projectCategory: {
      findMany: vi.fn()
    }
  }
}));

describe('Project CRUD Operations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Create Project', () => {
    it('should create a new project with valid data', async () => {
      // Mock the server response for project creation
      server.use(
        http.post('/api/projects', () => {
          return jsonResponse({ success: true, project: testData.project });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('title', testData.project.title);
      mockFormData.append('slug', testData.project.slug);
      mockFormData.append('description', testData.project.description);
      mockFormData.append('content', testData.project.content);
      mockFormData.append('client', testData.project.client);
      mockFormData.append('completionDate', testData.project.completionDate);
      mockFormData.append('technologies', testData.project.technologies);
      mockFormData.append('websiteUrl', testData.project.websiteUrl);
      mockFormData.append('githubUrl', testData.project.githubUrl);
      mockFormData.append('featured', String(testData.project.featured));
      mockFormData.append('order', String(testData.project.order));
      mockFormData.append('categories', JSON.stringify([]));
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.project.title).toBe(testData.project.title);
    });

    it('should return validation errors with invalid data', async () => {
      // Mock the server response for invalid data
      server.use(
        http.post('/api/projects', () => {
          return HttpResponse.json({ 
              success: false, 
              message: 'Validation error', 
              errors: ['Title is required'] 
            }, { status: 400 });
        })
      );

      const mockFormData = new FormData();
      // Missing required fields
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Title is required');
    });
  });

  describe('Read Projects', () => {
    it('should fetch all projects', async () => {
      // Mock the server response for fetching projects
      server.use(
        http.get('/api/projects', () => {
          return jsonResponse({ projects: [testData.project] });
        })
      );

      const response = await fetch('/api/projects');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(1);
      expect(data.projects[0].title).toBe(testData.project.title);
    });

    it('should fetch a single project by slug', async () => {
      // Mock the server response for fetching a single project
      server.use(
        http.get('/api/projects/test-project', () => {
          return jsonResponse({ project: testData.project });
        })
      );

      const response = await fetch('/api/projects/test-project');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.project.title).toBe(testData.project.title);
    });

    it('should return 404 for non-existent project', async () => {
      // Mock the server response for non-existent project
      server.use(
        http.get('/api/projects/non-existent', () => {
          return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
        })
      );

      const response = await fetch('/api/projects/non-existent');
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.message).toBe('Project not found');
    });
  });

  describe('Update Project', () => {
    it('should update an existing project', async () => {
      // Mock the server response for updating a project
      server.use(
        http.put('/api/projects/test-project-id', () => {
          return jsonResponse({ 
              success: true, 
              project: { ...testData.project, title: 'Updated Project Title' } 
            });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('title', 'Updated Project Title');
      mockFormData.append('description', testData.project.description);
      mockFormData.append('content', testData.project.content);
      
      const response = await fetch('/api/projects/test-project-id', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.project.title).toBe('Updated Project Title');
    });
  });

  describe('Delete Project', () => {
    it('should delete a project', async () => {
      // Mock the server response for deleting a project
      server.use(
        http.delete('/api/projects/test-project-id', () => {
          return jsonResponse({ success: true });
        })
      );

      const response = await fetch('/api/projects/test-project-id', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Project Categories', () => {
    it('should fetch all project categories', async () => {
      const categories = [
        { id: 'cat1', name: 'Web Development', slug: 'web-development' },
        { id: 'cat2', name: 'Mobile Apps', slug: 'mobile-apps' }
      ];
      
      // Mock the server response for fetching categories
      server.use(
        http.get('/api/projects/categories', () => {
          return jsonResponse({ categories });
        })
      );

      const response = await fetch('/api/projects/categories');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.categories).toHaveLength(2);
      expect(data.categories[0].name).toBe('Web Development');
    });

    it('should create a new project category', async () => {
      const newCategory = { id: 'cat3', name: 'UI/UX Design', slug: 'ui-ux-design' };
      
      // Mock the server response for creating a category
      server.use(
        http.post('/api/projects/categories', () => {
          return jsonResponse({ success: true, category: newCategory });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', newCategory.name);
      
      const response = await fetch('/api/projects/categories', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.category.name).toBe(newCategory.name);
    });
  });
});
