# Peer Support Network - Testing Guide

## 🧪 Testing Checklist

### Database Setup Tests

#### ✅ Migration Success
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%peer%' OR table_name LIKE '%support%');
```

**Expected Result**: 7 tables
- peer_support_profiles
- support_groups
- group_memberships
- chat_messages
- buddy_pairs
- moderation_logs
- user_reports

#### ✅ Default Groups Created
```sql
SELECT COUNT(*) as group_count FROM support_groups WHERE is_active = true;
```

**Expected Result**: 8 groups

#### ✅ RLS Policies Enabled
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('peer_support_profiles', 'support_groups', 'chat_messages');
```

**Expected Result**: Multiple policies per table

---

## 🎭 User Flow Tests

### Test 1: Profile Creation

**Steps:**
1. Navigate to `/peer-support`
2. Should see welcome screen
3. Click "Create Anonymous Profile"
4. Fill out form:
   - Display name: "TestUser123"
   - Pick a color
   - Add bio (optional)
   - Select conditions: Depression, Anxiety
   - Check terms agreement
5. Click "Create Profile"

**Expected Results:**
- ✅ Profile created successfully
- ✅ Redirected to Peer Support Hub
- ✅ Can see "My Support Groups" section
- ✅ Stats show 0 groups joined

**Database Verification:**
```sql
SELECT * FROM peer_support_profiles WHERE display_name = 'TestUser123';
```

---

### Test 2: Viewing Support Groups

**Steps:**
1. From hub, click "Browse Support Groups"
2. Should see list of 8 groups
3. Click on "Depression Support Circle"
4. View group details

**Expected Results:**
- ✅ All 8 groups displayed
- ✅ Each shows name, description, member count
- ✅ Can filter by category
- ✅ Can search by name

**Database Verification:**
```sql
SELECT name, category, 
  (SELECT COUNT(*) FROM group_memberships WHERE group_id = support_groups.id) as member_count
FROM support_groups 
WHERE is_active = true;
```

---

### Test 3: Joining a Group

**Steps:**
1. Browse groups
2. Click "Join" on "Anxiety Warriors"
3. Should be added to group
4. Return to hub

**Expected Results:**
- ✅ Join button changes to "Joined" or "Leave"
- ✅ Group appears in "My Groups" on hub
- ✅ Member count increases by 1

**Database Verification:**
```sql
SELECT gm.*, sg.name 
FROM group_memberships gm
JOIN support_groups sg ON gm.group_id = sg.id
JOIN peer_support_profiles psp ON gm.peer_profile_id = psp.id
WHERE psp.display_name = 'TestUser123';
```

---

### Test 4: Sending a Message (When UI Complete)

**Steps:**
1. Open a group you've joined
2. Type message: "Hello everyone!"
3. Click send

**Expected Results:**
- ✅ Message appears immediately (optimistic UI)
- ✅ Message saved to database
- ✅ Other users receive in real-time
- ✅ Timestamp shows "just now"

**Database Verification:**
```sql
SELECT cm.*, psp.display_name 
FROM chat_messages cm
JOIN peer_support_profiles psp ON cm.sender_profile_id = psp.id
WHERE cm.content = 'Hello everyone!'
ORDER BY cm.created_at DESC
LIMIT 1;
```

---

## 🚨 Safety Tests

### Test 5: Crisis Keyword Detection

**Test Input:**
```typescript
const testMessages = [
  "I want to end it all",
  "thinking about suicide",
  "I'm going to hurt myself",
  "not worth living anymore"
];

for (const msg of testMessages) {
  const result = await moderationService.moderateContent(msg);
  console.log(msg, '→', result);
}
```

**Expected Results:**
```javascript
{
  isSafe: false,
  confidence: 0.95,
  flags: ['crisis', 'suicide_risk'],
  suggestedAction: 'escalate',
  reason: 'Crisis language detected. User needs immediate support.'
}
```

**What Should Happen:**
- ✅ Message blocked from posting
- ✅ Crisis resources shown to user
- ✅ Moderators alerted
- ✅ Moderation log created

---

### Test 6: Harmful Content Detection

**Test Input:**
```typescript
const testMessages = [
  "You're an idiot",
  "STOP BEING SO STUPID!!!",
  "aaaaaaaaaaaaaaaa" (spam),
  "You should stop taking your medication" (medical advice)
];

for (const msg of testMessages) {
  const result = await moderationService.moderateContent(msg);
  console.log(msg, '→', result);
}
```

