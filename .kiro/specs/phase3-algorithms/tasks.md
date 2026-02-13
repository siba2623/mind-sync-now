# Implementation Plan: Phase 3 Algorithms

## Overview

This implementation plan breaks down the Phase 3 algorithms into discrete, incremental coding tasks. Each task builds on previous work and integrates with the existing MindSync codebase. The plan follows a test-driven approach with property-based testing for correctness validation.

## Tasks

- [x] 1. Set up Phase 3 infrastructure and testing framework
  - Create service directory structure at `src/services/phase3/`
  - Install and configure `fast-check` library for property-based testing
  - Create shared types and interfaces for all three algorithms
  - Set up test utilities and generators (arbitraries) for property tests
  - _Requirements: All (infrastructure)_

- [x] 2. Implement Medication Adherence Prediction Service
  - [x] 2.1 Create adherence feature extraction module
    - Implement `extractAdherenceFeatures()` function
    - Extract temporal features (time since last dose, day of week, hour of day)
    - Extract pattern features (7-day rate, 30-day rate, streak length)
    - Extract contextual features (mood, sleep, activity, side effects)
    - _Requirements: 1.1_
  
  - [x] 2.2 Write property test for feature extraction
    - **Property 1: Feature Extraction Completeness**
    - **Validates: Requirements 1.1**
  
  - [x] 2.3 Implement logistic regression risk prediction
    - Create `calculateRiskProbability()` function with initial heuristic weights
    - Implement risk categorization (low/moderate/high)
    - Calculate confidence scores based on data availability
    - Return structured prediction with factors
    - _Requirements: 1.2_
  
  - [x] 2.4 Write property tests for risk prediction
    - **Property 2: Risk Probability Bounds**
    - **Validates: Requirements 1.2**
  
  - [x] 2.5 Write property test for prediction performance
    - **Property 5: Adherence Prediction Performance**
    - **Validates: Requirements 1.5**
  
  - [x] 2.6 Implement optimal reminder timing calculator
    - Create `calculateOptimalReminderTime()` function
    - Analyze user's historical response patterns
    - Consider current context (active hours, recent activity)
    - Calculate lead time based on risk level
    - _Requirements: 1.3_
  
  - [x] 2.7 Write property test for reminder timing
    - **Property 3: High-Risk Reminder Generation**
    - **Validates: Requirements 1.3**
  
  - [x] 2.8 Create adherence insights generator
    - Implement `getAdherenceInsights()` function
    - Generate 7-day adherence forecast
    - Identify streak protection alerts
    - Create personalized adherence tips
    - _Requirements: 1.4_
  
  - [x] 2.9 Write property test for insights completeness
    - **Property 4: Adherence Insights Completeness**
    - **Validates: Requirements 1.4**
  
  - [x] 2.10 Add adherence event recording
    - Implement `recordAdherenceEvent()` function
    - Store medication logs in Supabase
    - Update local cache for performance
    - Trigger model updates when needed
    - _Requirements: 1.1, 1.2_

- [x] 3. Integrate adherence prediction with Medication Tracker UI
  - [x] 3.1 Add risk indicators to medication cards
    - Display risk level badges (low/moderate/high)
    - Show probability percentage
    - Add visual indicators (colors, icons)
    - _Requirements: 1.4_
  
  - [x] 3.2 Display 7-day adherence forecast
    - Create forecast visualization component
    - Show daily predicted adherence rates
    - Highlight high-risk days
    - _Requirements: 1.4_
  
  - [x] 3.3 Add streak protection alerts
    - Show streak protection warnings for high-risk medications
    - Display recommended actions
    - Add "Protect Your Streak" call-to-action
    - _Requirements: 1.4_
  
  - [x] 3.4 Implement smart reminder scheduling
    - Update notification service to use optimal timing
    - Schedule reminders based on risk predictions
    - Add multiple reminders for high-risk medications
    - _Requirements: 1.3_

