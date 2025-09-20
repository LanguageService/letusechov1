#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to check for service worker
const possiblePaths = [
  join(__dirname, '../dist/public/sw.js'),
  join(__dirname, '../client/public/sw.js')
];

// Find the service worker file
let swPath = null;
for (const path of possiblePaths) {
  if (existsSync(path)) {
    swPath = path;
    break;
  }
}

if (!swPath) {
  console.error('❌ Service worker file not found in any of these locations:');
  possiblePaths.forEach(path => console.error(`   - ${path}`));
  process.exit(1);
}

try {
  // Read the service worker file
  let swContent = readFileSync(swPath, 'utf8');
  
  // Generate a timestamp for cache busting
  const buildTimestamp = Date.now();
  
  // Replace the BUILD_TIMESTAMP placeholder with actual timestamp
  swContent = swContent.replace(
    /const BUILD_TIMESTAMP = '[^']*';/,
    `const BUILD_TIMESTAMP = '${buildTimestamp}';`
  );
  
  // Also replace {{BUILD_TIMESTAMP}} if present
  swContent = swContent.replace(
    /\{\{BUILD_TIMESTAMP\}\}/g,
    buildTimestamp.toString()
  );
  
  // Write the updated content back
  writeFileSync(swPath, swContent, 'utf8');
  
  console.log(`✅ Service worker cache updated with timestamp: ${buildTimestamp}`);
  console.log(`   File: ${swPath}`);
} catch (error) {
  console.error('❌ Failed to update service worker cache:', error.message);
  process.exit(1);
}