**Expected Results:**
- Harassment → `flags: ['harassment'], suggestedAction: 'flag'`
- Excessive caps → `flags: ['excessive_caps']`
- Spam → `flags: ['spam'], suggestedAction: 'flag'`
- Medical advice → `flags: ['medical_advice'], suggestedAction: 'flag'`

---

### Test 7: Rate Limiting

**Test:**
```typescript
const profileId = 'test-profile-id';

// Send 11 messages rapidly
for (let i = 0; i < 11; i++) {
  const result = await moderationService.checkRateLimit(profileId);
  console.log(`Message ${i + 1}:`, result);
}
```

**Expected Results:**
- Messages 1-10: `{ allowed: true }`
- Message 11: `{ allowed: false, reason: 'Rate limit exceeded...' }`

---

### Test 8: Content Sanitization

**Test Input:**
```typescript
const testMessages = [
  "  Too   many    spaces  ",
  "<script>alert('xss')</script>",
  "A".repeat(3000) // Too long
];

for (const msg of testMessages) {
  const sanitized = moderationService.sanitizeContent(msg);
  console.log('Original:', msg.length, 'Sanitized:', sanitized.length);
}
```

**Expected Results:**
- Whitespace normalized
- Script tags removed
- Content truncated to 2000 chars

---

## 🔐 Security Tests

### Test 9: Row Level Security

**Test: User can only see messages in their groups**

```sql
-- As User A (member of Group 1)
SELECT * FROM chat_messages WHERE group_id = 'group-1-id';
-- Should return messages

SELECT * FROM chat_messages WHERE group_id = 'group-2-id';
-- Should return empty (not a member)
```

**Test: User can only update their own profile**

```sql
-- As User A
UPDATE peer_support_profiles 
SET display_name = 'NewName' 
WHERE user_id = 'user-a-id';
-- Should succeed

UPDATE peer_support_profiles 
SET display_name = 'Hacked' 
WHERE user_id = 'user-b-id';
-- Should fail (RLS violation)
```

---

### Test 10: Anonymous Profile Privacy

**Verify:**
- ✅ No real names visible
- ✅ No email addresses exposed
- ✅ No profile photos
- ✅ Only display name and avatar color shown
- ✅ User ID not exposed in UI

**Database Check:**
```sql
-- This should NOT be accessible via API
SELECT psp.*, p.email 
FROM peer_support_profiles psp
JOIN profiles p ON psp.user_id = p.id;
```

---

## 🔄 Real-Time Tests

### Test 11: Real-Time Message Delivery

**Setup:**
1. Open app in two browser windows
2. Log in as different users
3. Both join same group

**Test:**
1. User A sends message
2. User B should receive immediately

**Expected Results:**
- ✅ Message appears in User B's chat within 1 second
- ✅ No page refresh needed
- ✅ Typing indicator shows when User A is typing
- ✅ Online status updates

---

### Test 12: Presence Tracking

**Test:**
```typescript
// Subscribe to group presence
peerSupportService.subscribeToGroup(
  groupId,
  (message) => console.log('New message:', message),
  (presence) => console.log('Online users:', presence)
);

// Check who's online
// Should see list of active users
```

**Expected Results:**
- ✅ Online users list updates in real-time
- ✅ User appears online when active
- ✅ User appears offline after 5 minutes of inactivity

---

## 📊 Performance Tests

### Test 13: Message Loading Performance

**Test:**
```typescript
console.time('Load messages');
const messages = await peerSupportService.getMessages({
  groupId: 'test-group',
  limit: 50
});
console.timeEnd('Load messages');
```

**Expected Results:**
- ✅ Loads in < 500ms
- ✅ Pagination works (50 messages at a time)
- ✅ Infinite scroll loads more

---

### Test 14: Group List Performance

**Test:**
```typescript
console.time('Load groups');
const groups = await peerSupportService.listSupportGroups();
console.timeEnd('Load groups');
```

**Expected Results:**
- ✅ Loads in < 300ms
- ✅ Member counts accurate
- ✅ Filtering is instant

---

## 🎯 Integration Tests

### Test 15: Crisis Detection Integration

**Test:**
1. Send crisis message in peer support
2. Verify crisis detection system triggered

**Expected Flow:**
```
User sends crisis message
  → moderationService detects
  → crisisDetectionService.triggerAlert()
  → Crisis resources shown
  → Emergency contacts notified (if configured)
```

---

### Test 16: Vitality Points Integration

**Test:**
1. Send helpful message in group
2. Check vitality points increased

