import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, HttpHandler } from 'msw';

// Mock SvelteKit modules
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn()
}));

vi.mock('$app/forms', () => ({
  enhance: vi.fn((form) => form)
}));

vi.mock('$app/state', () => ({
  page: {
    url: new URL('http://localhost:5173'),
    params: {}
  }
}));

// Setup MSW server for API mocking
export const server = setupServer();

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
