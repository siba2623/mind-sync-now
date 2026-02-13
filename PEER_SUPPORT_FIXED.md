# Peer Support Network - Fixed Migration

## ✅ Issue Resolved

The original migration conflicted with an existing `support_groups` table from the SocialSupport feature. 

## 🔧 Solution

Created a **SAFE migration** that uses prefixed table names to avoid conflicts:

### New Table Names (with `peer_` prefix)
- `peer_support_profiles` - Anonymous user profiles
- `peer_support_groups` - Peer support communities (separate from social support)
- `peer_group_memberships` - User-group relationships
- `peer_chat_messages` - Real-time messages
- `buddy_pairs` - 1-on-1 accountability partners
- `peer_moderation_logs` - Safety tracking
- `peer_user_reports` - Abuse reporting

## 🚀 Run This Migration Instead

**File:** `mind-sync-now/supabase/migrations/20260210_peer_support_network_SAFE.sql`

### Steps:
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `20260210_peer_support_network_SAFE.sql`
3. Paste and click "Run"
4. You should see: "Peer Support Network schema created successfully!"

## ✅ What's Included

- ✅ 7 new tables with `peer_` prefix (no conflicts)
- ✅ Row Level Security policies
- ✅ Real-time triggers
- ✅ Helper functions
- ✅ 8 default peer support groups
- ✅ All services updated to use new table names

## 🔍 Verify Installation

```sql
-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'peer_%';

-- Should return 7 tables:
-- peer_support_profiles
-- peer_support_groups
-- peer_group_memberships
-- peer_chat_messages
-- peer_moderation_logs
-- peer_user_reports
-- (plus buddy_pairs)

-- Check default groups
SELECT COUNT(*) FROM peer_support_groups;
-- Should return: 8
```

## 📝 Services Updated

Both service files have been updated to use the new table names:

1. **peerSupportService.ts** - All queries now use `peer_support_groups`, `peer_group_memberships`, `peer_chat_messages`
2. **moderationService.ts** - All queries now use `peer_user_reports`, `peer_moderation_logs`, `peer_chat_messages`

## 🎯 No Code Changes Needed

The UI components (`PeerSupportHub.tsx`, `PeerProfileSetup.tsx`) don't need any changes - they use the service layer which has been updated.

## 🔄 Coexistence

The new peer support system coexists peacefully with the existing social support feature:

### Existing Social Support (Unchanged)
- `support_groups` (BIGSERIAL IDs)
- `group_memberships`
- `community_posts`
- Used by `SocialSupport.tsx` component

### New Peer Support (Separate)
- `peer_support_groups` (UUID IDs)
- `peer_group_memberships`
- `peer_chat_messages`
- Used by `PeerSupportHub.tsx` component

## 🧪 Test It

1. Run the SAFE migration
2. Start your app: `npm run dev`
3. Navigate to `/peer-support`
4. Create a profile
5. Browse the 8 default groups
6. Join a group

## 📊 Default Groups Created

1. Depression Support Circle
2. Anxiety Warriors
3. Bipolar Balance
4. PTSD Recovery
5. Medication Side Effects
6. Work & Mental Health
7. New to Therapy
8. General Wellness

## ✨ Ready to Go!

The peer support network is now ready to use with zero conflicts. All documentation remains valid - just use the SAFE migration file instead of the original.

---

*Fixed: February 10, 2026*
*Status: Ready for testing*
