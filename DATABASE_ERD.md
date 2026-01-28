# MindSync Database - Entity Relationship Diagram
## Visual Database Schema

---

## 🗺️ Complete ERD (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            auth.users (Supabase)                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ id (UUID, PK)                                                       │     │
│  │ email (TEXT)                                                        │     │
│  │ encrypted_password (TEXT)                                           │     │
│  │ created_at (TIMESTAMPTZ)                                            │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ (1:N)
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│ voice_recordings  │       │photo_mood_captures│       │  emotion_entries  │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id (UUID, PK)     │       │ id (UUID, PK)     │       │ id (UUID, PK)     │
│ user_id (FK)      │       │ user_id (FK)      │       │ user_id (FK)      │
│ audio_url         │       │ photo_url         │       │ emotion           │
│ transcription     │       │ mood_detected     │       │ category          │
│ sentiment_score   │       │ facial_analysis   │       │ intensity         │
│ emotion_detected  │       │ notes             │       │ context           │
│ keywords[]        │       │ created_at        │       │ created_at        │
│ support_flag      │       └───────────────────┘       └───────────────────┘
│ created_at        │
└───────────────────┘
        │
        │ (1:N)
        ▼
┌───────────────────┐
│strategy_usage     │
├───────────────────┤
│ id (UUID, PK)     │
│ user_id (FK)      │
│ strategy_id       │
│ strategy_name     │
│ category          │
│ helpful           │
│ emotion_context   │
│ duration_minutes  │
│ created_at        │
└───────────────────┘

        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│  health_metrics   │       │wellness_programs  │       │mental_health_     │
├───────────────────┤       ├───────────────────┤       │  assessments      │
│ id (UUID, PK)     │       │ id (UUID, PK)     │       ├───────────────────┤
│ user_id (FK)      │       │ user_id (FK)      │       │ id (UUID, PK)     │
│ metric_date       │       │ program_name      │       │ user_id (FK)      │
│ steps_count       │       │ program_type      │       │ assessment_type   │
│ heart_rate_avg    │       │ start_date        │       │ score             │
│ heart_rate_resting│       │ end_date          │       │ severity_level    │
│ blood_pressure    │       │ status            │       │ responses (JSONB) │
│ weight_kg         │       │ progress_%        │       │ recommendations[] │
│ bmi               │       │ goals (JSONB)     │       │ requires_support  │
│ calories_burned   │       │ achievements      │       │ created_at        │
│ active_minutes    │       │ created_at        │       └───────────────────┘
│ vitality_points   │       └───────────────────┘                │
│ created_at        │                                             │
└───────────────────┘                                             ▼
                                                        ┌───────────────────┐
                                                        │support_           │
                                                        │  interventions    │
                                                        ├───────────────────┤
                                                        │ id (UUID, PK)     │
                                                        │ user_id (FK)      │
                                                        │ trigger_source    │
                                                        │ trigger_id        │
                                                        │ intervention_type │
                                                        │ status            │
                                                        │ notes             │
                                                        │ created_at        │
                                                        │ resolved_at       │
                                                        └───────────────────┘

        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│   medications     │       │therapist_bookings │       │group_memberships  │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id (UUID, PK)     │       │ id (BIGSERIAL, PK)│       │ id (BIGSERIAL, PK)│
│ user_id (FK)      │       │ user_id (FK)      │       │ user_id (FK)      │
│ name              │       │ therapist_id (FK) │       │ group_id (FK)     │
│ dosage            │       │ session_date      │       │ joined_at         │
│ frequency         │       │ session_type      │       └───────────────────┘
│ times[]           │       │ status            │                │
│ prescribed_by     │       │ notes             │                │
│ start_date        │       │ created_at        │                ▼
│ end_date          │       └───────────────────┘       ┌───────────────────┐
│ notes             │                │                   │ support_groups    │
│ active            │                │                   ├───────────────────┤
│ created_at        │                ▼                   │ id (BIGSERIAL, PK)│
└───────────────────┘       ┌───────────────────┐       │ name              │
        │                   │   therapists      │       │ description       │
        │ (1:N)             ├───────────────────┤       │ category          │
        ▼                   │ id (BIGSERIAL, PK)│       │ moderator_id (FK) │
