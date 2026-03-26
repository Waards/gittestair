# Cache & Dev Server Quick Fix Guide

## Problem
After applying code changes, you may encounter ENOENT errors requiring manual cache clearing.

## Solutions

### Option 1: PowerShell Script (Recommended for Windows)
```powershell
.\fresh-dev.ps1
```
This automatically clears `.next` cache and starts the development server.

### Option 2: NPM Command
```bash
npm run dev:fresh
```
Same result as Option 1 - cleans cache and starts dev server.

### Option 3: Manual Commands
```bash
npm run clean      # Clear cache only
npm run dev        # Start dev server
```

## When to Use These

- **Regular dev work**: `npm run dev`
- **After code changes cause errors**: `npm run dev:fresh` or `.\fresh-dev.ps1`
- **Just need to clear cache**: `npm run clean`

## What Happens Automatically

- **`npm run build`** now automatically clears cache before building
- No more manual `.next` directory deletion needed

## Setup Complete ✅

You now have three ways to resolve build cache issues:
1. PowerShell script for quick one-click fix
2. NPM command for cross-platform compatibility  
3. Manual clean command for specific use cases
