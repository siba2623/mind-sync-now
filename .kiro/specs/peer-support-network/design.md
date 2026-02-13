# Real-Time Peer Support Network - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├─────────────────────────────────────────────────────────────┤
│  PeerSupportHub  │  SupportGroups  │  BuddyChat  │  Profile │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  peerSupportService  │  moderationService  │  matchingService│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend (PostgreSQL + Realtime)        │
├─────────────────────────────────────────────────────────────┤
│  Tables  │  RLS Policies  │  Functions  │  Realtime Channels │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### peer_support_profiles
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- display_name (text) -- Anonymous name
- avatar_color (text) -- Color for avatar
- bio (text, max 200 chars)
- conditions (text[]) -- Mental health conditions
- is_active (boolean)
- reputation_score (integer)
- joined_at (timestamp)
- last_active (timestamp)
```

### support_groups
```sql
- id (uuid, PK)
- name (text)
- description (text)
- category (text) -- depression, anxiety, bipolar, etc.
- group_type (text) -- condition, topic, general
- max_members (integer, default 50)
- is_moderated (boolean, default true)
- moderator_ids (uuid[])
- guidelines (text)
- created_at (timestamp)
- is_active (boolean)
```

### group_memberships
```sql
- id (uuid, PK)
- group_id (uuid, FK)
- peer_profile_id (uuid, FK)
- role (text) -- member, moderator, admin
- joined_at (timestamp)
- last_read_at (timestamp)
- is_muted (boolean)
```

### chat_messages
```sql
- id (uuid, PK)
- group_id (uuid, FK, nullable)
- buddy_pair_id (uuid, FK, nullable)
- sender_profile_id (uuid, FK)
- content (text)
- message_type (text) -- text, voice, system
- is_flagged (boolean)
- flagged_reason (text)
- created_at (timestamp)
- edited_at (timestamp)
- deleted_at (timestamp)
```

### buddy_pairs
```sql
- id (uuid, PK)
- profile_1_id (uuid, FK)
- profile_2_id (uuid, FK)
- status (text) -- pending, active, ended
- matched_at (timestamp)
- trial_ends_at (timestamp)
- ended_at (timestamp)
- match_score (integer)
```

### moderation_logs
```sql
- id (uuid, PK)
- message_id (uuid, FK)
- reported_by_profile_id (uuid, FK)
- moderator_id (uuid, FK, nullable)
- action_taken (text) -- warning, timeout, ban, none
- reason (text)
- ai_confidence (float)
- created_at (timestamp)
- resolved_at (timestamp)
```

### user_reports
```sql
- id (uuid, PK)
- reporter_profile_id (uuid, FK)
- reported_profile_id (uuid, FK)
- message_id (uuid, FK, nullable)
- reason (text)
- description (text)
- status (text) -- pending, reviewed, resolved
- created_at (timestamp)
```

## Component Architecture

### 1. PeerSupportHub (Main Entry)
```tsx
- Overview dashboard
- Active groups list
- Buddy status
- Quick access to crisis support
- Community highlights
```

### 2. SupportGroupList
```tsx
- Browse available groups
- Filter by category
- Join/leave groups
- Group member count
- Last activity timestamp
```

### 3. GroupChat
```tsx
- Real-time message stream
- Message composer
- Emoji reactions
- Member list sidebar
- Report/block functionality
- Typing indicators
```

### 4. BuddyChat
```tsx
- 1-on-1 messaging
- Check-in reminders
- Shared goals tracker
- End partnership option
```

### 5. PeerProfile
```tsx
- Anonymous profile setup
- Display name editor
- Bio and conditions
- Reputation score display
- Privacy settings
```

### 6. ModerationDashboard (Admin)
```tsx
- Flagged content queue
- User reports
- Ban/timeout controls
- Analytics
```

## Real-Time Features

### Supabase Realtime Channels
```typescript
// Group chat channel
const groupChannel = supabase.channel(`group:${groupId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `group_id=eq.${groupId}`
  }, handleNewMessage)
  .on('presence', { event: 'sync' }, handlePresence)
  .subscribe()

// Buddy chat channel
const buddyChannel = supabase.channel(`buddy:${pairId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `buddy_pair_id=eq.${pairId}`
  }, handleNewMessage)
  .subscribe()
