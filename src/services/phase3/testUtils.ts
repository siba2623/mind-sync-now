// Phase 3 Algorithms - Test Utilities and Generators (Arbitraries)

import * as fc from 'fast-check';
import type {
  AdherenceFeatures,
  NotificationType,
  TimeRange,
  TherapistSearchCriteria,
  TherapistProfile,
  Demographics,
} from './types';

// ============================================================================
// Medication Adherence Arbitraries
// ============================================================================

export const arbitraryMedicationHistory = () => fc.record({
  userId: fc.uuid(),
  medicationId: fc.uuid(),
  logs: fc.array(fc.record({
    scheduledTime: fc.date(),
    takenAt: fc.option(fc.date()),
    taken: fc.boolean()
  }), { minLength: 7, maxLength: 90 })
});

export const arbitraryAdherenceFeatures = (): fc.Arbitrary<AdherenceFeatures> => fc.record({
  medicationId: fc.uuid(),
  timeSinceLastDose: fc.float({ min: 0, max: 168 }), // 0-7 days in hours
  dayOfWeek: fc.integer({ min: 0, max: 6 }),
  hourOfDay: fc.integer({ min: 0, max: 23 }),
  currentStreak: fc.integer({ min: 0, max: 90 }),
  sevenDayRate: fc.float({ min: 0, max: 1 }),
  thirtyDayRate: fc.float({ min: 0, max: 1 }),
  recentMoodAvg: fc.float({ min: 1, max: 5 }),
  recentSleepQuality: fc.float({ min: 0, max: 10 }),
  sideEffectCount: fc.integer({ min: 0, max: 10 })
});

// ============================================================================
// Notification Timing Arbitraries
// ============================================================================

export const arbitraryNotificationType = (): fc.Arbitrary<NotificationType> => 
  fc.constantFrom(
    'medication_reminder',
    'mood_checkin',
    'wellness_tip',
    'risk_alert',
    'adherence_streak',
    'therapist_message'
  );

export const arbitraryNotificationInteraction = () => fc.record({
  notificationId: fc.uuid(),
  sentAt: fc.date(),
  action: fc.constantFrom('opened', 'dismissed', 'ignored'),
  hourOfDay: fc.integer({ min: 0, max: 23 }),
  dayOfWeek: fc.integer({ min: 0, max: 6 })
});

export const arbitraryNotificationRequest = () => fc.record({
  notificationType: arbitraryNotificationType(),
  userId: fc.uuid(),
  priority: fc.constantFrom('low', 'medium', 'high')
});

