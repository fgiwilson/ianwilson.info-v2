/**
 * Script to update MSW v1 handlers to MSW v2 format
 * This script updates all test files to use the MSW v2 API
 */
const fs = require('fs');
const path = require('path');

// Test directories to process
const testDirs = [
  'tests/auth',
  'tests/blog',
  'tests/media',
  'tests/projects',
  'tests/resume'
];

// Function to update imports
function updateImports(content) {
  return content.replace(
    /import\s*{\s*rest\s*}\s*from\s*['"]msw['"];/g,
    `import { http, HttpResponse, jsonResponse, errorResponse } from '../msw-helpers';`
  );
}

// Function to update handlers
function updateHandlers(content) {
  // Replace GET handlers
  content = content.replace(
    /rest\.get\(['"]([^'"]+)['"]\s*,\s*\([^)]*\)\s*=>\s*{\s*return\s*res\(\s*ctx\.status\((\d+)\),\s*ctx\.json\(([^)]+)\)\s*\);\s*}\)/g,
    (match, url, status, data) => {
      if (status === '200') {
        return `http.get('${url}', () => {\n          return jsonResponse(${data});\n        })`;
      } else {
        return `http.get('${url}', () => {\n          return HttpResponse.json(${data}, { status: ${status} });\n        })`;
      }
    }
  );

  // Replace POST handlers
  content = content.replace(
    /rest\.post\(['"]([^'"]+)['"]\s*,\s*\([^)]*\)\s*=>\s*{\s*return\s*res\(\s*ctx\.status\((\d+)\),\s*ctx\.json\(([^)]+)\)\s*\);\s*}\)/g,
    (match, url, status, data) => {
      if (status === '200' || status === '201') {
        return `http.post('${url}', () => {\n          return jsonResponse(${data});\n        })`;
      } else {
        return `http.post('${url}', () => {\n          return HttpResponse.json(${data}, { status: ${status} });\n        })`;
      }
    }
  );

  // Replace PUT handlers
  content = content.replace(
    /rest\.put\(['"]([^'"]+)['"]\s*,\s*\([^)]*\)\s*=>\s*{\s*return\s*res\(\s*ctx\.status\((\d+)\),\s*ctx\.json\(([^)]+)\)\s*\);\s*}\)/g,
    (match, url, status, data) => {
      if (status === '200') {
        return `http.put('${url}', () => {\n          return jsonResponse(${data});\n        })`;
      } else {
        return `http.put('${url}', () => {\n          return HttpResponse.json(${data}, { status: ${status} });\n        })`;
      }
    }
  );

  // Replace DELETE handlers
  content = content.replace(
    /rest\.delete\(['"]([^'"]+)['"]\s*,\s*\([^)]*\)\s*=>\s*{\s*return\s*res\(\s*ctx\.status\((\d+)\),\s*ctx\.json\(([^)]+)\)\s*\);\s*}\)/g,
    (match, url, status, data) => {
      if (status === '200') {
        return `http.delete('${url}', () => {\n          return jsonResponse(${data});\n        })`;
      } else {
        return `http.delete('${url}', () => {\n          return HttpResponse.json(${data}, { status: ${status} });\n        })`;
      }
    }
  );

  return content;
}

// Process each test directory
testDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  
  // Read all test files in the directory
  fs.readdir(fullPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${fullPath}:`, err);
      return;
    }

    // Process each test file
    files.forEach(file => {
      if (file.endsWith('.test.ts')) {
        const filePath = path.join(fullPath, file);
        
        // Read file content
        fs.readFile(filePath, 'utf8', (err, content) => {
          if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
          }

          // Update content
          let updatedContent = updateImports(content);
          updatedContent = updateHandlers(updatedContent);

          // Write updated content back to file
          fs.writeFile(filePath, updatedContent, 'utf8', err => {
            if (err) {
              console.error(`Error writing file ${filePath}:`, err);
              return;
            }
            console.log(`Updated ${filePath}`);
          });
        });
      }
    });
  });
});

console.log('MSW handler update script started. Check console for results.');