```

## Safety & Moderation System

### AI Content Filtering
```typescript
interface ModerationResult {
  isSafe: boolean
  confidence: number
  flags: string[] // ['suicide', 'self-harm', 'violence', 'harassment']
  suggestedAction: 'allow' | 'flag' | 'block' | 'escalate'
}
```

### Crisis Keywords Detection
```typescript
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'not worth living',
  'self harm', 'cutting', 'overdose', 'goodbye forever'
]

// Immediate actions:
// 1. Block message from posting
// 2. Show crisis resources to sender
// 3. Alert moderators
// 4. Trigger crisis detection system
// 5. Notify emergency contacts (if configured)
```

### Reputation System
```typescript
// Earn points for:
- Helpful messages (upvoted by others): +5
- Regular participation: +1/day
- Completing buddy trial: +10
- Moderator commendation: +20

// Lose points for:
- Reported content (if validated): -10
- Timeout/ban: -50
- Abandoning buddy: -5
```

## Matching Algorithm (Buddy System)

```typescript
interface MatchingCriteria {
  conditions: string[] // Shared mental health conditions
  ageRange: [number, number] // Similar age
  timezone: string // Compatible time zones
  goals: string[] // Similar recovery goals
  availability: string[] // When they're active
  preferences: {
    gender?: string
    language?: string
  }
}

function calculateMatchScore(profile1, profile2): number {
  let score = 0
  
  // Shared conditions (40 points max)
  const sharedConditions = intersection(profile1.conditions, profile2.conditions)
  score += sharedConditions.length * 10
  
  // Age proximity (20 points max)
  const ageDiff = Math.abs(profile1.age - profile2.age)
  score += Math.max(0, 20 - ageDiff)
  
  // Timezone compatibility (20 points max)
  const tzDiff = Math.abs(profile1.timezone - profile2.timezone)
  score += Math.max(0, 20 - tzDiff * 2)
  
  // Shared goals (20 points max)
  const sharedGoals = intersection(profile1.goals, profile2.goals)
  score += sharedGoals.length * 5
  
  return score
}
```

## UI/UX Design Principles

### Color Coding
- **Green**: Active, online, positive
- **Yellow**: Away, caution
- **Red**: Crisis, urgent
- **Blue**: Calm, supportive
- **Purple**: Moderator/admin

### Accessibility
- High contrast mode
- Screen reader support
- Keyboard navigation
- Font size controls
- Reduced motion option

### Mobile-First
- Bottom navigation for quick access
- Swipe gestures for actions
- Haptic feedback for important events
- Offline message queuing
- Push notifications

## Privacy & Security

### Data Encryption
- End-to-end encryption for 1-on-1 chats
- TLS for all data in transit
- Encrypted at rest in database

### Anonymity Protection
- No real names required
- No profile photos (avatar colors only)
- No location sharing
- No external links allowed in messages

### Data Retention
- Messages deleted after 90 days
- User can delete messages immediately
- Moderation logs kept for 1 year
- Deleted accounts purged after 30 days

## Integration Points

### With Existing MindSync Features

1. **Crisis Detection System**
   - Peer support messages analyzed for crisis signals
   - Auto-escalate to professional support
   - Notify emergency contacts

2. **Mood Tracking**
   - Suggest groups based on recent mood patterns
   - "You seem down, want to chat with others?"

3. **Vitality Points**
   - Earn points for peer support participation
   - Unlock special badges

4. **Notifications**
   - New message alerts
   - Buddy check-in reminders
   - Group activity summaries

5. **Mental Health Twin**
   - AI suggests when to seek peer support
   - Recommends specific groups

## Performance Optimization

### Caching Strategy
- Cache group lists (5 min TTL)
- Cache user profiles (10 min TTL)
- Infinite scroll for messages
- Lazy load images/avatars

### Rate Limiting
- Max 10 messages per minute per user
- Max 5 group joins per hour
- Max 3 reports per day

### Scalability
- Horizontal scaling with Supabase
- CDN for static assets
- Message pagination
- Archive old groups (inactive > 30 days)

## Testing Strategy

### Unit Tests
- Message validation
- Moderation logic
- Matching algorithm
- Reputation calculations

### Integration Tests
- Real-time message delivery
- Group membership flows
- Buddy pairing process
- Report handling

### E2E Tests
- Complete user journey
- Crisis escalation flow
- Moderation workflow
- Mobile responsiveness

### Safety Testing
- Penetration testing
- Content filter accuracy
- Privacy leak detection
- Load testing (1000 concurrent users)
