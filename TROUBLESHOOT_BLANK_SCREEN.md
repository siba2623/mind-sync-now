# Troubleshooting Blank Screen

## ✅ Server is Running
- URL: http://localhost:8080/
- Process ID: 6
- Status: Running cleanly (no errors in terminal)

---

## 🔍 Check Browser Console

### Step 1: Open Developer Tools
1. Press `F12` or `Ctrl+Shift+I` (Windows) or `Cmd+Option+I` (Mac)
2. Click on the **Console** tab
3. Look for any **red error messages**

### Common Errors to Look For:

#### Error 1: Supabase Connection
```
Error: Invalid Supabase URL or Key
```
**Solution:** Check your `.env` file has correct Supabase credentials

#### Error 2: Module Not Found
```
Error: Cannot find module '@/...'
```
**Solution:** Run `npm install` in the mind-sync-now folder

#### Error 3: TypeScript Errors
```
Type error: ...
```
**Solution:** These are warnings, app should still work

---

## 🔧 Quick Fixes

### Fix 1: Hard Refresh
1. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. This clears the browser cache

### Fix 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Try Incognito/Private Mode
1. Open a new incognito/private window
2. Go to http://localhost:8080/
3. This tests without browser extensions

### Fix 4: Check .env File
Make sure you have a `.env` file in `mind-sync-now/` folder with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🧪 Test Steps

### Test 1: Check if Server is Responding
Open this URL in browser:
```
http://localhost:8080/
```

You should see:
- ✅ A loading spinner, OR
- ✅ The MindSync login page, OR
- ❌ A blank white screen (this is the issue)

### Test 2: Check Network Tab
1. Open Developer Tools (F12)
2. Click **Network** tab
3. Refresh the page (F5)
4. Look for:
   - ✅ `main.tsx` loaded (status 200)
   - ✅ `index.css` loaded (status 200)
   - ❌ Any failed requests (status 404 or 500)

### Test 3: Check Console for Errors
1. Open Developer Tools (F12)
2. Click **Console** tab
3. Look for red error messages
4. **Copy the error message** and share it

---

## 📋 Information to Share

If the issue persists, please share:

1. **Browser Console Errors:**
   - Open Console (F12)
   - Copy any red error messages
   - Share the full error text

2. **Network Tab Status:**
   - Open Network tab (F12)
   - Refresh page
   - Check if main.tsx loaded (status 200)

3. **Browser Information:**
   - Which browser? (Chrome, Firefox, Edge, Safari)
   - Browser version?

4. **What You See:**
   - Completely blank white screen?
   - Loading spinner that never finishes?
   - Error message on screen?

---

## 🚀 Alternative: Restart Everything

If nothing works, try a complete restart:

### Step 1: Stop the Server
In the terminal where the server is running:
- Press `Ctrl+C`

### Step 2: Clear Node Modules (if needed)
```powershell
cd mind-sync-now
Remove-Item -Recurse -Force node_modules
npm install
```

### Step 3: Restart Server
```powershell
cd mind-sync-now
npm run dev
```

### Step 4: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R`

---

## 💡 Most Likely Causes

### 1. Supabase Connection Issue (Most Common)
**Symptom:** Blank screen, console shows Supabase error
**Fix:** Check `.env` file has correct credentials

### 2. Browser Cache Issue
**Symptom:** Blank screen, no console errors
**Fix:** Hard refresh (`Ctrl+Shift+R`)

### 3. JavaScript Error
**Symptom:** Blank screen, red error in console
**Fix:** Share the error message for specific help

### 4. Port Already in Use
**Symptom:** Server won't start or shows error
**Fix:** Kill process on port 8080 or use different port

---

## 🔍 Debug Mode

To see more detailed errors:

### Check Vite Output
Look at the terminal where you ran `npm run dev`:
- Should show: `ready in XXX ms`
- Should show: `Local: http://localhost:8080/`
- Should NOT show: Red error messages

### Enable Verbose Logging
In browser console, type:
```javascript
localStorage.setItem('debug', '*');
```
Then refresh the page.

---

## ✅ Expected Behavior

When working correctly, you should see:

1. **First Load:**
   - Brief loading spinner
   - Then: Login/Signup page

2. **After Login:**
   - Dashboard with mood tracking
   - Navigation menu
   - Various features accessible

3. **Console:**
   - Maybe some warnings (yellow)
   - NO red errors
   - Message: "Running in web mode"

---

## 📞 Next Steps

1. **Check browser console** (F12 → Console tab)
2. **Copy any error messages**
3. **Share the error** so I can help fix it

The server is running correctly, so the issue is likely:
- Browser cache
- Supabase connection
- JavaScript error in browser

**Let me know what you see in the console!** 🔍
