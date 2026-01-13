# Spotify API Setup Guide

## Why is Spotify Integration Failing?

The error "Failed to get Spotify token: 400" occurs because the Spotify API credentials are not properly configured. Here's how to fix it:

## What are Redirect URIs?

**Redirect URIs** are URLs where Spotify sends users after they authorize your app. Even though MindSync uses "Client Credentials Flow" (which doesn't require user login), Spotify still requires you to specify at least one redirect URI when creating the app.

### For MindSync, you need:
- **Development**: `http://localhost:8080/callback` (or whatever port your app runs on)
- **Production**: `https://yourdomain.com/callback` (replace with your actual domain)

**Important**: The redirect URI must match exactly (including http/https, port, and path).

## Step-by-Step Setup

### 1. Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (create one if you don't have it)
3. Accept the Terms of Service

### 2. Create a New App

1. Click "Create App"
2. Fill in the details:
   - **App Name**: `MindSync` (or any name you prefer)
   - **App Description**: `Mental health wellness app with music recommendations`
   - **Website**: `http://localhost:8080` (for development)
   - **Redirect URIs**: Add these URLs (click "Add" for each one):
     - `http://localhost:8080/callback` (for development)
     - `http://localhost:3000/callback` (alternative dev port)
     - `https://yourdomain.com/callback` (for production - replace with your actual domain)
3. Check the boxes for the APIs you'll use:
   - ✅ Web API
4. Click "Save"

### 3. Get Your Credentials

1. In your new app dashboard, click "Settings"
2. You'll see:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "View client secret" and copy this value

### 4. Update Your Environment Variables

1. Open your `.env` file
2. Replace the empty values:
   ```env
   VITE_SPOTIFY_CLIENT_ID="your_actual_client_id_here"
   VITE_SPOTIFY_CLIENT_SECRET="your_actual_client_secret_here"
   VITE_SPOTIFY_REDIRECT_URI="http://172.24.6.82:8080/"
   ```

### 5. Restart Your Development Server

```bash
npm run dev
```

## Important Security Notes

⚠️ **Never commit your actual Spotify credentials to version control!**

- The `.env` file is already in `.gitignore`
- Only use these credentials in development
- For production, use environment variables in your hosting platform

## Testing the Integration

1. After setting up the credentials, try using the music features in the app
2. If you still get errors, check the browser console for more details
3. Verify your credentials are correct in the Spotify Developer Dashboard

## Common Issues

### "Invalid client" Error
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces or quotes

### "Invalid redirect URI" Error
- Ensure the redirect URI in your app settings matches exactly what you're using
- Common redirect URIs to add:
  - `http://localhost:8080/callback`
  - `http://localhost:3000/callback` 
  - `http://localhost:8081/callback` (in case port 8080 is busy)
- For production, add your actual domain: `https://yourdomain.com/callback`

### Rate Limiting
- Spotify has rate limits for API calls
- The app handles this gracefully, but you might see temporary failures with heavy usage

## Optional: Disable Spotify Features

If you don't want to set up Spotify integration:

1. Leave the credentials empty in `.env`
2. The app will show a message that music features are not available
3. All other features will work normally

## Production Deployment

For production:
1. Create a new Spotify app for production
2. Update the redirect URI to your production domain
3. Set the environment variables in your hosting platform
4. Never expose your Client Secret in client-side code