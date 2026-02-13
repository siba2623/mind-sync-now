# 🤝 How to Access Peer Support

## 📱 In the App

### Method 1: Bottom Navigation (Mobile)
1. Open the app on your phone or in mobile view
2. Look at the **bottom navigation bar**
3. Tap the **"Support"** icon (💬 message bubble)
4. You're in! 🎉

### Method 2: Direct URL
Simply navigate to:
```
http://localhost:8080/#/peer-support
```

### Method 3: From Dashboard
Once we add a card to the dashboard, you'll be able to click:
- "Join Peer Support" button
- Or a quick link in the wellness section

## 🎯 What You'll See

### First Time (No Profile)
```
┌─────────────────────────────────┐
│  👥 Welcome to Peer Support     │
│                                  │
│  Connect with others who        │
│  understand what you're going   │
│  through...                     │
│                                  │
│  [Create Anonymous Profile]     │
│                                  │
│  Safety First:                  │
│  • All profiles anonymous       │
│  • Moderated by volunteers      │
│  • Crisis detection built-in    │
└─────────────────────────────────┘
```

### After Creating Profile
```
┌─────────────────────────────────┐
│  🚨 In Crisis? [Get Help]       │
│                                  │
│  My Support Groups              │
│  • Depression Support (24)      │
│  • Anxiety Warriors (31)        │
│                                  │
│  [Browse Support Groups]        │
│  [Edit My Profile]              │
└─────────────────────────────────┘
```

## 🗺️ Navigation Structure

```
/peer-support              → Main hub (PeerSupportHub)
/peer-support/setup        → Create profile (PeerProfileSetup)
/peer-support/groups       → Browse groups (TODO)
/peer-support/group/:id    → Group chat (TODO)
```

## 📍 Where It Appears

### ✅ Added to:
- **App.tsx** - Routes configured
- **MobileNavigation.tsx** - Bottom nav icon (💬 Support)

### 🚧 Not Yet Added to:
- Dashboard cards (can add a "Join Peer Support" card)
- Profile page (can add link to peer profile)
- Settings menu (can add peer support settings)

## 🎨 Navigation Icon

The Peer Support feature uses:
- **Icon**: MessageCircle (💬)
- **Label**: "Support"
- **Color**: Warning (orange/yellow theme)
- **Position**: 3rd icon in bottom nav (between Health and Community)

## 🔗 Quick Links

### Development
- Local: http://localhost:8080/#/peer-support
- Network: http://192.168.32.44:8080/#/peer-support

### Production (when deployed)
- https://your-domain.com/#/peer-support

## 📱 Mobile Navigation Order

```
┌─────┬─────┬─────────┬───────────┬─────────┐
│ 🏠  │ ❤️  │   💬    │    👥     │   👤    │
│Home │Health│ Support │ Community │ Profile │
└─────┴─────┴─────────┴───────────┴─────────┘
```

## 🎯 Testing Steps

1. **Clear browser cache** (if you had the app open before)
2. **Refresh the page** (Ctrl + Shift + R)
3. **Log in** to your account
4. **Look at bottom navigation** - you should see "Support" icon
5. **Tap/Click "Support"** - opens Peer Support Hub
6. **Create profile** if first time
7. **Browse groups** and join one

## ⚠️ Important Notes

### Before Using:
1. **Run the database migration** first:
   - File: `supabase/migrations/20260210_peer_support_network_SAFE.sql`
   - Run in Supabase SQL Editor
   - This creates the 8 default support groups

2. **Verify migration worked**:
   ```sql
   SELECT COUNT(*) FROM peer_support_groups;
   -- Should return: 8
   ```

### If You Don't See It:
1. Hard refresh: `Ctrl + Shift + R`
2. Check you're logged in
3. Check you're on a page that shows bottom nav (not auth page)
4. Try mobile view if on desktop (F12 → Toggle device toolbar)

## 🎊 You're All Set!

The Peer Support feature is now accessible from the bottom navigation bar. Just tap the **💬 Support** icon and you're in!

---

*Created: February 10, 2026*
*Location: Bottom navigation, 3rd icon*
