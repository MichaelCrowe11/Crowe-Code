#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to replace console.log with appropriate logger methods
const replacements = [
  // Error patterns
  { pattern: /console\.error\((.*?)\)/g, replacement: 'logger.error($1)' },
  { pattern: /console\.warn\((.*?)\)/g, replacement: 'logger.warn($1)' },

  // Info patterns
  { pattern: /console\.info\((.*?)\)/g, replacement: 'logger.info($1)' },

  // Debug patterns - for development logging
  { pattern: /console\.debug\((.*?)\)/g, replacement: 'logger.debug($1)' },

  // Generic console.log - convert to info or debug based on context
  { pattern: /console\.log\((.*?)\)/g, replacement: 'logger.info($1)' },

  // Table and other console methods
  { pattern: /console\.table\((.*?)\)/g, replacement: 'logger.debug("Table data", $1)' },
  { pattern: /console\.time\((.*?)\)/g, replacement: 'performanceLogger.start($1)' },
  { pattern: /console\.timeEnd\((.*?)\)/g, replacement: 'performanceLogger.end($1)' },
];

// Files to process
const sourcePatterns = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'scripts/*.js',
  'tests/**/*.ts',
  'tests/**/*.tsx'
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/build/**',
  '**/logs/**',
  'src/lib/logger.ts', // Don't modify the logger file itself
  'scripts/replace-console-logs.js' // Don't modify this script
];

// Check if file needs logger import
function needsLoggerImport(content) {
  return content.includes('console.') &&
         !content.includes("import logger") &&
         !content.includes("import { logger") &&
         !content.includes("from './logger'") &&
         !content.includes('from "../logger"') &&
         !content.includes('from "@/lib/logger"');
}

// Add logger import to file
function addLoggerImport(content, filePath) {
  const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  const relativePath = path.relative(path.dirname(filePath), path.join(process.cwd(), 'src/lib/logger'));

  let importStatement;
  if (relativePath.startsWith('..')) {
    importStatement = `import logger from '${relativePath.replace(/\\/g, '/').replace('.ts', '')}';`;
  } else {
    importStatement = `import logger from './${relativePath.replace(/\\/g, '/').replace('.ts', '')}';`;
  }

  // Add performance logger import if needed
  if (content.includes('console.time')) {
    importStatement = `import logger, { performanceLogger } from '${relativePath.replace(/\\/g, '/').replace('.ts', '')}';`;
  }

  // Find the right place to add import (after other imports)
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  } else {
    // Add at the beginning if no imports found
    lines.unshift(importStatement);
  }

  return lines.join('\n');
}

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;

  // Check if file has console statements
  if (!content.includes('console.')) {
    return { modified: false };
  }

  // Skip if file is a test file (might legitimately use console)
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    console.log(`⚠️  Skipping test file: ${filePath}`);
    return { modified: false };
  }

  // Add logger import if needed
  if (needsLoggerImport(content)) {
    content = addLoggerImport(content, filePath);
    modified = true;
  }

  // Apply replacements
  let replacementCount = 0;
  for (const { pattern, replacement } of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      replacementCount += matches.length;
      modified = true;
    }
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} - Replaced ${replacementCount} console statements`);
    return { modified: true, count: replacementCount };
  }

  return { modified: false };
}

// Main execution
async function main() {
  console.log('🔍 Searching for console.log statements to replace...\n');

  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalReplacements = 0;

  for (const pattern of sourcePatterns) {
    const files = glob.sync(pattern, {
      ignore: excludePatterns,
      nodir: true
    });

    for (const file of files) {
      totalFiles++;
      const result = processFile(file);
      if (result.modified) {
        modifiedFiles++;
        totalReplacements += result.count || 0;
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Console statements replaced: ${totalReplacements}`);

  if (modifiedFiles > 0) {
    console.log('\n✨ Successfully replaced console statements with proper logging!');
    console.log('📝 Note: Please review the changes and adjust log levels as needed.');
  } else {
    console.log('\n✅ No console statements found to replace!');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});