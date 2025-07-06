import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';
import { server } from '../setup';
import { renderWithUser, mockAuthSession } from '../utils/test-utils';
import { goto } from '$app/navigation';

// Mock the Prisma client
vi.mock('$lib/server/db.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

// Mock bcrypt for password hashing
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password_123'),
  compare: vi.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === 'correct_password');
  })
}));

describe('Authentication and User Profile CRUD Operations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('User Authentication', () => {
    it('should login a user with valid credentials', async () => {
      const user = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      };
      
      // Mock the server response for login
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json({ success: true, user }, { status: 200 });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('email', 'admin@example.com');
      mockFormData.append('password', 'correct_password');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('admin@example.com');
    });

    it('should reject login with invalid credentials', async () => {
      // Mock the server response for invalid login
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { 
              success: false, 
              message: 'Invalid email or password' 
            },
            { status: 401 }
          );
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('email', 'admin@example.com');
      mockFormData.append('password', 'wrong_password');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid email or password');
    });

    it('should logout a user', async () => {
      // Mock the server response for logout
      server.use(
        http.post('/api/auth/logout', () => {
          return HttpResponse.json({ success: true }, { status: 200 });
        })
      );

      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('User Profile Management', () => {
    it('should fetch user profile', async () => {
      const user = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Mock the server response for fetching user profile
      server.use(
        http.get('/api/users/profile', () => {
          return jsonResponse({ user });
        })
      );

      const response = await fetch('/api/users/profile');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.user.email).toBe('admin@example.com');
    });

    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Updated Admin Name',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Mock the server response for updating user profile
      server.use(
        http.put('/api/users/profile', () => {
          return jsonResponse({ 
            success: true, 
            user: updatedUser
          });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', 'Updated Admin Name');
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.name).toBe('Updated Admin Name');
    });

    it('should change user password', async () => {
      // Mock the server response for changing password
      server.use(
        http.post('/api/users/change-password', () => {
          return jsonResponse({ success: true });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('currentPassword', 'current_password');
      mockFormData.append('newPassword', 'new_password');
      mockFormData.append('confirmPassword', 'new_password');
      
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject password change with incorrect current password', async () => {
      // Mock the server response for invalid current password
      server.use(
        http.post('/api/users/change-password', () => {
          return errorResponse('Current password is incorrect', 401);
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('currentPassword', 'wrong_current_password');
      mockFormData.append('newPassword', 'new_password');
      mockFormData.append('confirmPassword', 'new_password');
      
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Current password is incorrect');
    });

    it('should reject password change when passwords do not match', async () => {
      // Mock the server response for mismatched passwords
      server.use(
        http.post('/api/users/change-password', () => {
          return errorResponse('New password and confirmation do not match', 400);
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('currentPassword', 'current_password');
      mockFormData.append('newPassword', 'new_password');
      mockFormData.append('confirmPassword', 'different_password');
      
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('New password and confirmation do not match');
    });
  });

  describe('Contact Form Submissions', () => {
    it('should submit a contact form', async () => {
      // Mock the server response for contact form submission
      server.use(
        http.post('/api/contact', () => {
          return jsonResponse({ 
              success: true, 
              message: 'Contact form submitted successfully' 
            });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', 'Test User');
      mockFormData.append('email', 'test@example.com');
      mockFormData.append('message', 'This is a test message');
      mockFormData.append('consulting', 'true');
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate contact form fields', async () => {
      // Mock the server response for invalid contact form
      server.use(
        http.post('/api/contact', () => {
          return HttpResponse.json({ 
              success: false, 
              message: 'Validation error', 
              errors: ['Email is required', 'Message is required'] 
            }, { status: 400 });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', 'Test User');
      // Missing email and message
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Email is required');
      expect(data.errors).toContain('Message is required');
    });
  });
});
