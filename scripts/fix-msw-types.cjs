/**
 * Script to fix MSW handler types and remaining rest references
 * This script specifically targets TypeScript errors in test files
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
    
    // Fix import if needed
    if (updatedContent.includes("import { rest } from 'msw';")) {
      updatedContent = updatedContent.replace(
        "import { rest } from 'msw';",
        "import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';"
      );
    }
    
    // Replace rest.get with http.get and add proper types
    updatedContent = updatedContent.replace(
      /rest\.get\(['"]([^'"]+)['"]\s*,\s*\(req,\s*res,\s*ctx\)\s*=>/g,
      "http.get('$1', () =>"
    );
    
    // Replace rest.post with http.post and add proper types
    updatedContent = updatedContent.replace(
      /rest\.post\(['"]([^'"]+)['"]\s*,\s*\(req,\s*res,\s*ctx\)\s*=>/g,
      "http.post('$1', () =>"
    );
    
    // Replace rest.put with http.put and add proper types
    updatedContent = updatedContent.replace(
      /rest\.put\(['"]([^'"]+)['"]\s*,\s*\(req,\s*res,\s*ctx\)\s*=>/g,
      "http.put('$1', () =>"
    );
    
    // Replace rest.delete with http.delete and add proper types
    updatedContent = updatedContent.replace(
      /rest\.delete\(['"]([^'"]+)['"]\s*,\s*\(req,\s*res,\s*ctx\)\s*=>/g,
      "http.delete('$1', () =>"
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
    
    // Replace res(ctx.status(400), ctx.json({ success: false, message: '...' })) with errorResponse
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(400\),\s*ctx\.json\(\s*{\s*success\s*:\s*false,\s*message\s*:\s*['"]([^'"]+)['"]\s*}\s*\)\s*\);/g,
      "return errorResponse('$1', 400);"
    );
    
    // Replace res(ctx.status(404), ctx.json({ success: false, message: '...' })) with errorResponse
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(404\),\s*ctx\.json\(\s*{\s*success\s*:\s*false,\s*message\s*:\s*['"]([^'"]+)['"]\s*}\s*\)\s*\);/g,
      "return errorResponse('$1', 404);"
    );
    
    // Replace res(ctx.status(500), ctx.json({ success: false, message: '...' })) with errorResponse
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\(500\),\s*ctx\.json\(\s*{\s*success\s*:\s*false,\s*message\s*:\s*['"]([^'"]+)['"]\s*}\s*\)\s*\);/g,
      "return errorResponse('$1', 500);"
    );
    
    // Replace remaining res(ctx.status(...), ctx.json(...)) with HttpResponse.json
    updatedContent = updatedContent.replace(
      /return\s+res\(\s*ctx\.status\((\d+)\),\s*ctx\.json\(([^)]+)\)\s*\);/g,
      "return HttpResponse.json($2, { status: $1 });"
    );

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

console.log('MSW handler type fix script started. Check console for results.');
