# PWA Setup Guide

## Overview
The Scanner Dashboard is now configured as a Progressive Web App (PWA), allowing users to install it on their devices and use it offline.

## Features Implemented

### 1. Web App Manifest (`public/manifest.json`)
- App name and description
- Theme color: #06b6d4 (cyan)
- Display mode: standalone (full-screen app experience)
- Icons configuration (192x192 and 512x512)
- Portrait orientation for mobile

### 2. Service Worker (`public/sw.js`)
- Caches essential resources for offline use
- Network-first strategy with cache fallback
- Automatic cache updates
- Offline support

### 3. PWA Meta Tags (in `index.html`)
- Theme color for browser UI
- Apple mobile web app support
- Viewport configuration for mobile
- Service worker registration

## Creating App Icons

You need to create two PNG icons:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

### Recommended Tools:
1. **Online**: https://realfavicongenerator.net/
2. **Design**: Use your app logo with cyan (#06b6d4) theme
3. **Format**: PNG with transparent or white background

### Quick Icon Creation:
```bash
# Using ImageMagick (if installed)
convert -size 192x192 -background "#06b6d4" -fill white -gravity center \
  -pointsize 72 label:"SD" public/icon-192.png

convert -size 512x512 -background "#06b6d4" -fill white -gravity center \
  -pointsize 200 label:"SD" public/icon-512.png
```

## Testing PWA

### Desktop (Chrome/Edge):
1. Open the app in browser
2. Look for install icon in address bar
3. Click to install
4. App opens in standalone window

### Mobile (Android):
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Add to Home Screen"
4. App icon appears on home screen

### Mobile (iOS):
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon appears on home screen

## Offline Functionality

The app will cache:
- Main HTML/CSS/JS files
- CSV data files (scan_logs.csv, allotments.csv)
- Static assets

Users can:
- View previously loaded data offline
- Navigate between pages
- Use all UI features

## Deployment Notes

### For Production:
1. Build the app: `npm run build`
2. Ensure `manifest.json` and `sw.js` are in the `dist` folder
3. Serve with HTTPS (required for service workers)
4. Test on actual devices

### HTTPS Requirement:
Service workers only work on:
- `https://` domains
- `localhost` (for development)

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet
- ⚠️ Safari (Desktop) - Limited PWA support

## Troubleshooting

### Service Worker Not Registering:
- Check browser console for errors
- Ensure HTTPS or localhost
- Clear browser cache and reload

### App Not Installing:
- Verify manifest.json is accessible
- Check icon files exist
- Ensure all required manifest fields are present

### Offline Not Working:
- Check service worker is active (DevTools > Application > Service Workers)
- Verify cache is populated
- Test with DevTools offline mode

## Future Enhancements

Consider adding:
- Push notifications for new scans
- Background sync for data updates
- App shortcuts in manifest
- Share target API
- Periodic background sync
