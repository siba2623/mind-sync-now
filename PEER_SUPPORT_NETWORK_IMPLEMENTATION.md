# Real-Time Peer Support Network - Implementation Guide

## 🎉 What We Built

A comprehensive, safety-first peer support system that connects MindSync users experiencing similar mental health challenges. This feature reduces isolation and provides real-time emotional support between professional care sessions.

## 🏗️ Architecture

### Database Layer
- **7 new tables** with Row Level Security
- **Real-time subscriptions** via Supabase Realtime
- **Automated triggers** for activity tracking
- **8 default support groups** pre-seeded

### Service Layer
- `peerSupportService.ts` - Core chat and group management
- `moderationService.ts` - Safety and content filtering
- Crisis detection integration

### UI Components
- `PeerSupportHub.tsx` - Main dashboard
- `PeerProfileSetup.tsx` - Anonymous profile creation
- Additional components needed (see tasks below)

## 📋 Implementation Status

### ✅ Completed (Phase 1)
1. **Database Schema** - Complete with RLS policies
2. **Peer Support Service** - Real-time chat infrastructure
3. **Moderation Service** - Crisis detection and content filtering
4. **Hub Component** - Main entry point
5. **Profile Setup** - Anonymous profile creation

### 🚧 Remaining Tasks

#### High Priority (MVP)
1. **SupportGroupList Component** - Browse and join groups
2. **GroupChat Component** - Real-time messaging interface
3. **ChatMessage Component** - Individual message display
4. **Navigation Integration** - Add to app routing
5. **Crisis Integration** - Connect to existing crisis system

#### Medium Priority
6. **Buddy System** - 1-on-1 matching (basic version)
7. **Report Modal** - User reporting interface
8. **Notification Integration** - Message alerts
9. **Vitality Points** - Reward peer support participation

#### Low Priority (Future)
10. **Moderation Dashboard** - Admin tools
11. **Advanced Buddy Matching** - Algorithm-based pairing
12. **Voice Messages** - Audio clip support
13. **Group Analytics** - Engagement metrics

## 🚀 Quick Start

### Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
-- mind-sync-now/supabase/migrations/20260210_peer_support_network.sql
```

This creates:
- All 7 tables with indexes
- Row Level Security policies
- Helper functions and triggers
- 8 default support groups

### Step 2: Verify Tables Created

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%peer%' OR table_name LIKE '%support%';
```

You should see:
- peer_support_profiles
- support_groups
- group_memberships
- chat_messages
- buddy_pairs
- moderation_logs
- user_reports

### Step 3: Test Profile Creation

Navigate to `/peer-support` in your app. You should see:
1. Welcome screen (if no profile)
2. Profile setup form
3. After creation, the main hub

### Step 4: Join a Support Group

The 8 default groups are:
1. Depression Support Circle
2. Anxiety Warriors
3. Bipolar Balance
4. PTSD Recovery
5. Medication Side Effects
6. Work & Mental Health
7. New to Therapy
8. General Wellness

## 🔐 Safety Features

### Crisis Detection
The moderation service automatically detects crisis keywords:
- "suicide", "kill myself", "end it all"
- "self harm", "cutting", "overdose"
- "not worth living", "want to die"

**When detected:**
1. Message is blocked from posting
2. Crisis resources shown to sender
3. Moderators alerted
4. Existing crisis detection system triggered
5. Incident logged

### Content Moderation
- **AI filtering** for harmful content
- **Rate limiting** (10 messages/minute)
- **Spam detection** (repeated characters)
- **Medical advice blocking** (peer support ≠ medical advice)
- **Reputation system** (karma points)

### Privacy Protection
- **Anonymous profiles** only
- **No real names** or photos
- **Avatar colors** instead of images
- **Row Level Security** on all tables
- **End-to-end encryption** (planned for 1-on-1 chats)

## 📱 User Flow

### First Time User
1. Open Peer Support → See welcome screen
2. Click "Create Anonymous Profile"
3. Choose display name (e.g., "HopefulJourney")
4. Pick avatar color
5. Write optional bio (200 chars)
6. Select mental health conditions
7. Agree to community guidelines
8. Profile created → Redirected to hub

### Joining a Group
1. Hub → "Browse Support Groups"
2. Filter by category or search
3. View group details (description, member count)
4. Click "Join Group"
5. Redirected to group chat

### Chatting in a Group
1. View message history (infinite scroll)
2. See who's online (presence indicators)
3. Type message (2000 char limit)
4. Send → Real-time delivery to all members
5. See typing indicators
6. React with emojis (planned)
7. Report inappropriate content

## 🔧 Technical Details

### Real-Time Chat

```typescript
// Subscribe to group messages
const unsubscribe = peerSupportService.subscribeToGroup(
  groupId,
  (message) => {
    // New message received
    console.log('New message:', message);
  },
  (presence) => {
    // Online users updated
    console.log('Online users:', presence);
  }
);

// Send a message
await peerSupportService.sendMessage({
  groupId: 'uuid',
  content: 'Hello everyone!',
  messageType: 'text'
});

// Cleanup
unsubscribe();
```

### Content Moderation

```typescript
// Check message before sending
const result = await moderationService.moderateContent(messageText);

if (!result.isSafe) {
  if (result.suggestedAction === 'escalate') {
    // Crisis detected - show resources
    showCrisisSupport();
  } else if (result.suggestedAction === 'block') {
    // Block message
    showError('Message contains inappropriate content');
  }
}
```

### Reputation System

