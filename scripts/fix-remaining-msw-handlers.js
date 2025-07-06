/**
 * Script to fix remaining MSW v1 handlers to MSW v2 format
 * This script specifically targets the 'rest' references that still exist
 */
const fs = require('fs');
const path = require('path');

// Test files with remaining TypeScript errors
const testFiles = [
  'tests/auth/auth-crud.test.ts',
  'tests/blog/blog-crud.test.ts',
  'tests/media/media-crud.test.ts',
  'tests/projects/project-crud.test.ts',
  'tests/resume/resume-crud.test.ts'
];

// Process each test file
testFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Read file content
  fs.readFile(fullPath, 'utf8', (err, content) => {
    if (err) {
      console.error(`Error reading file ${fullPath}:`, err);
      return;
    }

    // Replace remaining rest.* references with http.*
    let updatedContent = content;
    
    // Replace rest.get
    updatedContent = updatedContent.replace(
      /rest\.get\(['"]([^'"]+)['"]/g,
      "http.get('$1'"
    );
    
    // Replace rest.post
    updatedContent = updatedContent.replace(
      /rest\.post\(['"]([^'"]+)['"]/g,
      "http.post('$1'"
    );
    
    // Replace rest.put
    updatedContent = updatedContent.replace(
      /rest\.put\(['"]([^'"]+)['"]/g,
      "http.put('$1'"
    );
    
    // Replace rest.delete
    updatedContent = updatedContent.replace(
      /rest\.delete\(['"]([^'"]+)['"]/g,
      "http.delete('$1'"
    );
    
    // Replace res(ctx.status(200), ctx.json(...)) with jsonResponse(...)
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(200\),\s*ctx\.json\(([^)]+)\)\s*\);/g,
      "return jsonResponse($1);"
    );
    
    // Replace res(ctx.status(201), ctx.json(...)) with jsonResponse(..., 201)
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(201\),\s*ctx\.json\(([^)]+)\)\s*\);/g,
      "return jsonResponse($1, 201);"
    );
    
    // Replace res(ctx.status(400), ctx.json(...)) with errorResponse
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(400\),\s*ctx\.json\(\s*{\s*success\s*:\s*false,\s*message\s*:\s*['"]([^'"]+)['"]\s*}\s*\)\s*\);/g,
      "return errorResponse('$1', 400);"
    );
    
    // Replace res(ctx.status(404), ctx.json(...)) with errorResponse
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(404\),\s*ctx\.json\(\s*{\s*success\s*:\s*false,\s*message\s*:\s*['"]([^'"]+)['"]\s*}\s*\)\s*\);/g,
      "return errorResponse('$1', 404);"
    );
    
    // Replace res(ctx.status(500), ctx.json(...)) with errorResponse
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(500\),\s*ctx\.json\(\s*{\s*success\s*:\s*false,\s*message\s*:\s*['"]([^'"]+)['"]\s*}\s*\)\s*\);/g,
      "return errorResponse('$1', 500);"
    );
    
    // Replace remaining res(ctx.status(...), ctx.json(...)) with HttpResponse.json
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\((\d+)\),\s*ctx\.json\(([^)]+)\)\s*\);/g,
      "return HttpResponse.json($2, { status: $1 });"
    );

    // Replace import { rest } from 'msw' if it still exists
    if (updatedContent.includes("import { rest } from 'msw';")) {
      updatedContent = updatedContent.replace(
        "import { rest } from 'msw';",
        "import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';"
      );
    }

    // Write updated content back to file
    fs.writeFile(fullPath, updatedContent, 'utf8', err => {
      if (err) {
        console.error(`Error writing file ${fullPath}:`, err);
        return;
      }
      console.log(`Updated ${filePath}`);
    });
  });
});

console.log('MSW handler update script started. Check console for results.');
