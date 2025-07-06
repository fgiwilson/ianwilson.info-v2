/**
 * Helper functions for MSW v2 API
 */
import { http, HttpResponse } from 'msw';

// Type definitions for common request/response patterns
export type JsonRequestHandler = (path: string, resolver: () => Response) => any;
export type JsonResponse = typeof HttpResponse.json;

// Export MSW v2 components for consistent usage across test files
export { http, HttpResponse };

/**
 * Creates a JSON response with the given data and status code
 * @param data The response data
 * @param status The HTTP status code
 * @returns An MSW HttpResponse
 */
export function jsonResponse(data: any, status = 200) {
  return HttpResponse.json(data, { status });
}

/**
 * Creates a JSON error response
 * @param message Error message
 * @param status HTTP status code
 * @returns An MSW HttpResponse
 */
export function errorResponse(message: string, status = 400) {
  return HttpResponse.json({ success: false, message }, { status });
}
