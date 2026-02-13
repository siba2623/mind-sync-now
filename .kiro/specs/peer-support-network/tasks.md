# Real-Time Peer Support Network - Implementation Tasks

## Phase 1: Database & Backend (Tasks 1-5)

### Task 1: Database Schema Setup
**File**: `supabase/migrations/20260210_peer_support_network.sql`
- [ ] Create `peer_support_profiles` table
- [ ] Create `support_groups` table
- [ ] Create `group_memberships` table
- [ ] Create `chat_messages` table
- [ ] Create `buddy_pairs` table
- [ ] Create `moderation_logs` table
- [ ] Create `user_reports` table
- [ ] Add indexes for performance
- [ ] Set up Row Level Security policies
- [ ] Create database functions for common queries

**Estimated Time**: 2 hours

### Task 2: Real-Time Chat Infrastructure
**File**: `src/services/peerSupportService.ts`
- [ ] Set up Supabase Realtime channels
- [ ] Implement message sending
- [ ] Implement message receiving
- [ ] Handle presence tracking
- [ ] Implement typing indicators
- [ ] Add offline message queuing
- [ ] Handle reconnection logic

**Estimated Time**: 3 hours

### Task 3: Moderation Service
**File**: `src/services/moderationService.ts`
- [ ] Crisis keyword detection
- [ ] Content filtering rules
- [ ] Auto-flagging system
- [ ] Report handling
- [ ] Reputation scoring
- [ ] Ban/timeout logic
- [ ] Integration with crisis detection system

**Estimated Time**: 2 hours

### Task 4: Group Management Service
**File**: `src/services/groupManagementService.ts`
- [ ] Create group
- [ ] Join/leave group
- [ ] List available groups
- [ ] Get group members
- [ ] Update group settings
- [ ] Archive inactive groups
- [ ] Group search/filter

**Estimated Time**: 2 hours

### Task 5: Buddy Matching Service (Basic)
**File**: `src/services/buddyMatchingService.ts`
- [ ] Create buddy request
- [ ] Accept/decline buddy request
- [ ] End buddy partnership
- [ ] Get buddy status
- [ ] Send check-in reminders

**Estimated Time**: 2 hours

## Phase 2: Core UI Components (Tasks 6-12)

### Task 6: Peer Profile Setup
**File**: `src/components/PeerProfileSetup.tsx`
- [ ] Anonymous display name input
- [ ] Avatar color picker
- [ ] Bio editor (200 char limit)
- [ ] Condition selection (multi-select)
- [ ] Privacy settings
- [ ] Terms of service agreement
- [ ] Save profile

**Estimated Time**: 2 hours

### Task 7: Support Group List
**File**: `src/components/SupportGroupList.tsx`
- [ ] Display available groups
- [ ] Filter by category
- [ ] Show member count
- [ ] Show last activity
- [ ] Join group button
- [ ] Group details modal
- [ ] Empty state for no groups

**Estimated Time**: 2 hours

### Task 8: Group Chat Component
**File**: `src/components/GroupChat.tsx`
- [ ] Message list with infinite scroll
- [ ] Message composer
- [ ] Send button with loading state
- [ ] Emoji picker
- [ ] Typing indicators
- [ ] Online member list
- [ ] Message timestamps
- [ ] Report message button
- [ ] Leave group option

**Estimated Time**: 4 hours

### Task 9: Message Component
**File**: `src/components/ChatMessage.tsx`
- [ ] Display sender name and avatar
- [ ] Message content rendering
- [ ] Timestamp formatting
- [ ] Edited indicator
- [ ] Deleted message placeholder
- [ ] Emoji reactions
- [ ] Long-press menu (report, copy)
- [ ] System message styling

**Estimated Time**: 2 hours

### Task 10: Peer Support Hub
**File**: `src/components/PeerSupportHub.tsx`
- [ ] Overview dashboard
- [ ] My groups section
- [ ] Buddy status card
- [ ] Quick access to crisis support
- [ ] Community highlights
- [ ] Onboarding for new users
- [ ] Navigation to group list

**Estimated Time**: 3 hours

