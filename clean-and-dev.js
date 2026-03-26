#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const nextDir = path.join(__dirname, '.next');

// Remove .next directory if it exists
if (fs.existsSync(nextDir)) {
  console.log('🧹 Cleaning build cache...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Build cache cleared');
}

// Start dev server
console.log('🚀 Starting development server...\n');
const isDev = process.argv[2] === '--fresh-restart';

const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

devProcess.on('error', (err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  devProcess.kill();
  process.exit(0);
});
