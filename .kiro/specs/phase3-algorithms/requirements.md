# Phase 3 Algorithms - Requirements

## Feature Overview

Implement three advanced algorithms to enhance MindSync's predictive capabilities and user experience optimization:

1. **Medication Adherence Prediction** - Predict likelihood of missing doses and optimize reminder timing
2. **Optimal Notification Timing** - Learn user patterns to send notifications at the best times
3. **Therapist Matching** - Match users with compatible therapists based on multiple criteria

## User Stories

### 1. Medication Adherence Prediction

**As a** MindSync user taking medications  
**I want** the app to predict when I'm likely to miss a dose  
**So that** I receive proactive reminders and maintain my treatment adherence

**As a** healthcare provider  
**I want** to see adherence risk predictions for my patients  
**So that** I can intervene before adherence problems develop

### 2. Optimal Notification Timing

**As a** MindSync user  
**I want** notifications sent at times when I'm most likely to engage  
**So that** I don't miss important reminders and the app feels less intrusive

**As a** user with a busy schedule  
**I want** the app to learn my daily patterns  
**So that** notifications arrive when I'm available and receptive

### 3. Therapist Matching

**As a** user seeking therapy  
**I want** personalized therapist recommendations  
**So that** I can find a compatible therapist quickly

**As a** user with specific needs  
**I want** to filter therapists by specialization, insurance, and preferences  
**So that** I only see relevant matches

## Acceptance Criteria

### 1. Medication Adherence Prediction

#### 1.1 Feature Extraction
- **GIVEN** a user has medication history  
- **WHEN** the system analyzes adherence patterns  
- **THEN** it extracts features including:
  - Time since last dose
  - Day of week patterns
  - Recent adherence streak
  - Time of day patterns
  - Concurrent life events (mood, stress)

#### 1.2 Risk Probability Calculation
- **GIVEN** extracted features  
- **WHEN** the prediction algorithm runs  
- **THEN** it calculates miss probability (0-100%)  
- **AND** categorizes risk as low (<30%), moderate (30-60%), or high (>60%)

#### 1.3 Optimal Reminder Timing
- **GIVEN** a high-risk prediction (>30%)  
- **WHEN** the system calculates reminder timing  
- **THEN** it recommends optimal reminder time based on:
  - User's historical response patterns
  - Current context (location, activity)
  - Time before scheduled dose

#### 1.4 Adherence Insights Display
- **GIVEN** adherence predictions exist  
- **WHEN** user views medication tracker  
- **THEN** they see:
  - Risk level indicator for each medication
  - Predicted adherence rate for next 7 days
  - Personalized adherence tips
  - Streak protection alerts

#### 1.5 Performance Requirements
- **GIVEN** prediction algorithm runs  
- **WHEN** calculating risk for one medication  
- **THEN** it completes in <100ms  
- **AND** updates predictions every 6 hours

### 2. Optimal Notification Timing

#### 2.1 User Pattern Learning
- **GIVEN** a user interacts with notifications  
- **WHEN** the system tracks engagement  
- **THEN** it records:
  - Notification send time
  - Open/dismiss action
  - Response time
  - Current context (location, activity)

#### 2.2 Time Slot Optimization
- **GIVEN** historical engagement data  
- **WHEN** scheduling a new notification  
- **THEN** the system:
  - Identifies user's active hours
  - Calculates engagement probability for each hour
  - Balances exploration (trying new times) vs exploitation (using best times)
  - Respects do-not-disturb periods

#### 2.3 Context-Aware Scheduling
- **GIVEN** a notification needs to be sent  
- **WHEN** determining send time  
- **THEN** the system considers:
  - User's calendar/meeting times (if available)
  - Sleep hours (no notifications)
  - Recent notification frequency (avoid spam)
  - Notification type priority

#### 2.4 A/B Testing Framework
- **GIVEN** multiple timing strategies  
- **WHEN** the system operates  
- **THEN** it:
  - Randomly explores new times 10% of the time
  - Uses best-known times 90% of the time
  - Tracks engagement rates per time slot
  - Updates strategy weekly

#### 2.5 Performance Requirements
- **GIVEN** notification timing calculation  
- **WHEN** determining optimal send time  
- **THEN** it completes in <50ms  
- **AND** improves engagement rate by 40%+ over baseline

### 3. Therapist Matching

