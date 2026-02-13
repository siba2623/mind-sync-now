# Peer Support Network - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│  PeerSupportHub  │  GroupList  │  GroupChat  │  ProfileSetup   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  peerSupportService    │    moderationService                   │
│  - Chat management     │    - Crisis detection                  │
│  - Group operations    │    - Content filtering                 │
│  - Real-time subs      │    - Reputation system                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database  │  Realtime Engine  │  Row Level Security │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema Relationships

```
┌──────────────────────┐
│      profiles        │ (Existing MindSync table)
│  - id (PK)          │
│  - user_id          │
│  - email            │
└──────────────────────┘
          │
          │ 1:1
          ▼
┌──────────────────────┐
│ peer_support_profiles│
│  - id (PK)          │
│  - user_id (FK)     │◄────────┐
│  - display_name     │         │
│  - avatar_color     │         │
│  - conditions[]     │         │
│  - reputation_score │         │
└──────────────────────┘         │
          │                      │
          │ 1:N                  │
          ▼                      │
┌──────────────────────┐         │
│  group_memberships   │         │
│  - id (PK)          │         │
│  - group_id (FK)    │         │
│  - peer_profile_id  │─────────┘
│  - role             │
└──────────────────────┘
          │
          │ N:1
          ▼
┌──────────────────────┐
│   support_groups     │
│  - id (PK)          │◄────────┐
│  - name             │         │
│  - category         │         │
│  - max_members      │         │
│  - moderator_ids[]  │         │
└──────────────────────┘         │
          │                      │
          │ 1:N                  │
          ▼                      │
┌──────────────────────┐         │
│   chat_messages      │         │
│  - id (PK)          │         │
│  - group_id (FK)    │─────────┘
│  - sender_profile_id│─────────┐
│  - content          │         │
│  - is_flagged       │         │
└──────────────────────┘         │
          │                      │
          │ N:1                  │
          └──────────────────────┘

┌──────────────────────┐
│    buddy_pairs       │
│  - id (PK)          │
│  - profile_1_id (FK)│─────────┐
│  - profile_2_id (FK)│─────────┤
│  - status           │         │
│  - match_score      │         │
└──────────────────────┘         │
          │                      │
          │ 1:N                  │
          ▼                      │
┌──────────────────────┐         │
│   chat_messages      │         │
│  - buddy_pair_id(FK)│         │
└──────────────────────┘         │
                                 │
┌──────────────────────┐         │
│   user_reports       │         │
│  - id (PK)          │         │
│  - reporter_id (FK) │─────────┤
│  - reported_id (FK) │─────────┤
│  - message_id (FK)  │         │
│  - reason           │         │
└──────────────────────┘         │
                                 │
┌──────────────────────┐         │
│  moderation_logs     │         │
│  - id (PK)          │         │
│  - message_id (FK)  │         │
│  - moderator_id(FK) │─────────┘
│  - action_taken     │
│  - ai_confidence    │
└──────────────────────┘
```

## 🔄 Real-Time Message Flow

```
┌─────────────┐                    ┌─────────────┐
│   User A    │                    │   User B    │
│  (Sender)   │                    │ (Receiver)  │
└─────────────┘                    └─────────────┘
      │                                   │
      │ 1. Type message                   │
      │    "Hello everyone!"              │
      │                                   │
      ▼                                   │
┌─────────────────────────────────────┐  │
│  moderationService.moderateContent() │  │
│  - Check crisis keywords             │  │
│  - Check harmful content             │  │
│  - Check spam patterns               │  │
└─────────────────────────────────────┘  │
      │                                   │
      │ 2. If safe, send message          │
      │                                   │
      ▼                                   │
┌─────────────────────────────────────┐  │
│  peerSupportService.sendMessage()    │  │
│  - Insert into chat_messages table   │  │
│  - Returns message ID                │  │
└─────────────────────────────────────┘  │
      │                                   │
      │ 3. Database trigger fires         │
      │                                   │
      ▼                                   │
┌─────────────────────────────────────┐  │
│  Supabase Realtime Engine            │  │
│  - Detects INSERT on chat_messages   │  │
│  - Broadcasts to subscribed clients  │  │
└─────────────────────────────────────┘  │
      │                                   │
      │ 4. Real-time broadcast            │
      │                                   │
      └───────────────────────────────────►
                                          │
                                          ▼
                              ┌─────────────────────┐
                              │  Message received!  │
                              │  - Update UI        │
                              │  - Show notification│
                              │  - Play sound       │
                              └─────────────────────┘
```

