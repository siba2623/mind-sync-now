# Phase 3 Algorithms - Design Document

## Overview

This design document specifies the implementation of three advanced algorithms for MindSync's Phase 3:

1. **Medication Adherence Prediction** - Predicts when users are likely to miss medication doses and optimizes reminder timing
2. **Optimal Notification Timing** - Learns user engagement patterns to send notifications at the most effective times
3. **Therapist Matching** - Matches users with compatible therapists using multi-criteria decision making

These algorithms build on the existing Phase 1 (Mood Pattern Analysis) and Phase 2 (Crisis Detection) implementations, leveraging the established data collection infrastructure and user engagement patterns.

### Design Philosophy

- **Incremental Learning**: Algorithms improve over time as they collect more user data
- **Privacy-First**: All predictions run locally when possible, with encrypted cloud backup
- **Explainable**: Users can see why recommendations are made
- **Fail-Safe**: Conservative defaults when insufficient data exists
- **Performance**: All algorithms meet strict latency requirements (<100ms for adherence, <50ms for notifications, <500ms for matching)

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     MindSync Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Medication  │  │ Notification │  │  Therapist   │      │
│  │  Tracker UI  │  │  Service UI  │  │  Network UI  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         ▼                  ▼                  ▼               │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Phase 3 Algorithm Services               │       │
│  ├──────────────────────────────────────────────────┤       │
│  │                                                    │       │
│  │  ┌─────────────────────────────────────────┐    │       │
│  │  │  Adherence Prediction Service           │    │       │
│  │  │  - Feature Extraction                   │    │       │
│  │  │  - Logistic Regression Model            │    │       │
│  │  │  - Risk Scoring                         │    │       │
│  │  └─────────────────────────────────────────┘    │       │
│  │                                                    │       │
│  │  ┌─────────────────────────────────────────┐    │       │
│  │  │  Notification Timing Service            │    │       │
│  │  │  - Engagement Tracking                  │    │       │
│  │  │  - Thompson Sampling (MAB)              │    │       │
│  │  │  - Context-Aware Scheduling             │    │       │
│  │  └─────────────────────────────────────────┘    │       │
│  │                                                    │       │
│  │  ┌─────────────────────────────────────────┐    │       │
│  │  │  Therapist Matching Service             │    │       │
│  │  │  - Constraint Filtering                 │    │       │
│  │  │  - Multi-Criteria Scoring               │    │       │
│  │  │  - Collaborative Filtering              │    │       │
│  │  └─────────────────────────────────────────┘    │       │
│  │                                                    │       │
│  └────────────────────┬───────────────────────────┘       │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Data Layer (Supabase + Local)            │     │
│  ├──────────────────────────────────────────────────┤     │
│  │  - Medication Logs                               │     │
│  │  - Notification Interactions                     │     │
│  │  - Therapist Profiles                            │     │
│  │  - User Preferences                              │     │
│  │  - Prediction History                            │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Medication Adherence Flow:**
```
User Opens App → Load Medication Schedule → Extract Features → 
Calculate Risk → Display Indicators → Schedule Smart Reminders
```

**Notification Timing Flow:**
```
Notification Triggered → Check User Context → Query Timing Model → 
Calculate Optimal Time → Schedule Notification → Track Engagement → 
Update Model
```

**Therapist Matching Flow:**
```
User Searches → Apply Hard Filters → Score Remaining Therapists → 
Rank by Match Score → Display Top 10 → Track Booking Success
```

## Components and Interfaces

### 1. Medication Adherence Prediction Service



#### Interface

```typescript
interface AdherencePredictionService {
  // Predict risk for a specific medication
  predictAdherenceRisk(
    medicationId: string,
    userId: string
  ): Promise<AdherenceRiskPrediction>;
  
  // Calculate optimal reminder time
  calculateOptimalReminderTime(
    medicationId: string,
    scheduledTime: string,
    userId: string
  ): Promise<OptimalReminderTime>;
  
  // Get adherence insights for display
  getAdherenceInsights(
    userId: string
  ): Promise<AdherenceInsights>;
  
  // Update model with new adherence data
  recordAdherenceEvent(
    medicationId: string,
    userId: string,
    taken: boolean,
    timestamp: Date
  ): Promise<void>;
}

interface AdherenceRiskPrediction {
  medicationId: string;
  riskLevel: 'low' | 'moderate' | 'high';
  probability: number; // 0-100
  confidence: number; // 0-100
  factors: RiskFactor[];
  nextDoseTime: Date;
  recommendedReminderTime?: Date;
}

interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative';
  weight: number;
  description: string;
}

interface OptimalReminderTime {
  recommendedTime: Date;
  confidence: number;
  reasoning: string[];
  alternativeTimes: Date[];
}

interface AdherenceInsights {
  overallAdherenceRate: number;
  sevenDayForecast: DailyForecast[];
  streakProtectionAlerts: StreakAlert[];
  personalizedTips: string[];
}

interface DailyForecast {
  date: Date;
  predictedAdherence: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

interface StreakAlert {
  medicationId: string;
  currentStreak: number;
  riskOfBreaking: number;
  protectionStrategy: string;
}
```

