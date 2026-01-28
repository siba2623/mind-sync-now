# MindSync Database - Quick Reference Card

## 📊 Tables at a Glance

### Total: 22 Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | voice_recordings | Voice mood captures | user_id, audio_url, sentiment_score |
| 2 | photo_mood_captures | Photo mood captures | user_id, photo_url, mood_detected |
| 3 | emotion_entries | Emotion vocabulary | user_id, emotion, category, intensity |
| 4 | strategy_usage | Regulation strategies | user_id, strategy_name, helpful |
| 5 | health_metrics | Daily health data | user_id, metric_date, steps, heart_rate |
| 6 | wellness_programs | Wellness enrollment | user_id, program_name, status |
| 7 | mental_health_assessments | PHQ-9, GAD-7 | user_id, assessment_type, score |
| 8 | support_interventions | Crisis support | user_id, trigger_source, status |
| 9 | medications | User medications | user_id, name, dosage, times[] |
| 10 | medication_logs | Med adherence | user_id, medication_id, taken_at |
| 11 | therapists | Therapist profiles | name, specializations[], rate |
| 12 | therapist_bookings | Session bookings | user_id, therapist_id, session_date |
| 13 | support_groups | Community groups | name, category, member_count |
| 14 | group_memberships | Group joins | user_id, group_id |
| 15 | community_posts | Feed posts | user_id, group_id, content |
| 16 | post_likes | Post likes | user_id, post_id |
| 17 | post_replies | Post comments | user_id, post_id, content |
| 18 | buddy_requests | Buddy matching | requester_id, buddy_id, status |
| 19 | buddy_checkins | Buddy interactions | user_id, buddy_id, message |
| 20 | notification_preferences | Notif settings | user_id, medication_reminders |
| 21 | scheduled_notifications | Notif queue | user_id, scheduled_at, sent |
| 22 | user_preferences | App preferences | user_id, language, theme |

---

## 🔑 Primary Key Types

**UUID (User Data):** 18 tables
- All user-facing data uses UUID for security

**BIGSERIAL (System Data):** 4 tables
- therapists, support_groups, and junction tables

---

## 🔗 Key Relationships

### User → Data (1:N)
```
auth.users (1) → (N) voice_recordings
auth.users (1) → (N) photo_mood_captures
auth.users (1) → (N) emotion_entries
auth.users (1) → (N) strategy_usage
auth.users (1) → (N) health_metrics
auth.users (1) → (N) wellness_programs
auth.users (1) → (N) mental_health_assessments
auth.users (1) → (N) support_interventions
auth.users (1) → (N) medications
auth.users (1) → (N) medication_logs
auth.users (1) → (N) therapist_bookings
auth.users (1) → (N) group_memberships
auth.users (1) → (N) community_posts
auth.users (1) → (N) scheduled_notifications
```

### User → Preferences (1:1)
```
auth.users (1) ↔ (1) notification_preferences
auth.users (1) ↔ (1) user_preferences
```

### Many-to-Many
```
Users ↔ Therapists (via therapist_bookings)
Users ↔ Groups (via group_memberships)
Users ↔ Posts (via post_likes)
Users ↔ Users (via buddy_requests)
```

---

## 📈 Common Queries

### Get User's Recent Moods
```sql
SELECT * FROM emotion_entries
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 30;
```

### Get User's Medications Due Today
```sql
SELECT * FROM medications
WHERE user_id = $1
AND active = true
AND $2 = ANY(times);  -- $2 = current time
```

### Get User's Groups
```sql
SELECT g.* FROM support_groups g
JOIN group_memberships gm ON g.id = gm.group_id
WHERE gm.user_id = $1;
```

### Get Posts in User's Groups
```sql
SELECT p.* FROM community_posts p
WHERE p.group_id IN (
  SELECT group_id FROM group_memberships
  WHERE user_id = $1
)
ORDER BY p.created_at DESC;
```

### Get Therapists by Filters
```sql
SELECT * FROM therapists
WHERE 'Anxiety' = ANY(specializations)
AND 'isiZulu' = ANY(languages)
AND location ILIKE '%Johannesburg%'
AND discovery_network = true;
```

---

## 🔐 Security (RLS)

### All User Data Protected
```sql
-- Pattern for all user tables
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

### Public Data
```sql
-- Therapists and groups are public
CREATE POLICY "policy_name" ON therapists
  FOR SELECT USING (true);
```

### Group Data
```sql
-- Posts visible to group members only
CREATE POLICY "policy_name" ON community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_id = community_posts.group_id
      AND user_id = auth.uid()
    )
  );
