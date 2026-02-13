# Peer Support Network - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run the Database Migration (2 min)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of:
   ```
   mind-sync-now/supabase/migrations/20260210_peer_support_network_SAFE.sql
   ```
3. Click "Run"
4. You should see: "Peer Support Network schema created successfully!"

**Note:** Use the `_SAFE.sql` version to avoid conflicts with existing tables.

### Step 2: Verify Installation (1 min)

Run this query in Supabase:
```sql
SELECT COUNT(*) as group_count FROM peer_support_groups;
```

Expected result: **8 groups** (the default support groups)

### Step 3: Test in Your App (2 min)

1. Start your app: `npm run dev`
2. Navigate to: `/peer-support`
3. You should see the welcome screen
4. Click "Create Anonymous Profile"
5. Fill out the form and submit
6. You're in! 🎉

## 📱 User Journey

### Creating Your Profile
```
1. Choose a display name (e.g., "HopefulJourney")
2. Pick your avatar color
3. Write a short bio (optional)
4. Select your mental health conditions
5. Agree to community guidelines
6. Done!
```

### Joining Your First Group
```
1. From the hub, click "Browse Support Groups"
2. See 8 default groups:
   - Depression Support Circle
   - Anxiety Warriors
   - Bipolar Balance
   - PTSD Recovery
   - Medication Side Effects
   - Work & Mental Health
   - New to Therapy
   - General Wellness
3. Click on a group to see details
4. Click "Join Group"
5. Start chatting!
```

## 🔐 Safety Features (Built-In)

### Automatic Crisis Detection
If someone types crisis keywords like:
- "suicide" or "kill myself"
- "self harm" or "cutting"
- "not worth living"

**The system automatically:**
1. ❌ Blocks the message
2. 🆘 Shows crisis resources to the sender
3. 🚨 Alerts moderators
4. 📞 Triggers your existing crisis detection system

### Content Moderation
- ✅ Rate limiting (10 messages/minute)
- ✅ Spam detection
- ✅ Harmful content filtering
- ✅ Medical advice blocking
- ✅ Reputation system

### Privacy Protection
- ✅ Anonymous profiles only
- ✅ No real names or photos
- ✅ Avatar colors instead
- ✅ Row Level Security
- ✅ No external links allowed

## 🎯 What's Working Now

### ✅ Fully Functional
- Anonymous profile creation
- Support group browsing
- Group membership management
- Real-time chat infrastructure
- Crisis detection
- Content moderation
- Reputation system
- Database with RLS

### 🚧 Needs UI Components
- Group chat interface (messages display)
- Message composer
- Online user list
- Report modal
- Buddy chat interface

## 📊 Default Support Groups

| Group Name | Category | Description |
|------------|----------|-------------|
| Depression Support Circle | depression | Safe space for those experiencing depression |
| Anxiety Warriors | anxiety | Connect with others managing anxiety |
| Bipolar Balance | bipolar | Support for bipolar disorder |
| PTSD Recovery | ptsd | Healing together from trauma |
| Medication Side Effects | medication | Discuss medication experiences |
| Work & Mental Health | work | Balancing career and wellness |
| New to Therapy | therapy | For those starting therapy |
| General Wellness | general | Open discussion for all topics |

## 🔧 Quick Troubleshooting

### "Profile not found" error
- Make sure you ran the database migration
- Check that `peer_support_profiles` table exists
- Verify RLS policies are enabled

### Can't see support groups
- Run: `SELECT * FROM support_groups WHERE is_active = true;`
- Should return 8 groups
- If empty, re-run the migration

### Real-time messages not working
- Check Supabase Realtime is enabled
- Verify your Supabase URL and anon key
- Check browser console for errors

## 📝 Next Steps

### To Complete the Feature:

1. **Create GroupChat Component**
   - Display messages in real-time
   - Message composer
   - Send button
   - Typing indicators

2. **Create ChatMessage Component**
   - Show sender avatar (colored circle)
   - Display name and timestamp
   - Message content
   - Report option

3. **Add Navigation**
   - Add routes to App.tsx
   - Add "Peer Support" to main menu
   - Add notification badges

4. **Test with Users**
   - Create multiple test accounts
   - Join same group
   - Send messages
   - Verify real-time delivery

## 💡 Pro Tips

### For Testing
```typescript
// Create a test profile quickly
await peerSupportService.createPeerProfile({
  display_name: 'TestUser' + Math.random().toString(36).substr(2, 5),
  avatar_color: '#6366f1',
  conditions: ['Depression', 'Anxiety']
});
```

### For Debugging
```typescript
// Check if user has profile
const profile = await peerSupportService.getPeerProfile();
console.log('My profile:', profile);

// List all groups
const groups = await peerSupportService.listSupportGroups();
console.log('Available groups:', groups);

// Check group membership
const isMember = await peerSupportService.isGroupMember(groupId);
console.log('Am I a member?', isMember);
```

### For Moderation
```typescript
// Test content moderation
const result = await moderationService.moderateContent('test message');
console.log('Moderation result:', result);

// Check for crisis keywords
const crisisTest = await moderationService.moderateContent('I want to end it all');
console.log('Crisis detected:', crisisTest.suggestedAction === 'escalate');
```

## 🎨 Customization Ideas

### Add More Groups
```sql
INSERT INTO support_groups (name, description, category, group_type, guidelines)
VALUES (
  'Your Group Name',
  'Group description',
  'category_name',
  'condition',
  'Group guidelines here'
);
```

### Change Avatar Colors
Edit `AVATAR_COLORS` array in `PeerProfileSetup.tsx`

### Adjust Rate Limits
Edit `checkRateLimit()` in `moderationService.ts`

### Add More Crisis Keywords
Edit `CRISIS_KEYWORDS` array in `moderationService.ts`

## 📞 Support

If you run into issues:
1. Check the full implementation guide: `PEER_SUPPORT_NETWORK_IMPLEMENTATION.md`
2. Review the database schema in the migration file
3. Check Supabase logs for errors
4. Verify RLS policies are working

## 🎊 You're Ready!

The foundation is solid. Now you just need to:
1. Build the chat UI components
2. Add navigation
3. Test with real users
4. Iterate based on feedback

**This feature could literally save lives. Let's make it amazing! 🚀**

---

*Quick Start Guide - February 10, 2026*
