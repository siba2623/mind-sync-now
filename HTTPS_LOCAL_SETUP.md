# 🔒 Enable HTTPS for Local Development (Optional)

If you want to avoid the "not secure" warning from Spotify, you can enable HTTPS for your local development server.

## Method 1: Using Vite's Built-in HTTPS (Easiest)

### 1. Install mkcert (one-time setup)

**On Windows:**
```bash
# Using Chocolatey
choco install mkcert

# Or using Scoop
scoop install mkcert
```

**On macOS:**
```bash
brew install mkcert
```

**On Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

### 2. Create Local Certificate Authority
```bash
mkcert -install
```

### 3. Generate Certificate for localhost
```bash
# In your project root
mkcert localhost 127.0.0.1 ::1
```

This creates two files:
- `localhost+2.pem` (certificate)
- `localhost+2-key.pem` (private key)

### 4. Update Your Vite Config

Edit `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

### 5. Update Your Spotify Redirect URI
Change from:
```
http://localhost:8080/callback
```

To:
```
https://localhost:8080/callback
```

### 6. Update Your .env File
```env
VITE_SPOTIFY_REDIRECT_URI="https://localhost:8080/callback"
```

### 7. Start Your App
```bash
npm run dev
```

Your app will now run at `https://localhost:8080` with no security warnings!

---

## Method 2: Just Accept the Warning (Recommended)

Honestly, for development purposes, it's much easier to just:

1. Use `http://localhost:8080/callback`
2. Click "I understand" when Spotify shows the warning
3. Continue with development

The warning doesn't affect functionality - it's just Spotify being cautious about security.

---

## For Production

When you deploy to production:
- Your hosting provider (Vercel, Netlify, etc.) will automatically provide HTTPS
- Update your Spotify app with your production URL: `https://yourdomain.com/callback`
- No additional setup needed

---

## Troubleshooting HTTPS Setup

**Certificate errors:**
- Make sure mkcert is installed correctly
- Run `mkcert -install` to trust the local CA
- Restart your browser after setup

**Vite won't start:**
- Check that the certificate files exist in your project root
- Make sure the file paths in vite.config.ts are correct

**Still getting warnings:**
- Clear your browser cache
- Try incognito/private browsing mode
- Restart your development server