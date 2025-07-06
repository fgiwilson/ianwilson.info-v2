import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';
import { server } from '../setup';
import { renderWithUser, testData, mockAuthSession } from '../utils/test-utils';
import { goto } from '$app/navigation';

// Mock the Prisma client
vi.mock('$lib/server/db.js', () => ({
  prisma: {
    resumeSection: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    resumeItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    skill: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    skillCategory: {
      findMany: vi.fn()
    },
    personalInfo: {
      findFirst: vi.fn(),
      upsert: vi.fn()
    }
  }
}));

describe('Resume CRUD Operations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Resume Sections', () => {
    it('should fetch all resume sections', async () => {
      // Mock the server response for fetching resume sections
      server.use(
        http.get('/api/resume/sections', () => {
          return jsonResponse({ sections: [testData.resumeSection] });
        })
      );

      const response = await fetch('/api/resume/sections');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sections).toHaveLength(1);
      expect(data.sections[0].title).toBe(testData.resumeSection.title);
    });

    it('should create a new resume section', async () => {
      // Mock the server response for section creation
      server.use(
        http.post('/api/resume/sections', () => {
          return jsonResponse({ success: true, section: testData.resumeSection }, 201);
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('title', testData.resumeSection.title);
      mockFormData.append('type', testData.resumeSection.type);
      mockFormData.append('order', String(testData.resumeSection.order));
      
      const response = await fetch('/api/resume/sections', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.section.title).toBe(testData.resumeSection.title);
    });

    it('should update an existing resume section', async () => {
      // Mock the server response for updating a section
      server.use(
        http.put('/api/resume/sections/test-section-id', () => {
          return jsonResponse({ 
              success: true, 
              section: { ...testData.resumeSection, title: 'Updated Section Title' } 
            });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('title', 'Updated Section Title');
      mockFormData.append('type', testData.resumeSection.type);
      mockFormData.append('order', String(testData.resumeSection.order));
      
      const response = await fetch('/api/resume/sections/test-section-id', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.section.title).toBe('Updated Section Title');
    });

    it('should delete a resume section', async () => {
      // Mock the server response for deleting a section
      server.use(
        http.delete('/api/resume/sections/test-section-id', () => {
          return jsonResponse({ success: true });
        })
      );

      const response = await fetch('/api/resume/sections/test-section-id', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Resume Items', () => {
    it('should fetch all items for a section', async () => {
      // Mock the server response for fetching resume items
      server.use(
        http.get('/api/resume/sections/test-section-id/items', () => {
          return jsonResponse({ items: [testData.resumeItem] });
        })
      );

      const response = await fetch('/api/resume/sections/test-section-id/items');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].title).toBe(testData.resumeItem.title);
    });

    it('should create a new resume item', async () => {
      // Mock the server response for item creation
      server.use(
        http.post('/api/resume/sections/test-section-id/items', () => {
          return jsonResponse({ success: true, item: testData.resumeItem });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('title', testData.resumeItem.title);
      mockFormData.append('subtitle', testData.resumeItem.subtitle || '');
      mockFormData.append('location', testData.resumeItem.location || '');
      mockFormData.append('startDate', testData.resumeItem.startDate || '');
      mockFormData.append('endDate', testData.resumeItem.endDate || '');
      mockFormData.append('current', String(testData.resumeItem.current));
      mockFormData.append('description', testData.resumeItem.description || '');
      mockFormData.append('order', String(testData.resumeItem.order));
      
      const response = await fetch('/api/resume/sections/test-section-id/items', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.item.title).toBe(testData.resumeItem.title);
    });

    it('should update an existing resume item', async () => {
      // Mock the server response for updating an item
      server.use(
        http.put('/api/resume/sections/test-section-id/items/test-item-id', () => {
          return jsonResponse({ 
              success: true, 
              item: { ...testData.resumeItem, title: 'Updated Item Title' } 
            });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('title', 'Updated Item Title');
      mockFormData.append('subtitle', testData.resumeItem.subtitle || '');
      mockFormData.append('location', testData.resumeItem.location || '');
      mockFormData.append('startDate', testData.resumeItem.startDate || '');
      mockFormData.append('endDate', testData.resumeItem.endDate || '');
      mockFormData.append('current', String(testData.resumeItem.current));
      mockFormData.append('description', testData.resumeItem.description || '');
      mockFormData.append('order', String(testData.resumeItem.order));
      
      const response = await fetch('/api/resume/sections/test-section-id/items/test-item-id', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.item.title).toBe('Updated Item Title');
    });

    it('should delete a resume item', async () => {
      // Mock the server response for deleting an item
      server.use(
        http.delete('/api/resume/sections/test-section-id/items/test-item-id', () => {
          return jsonResponse({ success: true });
        })
      );

      const response = await fetch('/api/resume/sections/test-section-id/items/test-item-id', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Personal Info', () => {
    it('should fetch personal info', async () => {
      const personalInfo = {
        id: 'personal-info-id',
        name: 'Ian Wilson',
        title: 'Full Stack Developer',
        email: 'ian@example.com',
        phone: '555-123-4567',
        location: 'Seattle, WA',
        bio: 'Experienced developer with a passion for creating beautiful web applications.',
        websiteUrl: 'https://ianwilson.info',
        githubUrl: 'https://github.com/ianwilson',
        linkedinUrl: 'https://linkedin.com/in/ianwilson'
      };
      
      // Mock the server response for fetching personal info
      server.use(
        http.get('/api/resume/personal-info', () => {
          return jsonResponse({ personalInfo });
        })
      );

      const response = await fetch('/api/resume/personal-info');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.personalInfo.name).toBe('Ian Wilson');
    });

    it('should update personal info', async () => {
      const updatedInfo = {
        id: 'personal-info-id',
        name: 'Ian Wilson',
        title: 'Senior Full Stack Developer',
        email: 'ian@example.com',
        phone: '555-123-4567',
        location: 'Seattle, WA',
        bio: 'Updated bio information',
        websiteUrl: 'https://ianwilson.info',
        githubUrl: 'https://github.com/ianwilson',
        linkedinUrl: 'https://linkedin.com/in/ianwilson'
      };
      
      // Mock the server response for updating personal info
      server.use(
        http.put('/api/resume/personal-info', () => {
          return jsonResponse({ success: true, personalInfo: updatedInfo });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', updatedInfo.name);
      mockFormData.append('title', updatedInfo.title);
      mockFormData.append('email', updatedInfo.email);
      mockFormData.append('phone', updatedInfo.phone);
      mockFormData.append('location', updatedInfo.location);
      mockFormData.append('bio', updatedInfo.bio);
      mockFormData.append('websiteUrl', updatedInfo.websiteUrl);
      mockFormData.append('githubUrl', updatedInfo.githubUrl);
      mockFormData.append('linkedinUrl', updatedInfo.linkedinUrl);
      
      const response = await fetch('/api/resume/personal-info', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.personalInfo.title).toBe('Senior Full Stack Developer');
      expect(data.personalInfo.bio).toBe('Updated bio information');
    });
  });

  describe('Skills', () => {
    it('should fetch all skills', async () => {
      const skills = [
        { 
          id: 'skill-1', 
          name: 'JavaScript', 
          description: '- ES6+\n- TypeScript\n- React', 
          categoryId: 'cat-1',
          category: { id: 'cat-1', name: 'Frontend' },
          order: 1
        },
        { 
          id: 'skill-2', 
          name: 'Node.js', 
          description: '- Express\n- API Development', 
          categoryId: 'cat-2',
          category: { id: 'cat-2', name: 'Backend' },
          order: 1
        }
      ];
      
      // Mock the server response for fetching skills
      server.use(
        http.get('/api/resume/skills', () => {
          return jsonResponse({ skills });
        })
      );

      const response = await fetch('/api/resume/skills');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.skills).toHaveLength(2);
      expect(data.skills[0].name).toBe('JavaScript');
      expect(data.skills[1].name).toBe('Node.js');
    });

    it('should create a new skill', async () => {
      const newSkill = { 
        id: 'skill-3', 
        name: 'Docker', 
        description: '- Containerization\n- Docker Compose', 
        categoryId: 'cat-3',
        category: { id: 'cat-3', name: 'DevOps' },
        order: 1
      };
      
      // Mock the server response for creating a skill
      server.use(
        http.post('/api/resume/skills', () => {
          return jsonResponse({ success: true, skill: newSkill });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', newSkill.name);
      mockFormData.append('description', newSkill.description);
      mockFormData.append('categoryId', newSkill.categoryId);
      mockFormData.append('order', String(newSkill.order));
      
      const response = await fetch('/api/resume/skills', {
        method: 'POST',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.skill.name).toBe('Docker');
    });

    it('should update an existing skill', async () => {
      const updatedSkill = { 
        id: 'skill-1', 
        name: 'JavaScript/TypeScript', 
        description: '- ES6+\n- Advanced TypeScript\n- React\n- Vue', 
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Frontend' },
        order: 1
      };
      
      // Mock the server response for updating a skill
      server.use(
        http.put('/api/resume/skills/skill-1', () => {
          return jsonResponse({ success: true, skill: updatedSkill });
        })
      );

      const mockFormData = new FormData();
      mockFormData.append('name', updatedSkill.name);
      mockFormData.append('description', updatedSkill.description);
      mockFormData.append('categoryId', updatedSkill.categoryId);
      mockFormData.append('order', String(updatedSkill.order));
      
      const response = await fetch('/api/resume/skills/skill-1', {
        method: 'PUT',
        body: mockFormData
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.skill.name).toBe('JavaScript/TypeScript');
      expect(data.skill.description).toContain('Advanced TypeScript');
    });

    it('should delete a skill', async () => {
      // Mock the server response for deleting a skill
      server.use(
        http.delete('/api/resume/skills/skill-1', () => {
          return jsonResponse({ success: true });
        })
      );

      const response = await fetch('/api/resume/skills/skill-1', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