### Task 11: Buddy Chat Component
**File**: `src/components/BuddyChat.tsx`
- [ ] 1-on-1 message interface
- [ ] Check-in reminder display
- [ ] Shared goals tracker
- [ ] End partnership button
- [ ] Buddy profile view
- [ ] Message encryption indicator

**Estimated Time**: 3 hours

### Task 12: Report & Block UI
**File**: `src/components/ReportModal.tsx`
- [ ] Report reason selection
- [ ] Description text area
- [ ] Submit report
- [ ] Block user option
- [ ] Confirmation dialog
- [ ] Success feedback

**Estimated Time**: 1 hour

## Phase 3: Safety & Moderation (Tasks 13-15)

### Task 13: Crisis Detection Integration
**File**: `src/services/peerCrisisDetection.ts`
- [ ] Monitor messages for crisis keywords
- [ ] Block dangerous messages
- [ ] Show crisis resources to sender
- [ ] Alert moderators
- [ ] Trigger existing crisis detection system
- [ ] Log incidents

**Estimated Time**: 2 hours

### Task 14: Moderation Dashboard (Admin)
**File**: `src/components/ModerationDashboard.tsx`
- [ ] Flagged content queue
- [ ] User reports list
- [ ] Review message context
- [ ] Take action (warn, timeout, ban)
- [ ] Add moderator notes
- [ ] Analytics overview

**Estimated Time**: 3 hours

### Task 15: Reputation System
**File**: `src/services/reputationService.ts`
- [ ] Calculate reputation score
- [ ] Award points for helpful actions
- [ ] Deduct points for violations
- [ ] Display badges
- [ ] Reputation history
- [ ] Unlock features based on reputation

**Estimated Time**: 2 hours

## Phase 4: Integration & Polish (Tasks 16-20)

### Task 16: Navigation Integration
**File**: `src/App.tsx` and routing
- [ ] Add Peer Support to main navigation
- [ ] Create routes for all peer support pages
- [ ] Add notification badges
- [ ] Deep linking support

**Estimated Time**: 1 hour

### Task 17: Notification System
**File**: `src/services/peerNotificationService.ts`
- [ ] New message notifications
- [ ] Buddy check-in reminders
- [ ] Group activity summaries
- [ ] Moderation alerts
- [ ] Notification preferences

**Estimated Time**: 2 hours

### Task 18: Vitality Points Integration
**File**: Update `src/services/vitalityPointsService.ts`
- [ ] Award points for peer support participation
- [ ] Award points for helping others
- [ ] Award points for buddy completion
- [ ] Display peer support achievements

**Estimated Time**: 1 hour

### Task 19: Mental Health Twin Integration
**File**: Update `src/services/mentalHealthTwin.ts`
- [ ] Suggest peer support when user is struggling
- [ ] Recommend specific groups based on patterns
- [ ] Buddy matching suggestions
- [ ] Engagement prompts

**Estimated Time**: 1 hour

### Task 20: Testing & Documentation
- [ ] Unit tests for services
- [ ] Integration tests for chat flow
- [ ] E2E tests for critical paths
- [ ] User documentation
- [ ] Moderator guidelines
- [ ] Safety documentation

**Estimated Time**: 4 hours

## Total Estimated Time: 44 hours

## Priority Order for MVP
1. Task 1: Database Schema (foundation)
2. Task 2: Real-Time Chat Infrastructure (core feature)
3. Task 3: Moderation Service (safety critical)
4. Task 6: Peer Profile Setup (user onboarding)
5. Task 7: Support Group List (discovery)
6. Task 8: Group Chat Component (main interaction)
7. Task 9: Message Component (UI polish)
8. Task 10: Peer Support Hub (entry point)
9. Task 13: Crisis Detection Integration (safety)
10. Task 16: Navigation Integration (accessibility)

## Dependencies
- Supabase Realtime enabled
- Existing crisis detection system
- Existing notification system
- Existing vitality points system

## Testing Checklist
- [ ] Can create anonymous profile
- [ ] Can join support group
- [ ] Can send and receive messages in real-time
- [ ] Crisis keywords are detected and blocked
- [ ] Can report inappropriate content
- [ ] Moderators can review and take action
- [ ] Notifications work correctly
- [ ] Mobile responsive on iOS and Android
- [ ] Offline message queuing works
- [ ] Performance with 50+ users in group
