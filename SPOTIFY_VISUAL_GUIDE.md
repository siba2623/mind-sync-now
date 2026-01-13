# 🎵 Spotify API Setup - Visual Guide

## Quick Answer: What to Put in Redirect URIs

When Spotify asks for **Redirect URIs**, add these exact URLs:

```
http://localhost:8080/callback
http://localhost:8081/callback
http://localhost:3000/callback
```

*(You can add more ports if needed - just change the number)*

### ⚠️ "This redirect URI is not secure" Warning

**You'll see this warning - it's normal!**
- Spotify shows this because `http://localhost` isn't encrypted
- **For development, this is perfectly safe**
- Just click **"I understand"** or **"Continue anyway"**
- Your app will work fine

**To avoid the warning (optional):**
- Use `https://localhost:8080/callback` instead
- But you'll need to set up HTTPS for your local server

---

## Step-by-Step Visual Guide

### 1. 🌐 Go to Spotify Developer Dashboard
- Visit: https://developer.spotify.com/dashboard
- Log in with your Spotify account

### 2. ➕ Create New App
Click the green **"Create app"** button

### 3. 📝 Fill Out the Form

**App name:** `MindSync` (or whatever you want)

**App description:** `Mental health wellness app with music recommendations`

**Website:** `http://localhost:8080`

**Redirect URIs:** ⚠️ **This is the important part!**
```
http://localhost:8080/callback
```
Click **"Add"** to add it to the list.

**You'll see a warning:** "This redirect URI is not secure"
- This is normal for localhost development
- Click **"I understand"** to continue
- Your app will work perfectly

**Which API/SDKs are you planning to use?**
- ✅ Check **"Web API"**

### 4. ✅ Save the App
Click **"Save"** at the bottom

### 5. 🔑 Get Your Credentials
1. Click on your newly created app
2. Click **"Settings"** in the top right
3. You'll see:
   - **Client ID**: Copy this entire string
   - **Client secret**: Click "View client secret" and copy this string

### 6. 📁 Update Your .env File
Open your `.env` file and replace:
```env
VITE_SPOTIFY_CLIENT_ID="paste_your_client_id_here"
VITE_SPOTIFY_CLIENT_SECRET="paste_your_client_secret_here"
```

---

## 🤔 Why Do We Need Redirect URIs?

**Simple explanation:** 
- Redirect URIs tell Spotify "where to send users after they log in"
- Even though MindSync doesn't require users to log into Spotify, Spotify still requires at least one redirect URI
- It's like giving Spotify a return address

**For MindSync specifically:**
- We use "Client Credentials Flow" which gets music data without user login
- The redirect URI is mostly a formality, but required by Spotify
- We set it to `/callback` just in case

---

## 🚨 Common Mistakes

❌ **Wrong:** `localhost:8080/callback` (missing http://)
✅ **Correct:** `http://localhost:8080/callback`

❌ **Wrong:** `http://localhost:8080` (missing /callback)
✅ **Correct:** `http://localhost:8080/callback`

❌ **Wrong:** `localhost:8080/callback` (missing protocol)
✅ **Correct:** `http://localhost:8080/callback`
✅ **Also correct:** `https://localhost:8080/callback` (avoids security warning)

---

## 🔧 Testing Your Setup

1. Save your credentials in `.env`
2. Restart your app: `npm run dev`
3. Try using a music feature in MindSync
4. If it works = Success! 🎉
5. If you get errors, check the browser console for details

---

## 🌐 For Production (Later)

When you deploy MindSync to a real website:
1. Go back to your Spotify app settings
2. Add your production redirect URI:
   ```
   https://yourdomain.com/callback
   ```
3. Update your production environment variables

---

## 🛡️ Handling the "Not Secure" Warning

### What You'll See:
When you add `http://localhost:8080/callback`, Spotify shows:
> ⚠️ "This redirect URI is not secure"

### What to Do:
1. **Option 1 (Easiest):** Click **"I understand"** and continue
   - This is perfectly safe for development
   - Your app will work normally
   
2. **Option 2 (No warning):** Use HTTPS instead
   - Change to: `https://localhost:8080/callback`
   - You'll need to configure HTTPS for your local server

### Why This Happens:
- Spotify prefers encrypted connections (HTTPS)
- `http://localhost` is unencrypted, so they show a warning
- For local development, this is completely normal and safe

---

## 🆘 Still Having Issues?

**Error: "Invalid redirect URI"**
- Double-check the URI is exactly: `http://localhost:8080/callback`
- Make sure you clicked "Add" after typing it

**Error: "Invalid client"**
- Check your Client ID and Client Secret for typos
- Make sure there are no extra spaces

**Error: "Failed to get Spotify token: 400"**
- This usually means wrong credentials
- Try regenerating your Client Secret in Spotify dashboard