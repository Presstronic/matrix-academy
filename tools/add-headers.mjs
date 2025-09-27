#!/usr/bin/env node
/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- config ---
const ROOT = path.resolve(__dirname, '..');
const GLOB_DIRS = [path.join(ROOT, 'apps'), path.join(ROOT, 'packages')];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const AUTHOR_NAME = process.env.MA_AUTHOR_NAME || 'Your Name';
const AUTHOR_EMAIL = process.env.MA_AUTHOR_EMAIL || 'you@example.com';
const YEAR = new Date().getFullYear().toString();
const HEADER_PATH = path.join(__dirname, 'license-header.txt');
const SHORT_HEADER_PATH = path.join(__dirname, 'license-header-short.txt');

// Use long header by default; allow SHORT=1 to force short header
const USE_SHORT = process.env.SHORT === '1';
const TEMPLATE = fs.readFileSync(USE_SHORT ? SHORT_HEADER_PATH : HEADER_PATH, 'utf8').trim();

// Detect an existing header by SPDX line (fast + robust)
const SPDX_LINE = 'SPDX-License-Identifier: GPL-3.0-or-later';

function hasHeader(content) {
  return content.includes(SPDX_LINE);
}

function fillTemplate(template, absPath) {
  const fileBase = path.basename(absPath);
  return template
    .replaceAll('${YEAR}', YEAR)
    .replaceAll('${AUTHOR_NAME}', AUTHOR_NAME)
    .replaceAll('${AUTHOR_EMAIL}', AUTHOR_EMAIL)
    .replaceAll('${FILE_BASENAME}', fileBase);
}

function prependHeader(absPath) {
  const content = fs.readFileSync(absPath, 'utf8');
  if (hasHeader(content)) return false;
  const header = fillTemplate(TEMPLATE, absPath) + '\n\n';
  fs.writeFileSync(absPath, header + content, 'utf8');
  return true;
}

function shouldSkip(absPath) {
  const rel = path.relative(ROOT, absPath);
  return (
    rel.includes('node_modules/') ||
    rel.includes('dist/') ||
    rel.includes('build/') ||
    rel.includes('.turbo/') ||
    rel.includes('coverage/') ||
    rel.endsWith('.d.ts')
  );
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!shouldSkip(p)) walk(p);
    } else {
      if (shouldSkip(p)) continue;
      const ext = path.extname(p);
      if (EXTENSIONS.has(ext)) {
        prependHeader(p);
      }
    }
  }
}

for (const base of GLOB_DIRS) walk(base);
console.log('Header insertion complete.');
