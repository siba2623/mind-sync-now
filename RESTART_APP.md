# 🔄 How to Restart the App

## If the app isn't loading, follow these steps:

---

## Method 1: Restart in Current Terminal

1. **Find the terminal** where you ran `npm run dev`
2. **Press** `Ctrl + C` to stop the server
3. **Run** `npm run dev` again
4. **Wait** for "ready" message
5. **Open** http://localhost:8080

---

## Method 2: Fresh Start

1. **Close** all terminals
2. **Open** new terminal
3. **Navigate** to project:
   ```bash
   cd mind-sync-now
   ```
4. **Run** the dev server:
   ```bash
   npm run dev
   ```
5. **Wait** for this message:
   ```
   VITE v5.4.19  ready in XXXms
   ➜  Local:   http://localhost:8080/
   ```
6. **Open** http://localhost:8080 in browser

---

## Method 3: Complete Reset

1. **Stop** any running servers (Ctrl + C)
2. **Clear** node modules cache:
   ```bash
   cd mind-sync-now
   rm -rf node_modules/.vite
   ```
3. **Restart** server:
   ```bash
   npm run dev
   ```
4. **Open** http://localhost:8080

---

## ✅ How to Know It's Working

You should see this in terminal:
```
VITE v5.4.19  ready in 558 ms
➜  Local:   http://localhost:8080/
➜  Network: http://10.64.25.68:8080/
```

And in browser at http://localhost:8080:
- MindSync login page
- Or Dashboard if already logged in

---

## 🐛 Common Issues

### Issue: Port 8080 already in use
**Solution**: 
```bash
# Kill process on port 8080
npx kill-port 8080
# Then restart
npm run dev
```

### Issue: "Cannot find module"
**Solution**:
```bash
npm install
npm run dev
```

### Issue: Browser shows old version
**Solution**:
- Press `Ctrl + Shift + R` (hard refresh)
- Or clear browser cache

---

## 📞 Quick Commands

**Start server**:
```bash
cd mind-sync-now
npm run dev
```

**Stop server**:
- Press `Ctrl + C` in terminal

**Check if running**:
```bash
curl http://localhost:8080
```

---

**Need Help?** Check `APP_IS_RUNNING.md` for more details!