## 🚨 Crisis Detection Flow

```
┌─────────────┐
│    User     │
│  Types msg  │
└─────────────┘
      │
      │ "I want to end it all"
      │
      ▼
┌─────────────────────────────────────┐
│  moderationService.moderateContent() │
└─────────────────────────────────────┘
      │
      │ Detects crisis keyword
      │
      ▼
┌─────────────────────────────────────┐
│  Crisis Detected!                    │
│  - isSafe: false                     │
│  - flags: ['crisis', 'suicide_risk'] │
│  - suggestedAction: 'escalate'       │
└─────────────────────────────────────┘
      │
      ├──────────────────────────────────┐
      │                                  │
      ▼                                  ▼
┌─────────────────┐          ┌─────────────────┐
│  Block Message  │          │  Show Crisis    │
│  from posting   │          │  Resources to   │
│                 │          │  sender         │
└─────────────────┘          └─────────────────┘
      │                                  │
      ▼                                  ▼
┌─────────────────┐          ┌─────────────────┐
│  Alert          │          │  Trigger        │
│  Moderators     │          │  Crisis         │
│                 │          │  Detection      │
└─────────────────┘          │  System         │
      │                      └─────────────────┘
      ▼                                  │
┌─────────────────┐                     ▼
│  Create         │          ┌─────────────────┐
│  Moderation Log │          │  Notify         │
│                 │          │  Emergency      │
└─────────────────┘          │  Contacts       │
                             └─────────────────┘
```

## 🔐 Row Level Security (RLS) Flow

```
┌─────────────┐
│    User     │
│  Request    │
└─────────────┘
      │
      │ SELECT * FROM chat_messages WHERE group_id = 'xyz'
      │
      ▼
┌─────────────────────────────────────┐
│  Supabase Auth                       │
│  - Extracts JWT token                │
│  - Identifies user: auth.uid()       │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  RLS Policy Check                    │
│  "Users can view messages in their   │
│   groups"                            │
└─────────────────────────────────────┘
      │
      │ Check if user is member of group
      │
      ▼
┌─────────────────────────────────────┐
│  Query Execution                     │
│  SELECT cm.*                         │
│  FROM chat_messages cm               │
│  WHERE cm.group_id = 'xyz'           │
│    AND EXISTS (                      │
│      SELECT 1 FROM group_memberships │
│      WHERE group_id = 'xyz'          │
│        AND peer_profile_id IN (      │
│          SELECT id FROM profiles     │
│          WHERE user_id = auth.uid()  │
│        )                             │
│    )                                 │
└─────────────────────────────────────┘
      │
      ├─────────────────┬──────────────┐
      │                 │              │
      ▼                 ▼              ▼
┌──────────┐    ┌──────────┐   ┌──────────┐
│ Is Member│    │Not Member│   │  Error   │
│ → Return │    │ → Empty  │   │ → 403    │
│  Messages│    │   Result │   │          │
└──────────┘    └──────────┘   └──────────┘
```