┌───────────────────┐       │ name              │       │ moderator_name    │
│ medication_logs   │       │ title             │       │ member_count      │
├───────────────────┤       │ specializations[] │       │ is_active         │
│ id (UUID, PK)     │       │ languages[]       │       │ created_at        │
│ user_id (FK)      │       │ location          │       └───────────────────┘
│ medication_id (FK)│       │ rating            │                │
│ taken_at          │       │ reviews           │                │ (1:N)
│ scheduled_time    │       │ experience        │                ▼
│ notes             │       │ availability[]    │       ┌───────────────────┐
│ created_at        │       │ session_types[]   │       │ community_posts   │
└───────────────────┘       │ rate              │       ├───────────────────┤
                            │ discovery_network │       │ id (BIGSERIAL, PK)│
                            │ bio               │       │ user_id (FK)      │
                            │ image_url         │       │ group_id (FK)     │
                            │ created_at        │       │ content           │
                            └───────────────────┘       │ is_anonymous      │
                                                        │ likes_count       │
                                                        │ replies_count     │
                                                        │ created_at        │
                                                        └───────────────────┘
                                                                 │
                                        ┌────────────────────────┼────────────────────────┐
                                        │ (1:N)                  │ (1:N)                  │
                                        ▼                        ▼                        │
                                ┌───────────────────┐   ┌───────────────────┐            │
                                │   post_likes      │   │   post_replies    │            │
                                ├───────────────────┤   ├───────────────────┤            │
                                │ id (BIGSERIAL, PK)│   │ id (BIGSERIAL, PK)│            │
                                │ user_id (FK)      │   │ user_id (FK)      │            │
                                │ post_id (FK)      │   │ post_id (FK)      │            │
                                │ created_at        │   │ content           │            │
                                └───────────────────┘   │ is_anonymous      │            │
                                                        │ created_at        │            │
                                                        └───────────────────┘            │

        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│  buddy_requests   │       │  buddy_checkins   │       │notification_      │
├───────────────────┤       ├───────────────────┤       │  preferences      │
│ id (BIGSERIAL, PK)│       │ id (BIGSERIAL, PK)│       ├───────────────────┤
│ requester_id (FK) │       │ user_id (FK)      │       │ id (BIGSERIAL, PK)│
│ buddy_id (FK)     │       │ buddy_id (FK)     │       │ user_id (FK)      │
│ status            │       │ message           │       │ medication_       │
│ message           │       │ created_at        │       │   reminders       │
│ categories[]      │       └───────────────────┘       │ daily_checkin     │
│ created_at        │                                   │ crisis_alerts     │
└───────────────────┘                                   │ wellness_tips     │
                                                        │ community_updates │
                                                        │ therapist_        │
                                                        │   reminders       │
                                                        │ created_at        │
                                                        └───────────────────┘

        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│scheduled_         │       │  user_preferences │       │                   │
│  notifications    │       ├───────────────────┤       │                   │
├───────────────────┤       │ id (BIGSERIAL, PK)│       │                   │
│ id (BIGSERIAL, PK)│       │ user_id (FK)      │       │                   │
│ user_id (FK)      │       │ language          │       │                   │
│ notification_type │       │ theme             │       │                   │
│ title             │       │ onboarding_       │       │                   │
│ body              │       │   completed       │       │                   │
│ scheduled_at      │       │ created_at        │       │                   │
│ sent              │       └───────────────────┘       │                   │
│ metadata (JSONB)  │                                   │                   │
│ created_at        │                                   │                   │
└───────────────────┘                                   └───────────────────┘
```

--


## 📊 Relationship Types

### One-to-Many (1:N)

**User → User Data:**
- 1 User → N Voice Recordings
- 1 User → N Photo Captures
- 1 User → N Emotion Entries
- 1 User → N Strategy Usages
- 1 User → N Health Metrics
- 1 User → N Wellness Programs
- 1 User → N Assessments
- 1 User → N Interventions
- 1 User → N Medications
- 1 User → N Medication Logs
- 1 User → N Therapist Bookings
- 1 User → N Group Memberships
- 1 User → N Community Posts
- 1 User → N Post Likes
- 1 User → N Post Replies
- 1 User → N Buddy Requests
- 1 User → N Buddy Check-ins
- 1 User → N Scheduled Notifications

**Medication → Logs:**
- 1 Medication → N Medication Logs

**Therapist → Bookings:**
- 1 Therapist → N Therapist Bookings

**Group → Content:**
- 1 Support Group → N Group Memberships
- 1 Support Group → N Community Posts

**Post → Engagement:**
- 1 Community Post → N Post Likes
- 1 Community Post → N Post Replies

### One-to-One (1:1)

**User → Preferences:**
- 1 User ↔ 1 Notification Preferences
- 1 User ↔ 1 User Preferences

### Many-to-Many (N:N)

**User ↔ Therapists** (via therapist_bookings)
- Many Users can book Many Therapists
- Junction: therapist_bookings

**User ↔ Support Groups** (via group_memberships)
- Many Users can join Many Support Groups
- Junction: group_memberships

**User ↔ Community Posts** (via post_likes)
- Many Users can like Many Posts
- Junction: post_likes

**User ↔ Users** (via buddy_requests)
- Many Users can connect with Many Users
- Junction: buddy_requests

---

## 🔑 Foreign Key Constraints

### CASCADE Deletes

All user data tables use `ON DELETE CASCADE`:
- When a user is deleted, ALL their data is automatically deleted
- Ensures GDPR/POPIA compliance (right to be forgotten)

**Example:**
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
```

