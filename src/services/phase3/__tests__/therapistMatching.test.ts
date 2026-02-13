// Phase 3 - Therapist Matching Service Tests

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  applyHardConstraints,
  calculateMatchScore,
  calculateSimilarity,
  rankAndFormatMatches
} from '../therapistMatching';
import {
  arbitraryTherapistProfile,
  arbitrarySearchCriteria,
  arbitraryDemographics,
  createMockTherapist
} from '../testUtils';
import type { UserProfile } from '../types';

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Therapist Matching Service - Property Tests', () => {
  // Feature: phase3-algorithms, Property 11: Hard Constraint Enforcement
  test('all returned therapists satisfy hard constraints', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTherapistProfile(), { minLength: 10, maxLength: 50 }),
        arbitrarySearchCriteria(),
        (therapists, criteria) => {
          const matches = applyHardConstraints(therapists, criteria);

          matches.forEach(match => {
            // Insurance constraint
            if (criteria.insurance) {
              expect(match.insurance).toContain(criteria.insurance);
            }

            // Language constraint
            if (criteria.languages && criteria.languages.length > 0) {
              const hasLanguage = criteria.languages.some(lang =>
                match.languages.includes(lang)
              );
              expect(hasLanguage).toBe(true);
            }

            // Availability constraint
            if (criteria.availability) {
              switch (criteria.availability) {
                case 'weekday':
                  expect(match.availability.weekdays).toBe(true);
                  break;
                case 'weekend':
                  expect(match.availability.weekends).toBe(true);
                  break;
                case 'evening':
                  expect(match.availability.evenings).toBe(true);
                  break;
              }
            }
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  // Feature: phase3-algorithms, Property 12: Match Score Bounds and Weights
  test('match scores are between 0 and 100', () => {
    fc.assert(
      fc.property(
        arbitraryTherapistProfile(),
        arbitraryDemographics(),
        arbitrarySearchCriteria(),
        (therapist, demographics, criteria) => {
          const user: UserProfile = {
            id: 'test-user',
            demographics,
            needs: criteria.specializations || [],
            conditions: criteria.specializations || [],
            age: demographics.age
          };

          const score = calculateMatchScore(therapist, user, criteria);

          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: phase3-algorithms, Property 13: Similar Patient Identification
  test('patient similarity is between 0 and 1', () => {
    fc.assert(
      fc.property(
        arbitraryDemographics(),
        fc.array(fc.string(), { maxLength: 5 }),
        arbitraryDemographics(),
        fc.array(fc.string(), { maxLength: 5 }),
        (demo1, conditions1, demo2, conditions2) => {
          const similarity = calculateSimilarity(demo1, conditions1, demo2, conditions2);

          expect(similarity).toBeGreaterThanOrEqual(0);
          expect(similarity).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: phase3-algorithms, Property 14: Match Results Completeness
  test('match results include all required fields', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            therapist: arbitraryTherapistProfile(),
            score: fc.integer({ min: 0, max: 100 })
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (matches) => {
          const formatted = rankAndFormatMatches(matches, 10);

          formatted.forEach(match => {
            expect(match).toHaveProperty('therapist');
            expect(match).toHaveProperty('matchScore');
            expect(match).toHaveProperty('matchPercentage');
            expect(match).toHaveProperty('keyMatchingFactors');
            expect(match).toHaveProperty('availableSlots');
            expect(match).toHaveProperty('estimatedWaitTime');

            expect(Array.isArray(match.keyMatchingFactors)).toBe(true);
            expect(Array.isArray(match.availableSlots)).toBe(true);
            expect(typeof match.estimatedWaitTime).toBe('string');
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Therapist Matching Service - Unit Tests', () => {
  describe('Hard Constraint Filtering', () => {
    test('filters by insurance', () => {
      const therapists = [
        createMockTherapist({ insurance: ['Discovery', 'Momentum'] }),
        createMockTherapist({ insurance: ['Bonitas'] }),
        createMockTherapist({ insurance: ['Discovery'] })
      ];

      const criteria = { insurance: 'Discovery' };
      const filtered = applyHardConstraints(therapists, criteria);

      expect(filtered).toHaveLength(2);
      filtered.forEach(t => {
        expect(t.insurance).toContain('Discovery');
      });
    });

    test('filters by language', () => {
      const therapists = [
        createMockTherapist({ languages: ['English', 'Afrikaans'] }),
        createMockTherapist({ languages: ['isiZulu'] }),
        createMockTherapist({ languages: ['English'] })
      ];

      const criteria = { languages: ['English'] };
      const filtered = applyHardConstraints(therapists, criteria);

      expect(filtered).toHaveLength(2);
      filtered.forEach(t => {
        expect(t.languages).toContain('English');
      });
    });

    test('filters by availability', () => {
      const therapists = [
        createMockTherapist({ availability: { weekdays: true, weekends: false, evenings: false, nextAvailable: new Date() } }),
        createMockTherapist({ availability: { weekdays: false, weekends: true, evenings: false, nextAvailable: new Date() } }),
        createMockTherapist({ availability: { weekdays: true, weekends: true, evenings: true, nextAvailable: new Date() } })
      ];

      const criteria = { availability: 'weekend' as const };
      const filtered = applyHardConstraints(therapists, criteria);

      expect(filtered).toHaveLength(2);
      filtered.forEach(t => {
        expect(t.availability.weekends).toBe(true);
      });
    });

    test('returns all therapists when no constraints', () => {
      const therapists = [
        createMockTherapist(),
        createMockTherapist(),
        createMockTherapist()
      ];

      const criteria = {};
      const filtered = applyHardConstraints(therapists, criteria);

      expect(filtered).toHaveLength(3);
    });
  });

  describe('Match Scoring', () => {
    test('perfect specialization match gives high score', () => {
      const therapist = createMockTherapist({
        specializations: ['Anxiety', 'Depression']
      });

      const user: UserProfile = {
        id: 'test-user',
        demographics: { age: 30, gender: 'female', location: 'Cape Town' },
        needs: ['Anxiety', 'Depression'],
        conditions: ['Anxiety', 'Depression'],
        age: 30
      };

      const criteria = { specializations: ['Anxiety', 'Depression'] };
      const score = calculateMatchScore(therapist, user, criteria);

      expect(score).toBeGreaterThan(70);
    });

    test('no specialization match gives lower score', () => {
      const therapist = createMockTherapist({
        specializations: ['Trauma', 'PTSD']
      });

      const user: UserProfile = {
        id: 'test-user',
        demographics: { age: 30, gender: 'female', location: 'Cape Town' },
        needs: ['Anxiety', 'Depression'],
        conditions: ['Anxiety', 'Depression'],
        age: 30
      };

      const criteria = { specializations: ['Anxiety', 'Depression'] };
      const score = calculateMatchScore(therapist, user, criteria);

      expect(score).toBeLessThan(60);
    });

    test('gender preference match increases score', () => {
      const therapist = createMockTherapist({ gender: 'female' });

      const user: UserProfile = {
        id: 'test-user',
        demographics: { age: 30, gender: 'female', location: 'Cape Town' },
        needs: [],
        conditions: [],
        age: 30
      };

      const criteriaWithPref = { genderPreference: 'female' as const };
      const criteriaWithoutPref = { genderPreference: 'no-preference' as const };

      const scoreWith = calculateMatchScore(therapist, user, criteriaWithPref);
      const scoreWithout = calculateMatchScore(therapist, user, criteriaWithoutPref);

      expect(scoreWith).toBeGreaterThanOrEqual(scoreWithout);
    });

    test('score is always between 0 and 100', () => {
      const therapist = createMockTherapist();
      const user: UserProfile = {
        id: 'test-user',
        demographics: { age: 30, gender: 'female', location: 'Cape Town' },
        needs: [],
        conditions: [],
        age: 30
      };

      const score = calculateMatchScore(therapist, user, {});

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Patient Similarity', () => {
    test('identical patients have similarity of 1', () => {
      const demo = { age: 30, gender: 'female', location: 'Cape Town' };
      const conditions = ['Anxiety', 'Depression'];

      const similarity = calculateSimilarity(demo, conditions, demo, conditions);

      expect(similarity).toBeGreaterThan(0.9);
    });

    test('completely different patients have low similarity', () => {
      const demo1 = { age: 25, gender: 'male', location: 'Cape Town' };
      const conditions1 = ['Anxiety'];

      const demo2 = { age: 60, gender: 'female', location: 'Johannesburg' };
      const conditions2 = ['Trauma', 'PTSD'];

      const similarity = calculateSimilarity(demo1, conditions1, demo2, conditions2);

      expect(similarity).toBeLessThan(0.5);
    });

    test('similar age increases similarity', () => {
      const demo1 = { age: 30, gender: 'female', location: 'Cape Town' };
      const demo2 = { age: 32, gender: 'female', location: 'Cape Town' };
      const conditions = ['Anxiety'];

      const similarity = calculateSimilarity(demo1, conditions, demo2, conditions);

      expect(similarity).toBeGreaterThan(0.8);
    });

    test('condition overlap is weighted heavily', () => {
      const demo = { age: 30, gender: 'female', location: 'Cape Town' };
      const conditions1 = ['Anxiety', 'Depression', 'Stress'];
      const conditions2 = ['Anxiety', 'Depression'];

      const similarity = calculateSimilarity(demo, conditions1, demo, conditions2);

      expect(similarity).toBeGreaterThan(0.7);
    });
  });

  describe('Ranking and Formatting', () => {
    test('ranks therapists by score descending', () => {
      const matches = [
        { therapist: createMockTherapist({ name: 'Low' }), score: 50 },
        { therapist: createMockTherapist({ name: 'High' }), score: 90 },
        { therapist: createMockTherapist({ name: 'Medium' }), score: 70 }
      ];

      const ranked = rankAndFormatMatches(matches, 10);

      expect(ranked[0].therapist.name).toBe('High');
      expect(ranked[1].therapist.name).toBe('Medium');
      expect(ranked[2].therapist.name).toBe('Low');
    });

    test('limits results to topN', () => {
      const matches = Array.from({ length: 20 }, (_, i) => ({
        therapist: createMockTherapist({ name: `Therapist ${i}` }),
        score: 100 - i
      }));

      const ranked = rankAndFormatMatches(matches, 5);

      expect(ranked).toHaveLength(5);
    });

    test('includes key matching factors', () => {
      const therapist = createMockTherapist({
        specializations: ['Anxiety'],
        rating: 4.8,
        yearsExperience: 15
      });

      const matches = [{ therapist, score: 95 }];
      const ranked = rankAndFormatMatches(matches, 10);

      expect(ranked[0].keyMatchingFactors.length).toBeGreaterThan(0);
      expect(ranked[0].keyMatchingFactors.some(f => f.includes('Anxiety'))).toBe(true);
    });

    test('calculates estimated wait time', () => {
      const therapist = createMockTherapist({
        availability: {
          weekdays: true,
          weekends: false,
          evenings: false,
          nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      const matches = [{ therapist, score: 80 }];
      const ranked = rankAndFormatMatches(matches, 10);

      expect(ranked[0].estimatedWaitTime).toBeTruthy();
      expect(typeof ranked[0].estimatedWaitTime).toBe('string');
    });
  });
});