**Expected:**
```typescript
// Before
const pointsBefore = await vitalityPointsService.getPoints(userId);

// Send message
await peerSupportService.sendMessage({...});

// After
const pointsAfter = await vitalityPointsService.getPoints(userId);

// Should increase by 1-5 points
expect(pointsAfter).toBeGreaterThan(pointsBefore);
```

---

## 🐛 Edge Case Tests

### Test 17: Empty States

**Test:**
- New user with no groups → Show empty state
- Group with no messages → Show welcome message
- No search results → Show "no results" message

---

### Test 18: Error Handling

**Test:**
- Network offline → Queue messages
- Database error → Show error message
- Invalid input → Show validation error
- Rate limit hit → Show "slow down" message

---

### Test 19: Concurrent Users

**Test:**
1. 10 users join same group
2. All send messages simultaneously
3. Verify all messages delivered
4. Check for race conditions

---

### Test 20: Data Cleanup

**Test:**
```sql
-- Messages older than 90 days should be deleted
SELECT COUNT(*) FROM chat_messages 
WHERE created_at < NOW() - INTERVAL '90 days';
-- Should be 0 (or have deletion job)
```

---

## 📱 Mobile Tests

### Test 21: Mobile Responsiveness

**Test on:**
- iPhone (iOS Safari)
- Android (Chrome)
- Tablet (iPad)

**Verify:**
- ✅ Chat interface fits screen
- ✅ Keyboard doesn't cover input
- ✅ Touch targets are large enough
- ✅ Swipe gestures work
- ✅ Notifications work

---

### Test 22: Offline Support

**Test:**
1. Go offline
2. Type message
3. Go back online

**Expected:**
- ✅ Message queued while offline
- ✅ Sent automatically when online
- ✅ User notified of offline status

---

## 🎭 User Acceptance Tests

### Test 23: Complete User Journey

**Scenario: New user joins and participates**

1. ✅ Create profile (< 2 minutes)
2. ✅ Browse groups (find relevant group)
3. ✅ Join group (one click)
4. ✅ Read messages (understand context)
5. ✅ Send first message (feel welcomed)
6. ✅ Receive replies (feel connected)
7. ✅ Return next day (retention)

---

### Test 24: Moderation Workflow

**Scenario: User reports inappropriate content**

1. ✅ See inappropriate message
2. ✅ Long-press → Report
3. ✅ Select reason
4. ✅ Submit report
5. ✅ Moderator receives alert
6. ✅ Moderator reviews
7. ✅ Action taken (warning/ban)
8. ✅ Reporter notified

---

## 📊 Metrics to Track

### Adoption Metrics
- % of users who create peer profile
- Time to first message
- Groups joined per user

### Engagement Metrics
- Messages sent per day
- Active users per group
- Session duration in peer support

### Safety Metrics
- Moderation incidents per 1000 messages
- Crisis detections per day
- Response time to reports

### Impact Metrics
- Mood improvement for engaged users
- Retention rate (7-day, 30-day)
- User satisfaction (surveys)

---

## 🚀 Pre-Launch Checklist

### Before Beta Launch
- [ ] All database migrations run (use SAFE version)
- [ ] RLS policies tested
- [ ] Crisis detection working
- [ ] Rate limiting functional
- [ ] Mobile responsive
- [ ] Moderators trained
- [ ] Crisis resources updated
- [ ] Terms of service reviewed
- [ ] Privacy policy updated
- [ ] Analytics tracking setup

### Before Public Launch
- [ ] Beta feedback incorporated
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] Backup/recovery tested
- [ ] Monitoring alerts configured
- [ ] Support team trained
- [ ] Marketing materials ready
- [ ] Press release prepared
- [ ] Launch plan finalized

---

## 🔧 Debugging Tips

### Message not appearing?
```typescript
// Check subscription
console.log('Subscribed channels:', peerSupportService.channels);

// Check RLS
// Run as authenticated user in Supabase
SELECT * FROM chat_messages WHERE group_id = 'your-group-id';
```

### Can't join group?
```sql
-- Check group capacity
SELECT 
  sg.name,
  sg.max_members,
  COUNT(gm.id) as current_members
FROM support_groups sg
LEFT JOIN group_memberships gm ON sg.id = gm.group_id
WHERE sg.id = 'your-group-id'
GROUP BY sg.id;
```

### Crisis detection not working?
```typescript
// Test moderation service
const result = await moderationService.moderateContent('suicide');
console.log('Should escalate:', result.suggestedAction === 'escalate');
```

---

*Testing Guide - February 10, 2026*
*Use this guide to ensure quality before launch*