- [x] 4. Checkpoint - Test adherence prediction end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Notification Timing Service
  - [x] 5.1 Create engagement tracking module
    - Implement `recordEngagement()` function
    - Store notification interactions in Supabase
    - Track send time, action, response time, context
    - _Requirements: 2.1_
  
  - [x] 5.2 Write property test for engagement data capture
    - **Property 6: Engagement Data Capture**
    - **Validates: Requirements 2.1**
  
  - [x] 5.3 Implement Thompson Sampling (Multi-Armed Bandit)
    - Create Beta distribution model for each hour
    - Implement Thompson Sampling selection algorithm
    - Balance exploration (10%) vs exploitation (90%)
    - Update distributions after each notification
    - _Requirements: 2.2, 2.4_
  
  - [x] 5.4 Write property tests for MAB algorithm
    - **Property 8: Exploration-Exploitation Balance**
    - **Validates: Requirements 2.4**
  
  - [x] 5.5 Implement context-aware scheduling
    - Create `calculateOptimalSendTime()` function
    - Identify user's active hours from history
    - Apply do-not-disturb filters (sleep hours, user preferences)
    - Enforce frequency limits (max 5/day, 2 hours apart)
    - Consider notification type priority
    - _Requirements: 2.2, 2.3_
  
  - [x] 5.6 Write property tests for context-aware scheduling
    - **Property 7: Do-Not-Disturb Respect**
    - **Property 9: Notification Frequency Limits**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 5.7 Write property test for timing performance
    - **Property 10: Notification Timing Performance**
    - **Validates: Requirements 2.5**
  
  - [x] 5.8 Create notification profile manager
    - Implement `getUserNotificationProfile()` function
    - Calculate engagement rates by hour
    - Identify preferred notification types
    - Track average response times
    - _Requirements: 2.1, 2.2_

- [x] 6. Integrate notification timing with existing notification service
  - [x] 6.1 Update notificationService.ts to use optimal timing
    - Modify scheduling functions to call timing service
    - Replace hardcoded times with calculated optimal times
    - Add engagement tracking to all notification sends
    - _Requirements: 2.2, 2.3_
  
  - [x] 6.2 Add notification analytics dashboard
    - Create component to display engagement metrics
    - Show best times for each notification type
    - Display learning progress (confidence over time)
    - _Requirements: 2.1, 2.4_
  
  - [ ] 6.3 Implement user notification preferences UI
    - Add settings for do-not-disturb hours
    - Allow users to set notification type preferences
    - Provide opt-out options for specific types
    - _Requirements: 2.3_

- [x] 7. Checkpoint - Test notification timing end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Therapist Matching Service
  - [x] 8.1 Create hard constraint filtering module
    - Implement `applyHardConstraints()` function
    - Filter by insurance compatibility
    - Filter by distance/location
    - Filter by language requirements
    - Filter by availability
    - _Requirements: 3.1_
  
  - [x] 8.2 Write property test for hard constraint enforcement
    - **Property 11: Hard Constraint Enforcement**
    - **Validates: Requirements 3.1**
  
  - [x] 8.3 Implement multi-criteria scoring algorithm
    - Create `calculateMatchScore()` function
    - Calculate specialization match (40% weight)
    - Calculate gender preference match (15% weight)
    - Calculate age preference match (10% weight)
    - Placeholder for similar patient success (35% weight)
    - _Requirements: 3.2_
  
  - [x] 8.4 Write property tests for match scoring
    - **Property 12: Match Score Bounds and Weights**
    - **Validates: Requirements 3.2**
  
  - [x] 8.5 Implement collaborative filtering module
    - Create `findSimilarPatients()` function
    - Calculate patient similarity based on demographics and conditions
    - Implement `calculateSimilarPatientSuccess()` function
    - Weight recent outcomes more heavily
    - _Requirements: 3.3_
  
  - [x] 8.6 Write property test for similar patient identification
    - **Property 13: Similar Patient Identification**
    - **Validates: Requirements 3.3**
  
  - [x] 8.7 Create match ranking and formatting module
    - Implement `rankAndFormatMatches()` function
    - Sort by match score (descending)
    - Return top 10 matches
    - Identify key matching factors for each match
    - _Requirements: 3.4_
  
  - [x] 8.8 Write property tests for match results
    - **Property 14: Match Results Completeness**
    - **Validates: Requirements 3.4**
  
  - [x] 8.9 Write property test for matching performance
    - **Property 15: Therapist Matching Performance**
    - **Validates: Requirements 3.5**
  
  - [x] 8.10 Implement booking outcome tracking
    - Create `recordBooking()` function
    - Store booking attempts and outcomes
    - Track therapy outcomes over time
    - Update collaborative filtering model
    - _Requirements: 3.3_