```

---

## 📊 Data Types Reference

### Common Types

| Type | Usage | Example |
|------|-------|---------|
| UUID | Primary keys (user data) | gen_random_uuid() |
| BIGSERIAL | Primary keys (system) | Auto-increment |
| TEXT | Strings | 'Hello World' |
| TEXT[] | Arrays | ARRAY['item1', 'item2'] |
| INTEGER | Numbers | 42 |
| DECIMAL(5,2) | Decimals | 123.45 |
| BOOLEAN | True/False | true |
| DATE | Dates | '2026-01-27' |
| TIME | Times | '08:00:00' |
| TIMESTAMPTZ | Timestamps | NOW() |
| JSONB | JSON data | '{"key": "value"}' |

---

## 🎯 Indexes

### Automatic Indexes
- All PRIMARY KEY columns
- All UNIQUE constraints

### Manual Indexes (35+)
- All user_id columns
- All created_at columns (DESC)
- Status/flag columns
- Foreign keys
- Composite indexes

---

## 💾 Storage Buckets

### Supabase Storage

**mood-captures:**
- Voice recordings (audio files)
- Photo captures (image files)

**Access:**
```typescript
const { data } = await supabase.storage
  .from('mood-captures')
  .upload(`${userId}/voice/${filename}`, file);
```

---

## 🔄 Triggers

### Update Timestamps
```sql
CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Applied to tables with updated_at column**

---

## 📏 Constraints

### CHECK Constraints

**emotion_entries:**
```sql
intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10)
```

**therapist_bookings:**
```sql
session_type TEXT CHECK (session_type IN ('in-person', 'video', 'phone'))
status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
```

**user_preferences:**
```sql
language TEXT CHECK (language IN ('en', 'zu', 'xh', 'af', 'st'))
theme TEXT CHECK (theme IN ('light', 'dark', 'system'))
```

### UNIQUE Constraints

**group_memberships:**
```sql
UNIQUE(user_id, group_id)  -- User can only join group once
```

**post_likes:**
```sql
UNIQUE(user_id, post_id)  -- User can only like post once
```

**buddy_requests:**
```sql
UNIQUE(requester_id, buddy_id)  -- One request per pair
```

---

## 🚀 Performance Tips

### Use Indexes
```sql
-- Good: Uses index
SELECT * FROM emotion_entries
WHERE user_id = $1
ORDER BY created_at DESC;

-- Bad: No index
SELECT * FROM emotion_entries
WHERE emotion LIKE '%happy%';
```

### Limit Results
```sql
-- Good: Limits rows
SELECT * FROM community_posts
ORDER BY created_at DESC
LIMIT 20;

-- Bad: Returns all rows
SELECT * FROM community_posts
ORDER BY created_at DESC;
```

### Use Joins Efficiently
```sql
-- Good: Single query
SELECT p.*, g.name FROM community_posts p
JOIN support_groups g ON p.group_id = g.id
WHERE p.user_id = $1;

-- Bad: Multiple queries
-- Query 1: Get posts
-- Query 2: Get group for each post
```

---

## 📝 Migration Files

| Date | File | Tables Created |
|------|------|----------------|
| 2026-01-19 | 20260119_voice_photo_health_features.sql | 6 tables |
| 2026-01-21 | 20260121_emotion_tracking.sql | 2 tables |
| 2026-01-22 | 20260122_medications_table.sql | 2 tables |
| 2026-01-27 | 20260127_enhanced_features.sql | 12 tables |

**Total: 22 tables**

---

## 🔍 Useful Queries

### Count User's Data
```sql
SELECT
  (SELECT COUNT(*) FROM emotion_entries WHERE user_id = $1) as emotions,
  (SELECT COUNT(*) FROM medications WHERE user_id = $1) as medications,
  (SELECT COUNT(*) FROM community_posts WHERE user_id = $1) as posts,
  (SELECT COUNT(*) FROM group_memberships WHERE user_id = $1) as groups;
```

### Get User's Activity Summary
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as entries
FROM emotion_entries
WHERE user_id = $1
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Get Medication Adherence Rate
```sql
SELECT
  m.name,
  COUNT(ml.id) as taken_count,
  (COUNT(ml.id)::float / 30) * 100 as adherence_rate
FROM medications m
LEFT JOIN medication_logs ml ON m.id = ml.medication_id
WHERE m.user_id = $1
AND ml.taken_at >= NOW() - INTERVAL '30 days'
GROUP BY m.id, m.name;
```

---

## 📚 Documentation Files

1. **DATABASE_DOCUMENTATION.md** - Complete schema reference
2. **DATABASE_ERD.md** - Entity relationship diagrams
3. **DATABASE_QUICK_REFERENCE.md** - This file

---

**Quick Stats:**
- **Total Tables:** 22
- **User Data Tables:** 18
- **System Tables:** 4
- **Junction Tables:** 3
- **Total Columns:** ~200
- **Total Indexes:** 35+
- **RLS Policies:** 50+

---

**Last Updated:** January 27, 2026  
**Database:** PostgreSQL (Supabase)  
**Version:** 1.0