### Tables with CASCADE:
- voice_recordings
- photo_mood_captures
- emotion_entries
- strategy_usage
- health_metrics
- wellness_programs
- mental_health_assessments
- support_interventions
- medications
- medication_logs
- therapist_bookings
- group_memberships
- community_posts
- post_likes
- post_replies
- buddy_requests
- buddy_checkins
- notification_preferences
- scheduled_notifications
- user_preferences

---

## 📈 Cardinality Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Voice Recordings | 1:N | One user, many recordings |
| User → Photo Captures | 1:N | One user, many photos |
| User → Emotions | 1:N | One user, many emotions |
| User → Strategies | 1:N | One user, many strategy uses |
| User → Health Metrics | 1:N | One user, many daily metrics |
| User → Wellness Programs | 1:N | One user, many programs |
| User → Assessments | 1:N | One user, many assessments |
| User → Interventions | 1:N | One user, many interventions |
| User → Medications | 1:N | One user, many medications |
| Medication → Logs | 1:N | One medication, many logs |
| User → Therapist Bookings | 1:N | One user, many bookings |
| Therapist → Bookings | 1:N | One therapist, many bookings |
| User → Group Memberships | 1:N | One user, many groups |
| Group → Memberships | 1:N | One group, many members |
| User → Posts | 1:N | One user, many posts |
| Group → Posts | 1:N | One group, many posts |
| Post → Likes | 1:N | One post, many likes |
| Post → Replies | 1:N | One post, many replies |
| User → Buddy Requests | 1:N | One user, many requests |
| User → Buddy Check-ins | 1:N | One user, many check-ins |
| User → Notifications | 1:N | One user, many notifications |
| User → Notification Prefs | 1:1 | One user, one preference set |
| User → User Prefs | 1:1 | One user, one preference set |

---

## 🎯 Junction Tables (Many-to-Many)

### 1. therapist_bookings
**Connects:** Users ↔ Therapists

**Purpose:** Track therapy session bookings

**Key Columns:**
- user_id (FK → auth.users)
- therapist_id (FK → therapists)
- session_date
- session_type
- status

**Unique Constraint:** None (users can book same therapist multiple times)

---

### 2. group_memberships
**Connects:** Users ↔ Support Groups

**Purpose:** Track group memberships

**Key Columns:**
- user_id (FK → auth.users)
- group_id (FK → support_groups)
- joined_at

**Unique Constraint:** (user_id, group_id) - User can only join group once

---

### 3. post_likes
**Connects:** Users ↔ Community Posts

**Purpose:** Track post likes

**Key Columns:**
- user_id (FK → auth.users)
- post_id (FK → community_posts)
- created_at

**Unique Constraint:** (user_id, post_id) - User can only like post once

---

### 4. buddy_requests
**Connects:** Users ↔ Users

**Purpose:** Accountability buddy matching

**Key Columns:**
- requester_id (FK → auth.users)
- buddy_id (FK → auth.users)
- status
- categories

**Unique Constraint:** (requester_id, buddy_id) - One request per pair

---

## 🔍 Data Flow Examples

### Example 1: User Takes Medication

```
1. User opens app
2. Sees medication reminder (from scheduled_notifications)
3. Marks medication as taken
4. Creates record in medication_logs:
   - user_id: current user
   - medication_id: from medications table
   - taken_at: NOW()
   - scheduled_time: from medications.times[]
5. Updates medication adherence stats
```

**Tables Involved:**
- medications (read)
- scheduled_notifications (read)
- medication_logs (insert)

---

### Example 2: User Books Therapist

```
1. User browses therapists (therapists table)
2. Filters by specialization, language, location
3. Selects therapist
4. Chooses session date/time
5. Creates booking in therapist_bookings:
   - user_id: current user
   - therapist_id: selected therapist
   - session_date: chosen date
   - session_type: 'video'
   - status: 'pending'
6. Creates notification in scheduled_notifications:
   - notification_type: 'therapist_reminder'
   - scheduled_at: 24 hours before session
```

**Tables Involved:**
- therapists (read)
- therapist_bookings (insert)
- scheduled_notifications (insert)

---

### Example 3: User Posts in Community

```
1. User joins support group
2. Creates record in group_memberships:
   - user_id: current user
   - group_id: selected group
3. User creates post
4. Creates record in community_posts:
   - user_id: current user
   - group_id: current group
   - content: post text
   - is_anonymous: true/false
5. Other users like post
6. Creates records in post_likes:
   - user_id: liker
   - post_id: post ID
7. Updates community_posts.likes_count
```

