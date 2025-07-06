import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

// Enhanced render with user-event setup
export function renderWithUser(component: any, options = {}) {
  const user = userEvent.setup();
  return {
    user,
    ...render(component, options)
  };
}

// Mock session for authenticated routes
export function mockAuthSession() {
  return {
    user: {
      id: 'test-user-id',
      email: 'admin@example.com',
      name: 'Test Admin',
      role: 'admin'
    }
  };
}

// Helper to create test data
export const testData = {
  blogPost: {
    id: 'test-blog-post-id',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    content: 'This is a test blog post content.',
    excerpt: 'Test excerpt',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'test-user-id',
    featured: false
  },
  project: {
    id: 'test-project-id',
    title: 'Test Project',
    slug: 'test-project',
    description: 'Test project description',
    content: 'This is a test project content.',
    client: 'Test Client',
    completionDate: new Date().toISOString(),
    technologies: 'React, Node.js',
    websiteUrl: 'https://example.com',
    githubUrl: 'https://github.com/example/test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'test-user-id',
    featured: true,
    order: 1,
    categories: []
  },
  resumeSection: {
    id: 'test-section-id',
    title: 'Work Experience',
    type: 'work',
    content: null,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  },
  resumeItem: {
    id: 'test-item-id',
    title: 'Software Developer',
    subtitle: 'Test Company',
    location: 'Remote',
    startDate: new Date('2022-01-01').toISOString(),
    endDate: null,
    current: true,
    description: 'Test job description',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sectionId: 'test-section-id'
  },
  media: {
    id: 'test-media-id',
    filename: 'test-image.jpg',
    path: '/uploads/test-image.jpg',
    thumbnailPath: '/uploads/thumbnails/test-image.jpg',
    mediumPath: '/uploads/medium/test-image.jpg',
    mimetype: 'image/jpeg',
    size: 12345,
    alt: 'Test image',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};