- [ ] 9. Integrate therapist matching with Therapist Network UI
  - [x] 9.1 Update TherapistMatching.tsx to use matching service
    - Replace mock filtering with real matching algorithm
    - Display match scores and percentages
    - Show key matching factors for each therapist
    - _Requirements: 3.4_
  
  - [x] 9.2 Add match explanation modal
    - Create detailed match breakdown component
    - Show score breakdown by category
    - Display similar patient success rate
    - Explain why therapist is a good match
    - _Requirements: 3.4_
  
  - [x] 9.3 Implement booking flow with outcome tracking
    - Add booking confirmation
    - Track booking success/failure
    - Prompt for satisfaction ratings after sessions
    - Feed outcomes back to matching algorithm
    - _Requirements: 3.3, 3.5_

- [x] 10. Create database migrations for Phase 3
  - [x] 10.1 Create adherence predictions table
    - Add table for storing prediction history
    - Include risk levels, probabilities, features
    - Set up RLS policies
    - _Requirements: 1.2, 1.5_
  
  - [x] 10.2 Create notification interactions table
    - Add table for tracking engagement
    - Include send times, actions, response times
    - Set up RLS policies
    - _Requirements: 2.1_
  
  - [x] 10.3 Create notification timing models table
    - Add table for storing Beta distributions
    - Include per-user, per-type timing models
    - Set up RLS policies
    - _Requirements: 2.2, 2.4_
  
  - [x] 10.4 Create therapists table
    - Add comprehensive therapist profiles
    - Include specializations, languages, availability
    - Set up indexes for search performance
    - _Requirements: 3.1, 3.2_
  
  - [x] 10.5 Create therapy outcomes table
    - Add table for tracking therapy results
    - Include session counts, satisfaction, improvement
    - Set up RLS policies
    - _Requirements: 3.3_
  
  - [x] 10.6 Create therapist bookings table
    - Add table for tracking booking attempts
    - Include match scores and outcomes
    - Set up RLS policies
    - _Requirements: 3.5_

- [ ] 11. Add error handling and fallback strategies
  - [ ] 11.1 Implement adherence prediction error handling
    - Add insufficient data fallback (rule-based heuristics)
    - Handle missing context data gracefully
    - Add model prediction failure fallback
    - Implement performance timeout handling
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 11.2 Implement notification timing error handling
    - Add no historical data fallback (default times)
    - Handle Thompson Sampling failures
    - Add context data unavailable fallback
    - Implement scheduling conflict resolution
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 11.3 Implement therapist matching error handling
    - Add no matching therapists fallback (relax constraints)
    - Handle insufficient therapist data
    - Add collaborative filtering failure fallback
    - Implement distance calculation error handling
    - Handle performance timeouts
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 12. Write integration tests for all three algorithms
  - [ ] 12.1 Write adherence prediction integration test
    - Test complete flow: add medication → predict risk → schedule reminder → record adherence → update model
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 12.2 Write notification timing integration test
    - Test complete flow: schedule notification → user engages → record engagement → update model → next notification uses learned timing
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 12.3 Write therapist matching integration test
    - Test complete flow: search therapists → filter and score → display matches → book therapist → record outcome → update model
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 13. Performance optimization and caching
  - [ ] 13.1 Implement caching for adherence predictions
    - Cache predictions for 6 hours
    - Invalidate cache on new adherence events
    - Use local storage for offline support
    - _Requirements: 1.5_
  
  - [ ] 13.2 Implement caching for notification timing models
    - Cache Beta distributions locally
    - Update cache after each engagement
    - Sync to Supabase daily
    - _Requirements: 2.5_
  
  - [ ] 13.3 Optimize therapist matching queries
    - Add database indexes for common filters
    - Implement query result caching
    - Optimize distance calculations
    - _Requirements: 3.5_

- [ ] 14. Add monitoring and analytics
  - [ ] 14.1 Add adherence prediction metrics
    - Track prediction accuracy over time
    - Monitor model confidence scores
    - Log feature extraction performance
    - _Requirements: 1.2, 1.5_
  
  - [ ] 14.2 Add notification timing metrics
    - Track engagement rates by hour
    - Monitor exploration vs exploitation balance
    - Log timing calculation performance
    - _Requirements: 2.4, 2.5_
  
  - [ ] 14.3 Add therapist matching metrics
    - Track match quality (booking rates, satisfaction)
    - Monitor matching algorithm performance
    - Log collaborative filtering effectiveness
    - _Requirements: 3.5_

- [ ] 15. Final checkpoint - End-to-end testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All algorithms must meet performance requirements (<100ms, <50ms, <500ms)
- Error handling ensures graceful degradation when data is insufficient
- Caching strategies ensure offline support and performance