Users earn/lose points:
- **+1** per helpful message
- **+5** for upvoted messages (planned)
- **+10** for completing buddy trial
- **+20** for moderator commendation
- **-5** for abandoning buddy
- **-10** for validated report
- **-50** for timeout/ban

## 🎨 UI Components Needed

### SupportGroupList.tsx
```tsx
- Display available groups
- Filter by category (depression, anxiety, etc.)
- Search functionality
- Show member count and last activity
- Join/leave buttons
- Group details modal
```

### GroupChat.tsx
```tsx
- Message list with infinite scroll
- Message composer with character count
- Send button with loading state
- Emoji picker
- Typing indicators
- Online member list sidebar
- Report message option
- Leave group button
```

### ChatMessage.tsx
```tsx
- Sender avatar (colored circle)
- Display name
- Message content
- Timestamp (relative: "2m ago")
- Edited indicator
- Deleted placeholder
- Long-press menu (report, copy)
- System message styling
```

### ReportModal.tsx
```tsx
- Report reason dropdown
- Description textarea
- Block user checkbox
- Submit button
- Confirmation dialog
```

## 🔗 Integration Points

### With Existing Features

1. **Crisis Detection System**
   ```typescript
   // In moderationService.ts
   if (crisisDetected) {
     await crisisDetectionService.triggerAlert(userId);
   }
   ```

2. **Vitality Points**
   ```typescript
   // Award points for peer support
   await vitalityPointsService.awardPoints(userId, 5, 'peer_support_message');
   ```

3. **Notifications**
   ```typescript
   // New message notification
   await notificationService.send({
     userId,
     title: 'New message in Depression Support',
     body: 'HopefulJourney: Thanks for sharing...',
     type: 'peer_support'
   });
   ```

4. **Mental Health Twin**
   ```typescript
   // Suggest peer support when struggling
   if (moodScore < 3) {
     suggestPeerSupport('You might benefit from talking to others');
   }
   ```

## 📊 Database Queries

### Get Active Groups
```sql
SELECT * FROM support_groups 
WHERE is_active = true 
ORDER BY last_activity DESC;
```

### Get Group Messages
```sql
SELECT cm.*, psp.display_name, psp.avatar_color
FROM chat_messages cm
JOIN peer_support_profiles psp ON cm.sender_profile_id = psp.id
WHERE cm.group_id = 'uuid' 
AND cm.deleted_at IS NULL
ORDER BY cm.created_at DESC
LIMIT 50;
```

### Get My Groups
```sql
SELECT sg.* 
FROM support_groups sg
JOIN group_memberships gm ON sg.id = gm.group_id
JOIN peer_support_profiles psp ON gm.peer_profile_id = psp.id
WHERE psp.user_id = auth.uid()
AND sg.is_active = true;
```

## 🧪 Testing Checklist

- [ ] Can create anonymous profile
- [ ] Profile validation works (name length, conditions)
- [ ] Can view support groups list
- [ ] Can join a support group
- [ ] Can send messages in group
- [ ] Messages appear in real-time
- [ ] Crisis keywords are detected
- [ ] Can report inappropriate content
- [ ] Rate limiting works (10 msg/min)
- [ ] Can leave a group
- [ ] Reputation score updates
- [ ] Mobile responsive
- [ ] Offline message queuing
- [ ] Performance with 50+ users

## 🚨 Known Limitations

1. **No voice/video calls** - Text only for MVP
2. **Basic buddy matching** - No algorithm yet
3. **Limited moderation tools** - Admin dashboard needed
4. **No message editing** - Can only delete
5. **No emoji reactions** - Planned for Phase 2
6. **No file sharing** - Security concern
7. **No external links** - Prevents spam/phishing

## 📈 Success Metrics

Track these KPIs:
- **Adoption rate**: % of users who create peer profile
- **Engagement**: Messages sent per active user
- **Retention**: Users active after 7/30 days
- **Safety**: Moderation incidents per 1000 messages
- **Impact**: Mood improvement for engaged users

## 🎯 Next Steps

1. **Complete remaining UI components** (GroupChat, etc.)
2. **Add navigation routes** to App.tsx
3. **Test with real users** (beta group)
4. **Gather feedback** on safety and usability
5. **Iterate on moderation** based on incidents
6. **Launch buddy matching** (Phase 2)
7. **Add voice messages** (Phase 3)

## 💡 Future Enhancements

- **Video support groups** (scheduled sessions)
- **Professional-led workshops** (licensed therapists)
- **Advanced AI moderation** (sentiment analysis)
- **Multi-language support** (translate messages)
- **Gamification** (badges, streaks, challenges)
- **Integration with wearables** (share wellness data)
- **Family/caregiver access** (opt-in sharing)

## 📚 Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Mental Health Peer Support Best Practices](https://www.samhsa.gov/brss-tacs/recovery-support-tools/peers)
- [Online Community Moderation Guide](https://www.communityroundtable.com/what-we-do/research/community-moderation/)
- [Crisis Intervention Protocols](https://www.crisistextline.org/)

---

## 🎊 Impact

This feature addresses a critical gap in mental health care: **the isolation between professional sessions**. By connecting users with shared experiences, we:

1. **Reduce loneliness** - "I'm not alone in this"
2. **Provide 24/7 support** - Someone is always there
3. **Build community** - Lasting connections
4. **Improve outcomes** - Peer support enhances therapy
5. **Save lives** - Crisis detection and intervention

**This could be the most impactful feature in MindSync.**

---

*Created: February 10, 2026*
*Status: Phase 1 Complete, Ready for Phase 2*