#### 3.1 Hard Constraint Filtering
- **GIVEN** a user searches for therapists  
- **WHEN** the matching algorithm runs  
- **THEN** it filters by:
  - Insurance compatibility (must match)
  - Maximum distance/location (must be within range)
  - Availability (must have open slots)
  - Language (must speak user's language)

#### 3.2 Soft Preference Scoring
- **GIVEN** eligible therapists after hard filtering  
- **WHEN** calculating match scores  
- **THEN** it scores based on:
  - Specialization match (40% weight)
  - Gender preference (15% weight)
  - Age range preference (10% weight)
  - Success rate with similar patients (35% weight)

#### 3.3 Collaborative Filtering
- **GIVEN** user profile and needs  
- **WHEN** calculating success rate  
- **THEN** the system:
  - Finds similar patients (by demographics, conditions)
  - Calculates therapist success rate with similar patients
  - Weights recent outcomes more heavily

#### 3.4 Match Results Display
- **GIVEN** therapist match scores calculated  
- **WHEN** user views results  
- **THEN** they see:
  - Top 10 matches ranked by score
  - Match percentage (0-100%)
  - Key matching factors highlighted
  - Therapist profile summary
  - Availability calendar
  - Contact/booking options

#### 3.5 Performance Requirements
- **GIVEN** therapist matching query  
- **WHEN** calculating matches  
- **THEN** it completes in <500ms  
- **AND** returns at least 5 matches (if available)  
- **AND** achieves 80%+ user satisfaction rate

## Technical Constraints

### Performance
- Medication adherence prediction: <100ms per medication
- Notification timing calculation: <50ms per notification
- Therapist matching: <500ms per query
- All algorithms must work offline with cached data

### Data Requirements
- Minimum 7 days of user data for adherence prediction
- Minimum 14 days of notification data for timing optimization
- Minimum 10 therapists in database for matching

### Privacy & Security
- All predictions stored with user consent
- Therapist data encrypted at rest
- No PII shared without explicit permission
- POPIA compliance (South African data protection)

### Scalability
- Support 10,000+ concurrent users
- Handle 1M+ predictions per day
- Store 90 days of prediction history

## Success Metrics

### Medication Adherence Prediction
- **Accuracy**: 75%+ prediction accuracy
- **Impact**: 20%+ improvement in adherence rates
- **Engagement**: 60%+ of users act on high-risk alerts

### Optimal Notification Timing
- **Engagement**: 40%+ improvement in open rates
- **Satisfaction**: <5% notification opt-out rate
- **Learning**: Converge to optimal times within 14 days

### Therapist Matching
- **Satisfaction**: 80%+ user satisfaction with matches
- **Booking**: 50%+ of users book with top 3 matches
- **Retention**: 70%+ continue with matched therapist after 3 sessions

## Dependencies

### Existing Features
- Medication Tracker (implemented)
- Notification Service (implemented)
- Therapist Network (implemented)
- User Profile Service (implemented)

### External Services
- Supabase (database)
- Local storage (offline support)
- Push notifications (Capacitor)

### Data Sources
- Medication logs
- Notification interaction logs
- User profile data
- Therapist profiles
- Historical outcomes data

## Out of Scope

### Phase 3 Does NOT Include:
- Machine learning model training (use rule-based initially)
- Real-time therapist video calls
- Insurance claim processing
- Prescription management
- Medication delivery integration

## Risks & Mitigation

### Risk 1: Insufficient Data
**Risk**: Not enough user data for accurate predictions  
**Mitigation**: Start with rule-based heuristics, transition to ML after 30 days

### Risk 2: Privacy Concerns
**Risk**: Users uncomfortable with prediction tracking  
**Mitigation**: Explicit opt-in, transparent data usage, easy opt-out

### Risk 3: Algorithm Bias
**Risk**: Predictions biased toward certain demographics  
**Mitigation**: Regular bias audits, diverse training data, fairness metrics

### Risk 4: Performance Degradation
**Risk**: Algorithms slow down with large datasets  
**Mitigation**: Implement caching, data pruning, query optimization

## Implementation Phases

### Phase 3.1: Medication Adherence Prediction (Week 1)
- Implement feature extraction
- Build logistic regression model
- Create risk scoring system
- Add UI indicators to medication tracker
- Write unit tests

### Phase 3.2: Optimal Notification Timing (Week 2)
- Implement engagement tracking
- Build multi-armed bandit algorithm
- Create context-aware scheduler
- Add A/B testing framework
- Write unit tests

### Phase 3.3: Therapist Matching (Week 3)
- Implement constraint filtering
- Build scoring algorithm
- Create collaborative filtering
- Design match results UI
- Write unit tests

### Phase 3.4: Integration & Testing (Week 4)
- Integrate all three algorithms
- End-to-end testing
- Performance optimization
- Documentation
- User acceptance testing

## Glossary

- **Adherence**: Taking medication as prescribed
- **Multi-Armed Bandit**: Algorithm that balances exploration vs exploitation
- **Logistic Regression**: Statistical model for binary classification
- **Collaborative Filtering**: Recommendation technique based on similar users
- **RLS**: Row Level Security (database security feature)
- **POPIA**: Protection of Personal Information Act (South African law)

---

**Status**: Draft  
**Created**: February 4, 2026  
**Author**: Kiro AI  
**Version**: 1.0.0