## 🎮 User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRST TIME USER                           │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────┐
│  Open App       │
│  Navigate to    │
│  Peer Support   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Welcome Screen │
│  - Explanation  │
│  - Safety info  │
│  - CTA button   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Profile Setup  │
│  - Display name │
│  - Avatar color │
│  - Bio          │
│  - Conditions   │
│  - Terms agree  │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Peer Hub       │
│  - My groups    │
│  - Browse btn   │
│  - Crisis link  │
│  - Guidelines   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Browse Groups  │
│  - 8 defaults   │
│  - Filter       │
│  - Search       │
│  - Join button  │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Group Chat     │
│  - Messages     │
│  - Composer     │
│  - Members      │
│  - Report       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Active User    │
│  - Daily chats  │
│  - Help others  │
│  - Earn points  │
│  - Feel better  │
└─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RETURNING USER                            │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────┐
│  Open App       │
│  See badge: 3   │
│  new messages   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Peer Hub       │
│  - My groups    │
│  - Unread count │
│  - Quick access │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Group Chat     │
│  - Read msgs    │
│  - Reply        │
│  - React        │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Engaged User   │
│  - Regular      │
│  - Helpful      │
│  - Connected    │
└─────────────────┘
```

## 🔄 Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    MINDSYNC ECOSYSTEM                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Mood Tracking   │────────►│  Peer Support    │
│  - Low mood      │         │  - Suggest group │
│  - Patterns      │         │  - Auto-join     │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
┌──────────────────┐         ┌──────────────────┐
│  Crisis          │◄────────│  Crisis          │
│  Detection       │         │  Keywords        │
│  - Alert system  │         │  - Auto-trigger  │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
┌──────────────────┐         ┌──────────────────┐
│  Vitality Points │◄────────│  Reputation      │
│  - Earn points   │         │  - Help others   │
│  - Unlock badges │         │  - Get rewarded  │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
┌──────────────────┐         ┌──────────────────┐
│  Mental Health   │────────►│  Smart           │
│  Twin (AI)       │         │  Suggestions     │
│  - Analyze       │         │  - When to chat  │
│  - Recommend     │         │  - Which group   │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
┌──────────────────┐         ┌──────────────────┐
│  Notifications   │◄────────│  Message Alerts  │
│  - Push          │         │  - New messages  │
│  - In-app        │         │  - Mentions      │
└──────────────────┘         └──────────────────┘
```

## 📱 Component Hierarchy

```
App.tsx
│
├── PeerSupportHub.tsx (Main entry)
│   ├── Crisis Alert Card
│   ├── My Groups List
│   │   └── GroupCard (for each group)
│   ├── Community Guidelines
│   └── Stats Card
│
├── PeerProfileSetup.tsx (Onboarding)
│   ├── Display Name Input
│   ├── Avatar Color Picker
│   ├── Bio Textarea
│   ├── Condition Chips
│   └── Terms Checkbox
│
├── SupportGroupList.tsx (Browse)
│   ├── Search Bar
│   ├── Category Filter
│   └── GroupCard (for each group)
│       ├── Group Name
│       ├── Description
│       ├── Member Count
│       └── Join Button
│
├── GroupChat.tsx (Main chat)
│   ├── Header
│   │   ├── Group Name
│   │   ├── Member Count
│   │   └── Leave Button
│   ├── MessageList
│   │   └── ChatMessage (for each message)
│   │       ├── Avatar Circle
│   │       ├── Display Name
│   │       ├── Message Content
│   │       ├── Timestamp
│   │       └── Actions Menu
│   ├── TypingIndicator
│   └── MessageComposer
│       ├── Textarea
│       ├── Emoji Picker
│       ├── Character Count
│       └── Send Button
│
├── BuddyChat.tsx (1-on-1)
│   ├── Buddy Profile Header
│   ├── MessageList
│   ├── Check-in Reminders
│   ├── Shared Goals
│   └── MessageComposer
│
└── ReportModal.tsx (Safety)
    ├── Reason Dropdown
    ├── Description Textarea
    ├── Block User Checkbox
    └── Submit Button
```

## 🎯 Data Flow Example: Sending a Message

```typescript
// 1. User types message
const messageText = "Thanks for sharing, I understand how you feel";

// 2. Moderate content
const modResult = await moderationService.moderateContent(messageText);

if (!modResult.isSafe) {
  // Show error, don't send
  return;
}

// 3. Check rate limit
const rateCheck = await moderationService.checkRateLimit(profileId);

if (!rateCheck.allowed) {
  // Show "slow down" message
  return;
}

// 4. Send message
const message = await peerSupportService.sendMessage({
  groupId: currentGroupId,
  content: messageText,
  messageType: 'text'
});

// 5. Optimistic UI update (show immediately)
setMessages(prev => [...prev, message]);

// 6. Real-time broadcast (Supabase handles this)
// Other users receive via subscription

// 7. Award reputation
await moderationService.awardReputationForMessage(profileId);

// 8. Update vitality points
await vitalityPointsService.awardPoints(userId, 1, 'peer_support_message');
```

---

*Architecture Documentation - February 10, 2026*
