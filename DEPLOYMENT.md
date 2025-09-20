# Deployment Cache Busting Guide

## Problem
Users were seeing cached versions of the app after deployments, requiring manual cache clearing.

## Solution
Automatic cache busting using timestamped service worker cache names.

## How to Deploy Without Cache Issues

### Option 1: Automatic (Recommended)
Run this command after each deployment to ensure users get fresh content:

```bash
node scripts/update-sw-cache.js
```

This script:
- ✅ Generates a unique timestamp for the deployment
- ✅ Updates the service worker cache name
- ✅ Forces browsers to download fresh content
- ✅ Automatically cleans up old cache entries

### Option 2: Manual Integration
Add this command to your deployment pipeline after the build step:

```bash
npm run build && node scripts/update-sw-cache.js
```

## What Changed
1. **Service Worker Cache Name**: Now uses timestamps instead of static version
2. **Cache Strategy**: Enhanced with freshness validation
3. **Update Detection**: HTML files always check for updates
4. **Immediate Updates**: Service worker activates immediately with new cache

## Verification
After running the script, you'll see:
```
✅ Service worker cache updated with timestamp: 1757859480065
   File: /path/to/dist/public/sw.js
```

## Benefits
- ✅ No more "clear cache" requests to users
- ✅ Instant updates on deployment
- ✅ Better offline support
- ✅ Automatic cleanup of old cache entries

## For CI/CD
Add to your deployment workflow:
```yaml
- name: Build application
  run: npm run build
  
- name: Update service worker cache
  run: node scripts/update-sw-cache.js
```

This ensures every deployment gets a unique cache identifier, solving the cache invalidation problem permanently.