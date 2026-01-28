# MindSync Database Documentation
## Complete Schema Reference

**Last Updated:** January 27, 2026  
**Database:** PostgreSQL (Supabase)  
**Total Tables:** 22  
**Security:** Row-Level Security (RLS) enabled on all tables

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Tables](#authentication-tables)
3. [Mood & Emotion Tracking](#mood--emotion-tracking)
4. [Health & Wellness](#health--wellness)
5. [Mental Health Assessments](#mental-health-assessments)
6. [Medication Management](#medication-management)
7. [Therapist Network](#therapist-network)
8. [Social Support](#social-support)
9. [Notifications & Preferences](#notifications--preferences)
10. [Entity Relationships](#entity-relationships)
11. [Indexes & Performance](#indexes--performance)
12. [Security Policies](#security-policies)

---

## Overview

MindSync uses a PostgreSQL database hosted on Supabase with the following architecture:

**Core Principles:**
- ✅ Row-Level Security (RLS) on all user data
- ✅ UUID primary keys for user-facing tables
- ✅ BIGSERIAL for system tables (therapists, groups)
- ✅ Timestamps on all tables (created_at, updated_at)
- ✅ Soft deletes where appropriate
- ✅ Foreign key constraints with CASCADE
- ✅ Indexes on frequently queried columns

**Database Statistics:**
- **Total Tables:** 22
- **User Data Tables:** 18
- **System Tables:** 4
- **Junction Tables:** 3
- **Total Columns:** ~200
- **Total Indexes:** 35+

---

## Authentication Tables

### auth.users (Supabase Built-in)
**Purpose:** User authentication and identity  
**Managed By:** Supabase Auth

**Key Columns:**
- `id` (UUID, PK) - User unique identifier
- `email` (TEXT) - User email address
- `encrypted_password` (TEXT) - Hashed password
- `email_confirmed_at` (TIMESTAMPTZ) - Email verification timestamp
- `created_at` (TIMESTAMPTZ) - Account creation date

**Relationships:**
- Referenced by ALL user data tables via `user_id`

---

## Mood & Emotion Tracking

### 1. voice_recordings
**Purpose:** Store voice mood captures with AI sentiment analysis

**Schema:**
```sql
CREATE TABLE voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  transcription TEXT,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  emotion_detected TEXT,
  keywords TEXT[],
  support_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User who created recording | FK → auth.users(id), NOT NULL |
| audio_url | TEXT | Supabase Storage URL | NOT NULL |
| duration_seconds | INTEGER | Recording length | NOT NULL |
| transcription | TEXT | AI-generated transcript | Nullable |
| sentiment_score | DECIMAL(3,2) | Sentiment (-1.0 to 1.0) | Nullable |
| emotion_detected | TEXT | Primary emotion | Nullable |
| keywords | TEXT[] | Extracted keywords | Array |
| support_flag | BOOLEAN | Needs crisis support | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_voice_recordings_user_id` ON (user_id)
- `idx_voice_recordings_created_at` ON (created_at DESC)
- `idx_voice_recordings_support_flag` ON (support_flag) WHERE support_flag = TRUE

**RLS Policies:**
- Users can SELECT their own recordings
- Users can INSERT their own recordings

**Storage:**
- Audio files stored in Supabase Storage bucket: `mood-captures`

---

### 2. photo_mood_captures
**Purpose:** Store photo mood captures with facial expression analysis

**Schema:**
```sql
CREATE TABLE photo_mood_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  mood_detected TEXT,
  facial_expression_analysis JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User who took photo | FK → auth.users(id), NOT NULL |
| photo_url | TEXT | Supabase Storage URL | NOT NULL |
| mood_detected | TEXT | AI-detected mood | Nullable |
| facial_expression_analysis | JSONB | Detailed analysis | JSON object |
| notes | TEXT | User notes | Nullable |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |

**JSONB Structure (facial_expression_analysis):**
```json
{
  "emotions": {
    "happy": 0.85,
    "sad": 0.05,
    "anxious": 0.10
  },
  "confidence": 0.92,
  "dominant_emotion": "happy"
}
```

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_photo_mood_captures_user_id` ON (user_id)
- `idx_photo_mood_captures_created_at` ON (created_at DESC)

**RLS Policies:**
- Users can SELECT their own captures
- Users can INSERT their own captures

---

### 3. emotion_entries
**Purpose:** Track emotion vocabulary selections (Yale How We Feel integration)

**Schema:**
```sql
CREATE TABLE emotion_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  emotion TEXT NOT NULL,
  category TEXT NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User selecting emotion | NOT NULL |
| emotion | TEXT | Specific emotion word | NOT NULL |
| category | TEXT | Emotion quadrant | NOT NULL |
| intensity | INTEGER | Intensity (1-10) | CHECK 1-10 |
| context | TEXT | Optional context | Nullable |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Category Values:**
- `pleasant_high` - High energy, positive (e.g., Excited, Energized)
- `pleasant_low` - Low energy, positive (e.g., Calm, Content)
- `unpleasant_high` - High energy, negative (e.g., Anxious, Angry)
- `unpleasant_low` - Low energy, negative (e.g., Sad, Tired)

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_emotion_entries_user_id` ON (user_id)
- `idx_emotion_entries_created_at` ON (created_at)
- `idx_emotion_entries_category` ON (category)
- `idx_emotion_entries_emotion` ON (emotion)

**RLS Policies:**
- Users can SELECT, INSERT, UPDATE, DELETE their own entries

---

### 4. strategy_usage
**Purpose:** Track regulation strategy usage and effectiveness

**Schema:**
```sql
CREATE TABLE strategy_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_id INTEGER NOT NULL,
  strategy_name TEXT NOT NULL,
  category TEXT NOT NULL,
  helpful BOOLEAN NOT NULL,
  emotion_context TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User using strategy | NOT NULL |
| strategy_id | INTEGER | Strategy reference ID | NOT NULL |
| strategy_name | TEXT | Strategy name | NOT NULL |
| category | TEXT | Strategy category | NOT NULL |
| helpful | BOOLEAN | Was it helpful? | NOT NULL |
| emotion_context | TEXT | Emotion when used | Nullable |
| duration_minutes | INTEGER | Time spent | Nullable |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Category Values:**
- `thinking` - Cognitive strategies (e.g., Reframe Thoughts)
- `movement` - Physical strategies (e.g., Walk, Stretch)
- `mindfulness` - Meditation strategies (e.g., Box Breathing)
- `social` - Social strategies (e.g., Call a Friend)

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_strategy_usage_user_id` ON (user_id)
- `idx_strategy_usage_created_at` ON (created_at)
- `idx_strategy_usage_category` ON (category)
- `idx_strategy_usage_helpful` ON (helpful)
- `idx_strategy_usage_strategy_id` ON (strategy_id)

**RLS Policies:**
- Users can SELECT, INSERT, UPDATE, DELETE their own usage

---

## Health & Wellness

### 5. health_metrics
**Purpose:** Store daily health data for Discovery Health integration

**Schema:**
```sql
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  steps_count INTEGER,
  heart_rate_avg INTEGER,
  heart_rate_resting INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  weight_kg DECIMAL(5,2),
  bmi DECIMAL(4,2),
  calories_burned INTEGER,
  active_minutes INTEGER,
  vitality_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User's metrics | FK → auth.users(id), NOT NULL |
| metric_date | DATE | Date of metrics | NOT NULL |
| steps_count | INTEGER | Daily steps | Nullable |
| heart_rate_avg | INTEGER | Average HR (bpm) | Nullable |
| heart_rate_resting | INTEGER | Resting HR (bpm) | Nullable |
| blood_pressure_systolic | INTEGER | Systolic BP (mmHg) | Nullable |
| blood_pressure_diastolic | INTEGER | Diastolic BP (mmHg) | Nullable |
| weight_kg | DECIMAL(5,2) | Weight in kg | Nullable |
| bmi | DECIMAL(4,2) | Body Mass Index | Nullable |
| calories_burned | INTEGER | Calories burned | Nullable |
| active_minutes | INTEGER | Active minutes | Nullable |
| vitality_points | INTEGER | Discovery Vitality points | Nullable |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_health_metrics_user_id` ON (user_id)
- `idx_health_metrics_date` ON (metric_date DESC)

**RLS Policies:**
- Users can SELECT their own metrics
- Users can INSERT, UPDATE, DELETE their own metrics

---

### 6. wellness_programs
**Purpose:** Track user participation in wellness programs

**Schema:**
```sql
CREATE TABLE wellness_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  goals JSONB,
  achievements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | Enrolled user | FK → auth.users(id), NOT NULL |
| program_name | TEXT | Program name | NOT NULL |
| program_type | TEXT | Program category | NOT NULL |
| start_date | DATE | Enrollment date | NOT NULL |
| end_date | DATE | Completion date | Nullable |
| status | TEXT | Current status | DEFAULT 'active' |
| progress_percentage | INTEGER | Progress (0-100) | DEFAULT 0 |
| goals | JSONB | Program goals | JSON object |
| achievements | JSONB | Earned achievements | JSON array |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Program Types:**
- `fitness` - Physical fitness programs
- `nutrition` - Nutrition programs
- `mental_health` - Mental wellness programs
- `preventive_care` - Preventive health programs

**Status Values:**
- `active` - Currently enrolled
- `completed` - Successfully completed
- `paused` - Temporarily paused

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_wellness_programs_user_id` ON (user_id)
- `idx_wellness_programs_status` ON (status)

**RLS Policies:**
- Users can SELECT their own programs
- Users can INSERT, UPDATE, DELETE their own programs

---

## Mental Health Assessments

### 7. mental_health_assessments
**Purpose:** Store clinical assessment results (PHQ-9, GAD-7, etc.)

**Schema:**
```sql
CREATE TABLE mental_health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  severity_level TEXT,
  responses JSONB,
  recommendations TEXT[],
  requires_professional_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```


**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User assessed | FK → auth.users(id), NOT NULL |
| assessment_type | TEXT | Assessment name | NOT NULL |
| score | INTEGER | Total score | NOT NULL |
| severity_level | TEXT | Severity category | Nullable |
| responses | JSONB | Question responses | JSON object |
| recommendations | TEXT[] | Recommendations | Array |
| requires_professional_support | BOOLEAN | Needs support | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | Assessment date | DEFAULT NOW() |

**Assessment Types:**
- `PHQ-9` - Depression screening (0-27 scale)
- `GAD-7` - Anxiety screening (0-21 scale)
- `PSS` - Perceived Stress Scale
- `custom` - Custom assessments

**Severity Levels:**
- `minimal` - 0-4 (PHQ-9), 0-4 (GAD-7)
- `mild` - 5-9 (PHQ-9), 5-9 (GAD-7)
- `moderate` - 10-14 (PHQ-9), 10-14 (GAD-7)
- `severe` - 15+ (PHQ-9), 15+ (GAD-7)

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_mental_health_assessments_user_id` ON (user_id)
- `idx_mental_health_assessments_created_at` ON (created_at DESC)

**RLS Policies:**
- Users can SELECT their own assessments
- Users can INSERT their own assessments

---

### 8. support_interventions
**Purpose:** Track crisis support interventions

**Schema:**
```sql
CREATE TABLE support_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_source TEXT NOT NULL,
  trigger_id UUID,
  intervention_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User needing support | FK → auth.users(id), NOT NULL |
| trigger_source | TEXT | What triggered | NOT NULL |
| trigger_id | UUID | Source record ID | Nullable |
| intervention_type | TEXT | Type of intervention | NOT NULL |
| status | TEXT | Current status | DEFAULT 'pending' |
| notes | TEXT | Intervention notes | Nullable |
| created_at | TIMESTAMPTZ | Trigger timestamp | DEFAULT NOW() |
| resolved_at | TIMESTAMPTZ | Resolution timestamp | Nullable |

**Trigger Sources:**
- `voice_recording` - Voice sentiment analysis
- `assessment` - PHQ-9/GAD-7 score
- `mood_pattern` - Mood trend analysis
- `manual` - User requested

**Intervention Types:**
- `immediate_resources` - Crisis hotlines
- `counselor_referral` - Therapist referral
- `wellness_coach` - Wellness coaching
- `crisis_line` - Emergency services

**Status Values:**
- `pending` - Not yet contacted
- `contacted` - User contacted
- `completed` - Intervention complete
- `declined` - User declined

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `trigger_id` → Various tables (polymorphic)

**Indexes:**
- `idx_support_interventions_user_id` ON (user_id)
- `idx_support_interventions_status` ON (status)

**RLS Policies:**
- Users can SELECT their own interventions

---

## Medication Management

### 9. medications
**Purpose:** Store user medications for tracking

**Schema:**
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[] NOT NULL DEFAULT ARRAY['08:00'],
  prescribed_by TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User's medication | FK → auth.users(id), NOT NULL |
| name | TEXT | Medication name | NOT NULL |
| dosage | TEXT | Dosage (e.g., "50mg") | NOT NULL |
| frequency | TEXT | How often | NOT NULL |
| times | TEXT[] | Reminder times | Array, DEFAULT ['08:00'] |
| prescribed_by | TEXT | Prescribing doctor | Nullable |
| start_date | DATE | Start date | NOT NULL, DEFAULT today |
| end_date | DATE | End date | Nullable |
| notes | TEXT | Additional notes | Nullable |
| active | BOOLEAN | Currently taking | DEFAULT TRUE |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Frequency Values:**
- `once daily` - Once per day
- `twice daily` - Twice per day
- `three times daily` - Three times per day
- `as needed` - PRN (pro re nata)

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `id` ← `medication_logs(medication_id)` (One-to-Many)

**Indexes:**
- `idx_medications_user_id` ON (user_id)
- `idx_medications_active` ON (active)

**RLS Policies:**
- Users can SELECT, INSERT, UPDATE, DELETE their own medications

---

### 10. medication_logs
**Purpose:** Track when medications are taken

**Schema:**
```sql
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Primary key | PK, Auto-generated |
| user_id | UUID | User who took med | FK → auth.users(id), NOT NULL |
| medication_id | UUID | Which medication | FK → medications(id), NOT NULL |
| taken_at | TIMESTAMPTZ | When taken | DEFAULT NOW() |
| scheduled_time | TIME | Scheduled time | NOT NULL |
| notes | TEXT | Log notes | Nullable |
| created_at | TIMESTAMPTZ | Log timestamp | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `medication_id` → `medications(id)` (Many-to-One)

**Indexes:**
- `idx_medication_logs_user_id` ON (user_id)
- `idx_medication_logs_medication_id` ON (medication_id)
- `idx_medication_logs_taken_at` ON (taken_at)

**RLS Policies:**
- Users can SELECT, INSERT, UPDATE, DELETE their own logs

---

## Therapist Network

### 11. therapists
**Purpose:** Store therapist profiles for matching

**Schema:**
```sql
CREATE TABLE therapists (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  experience INTEGER NOT NULL,
  availability TEXT[] NOT NULL,
  session_types TEXT[] NOT NULL,
  rate INTEGER NOT NULL,
  discovery_network BOOLEAN DEFAULT false,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| name | TEXT | Therapist name | NOT NULL |
| title | TEXT | Professional title | NOT NULL |
| specializations | TEXT[] | Specializations | Array, NOT NULL |
| languages | TEXT[] | Languages spoken | Array, NOT NULL |
| location | TEXT | Practice location | NOT NULL |
| rating | DECIMAL(2,1) | Average rating (0-5) | DEFAULT 0 |
| reviews | INTEGER | Number of reviews | DEFAULT 0 |
| experience | INTEGER | Years of experience | NOT NULL |
| availability | TEXT[] | Available days | Array, NOT NULL |
| session_types | TEXT[] | Session types | Array, NOT NULL |
| rate | INTEGER | Session rate (ZAR) | NOT NULL |
| discovery_network | BOOLEAN | In Discovery network | DEFAULT false |
| bio | TEXT | Biography | Nullable |
| image_url | TEXT | Profile photo URL | Nullable |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Session Types:**
- `in-person` - Face-to-face sessions
- `video` - Video call sessions
- `phone` - Phone call sessions

**Relationships:**
- `id` ← `therapist_bookings(therapist_id)` (One-to-Many)

**RLS Policies:**
- Public SELECT (anyone can view therapists)

**Sample Data:**
- Dr. Thandi Mthembu (Clinical Psychologist)
- Dr. Johan van der Merwe (Psychiatrist)
- Lerato Khumalo (Counselling Psychologist)

---

### 12. therapist_bookings
**Purpose:** Track therapy session bookings

**Schema:**
```sql
CREATE TABLE therapist_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id BIGINT REFERENCES therapists(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('in-person', 'video', 'phone')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | User booking | FK → auth.users(id) |
| therapist_id | BIGINT | Therapist booked | FK → therapists(id) |
| session_date | TIMESTAMPTZ | Session date/time | NOT NULL |
| session_type | TEXT | Session type | CHECK constraint |
| status | TEXT | Booking status | CHECK constraint |
| notes | TEXT | Booking notes | Nullable |
| created_at | TIMESTAMPTZ | Booking timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Status Values:**
- `pending` - Awaiting confirmation
- `confirmed` - Confirmed by therapist
- `cancelled` - Cancelled
- `completed` - Session completed

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `therapist_id` → `therapists(id)` (Many-to-One)

**Indexes:**
- `idx_therapist_bookings_user` ON (user_id)
- `idx_therapist_bookings_therapist` ON (therapist_id)
- `idx_therapist_bookings_date` ON (session_date)

**RLS Policies:**
- Users can SELECT their own bookings
- Users can INSERT their own bookings
- Users can UPDATE their own bookings

---

## Social Support

### 13. support_groups
**Purpose:** Community support groups

**Schema:**
```sql
CREATE TABLE support_groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  moderator_id UUID REFERENCES auth.users(id),
  moderator_name TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```


**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| name | TEXT | Group name | NOT NULL |
| description | TEXT | Group description | NOT NULL |
| category | TEXT | Group category | NOT NULL |
| moderator_id | UUID | Moderator user | FK → auth.users(id) |
| moderator_name | TEXT | Moderator name | Nullable |
| member_count | INTEGER | Number of members | DEFAULT 0 |
| is_active | BOOLEAN | Group active | DEFAULT true |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Categories:**
- `Anxiety` - Anxiety support
- `Depression` - Depression support
- `Stress` - Stress management
- `Trauma` - Trauma recovery
- `General` - General wellness

**Relationships:**
- `moderator_id` → `auth.users(id)` (Many-to-One)
- `id` ← `group_memberships(group_id)` (One-to-Many)
- `id` ← `community_posts(group_id)` (One-to-Many)

**RLS Policies:**
- Public SELECT (where is_active = true)

**Sample Data:**
- Anxiety Warriors (1,247 members)
- Depression Support Circle (892 members)
- Young Professionals Wellness (2,134 members)
- PTSD Recovery (456 members)

---

### 14. group_memberships
**Purpose:** Track user group memberships (junction table)

**Schema:**
```sql
CREATE TABLE group_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES support_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | Member user | FK → auth.users(id) |
| group_id | BIGINT | Group joined | FK → support_groups(id) |
| joined_at | TIMESTAMPTZ | Join timestamp | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `group_id` → `support_groups(id)` (Many-to-One)

**Unique Constraint:**
- (user_id, group_id) - User can only join group once

**Indexes:**
- `idx_group_memberships_user` ON (user_id)
- `idx_group_memberships_group` ON (group_id)

**RLS Policies:**
- Public SELECT (anyone can view memberships)
- Users can INSERT their own memberships
- Users can DELETE their own memberships

---

### 15. community_posts
**Purpose:** Community feed posts

**Schema:**
```sql
CREATE TABLE community_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES support_groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | Post author | FK → auth.users(id) |
| group_id | BIGINT | Posted in group | FK → support_groups(id) |
| content | TEXT | Post content | NOT NULL |
| is_anonymous | BOOLEAN | Anonymous post | DEFAULT false |
| likes_count | INTEGER | Number of likes | DEFAULT 0 |
| replies_count | INTEGER | Number of replies | DEFAULT 0 |
| created_at | TIMESTAMPTZ | Post timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `group_id` → `support_groups(id)` (Many-to-One)
- `id` ← `post_likes(post_id)` (One-to-Many)
- `id` ← `post_replies(post_id)` (One-to-Many)

**Indexes:**
- `idx_community_posts_group` ON (group_id)
- `idx_community_posts_created` ON (created_at DESC)

**RLS Policies:**
- Users can SELECT posts in groups they're members of
- Users can INSERT posts in groups they're members of

---

### 16. post_likes
**Purpose:** Track post likes (junction table)

**Schema:**
```sql
CREATE TABLE post_likes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | User who liked | FK → auth.users(id) |
| post_id | BIGINT | Post liked | FK → community_posts(id) |
| created_at | TIMESTAMPTZ | Like timestamp | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `post_id` → `community_posts(id)` (Many-to-One)

**Unique Constraint:**
- (user_id, post_id) - User can only like post once

**RLS Policies:**
- Public SELECT (anyone can view likes)
- Users can INSERT their own likes
- Users can DELETE their own likes

---

### 17. post_replies
**Purpose:** Replies to community posts

**Schema:**
```sql
CREATE TABLE post_replies (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | Reply author | FK → auth.users(id) |
| post_id | BIGINT | Parent post | FK → community_posts(id) |
| content | TEXT | Reply content | NOT NULL |
| is_anonymous | BOOLEAN | Anonymous reply | DEFAULT false |
| created_at | TIMESTAMPTZ | Reply timestamp | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `post_id` → `community_posts(id)` (Many-to-One)

**RLS Policies:**
- Public SELECT (anyone can view replies)
- Users can INSERT their own replies

---

### 18. buddy_requests
**Purpose:** Accountability buddy matching

**Schema:**
```sql
CREATE TABLE buddy_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, buddy_id)
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| requester_id | UUID | User requesting | FK → auth.users(id) |
| buddy_id | UUID | Potential buddy | FK → auth.users(id) |
| status | TEXT | Request status | CHECK constraint |
| message | TEXT | Request message | Nullable |
| categories | TEXT[] | Shared interests | Array |
| created_at | TIMESTAMPTZ | Request timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Status Values:**
- `pending` - Awaiting response
- `accepted` - Buddy connection made
- `declined` - Request declined

**Relationships:**
- `requester_id` → `auth.users(id)` (Many-to-One)
- `buddy_id` → `auth.users(id)` (Many-to-One)

**Unique Constraint:**
- (requester_id, buddy_id) - One request per pair

**RLS Policies:**
- Users can SELECT requests involving them
- Users can INSERT requests they initiate
- Users can UPDATE requests involving them

---

### 19. buddy_checkins
**Purpose:** Track buddy check-ins

**Schema:**
```sql
CREATE TABLE buddy_checkins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | User checking in | FK → auth.users(id) |
| buddy_id | UUID | Buddy | FK → auth.users(id) |
| message | TEXT | Check-in message | Nullable |
| created_at | TIMESTAMPTZ | Check-in timestamp | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)
- `buddy_id` → `auth.users(id)` (Many-to-One)

**RLS Policies:**
- Users can SELECT check-ins involving them
- Users can INSERT their own check-ins

---

## Notifications & Preferences

### 20. notification_preferences
**Purpose:** User notification settings

**Schema:**
```sql
CREATE TABLE notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  medication_reminders BOOLEAN DEFAULT true,
  daily_checkin BOOLEAN DEFAULT true,
  crisis_alerts BOOLEAN DEFAULT true,
  wellness_tips BOOLEAN DEFAULT true,
  community_updates BOOLEAN DEFAULT true,
  therapist_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | User preferences | FK → auth.users(id), UNIQUE |
| medication_reminders | BOOLEAN | Med reminders | DEFAULT true |
| daily_checkin | BOOLEAN | Daily prompts | DEFAULT true |
| crisis_alerts | BOOLEAN | Crisis alerts | DEFAULT true |
| wellness_tips | BOOLEAN | Wellness tips | DEFAULT true |
| community_updates | BOOLEAN | Community notifs | DEFAULT true |
| therapist_reminders | BOOLEAN | Therapy reminders | DEFAULT true |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Relationships:**
- `user_id` → `auth.users(id)` (One-to-One)

**RLS Policies:**
- Users can SELECT their own preferences
- Users can INSERT their own preferences
- Users can UPDATE their own preferences

---

### 21. scheduled_notifications
**Purpose:** Notification queue

**Schema:**
```sql
CREATE TABLE scheduled_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | Recipient | FK → auth.users(id) |
| notification_type | TEXT | Notification type | NOT NULL |
| title | TEXT | Notification title | NOT NULL |
| body | TEXT | Notification body | NOT NULL |
| scheduled_at | TIMESTAMPTZ | Send time | NOT NULL |
| sent | BOOLEAN | Already sent | DEFAULT false |
| metadata | JSONB | Additional data | JSON object |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |

**Notification Types:**
- `medication_reminder` - Med reminder
- `daily_checkin` - Daily prompt
- `crisis_alert` - Crisis support
- `wellness_tip` - Wellness tip
- `community_update` - Community activity
- `therapist_reminder` - Therapy session

**Relationships:**
- `user_id` → `auth.users(id)` (Many-to-One)

**Indexes:**
- `idx_scheduled_notifications_user` ON (user_id)
- `idx_scheduled_notifications_scheduled` ON (scheduled_at)

**RLS Policies:**
- Users can SELECT their own notifications

---

### 22. user_preferences
**Purpose:** User app preferences (language, theme, onboarding)

**Schema:**
```sql
CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'zu', 'xh', 'af', 'st')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PK, Auto-increment |
| user_id | UUID | User preferences | FK → auth.users(id), UNIQUE |
| language | TEXT | App language | CHECK constraint |
| theme | TEXT | App theme | CHECK constraint |
| onboarding_completed | BOOLEAN | Onboarding done | DEFAULT false |
| created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Last update | DEFAULT NOW() |

**Language Values:**
- `en` - English
- `zu` - isiZulu
- `xh` - isiXhosa
- `af` - Afrikaans
- `st` - Sesotho

**Theme Values:**
- `light` - Light mode
- `dark` - Dark mode
- `system` - Follow system

**Relationships:**
- `user_id` → `auth.users(id)` (One-to-One)

**RLS Policies:**
- Users can SELECT their own preferences
- Users can INSERT their own preferences
- Users can UPDATE their own preferences

---

## Entity Relationships

### Relationship Diagram

```
auth.users (1) ──────────────────────────────────────────────────────────┐
    │                                                                      │
    │ (1:N)                                                                │
    ├─→ voice_recordings                                                   │
    ├─→ photo_mood_captures                                                │
    ├─→ emotion_entries                                                    │
    ├─→ strategy_usage                                                     │
    ├─→ health_metrics                                                     │
    ├─→ wellness_programs                                                  │
    ├─→ mental_health_assessments                                          │
    ├─→ support_interventions                                              │
    ├─→ medications ──(1:N)──→ medication_logs                             │
    ├─→ therapist_bookings ──(N:1)──→ therapists                           │
    ├─→ group_memberships ──(N:1)──→ support_groups                        │
    ├─→ community_posts ──(1:N)──→ post_likes                              │
    │                      └──(1:N)──→ post_replies                        │
    ├─→ buddy_requests (as requester or buddy)                             │
    ├─→ buddy_checkins (as user or buddy)                                  │
    ├─→ notification_preferences (1:1)                                     │
    ├─→ scheduled_notifications                                            │
    └─→ user_preferences (1:1)                                             │
```

### Key Relationships

**User → Mood Tracking (1:N)**
- One user has many voice recordings
- One user has many photo captures
- One user has many emotion entries
- One user has many strategy usages

**User → Health (1:N)**
- One user has many health metrics
- One user has many wellness programs
- One user has many assessments

**User → Medications (1:N:N)**
- One user has many medications
- One medication has many logs
- User → Medications → Logs (transitive)

**User → Therapists (N:N via bookings)**
- Many users can book many therapists
- Junction table: therapist_bookings

**User → Groups (N:N via memberships)**
- Many users can join many groups
- Junction table: group_memberships

**User → Posts (1:N:N)**
- One user creates many posts
- One post has many likes
- One post has many replies

**User → Buddies (N:N via requests)**
- Many users can connect with many buddies
- Junction table: buddy_requests
- Check-ins tracked in buddy_checkins

**User → Preferences (1:1)**
- One user has one notification_preferences
- One user has one user_preferences

---

## Indexes & Performance

### Index Strategy

**Primary Indexes (Automatic):**
- All PRIMARY KEY columns
- All UNIQUE constraints

**Foreign Key Indexes:**
- All `user_id` columns (35+ indexes)
- All junction table foreign keys

**Query Optimization Indexes:**
- Timestamp columns (created_at DESC)
- Status/flag columns (WHERE clauses)
- Composite indexes for common queries

### Index List

**Mood & Emotion:**
```sql
idx_voice_recordings_user_id
idx_voice_recordings_created_at
idx_voice_recordings_support_flag
idx_photo_mood_captures_user_id
idx_photo_mood_captures_created_at
idx_emotion_entries_user_id
idx_emotion_entries_created_at
idx_emotion_entries_category
idx_emotion_entries_emotion
idx_strategy_usage_user_id
idx_strategy_usage_created_at
idx_strategy_usage_category
idx_strategy_usage_helpful
idx_strategy_usage_strategy_id
```

**Health & Wellness:**
```sql
idx_health_metrics_user_id
idx_health_metrics_date
idx_wellness_programs_user_id
idx_wellness_programs_status
idx_mental_health_assessments_user_id
idx_mental_health_assessments_created_at
idx_support_interventions_user_id
idx_support_interventions_status
```

**Medications:**
```sql
idx_medications_user_id
idx_medications_active
idx_medication_logs_user_id
idx_medication_logs_medication_id
idx_medication_logs_taken_at
```

**Therapists:**
```sql
idx_therapist_bookings_user
idx_therapist_bookings_therapist
idx_therapist_bookings_date
```

**Social:**
```sql
idx_group_memberships_user
idx_group_memberships_group
idx_community_posts_group
idx_community_posts_created
idx_scheduled_notifications_user
idx_scheduled_notifications_scheduled
```

---

## Security Policies

### Row-Level Security (RLS)

**All tables have RLS enabled** with policies ensuring:
- Users can only access their own data
- Public data (therapists, groups) is readable by all
- Junction tables allow appropriate access

### Policy Patterns

**User Data Pattern:**
```sql
-- SELECT: Users see their own data
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users create their own data
CREATE POLICY "policy_name" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users modify their own data
CREATE POLICY "policy_name" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users delete their own data
CREATE POLICY "policy_name" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

**Public Data Pattern:**
```sql
-- Anyone can view
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (true);
```

**Group Membership Pattern:**
```sql
-- Users see data in groups they're members of
CREATE POLICY "policy_name" ON community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_memberships.group_id = community_posts.group_id
      AND group_memberships.user_id = auth.uid()
    )
  );
```

---

## Database Maintenance

### Triggers

**Update Timestamps:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to tables with updated_at column
```

### Backup Strategy

**Recommended:**
- Daily automated backups (Supabase handles this)
- Point-in-time recovery enabled
- Export critical data weekly

### Monitoring

**Key Metrics:**
- Table sizes
- Index usage
- Query performance
- Connection pool usage

---

## Migration History

| Date | File | Description |
|------|------|-------------|
| 2026-01-19 | 20260119_voice_photo_health_features.sql | Voice, photo, health metrics |
| 2026-01-21 | 20260121_emotion_tracking.sql | Emotion vocabulary, strategies |
| 2026-01-22 | 20260122_medications_table.sql | Medication tracking |
| 2026-01-27 | 20260127_enhanced_features.sql | Therapists, community, notifications |

---

## Quick Reference

### Table Count by Category

| Category | Tables | Description |
|----------|--------|-------------|
| Mood Tracking | 4 | Voice, photo, emotions, strategies |
| Health | 2 | Metrics, wellness programs |
| Assessments | 2 | Mental health, interventions |
| Medications | 2 | Medications, logs |
| Therapists | 2 | Therapists, bookings |
| Social | 6 | Groups, posts, likes, replies, buddies |
| Preferences | 3 | Notifications, user prefs, scheduled |
| **Total** | **22** | **All tables** |

### Storage Requirements

**Estimated per 10,000 users:**
- Voice recordings: ~50GB (audio files)
- Photo captures: ~20GB (image files)
- Database: ~5GB (all tables)
- **Total: ~75GB**

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Maintained By:** MindSync Development Team
