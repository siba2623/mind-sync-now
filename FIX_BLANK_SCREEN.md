# Fix Blank Screen Issue

## 🐛 Problem
Blank screen with CSP (Content Security Policy) errors in console:
- "Content Security Policy blocks the use of 'eval'"
- "Page layout may be unexpected due to Quirks Mode"

## ✅ Solutions (Try in Order)

### Solution 1: Hard Refresh Browser (Most Common Fix)
1. **Clear browser cache completely:**
   - Chrome/Edge: Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"

2. **Hard refresh the page:**
   - Press `Ctrl + Shift + R` (Windows)
   - Or `Ctrl + F5`

3. **Open in Incognito/Private mode:**
   - Chrome: `Ctrl + Shift + N`
   - Edge: `Ctrl + Shift + P`
   - Navigate to http://localhost:8080/

### Solution 2: Restart Dev Server
```bash
# Stop the server (Ctrl + C in terminal)
# Then restart:
cd mind-sync-now
npm run dev
```

### Solution 3: Clear Node Modules and Reinstall
```bash
cd mind-sync-now
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Solution 4: Check for Service Worker
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar
4. If any are registered, click "Unregister"
5. Refresh page

### Solution 5: Disable Browser Extensions
Some extensions (ad blockers, privacy tools) can interfere:
1. Open browser in Incognito mode (extensions disabled by default)
2. Or manually disable extensions temporarily
3. Try accessing http://localhost:8080/ again

### Solution 6: Try Different Browser
- If using Chrome, try Edge or Firefox
- Sometimes browser-specific issues occur

### Solution 7: Check Vite Dev Server
Make sure the dev server is actually running:
```bash
# Should see:
# VITE v5.4.19  ready in XXX ms
# ➜  Local:   http://localhost:8080/
```

If not running:
```bash
cd mind-sync-now
npm run dev
```

### Solution 8: Update Browserslist (Warning in Console)
```bash
cd mind-sync-now
npx update-browserslist-db@latest
```

## 🔍 Verify It's Working

Once fixed, you should see:
- ✅ MindSync login/signup page
- ✅ No console errors
- ✅ Page loads completely

## 🎯 Quick Test URLs

Try these to verify:
- http://localhost:8080/ (main app)
- http://localhost:8080/#/login (login page)
- http://localhost:8080/#/home (home page - requires login)

## 💡 Why This Happens

The CSP error is usually caused by:
1. **Browser cache** - Old cached files with strict CSP
2. **Service worker** - Cached app shell
3. **Browser extensions** - Privacy/security extensions
4. **Development mode** - Vite uses eval() for hot reload

The index.html has CSP commented out for development, so this shouldn't happen. It's likely a caching issue.

## 🚀 Most Likely Fix

**90% of the time, this works:**
1. Press `Ctrl + Shift + Delete`
2. Clear "Cached images and files"
3. Press `Ctrl + Shift + R` to hard refresh
4. Page should load! ✅

## 📞 Still Not Working?

If none of these work:
1. Check browser console for other errors
2. Check network tab - are files loading?
3. Try accessing from another device on same network: http://192.168.32.44:8080/
4. Check if port 8080 is actually open: `netstat -an | findstr 8080`

## ✨ Alternative: Use Different Port

If port 8080 has issues:
```bash
# Edit vite.config.ts, change port to 3000
# Then restart:
npm run dev
```

---

*Created: February 10, 2026*
*Most common cause: Browser cache*