export const arbitraryTimeRange = (): fc.Arbitrary<TimeRange> => fc.record({
  start: fc.integer({ min: 0, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
  end: fc.integer({ min: 0, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`)
});

export const arbitraryDNDHours = () => fc.array(arbitraryTimeRange(), { minLength: 0, maxLength: 3 });

// ============================================================================
// Therapist Matching Arbitraries
// ============================================================================

export const arbitrarySearchCriteria = (): fc.Arbitrary<TherapistSearchCriteria> => fc.record({
  insurance: fc.option(fc.constantFrom('Discovery', 'Momentum', 'Bonitas', 'Medshield')),
  maxDistance: fc.option(fc.integer({ min: 1, max: 100 })),
  languages: fc.array(fc.constantFrom('English', 'Afrikaans', 'isiZulu', 'isiXhosa'), { maxLength: 3 }),
  specializations: fc.array(fc.constantFrom('Anxiety', 'Depression', 'Trauma', 'PTSD', 'Addiction'), { maxLength: 3 }),
  genderPreference: fc.option(fc.constantFrom('male', 'female', 'non-binary', 'no-preference')),
  ageRangePreference: fc.option(fc.constantFrom('younger', 'similar', 'older', 'no-preference')),
  therapyApproach: fc.option(fc.array(fc.constantFrom('CBT', 'DBT', 'Psychodynamic', 'Humanistic'), { maxLength: 2 })),
  sessionType: fc.option(fc.constantFrom('in-person', 'video', 'phone', 'any')),
  availability: fc.option(fc.constantFrom('weekday', 'weekend', 'evening', 'any'))
});

export const arbitraryTherapistProfile = (): fc.Arbitrary<TherapistProfile> => fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  title: fc.constantFrom('Psychologist', 'Psychiatrist', 'Counselor', 'Therapist'),
  specializations: fc.array(fc.constantFrom('Anxiety', 'Depression', 'Trauma', 'PTSD', 'Addiction'), { minLength: 1, maxLength: 4 }),
  languages: fc.array(fc.constantFrom('English', 'Afrikaans', 'isiZulu', 'isiXhosa'), { minLength: 1, maxLength: 3 }),
  location: fc.record({
    city: fc.constantFrom('Cape Town', 'Johannesburg', 'Durban', 'Pretoria'),
    province: fc.constantFrom('Western Cape', 'Gauteng', 'KwaZulu-Natal'),
    coordinates: fc.option(fc.record({
      lat: fc.float({ min: -35, max: -22 }),
      lng: fc.float({ min: 16, max: 33 })
    }))
  }),
  rating: fc.float({ min: 1, max: 5 }),
  reviewCount: fc.integer({ min: 0, max: 500 }),
  yearsExperience: fc.integer({ min: 1, max: 40 }),
  sessionTypes: fc.array(fc.constantFrom('in-person', 'video', 'phone'), { minLength: 1, maxLength: 3 }),
  rate: fc.integer({ min: 500, max: 2000 }),
  insurance: fc.array(fc.constantFrom('Discovery', 'Momentum', 'Bonitas', 'Medshield'), { minLength: 1, maxLength: 4 }),
  bio: fc.string({ minLength: 50, maxLength: 200 }),
  photo: fc.option(fc.webUrl()),
  availability: fc.record({
    weekdays: fc.boolean(),
    weekends: fc.boolean(),
    evenings: fc.boolean(),
    nextAvailable: fc.date({ min: new Date(), max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
  }),
  gender: fc.option(fc.constantFrom('male', 'female', 'non-binary')),
  age: fc.option(fc.integer({ min: 25, max: 75 }))
});

export const arbitraryTherapistPool = (options?: { minLength?: number; maxLength?: number }) => 
  fc.array(arbitraryTherapistProfile(), { 
    minLength: options?.minLength ?? 10, 
    maxLength: options?.maxLength ?? 50 
  });

export const arbitraryDemographics = (): fc.Arbitrary<Demographics> => fc.record({
  age: fc.integer({ min: 18, max: 80 }),
  gender: fc.constantFrom('male', 'female', 'non-binary', 'other'),
  location: fc.constantFrom('Cape Town', 'Johannesburg', 'Durban', 'Pretoria')
});

// ============================================================================
// Helper Functions for Tests
// ============================================================================

export function createMockMedicationLog(overrides?: Partial<any>) {
  return {
    id: 'test-log-id',
    user_id: 'test-user-id',
    medication_id: 'test-med-id',
    scheduled_time: new Date(),
    taken_at: new Date(),
    taken: true,
    reminder_sent: false,
    reminder_time: null,
    side_effects: null,
    created_at: new Date(),
    ...overrides
  };
}

export function createMockAdherenceFeatures(overrides?: Partial<AdherenceFeatures>): AdherenceFeatures {
  return {
    medicationId: 'test-med-id',
    timeSinceLastDose: 24,
    dayOfWeek: 1,
    hourOfDay: 8,
    currentStreak: 7,
    sevenDayRate: 0.85,
    thirtyDayRate: 0.90,
    recentMoodAvg: 3.5,
    recentSleepQuality: 7.0,
    sideEffectCount: 0,
    ...overrides
  };
}

export function createMockTherapist(overrides?: Partial<TherapistProfile>): TherapistProfile {
  return {
    id: 'test-therapist-id',
    name: 'Dr. Test Therapist',
    title: 'Psychologist',
    specializations: ['Anxiety', 'Depression'],
    languages: ['English', 'Afrikaans'],
    location: {
      city: 'Cape Town',
      province: 'Western Cape',
      coordinates: { lat: -33.9249, lng: 18.4241 }
    },
    rating: 4.5,
    reviewCount: 50,
    yearsExperience: 10,
    sessionTypes: ['in-person', 'video'],
    rate: 1000,
    insurance: ['Discovery', 'Momentum'],
    bio: 'Experienced therapist specializing in anxiety and depression.',
    photo: 'https://example.com/photo.jpg',
    availability: {
      weekdays: true,
      weekends: false,
      evenings: true,
      nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    gender: 'female',
    age: 35,
    ...overrides
  };
}