**Tables Involved:**
- support_groups (read)
- group_memberships (insert)
- community_posts (insert)
- post_likes (insert)
- community_posts (update)

---

### Example 4: Crisis Detection Flow

```
1. User records voice message
2. Creates record in voice_recordings:
   - user_id: current user
   - audio_url: storage URL
   - sentiment_score: -0.8 (negative)
   - support_flag: TRUE
3. Triggers support intervention
4. Creates record in support_interventions:
   - user_id: current user
   - trigger_source: 'voice_recording'
   - trigger_id: voice_recording.id
   - intervention_type: 'immediate_resources'
   - status: 'pending'
5. Creates crisis notification
6. Creates record in scheduled_notifications:
   - notification_type: 'crisis_alert'
   - scheduled_at: NOW()
7. User sees crisis support resources
```

**Tables Involved:**
- voice_recordings (insert)
- support_interventions (insert)
- scheduled_notifications (insert)

---

## 📊 Table Size Estimates

### Per 10,000 Users (1 Year)

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| voice_recordings | 365K | 50GB | ~1 recording/user/day + audio files |
| photo_mood_captures | 365K | 20GB | ~1 photo/user/day + image files |
| emotion_entries | 730K | 100MB | ~2 entries/user/day |
| strategy_usage | 365K | 50MB | ~1 strategy/user/day |
| health_metrics | 365K | 200MB | ~1 metric/user/day |
| wellness_programs | 40K | 10MB | ~4 programs/user/year |
| mental_health_assessments | 120K | 50MB | ~1 assessment/user/month |
| support_interventions | 10K | 5MB | ~1% of users need intervention |
| medications | 30K | 10MB | ~3 medications/user |
| medication_logs | 1.1M | 150MB | ~3 logs/user/day |
| therapists | 500 | 1MB | System data |
| therapist_bookings | 50K | 20MB | ~5 bookings/user/year |
| support_groups | 100 | 1MB | System data |
| group_memberships | 50K | 10MB | ~5 groups/user |
| community_posts | 100K | 50MB | ~10 posts/user/year |
| post_likes | 500K | 30MB | ~50 likes/user/year |
| post_replies | 200K | 40MB | ~20 replies/user/year |
| buddy_requests | 20K | 5MB | ~2 buddies/user |
| buddy_checkins | 365K | 50MB | ~1 checkin/user/day |
| notification_preferences | 10K | 1MB | 1 per user |
| scheduled_notifications | 100K | 30MB | ~10 notifications/user |
| user_preferences | 10K | 1MB | 1 per user |
| **TOTAL** | **5.5M** | **~72GB** | **Includes file storage** |

---

## 🔐 Security Model

### Row-Level Security (RLS)

**Principle:** Users can only access their own data

**Implementation:**
```sql
-- Example: voice_recordings
CREATE POLICY "Users can view their own recordings"
  ON voice_recordings FOR SELECT
  USING (auth.uid() = user_id);
```

**Exceptions:**
- Public data (therapists, support_groups)
- Group data (posts visible to group members)
- Buddy data (visible to both users)

### Data Isolation

**User A cannot see User B's:**
- Voice recordings
- Photo captures
- Emotions
- Health metrics
- Medications
- Assessments
- Interventions

**User A can see:**
- Public therapists
- Public support groups
- Posts in groups they're members of
- Their own buddy connections

---

## 🚀 Performance Optimization

### Indexing Strategy

**Primary Keys:** Automatic indexes
**Foreign Keys:** Indexed for JOIN performance
**Timestamps:** Indexed for sorting (DESC)
**Status Flags:** Indexed for filtering
**Composite:** For common query patterns

### Query Optimization

**Common Queries:**
1. Get user's recent mood entries
2. Get user's medications due today
3. Get posts in user's groups
4. Get therapists by filters
5. Get user's health metrics (last 30 days)

**Optimized with:**
- Indexes on user_id + created_at
- Indexes on status flags
- Indexes on date ranges
- Composite indexes where needed

---

## 📝 Quick Reference

### Table Categories

**Mood & Emotion (4 tables):**
- voice_recordings
- photo_mood_captures
- emotion_entries
- strategy_usage

**Health & Wellness (2 tables):**
- health_metrics
- wellness_programs

**Mental Health (2 tables):**
- mental_health_assessments
- support_interventions

**Medications (2 tables):**
- medications
- medication_logs

**Therapists (2 tables):**
- therapists
- therapist_bookings

**Social Support (6 tables):**
- support_groups
- group_memberships
- community_posts
- post_likes
- post_replies
- buddy_requests
- buddy_checkins

**Preferences (3 tables):**
- notification_preferences
- scheduled_notifications
- user_preferences

**Total: 22 tables**

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**For:** MindSync Database Architecture