#### Implementation Details

**Feature Extraction:**

The adherence prediction model extracts the following features from user data:

1. **Temporal Features:**
   - Time since last dose (hours)
   - Day of week (0-6)
   - Hour of day (0-23)
   - Days since medication started
   - Current adherence streak length

2. **Pattern Features:**
   - 7-day adherence rate
   - 30-day adherence rate
   - Weekend vs weekday adherence difference
   - Morning vs evening adherence difference
   - Missed dose frequency pattern

3. **Contextual Features:**
   - Recent mood trend (from mood tracking)
   - Recent stress level (from daily check-ins)
   - Sleep quality (from health metrics)
   - Activity completion rate (from wellness activities)
   - Social interaction frequency

4. **Medication-Specific Features:**
   - Medication complexity (number of daily doses)
   - Side effect reports (count in last 7 days)
   - Refill status (days until refill needed)
   - Concurrent medications (count)

**Logistic Regression Model:**

The model uses logistic regression for binary classification (will miss / won't miss):

```
P(miss) = 1 / (1 + e^-(β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ))

Where:
- β₀ = intercept (baseline risk)
- βᵢ = coefficient for feature i
- xᵢ = normalized feature value
```

**Initial Coefficients (Rule-Based Heuristics):**

Until sufficient data is collected for training, use these heuristic weights:

- Recent streak broken: +0.8 (high risk)
- Weekend day: +0.3 (moderate risk)
- Low mood (< 3/5): +0.5 (moderate risk)
- Poor sleep (< 5 hours): +0.4 (moderate risk)
- Multiple daily doses: +0.2 (slight risk)
- Side effects reported: +0.3 (moderate risk)
- High recent adherence (>90%): -0.6 (protective)
- Morning medication: -0.2 (slightly protective)

**Risk Categorization:**

- Low Risk: P(miss) < 0.30 (30%)
- Moderate Risk: 0.30 ≤ P(miss) < 0.60 (30-60%)
- High Risk: P(miss) ≥ 0.60 (60%+)

**Optimal Reminder Timing:**

Calculate optimal reminder time based on:

1. **Historical Response Patterns:**
   - Average time between reminder and dose taken
   - Success rate by reminder lead time
   - Best-performing reminder times

2. **Current Context:**
   - User's typical active hours
   - Avoid sleep hours (22:00-06:00)
   - Avoid known busy times (if calendar integrated)

3. **Reminder Strategy:**
   - High risk: 2 reminders (1 hour before, at dose time)
   - Moderate risk: 1 reminder (30 minutes before)
   - Low risk: 1 reminder (at dose time)

### 2. Notification Timing Service

#### Interface

```typescript
interface NotificationTimingService {
  // Calculate optimal send time for a notification
  calculateOptimalSendTime(
    notificationType: NotificationType,
    userId: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<OptimalSendTime>;
  
  // Record notification engagement
  recordEngagement(
    notificationId: string,
    userId: string,
    action: 'opened' | 'dismissed' | 'ignored',
    timestamp: Date
  ): Promise<void>;
  
  // Get user's notification preferences
  getUserNotificationProfile(
    userId: string
  ): Promise<NotificationProfile>;
  
  // Update timing model with new data
  updateTimingModel(
    userId: string
  ): Promise<void>;
}

type NotificationType = 
  | 'medication_reminder'
  | 'mood_checkin'
  | 'wellness_tip'
  | 'risk_alert'
  | 'adherence_streak'
  | 'therapist_message';

interface OptimalSendTime {
  recommendedTime: Date;
  confidence: number; // 0-100
  reasoning: string;
  fallbackTime?: Date;
}

interface NotificationProfile {
  activeHours: TimeRange[];
  doNotDisturbHours: TimeRange[];
  engagementRateByHour: Map<number, number>; // hour -> rate
  preferredTypes: NotificationType[];
  optOutTypes: NotificationType[];
  averageResponseTime: number; // minutes
}

interface TimeRange {
  start: string; // HH:MM format
  end: string;
}
```

#### Implementation Details

**Multi-Armed Bandit Algorithm (Thompson Sampling):**

The notification timing service uses Thompson Sampling to balance exploration (trying new times) and exploitation (using known good times).

**Algorithm Overview:**

1. **Model Each Hour as an Arm:**
   - 24 arms (one per hour of day)
   - Each arm has a Beta distribution: Beta(α, β)
   - α = successes (notifications opened)
   - β = failures (notifications dismissed/ignored)

2. **Thompson Sampling Process:**
   ```
   For each notification:
     1. Sample from each arm's Beta distribution
     2. Select arm with highest sampled value
     3. Send notification at that hour
     4. Update arm's distribution based on outcome
   ```

3. **Exploration Rate:**
   - 10% of the time: randomly explore new times
   - 90% of the time: exploit best-known times
   - Gradually decrease exploration as confidence increases

**Context-Aware Scheduling:**

Before finalizing send time, apply context filters:

1. **Do Not Disturb:**
   - Default sleep hours: 22:00-06:00
   - User-configured DND periods
   - System-detected sleep (if health tracking enabled)

2. **Frequency Limits:**
   - Maximum 5 notifications per day
   - Minimum 2 hours between notifications
   - Priority notifications can override limits

3. **Type-Specific Rules:**
   - Medication reminders: must be near scheduled time
   - Mood check-ins: prefer morning (09:00), afternoon (14:00), evening (20:00)
   - Wellness tips: prefer low-stress times
   - Risk alerts: send immediately regardless of timing

**Engagement Tracking:**

Track these metrics per notification:

- Send time (hour of day, day of week)
- Open time (if opened)
- Response time (minutes from send to open)
- Action taken (opened, dismissed, ignored)
- User context at send time (if available)

**Model Update Frequency:**

- Update Beta distributions after each notification
- Recalculate optimal times daily
- Full model retraining weekly (if using ML enhancement)

### 3. Therapist Matching Service

#### Interface

```typescript
interface TherapistMatchingService {
  // Find matching therapists for a user
  findMatches(
    userId: string,
    searchCriteria: TherapistSearchCriteria
  ): Promise<TherapistMatch[]>;
  
  // Get detailed match explanation
  getMatchExplanation(
    userId: string,
    therapistId: string
  ): Promise<MatchExplanation>;
  
  // Record booking outcome
  recordBooking(
    userId: string,
    therapistId: string,
    booked: boolean
  ): Promise<void>;
  
  // Update match scores based on outcomes
  updateMatchModel(
    userId: string,
    therapistId: string,
    outcome: TherapyOutcome
  ): Promise<void>;
}

interface TherapistSearchCriteria {
  // Hard constraints (must match)
  insurance?: string;
  maxDistance?: number; // km
  languages?: string[];
  availability?: 'weekday' | 'weekend' | 'evening' | 'any';
  
  // Soft preferences (scored)
  specializations?: string[];
  genderPreference?: 'male' | 'female' | 'non-binary' | 'no-preference';
  ageRangePreference?: 'younger' | 'similar' | 'older' | 'no-preference';
  therapyApproach?: string[]; // CBT, DBT, psychodynamic, etc.
  sessionType?: 'in-person' | 'video' | 'phone' | 'any';
}

interface TherapistMatch {
  therapist: TherapistProfile;
  matchScore: number; // 0-100
  matchPercentage: number; // 0-100 (user-friendly)
  keyMatchingFactors: string[];
  availableSlots: TimeSlot[];
  estimatedWaitTime: string;
}

interface TherapistProfile {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  languages: string[];
  location: Location;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  rate: number;
  insurance: string[];
  bio: string;
  photo?: string;
  availability: Availability;
}

interface Location {
  city: string;
  province: string;
  coordinates?: { lat: number; lng: number };
}

interface Availability {
  weekdays: boolean;
  weekends: boolean;
  evenings: boolean;
  nextAvailable: Date;
}

interface TimeSlot {
  start: Date;
  end: Date;
  type: 'in-person' | 'video' | 'phone';
}

interface MatchExplanation {
  overallScore: number;
  breakdown: ScoreBreakdown[];
  strengths: string[];
  considerations: string[];
  similarPatientSuccess: number; // 0-100
}

interface ScoreBreakdown {
  category: string;
  score: number;
  weight: number;
  explanation: string;
}

interface TherapyOutcome {
  sessionCount: number;
  continuedTherapy: boolean;
  satisfactionRating: number; // 1-5
  outcomeImprovement: number; // -100 to +100
}
```

#### Implementation Details

**Two-Stage Matching Process:**

**Stage 1: Hard Constraint Filtering**

Apply mandatory filters first to reduce candidate pool:

```typescript
function applyHardConstraints(
  therapists: TherapistProfile[],
  criteria: TherapistSearchCriteria,
  userLocation: Location
): TherapistProfile[] {
  return therapists.filter(therapist => {
    // Insurance compatibility
    if (criteria.insurance && 
        !therapist.insurance.includes(criteria.insurance)) {
      return false;
    }
    
    // Distance constraint
    if (criteria.maxDistance) {
      const distance = calculateDistance(userLocation, therapist.location);
      if (distance > criteria.maxDistance) {
        return false;
      }
    }
    
    // Language requirement
    if (criteria.languages && criteria.languages.length > 0) {
      const hasLanguage = criteria.languages.some(lang => 
        therapist.languages.includes(lang)
      );
      if (!hasLanguage) {
        return false;
      }
    }
    
    // Availability requirement
    if (criteria.availability) {
      if (!matchesAvailability(therapist.availability, criteria.availability)) {
        return false;
      }
    }
    
    return true;
  });
}
```

**Stage 2: Multi-Criteria Scoring**

Score remaining therapists using weighted criteria:

```typescript
function calculateMatchScore(
  therapist: TherapistProfile,
  user: UserProfile,
  criteria: TherapistSearchCriteria
): number {
  let score = 0;
  
  // 1. Specialization Match (40% weight)
  const specializationScore = calculateSpecializationMatch(
    therapist.specializations,
    user.needs,
    criteria.specializations
  );
  score += specializationScore * 0.40;
  
  // 2. Success with Similar Patients (35% weight)
  const successScore = calculateSimilarPatientSuccess(
    therapist.id,
    user.demographics,
    user.conditions
  );
  score += successScore * 0.35;
  
  // 3. Gender Preference (15% weight)
  if (criteria.genderPreference && criteria.genderPreference !== 'no-preference') {
    const genderMatch = therapist.gender === criteria.genderPreference ? 100 : 0;
    score += genderMatch * 0.15;
  } else {
    score += 100 * 0.15; // Full points if no preference
  }
  
  // 4. Age Range Preference (10% weight)
  const ageScore = calculateAgePreferenceMatch(
    therapist.age,
    user.age,
    criteria.ageRangePreference
  );
  score += ageScore * 0.10;
  
  return Math.round(score);
}
```

**Specialization Matching:**

Calculate overlap between user needs and therapist specializations:

```typescript
function calculateSpecializationMatch(
  therapistSpecs: string[],
  userNeeds: string[],
  preferredSpecs?: string[]
): number {
  // Combine user needs and preferences
  const allNeeds = [...userNeeds, ...(preferredSpecs || [])];
  
  if (allNeeds.length === 0) {
    return 100; // No specific needs = all therapists match
  }
  
  // Calculate overlap
  const matches = allNeeds.filter(need => 
    therapistSpecs.some(spec => 
      spec.toLowerCase().includes(need.toLowerCase()) ||
      need.toLowerCase().includes(spec.toLowerCase())
    )
  );
  
  const matchRate = matches.length / allNeeds.length;
  return Math.round(matchRate * 100);
}
```

**Collaborative Filtering:**

Find similar patients and calculate therapist success rate:

```typescript
function calculateSimilarPatientSuccess(
  therapistId: string,
  userDemographics: Demographics,
  userConditions: string[]
): number {
  // Find similar patients
  const similarPatients = findSimilarPatients(
    userDemographics,
    userConditions,
    minSimilarity = 0.7
  );
  
  if (similarPatients.length === 0) {
    return 50; // Neutral score if no similar patients
  }
  
  // Get outcomes for this therapist with similar patients
  const outcomes = getTherapyOutcomes(therapistId, similarPatients);
  
  if (outcomes.length === 0) {
    return 50; // Neutral score if no history
  }
  
  // Calculate success rate
  const successfulOutcomes = outcomes.filter(outcome => 
    outcome.continuedTherapy && 
    outcome.satisfactionRating >= 4 &&
    outcome.outcomeImprovement > 20
  );
  
  const successRate = successfulOutcomes.length / outcomes.length;
  
  // Weight recent outcomes more heavily
  const weightedScore = calculateWeightedScore(outcomes);
  
  return Math.round(weightedScore * 100);
}
```

**Patient Similarity Calculation:**

```typescript
function findSimilarPatients(
  targetDemographics: Demographics,
  targetConditions: string[],
  minSimilarity: number
): string[] {
  const allPatients = getAllPatients();
  
  return allPatients
    .map(patient => ({
      id: patient.id,
      similarity: calculateSimilarity(
        targetDemographics,
        targetConditions,
        patient.demographics,
        patient.conditions
      )
    }))
    .filter(p => p.similarity >= minSimilarity)
    .map(p => p.id);
}

function calculateSimilarity(
  demo1: Demographics,
  conditions1: string[],
  demo2: Demographics,
  conditions2: string[]
): number {
  let similarity = 0;
  
  // Age similarity (20% weight)
  const ageDiff = Math.abs(demo1.age - demo2.age);
  const ageSimilarity = Math.max(0, 1 - (ageDiff / 50));
  similarity += ageSimilarity * 0.20;
  
  // Gender match (10% weight)
  const genderMatch = demo1.gender === demo2.gender ? 1 : 0;
  similarity += genderMatch * 0.10;
  
  // Condition overlap (70% weight)
  const conditionOverlap = calculateOverlap(conditions1, conditions2);
  similarity += conditionOverlap * 0.70;
  
  return similarity;
}
```

**Ranking and Display:**

```typescript
function rankAndFormatMatches(
  matches: TherapistMatch[],
  topN: number = 10
): TherapistMatch[] {
  // Sort by match score (descending)
  const sorted = matches.sort((a, b) => b.matchScore - a.matchScore);
  
  // Take top N
  const topMatches = sorted.slice(0, topN);
  
  // Add match percentage (user-friendly)
  return topMatches.map(match => ({
    ...match,
    matchPercentage: match.matchScore,
    keyMatchingFactors: identifyKeyFactors(match)
  }));
}

function identifyKeyFactors(match: TherapistMatch): string[] {
  const factors: string[] = [];
  
  // Add top 3 matching factors
  if (match.specializationScore > 80) {
    factors.push(`Specializes in ${match.topSpecialization}`);
  }
  
  if (match.similarPatientSuccess > 80) {
    factors.push(`${match.similarPatientSuccess}% success with similar patients`);
  }
  
  if (match.therapist.rating >= 4.5) {
    factors.push(`Highly rated (${match.therapist.rating}/5.0)`);
  }
  
  if (match.therapist.yearsExperience >= 10) {
    factors.push(`${match.therapist.yearsExperience} years experience`);
  }
  
  return factors.slice(0, 3);
}
```

## Data Models

### Medication Adherence Data

```typescript
// Stored in Supabase
interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: Date;
  taken_at: Date | null;
  taken: boolean;
  reminder_sent: boolean;
  reminder_time: Date | null;
  side_effects: string | null;
  created_at: Date;
}

interface AdherencePrediction {
  id: string;
  user_id: string;
  medication_id: string;
  prediction_date: Date;
  risk_level: 'low' | 'moderate' | 'high';
  probability: number;
  confidence: number;
  features: Record<string, number>; // JSON
  created_at: Date;
}

// Stored locally for performance
interface AdherenceFeatures {
  medicationId: string;
  timeSinceLastDose: number;
  dayOfWeek: number;
  hourOfDay: number;
  currentStreak: number;
  sevenDayRate: number;
  thirtyDayRate: number;
  recentMoodAvg: number;
  recentSleepQuality: number;
  sideEffectCount: number;
}
```

### Notification Timing Data

```typescript
// Stored in Supabase
interface NotificationInteraction {
  id: string;
  user_id: string;
  notification_id: string;
  notification_type: NotificationType;
  sent_at: Date;
  opened_at: Date | null;
  dismissed_at: Date | null;
  action: 'opened' | 'dismissed' | 'ignored';
  hour_of_day: number;
  day_of_week: number;
  response_time_minutes: number | null;
  created_at: Date;
}

interface NotificationTimingModel {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  hour_distributions: Record<number, BetaDistribution>; // JSON
  last_updated: Date;
  total_notifications: number;
  overall_engagement_rate: number;
}

interface BetaDistribution {
  alpha: number; // successes
  beta: number;  // failures
  sampleCount: number;
}
```

### Therapist Matching Data

```typescript
// Stored in Supabase
interface Therapist {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  languages: string[];
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  review_count: number;
  years_experience: number;
  session_types: string[];
  rate: number;
  insurance_accepted: string[];
  bio: string;
  photo_url: string | null;
  gender: string;
  age: number;
  weekday_availability: boolean;
  weekend_availability: boolean;
  evening_availability: boolean;
  next_available: Date;
  created_at: Date;
  updated_at: Date;
}

interface TherapyOutcome {
  id: string;
  user_id: string;
  therapist_id: string;
  session_count: number;
  continued_therapy: boolean;
  satisfaction_rating: number;
  outcome_improvement: number;
  start_date: Date;
  end_date: Date | null;
  created_at: Date;
}

interface TherapistBooking {
  id: string;
  user_id: string;
  therapist_id: string;
  match_score: number;
  booked: boolean;
  booking_date: Date | null;
  created_at: Date;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Medication Adherence Prediction Properties

**Property 1: Feature Extraction Completeness**

*For any* user with medication history, when the system extracts adherence features, all required features (time since last dose, day of week, hour of day, current streak, 7-day rate, 30-day rate, mood, sleep, side effects) should be present in the output with valid values.

**Validates: Requirements 1.1**

**Property 2: Risk Probability Bounds**

*For any* set of extracted features, when the prediction algorithm calculates risk, the miss probability should be between 0 and 100 (inclusive), and the risk level should correctly correspond to the probability (low < 30%, moderate 30-60%, high ≥ 60%).

**Validates: Requirements 1.2**

**Property 3: High-Risk Reminder Generation**

*For any* medication with risk probability ≥ 30%, when the system calculates optimal reminder timing, it should return a recommended reminder time that is before the scheduled dose time.

**Validates: Requirements 1.3**

**Property 4: Adherence Insights Completeness**

*For any* user with adherence predictions, when generating insights for display, the output should contain all required elements: risk level indicator, 7-day forecast, personalized tips, and streak protection alerts.

**Validates: Requirements 1.4**

**Property 5: Adherence Prediction Performance**

*For any* medication, when calculating adherence risk, the prediction should complete in less than 100 milliseconds.

**Validates: Requirements 1.5**

### Notification Timing Properties

**Property 6: Engagement Data Capture**

*For any* notification interaction, when the system records engagement, all required fields (send time, action type, response time, context) should be captured and stored.

**Validates: Requirements 2.1**

**Property 7: Do-Not-Disturb Respect**

*For any* notification scheduling request, when calculating optimal send time, the recommended time should never fall within the user's do-not-disturb hours or default sleep hours (22:00-06:00).

**Validates: Requirements 2.2, 2.3**

**Property 8: Exploration-Exploitation Balance**

*For any* sequence of 100 notification timing decisions, approximately 10% (±5%) should use exploration (random time selection) and 90% should use exploitation (best-known time selection).

**Validates: Requirements 2.4**

**Property 9: Notification Frequency Limits**

*For any* user on any given day, when scheduling notifications, the system should never schedule more than 5 notifications, and should maintain at least 2 hours between consecutive notifications (except for priority alerts).

**Validates: Requirements 2.3**

**Property 10: Notification Timing Performance**

*For any* notification timing calculation, the optimal send time should be determined in less than 50 milliseconds.

**Validates: Requirements 2.5**

### Therapist Matching Properties

**Property 11: Hard Constraint Enforcement**

*For any* therapist search with hard constraints (insurance, distance, language, availability), all returned therapists should satisfy every specified hard constraint.

**Validates: Requirements 3.1**

**Property 12: Match Score Bounds and Weights**

*For any* therapist match calculation, the match score should be between 0 and 100 (inclusive), and the score should be computed using the correct weights: specialization (40%), similar patient success (35%), gender preference (15%), age preference (10%).

**Validates: Requirements 3.2**

**Property 13: Similar Patient Identification**

*For any* user profile, when finding similar patients for collaborative filtering, all returned patients should have a similarity score ≥ 0.7 based on demographics and conditions.

**Validates: Requirements 3.3**

**Property 14: Match Results Completeness**

*For any* therapist match result set, when displaying to the user, each match should include all required elements: therapist profile, match score, match percentage, key factors, availability, and contact options.

**Validates: Requirements 3.4**

**Property 15: Therapist Matching Performance**

*For any* therapist search query, the matching algorithm should complete in less than 500 milliseconds and return at least 5 matches when 5 or more therapists satisfy the hard constraints.

**Validates: Requirements 3.5**

## Error Handling

### Medication Adherence Prediction Errors

**Insufficient Data:**
- **Scenario**: User has < 7 days of medication history
- **Handling**: Use conservative default risk level (moderate), display "Building your profile" message
- **Fallback**: Use rule-based heuristics instead of ML model

**Missing Context Data:**
- **Scenario**: Mood or sleep data unavailable
- **Handling**: Exclude missing features from calculation, adjust confidence score downward
- **Fallback**: Use medication-specific features only

**Model Prediction Failure:**
- **Scenario**: Logistic regression throws error
- **Handling**: Log error, fall back to rule-based risk assessment
- **User Impact**: Show generic adherence tips, no personalized predictions

**Performance Timeout:**
- **Scenario**: Prediction takes > 100ms
- **Handling**: Cancel calculation, use cached prediction if available
- **Fallback**: Show last known risk level with "outdated" indicator

### Notification Timing Errors

**No Historical Data:**
- **Scenario**: New user with no notification history
- **Handling**: Use default optimal times (09:00, 14:00, 20:00) based on notification type
- **Fallback**: Gradually learn from user interactions

**Thompson Sampling Failure:**
- **Scenario**: Beta distribution sampling throws error
- **Handling**: Fall back to simple exploitation (use hour with highest success rate)
- **User Impact**: Temporarily reduced exploration, resume normal operation after fix

**Context Data Unavailable:**
- **Scenario**: Cannot determine user's current context
- **Handling**: Use historical patterns only, ignore context filters
- **Fallback**: Apply conservative DND hours (22:00-06:00)

**Scheduling Conflict:**
- **Scenario**: Optimal time conflicts with DND or frequency limits
- **Handling**: Find next best time that satisfies constraints
- **Fallback**: Delay notification by 1 hour, retry up to 3 times

### Therapist Matching Errors

**No Matching Therapists:**
- **Scenario**: Hard constraints eliminate all therapists
- **Handling**: Relax constraints one at a time (distance → availability → language)
- **User Feedback**: Show "No exact matches found. Showing similar therapists."

**Insufficient Therapist Data:**
- **Scenario**: Therapist profile missing key fields
- **Handling**: Exclude from scoring, log data quality issue
- **Fallback**: Show therapist with disclaimer "Limited information available"

**Collaborative Filtering Failure:**
- **Scenario**: No similar patients found
- **Handling**: Use content-based scoring only (specialization + preferences)
- **User Impact**: Match scores may be less accurate, confidence score reduced

**Distance Calculation Error:**
- **Scenario**: Geocoding fails or coordinates missing
- **Handling**: Use city-level matching instead of precise distance
- **Fallback**: Show all therapists in same city

**Performance Timeout:**
- **Scenario**: Matching takes > 500ms
- **Handling**: Return partial results (top 5 processed so far)
- **User Feedback**: Show "Loading more matches..." indicator

### General Error Handling Principles

1. **Graceful Degradation**: Always provide some functionality, even if reduced
2. **User Communication**: Clearly explain when features are limited or unavailable
3. **Logging**: Log all errors with context for debugging
4. **Retry Logic**: Retry transient failures (network, database) up to 3 times
5. **Fallback Strategies**: Have rule-based fallbacks for all ML components
6. **Performance Monitoring**: Track error rates and alert if > 5%

## Testing Strategy

### Dual Testing Approach

This feature requires both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs using randomized testing

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library Selection:**
- **TypeScript**: Use `fast-check` library for property-based testing
- **Installation**: `npm install --save-dev fast-check @types/fast-check`

**Test Configuration:**
- **Minimum iterations**: 100 runs per property test (due to randomization)
- **Timeout**: 5 seconds per property test
- **Shrinking**: Enable automatic shrinking to find minimal failing examples

**Property Test Tagging:**

Each property-based test must include a comment tag referencing the design document property:

```typescript
// Feature: phase3-algorithms, Property 1: Feature Extraction Completeness
test('adherence feature extraction includes all required fields', () => {
  fc.assert(
    fc.property(
      arbitraryMedicationHistory(),
      (history) => {
        const features = extractAdherenceFeatures(history);
        // Verify all required fields present
        expect(features).toHaveProperty('timeSinceLastDose');
        expect(features).toHaveProperty('dayOfWeek');
        // ... etc
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Focus Areas for Unit Tests:**

1. **Specific Examples:**
   - Test known good/bad inputs with expected outputs
   - Verify algorithm behavior on hand-crafted scenarios
   - Example: "User with 90% adherence should get low risk"

2. **Edge Cases:**
   - Empty data sets
   - Boundary values (exactly 30% risk, exactly 5 matches)
   - Missing optional fields
   - Extreme values (0% adherence, 100% adherence)

3. **Error Conditions:**
   - Invalid inputs (negative probabilities, null values)
   - Database connection failures
   - Timeout scenarios
   - Malformed data

4. **Integration Points:**
   - Service interactions with database
   - UI component rendering with mock data
   - Notification scheduling integration

**Unit Test Examples:**

```typescript
describe('Adherence Prediction Service', () => {
  test('should return low risk for user with 95% adherence', () => {
    const prediction = predictAdherenceRisk(mockHighAdherenceUser);
    expect(prediction.riskLevel).toBe('low');
    expect(prediction.probability).toBeLessThan(30);
  });
  
  test('should handle missing mood data gracefully', () => {
    const userWithoutMood = { ...mockUser, moodHistory: null };
    const prediction = predictAdherenceRisk(userWithoutMood);
    expect(prediction).toBeDefined();
    expect(prediction.confidence).toBeLessThan(100);
  });
  
  test('should throw error for invalid medication ID', () => {
    expect(() => {
      predictAdherenceRisk('invalid-id');
    }).toThrow('Medication not found');
  });
});
```

### Property-Based Testing Strategy

**Generators (Arbitraries):**

Create custom generators for domain objects:

```typescript
// Medication history generator
const arbitraryMedicationHistory = () => fc.record({
  userId: fc.uuid(),
  medicationId: fc.uuid(),
  logs: fc.array(fc.record({
    scheduledTime: fc.date(),
    takenAt: fc.option(fc.date()),
    taken: fc.boolean()
  }), { minLength: 7, maxLength: 90 })
});

// Notification interaction generator
const arbitraryNotificationInteraction = () => fc.record({
  notificationId: fc.uuid(),
  sentAt: fc.date(),
  action: fc.constantFrom('opened', 'dismissed', 'ignored'),
  hourOfDay: fc.integer({ min: 0, max: 23 }),
  dayOfWeek: fc.integer({ min: 0, max: 6 })
});

// Therapist search criteria generator
const arbitrarySearchCriteria = () => fc.record({
  insurance: fc.option(fc.string()),
  maxDistance: fc.option(fc.integer({ min: 1, max: 100 })),
  languages: fc.array(fc.constantFrom('English', 'Afrikaans', 'isiZulu')),
  specializations: fc.array(fc.constantFrom('Anxiety', 'Depression', 'Trauma'))
});
```

**Property Test Examples:**

```typescript
// Feature: phase3-algorithms, Property 2: Risk Probability Bounds
test('risk probability is always between 0 and 100', () => {
  fc.assert(
    fc.property(
      arbitraryAdherenceFeatures(),
      (features) => {
        const prediction = calculateRiskProbability(features);
        expect(prediction.probability).toBeGreaterThanOrEqual(0);
        expect(prediction.probability).toBeLessThanOrEqual(100);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: phase3-algorithms, Property 7: Do-Not-Disturb Respect
test('notifications never scheduled during DND hours', () => {
  fc.assert(
    fc.property(
      arbitraryNotificationRequest(),
      arbitraryDNDHours(),
      (request, dndHours) => {
        const optimalTime = calculateOptimalSendTime(request, dndHours);
        const hour = optimalTime.getHours();
        
        // Check not in DND range
        const inDND = dndHours.some(range => 
          hour >= range.start && hour < range.end
        );
        expect(inDND).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: phase3-algorithms, Property 11: Hard Constraint Enforcement
test('all returned therapists satisfy hard constraints', () => {
  fc.assert(
    fc.property(
      arbitraryTherapistPool(),
      arbitrarySearchCriteria(),
      (therapists, criteria) => {
        const matches = findMatches(therapists, criteria);
        
        matches.forEach(match => {
          if (criteria.insurance) {
            expect(match.therapist.insurance).toContain(criteria.insurance);
          }
          if (criteria.maxDistance) {
            expect(match.distance).toBeLessThanOrEqual(criteria.maxDistance);
          }
          if (criteria.languages.length > 0) {
            const hasLanguage = criteria.languages.some(lang =>
              match.therapist.languages.includes(lang)
            );
            expect(hasLanguage).toBe(true);
          }
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Performance Testing

**Latency Requirements:**

Test that all algorithms meet performance requirements:

```typescript
describe('Performance Requirements', () => {
  // Feature: phase3-algorithms, Property 5: Adherence Prediction Performance
  test('adherence prediction completes in <100ms', () => {
    fc.assert(
      fc.property(
        arbitraryMedicationHistory(),
        (history) => {
          const start = performance.now();
          predictAdherenceRisk(history);
          const duration = performance.now() - start;
          
          expect(duration).toBeLessThan(100);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: phase3-algorithms, Property 10: Notification Timing Performance
  test('notification timing completes in <50ms', () => {
    fc.assert(
      fc.property(
        arbitraryNotificationRequest(),
        (request) => {
          const start = performance.now();
          calculateOptimalSendTime(request);
          const duration = performance.now() - start;
          
          expect(duration).toBeLessThan(50);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: phase3-algorithms, Property 15: Therapist Matching Performance
  test('therapist matching completes in <500ms', () => {
    fc.assert(
      fc.property(
        arbitraryTherapistPool({ minLength: 50, maxLength: 100 }),
        arbitrarySearchCriteria(),
        (therapists, criteria) => {
          const start = performance.now();
          findMatches(therapists, criteria);
          const duration = performance.now() - start;
          
          expect(duration).toBeLessThan(500);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**End-to-End Scenarios:**

1. **Medication Adherence Flow:**
   - User adds medication → System predicts risk → High risk triggers reminder → User takes medication → System updates model

2. **Notification Timing Flow:**
   - System schedules notification → User opens notification → System records engagement → Model updates → Next notification uses learned timing

3. **Therapist Matching Flow:**
   - User searches therapists → System filters and scores → User books therapist → System records outcome → Model improves

**Integration Test Example:**

```typescript
describe('Medication Adherence Integration', () => {
  test('complete adherence prediction and reminder flow', async () => {
    // Setup
    const user = await createTestUser();
    const medication = await addMedication(user.id, {
      name: 'Test Med',
      scheduledTime: '08:00'
    });
    
    // Simulate poor adherence history
    await simulateMissedDoses(medication.id, 5);
    
    // Predict risk
    const prediction = await predictAdherenceRisk(medication.id, user.id);
    expect(prediction.riskLevel).toBe('high');
    
    // Verify reminder scheduled
    const reminders = await getScheduledReminders(user.id);
    expect(reminders).toHaveLength(1);
    expect(reminders[0].medicationId).toBe(medication.id);
    
    // Simulate taking medication
    await recordAdherenceEvent(medication.id, user.id, true, new Date());
    
    // Verify model updated
    const newPrediction = await predictAdherenceRisk(medication.id, user.id);
    expect(newPrediction.probability).toBeLessThan(prediction.probability);
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: 80%+ line coverage
- **Property Test Coverage**: All 15 correctness properties tested
- **Integration Test Coverage**: All major user flows tested
- **Performance Test Coverage**: All latency requirements verified
- **Error Handling Coverage**: All error scenarios tested

### Continuous Testing

- **Pre-commit**: Run unit tests and fast property tests (10 runs)
- **CI Pipeline**: Run full test suite (100 runs per property)
- **Nightly**: Run extended property tests (1000 runs) and performance benchmarks
- **Weekly**: Run integration tests against production-like data

---

**Document Status**: Draft  
**Created**: February 4, 2026  
**Author**: Kiro AI  
**Version**: 1.0.0
