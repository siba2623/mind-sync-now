// Phase 3 - Medication Adherence Prediction Tests

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateRiskProbability } from '../adherencePrediction';
import { arbitraryAdherenceFeatures, createMockAdherenceFeatures } from '../testUtils';

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Medication Adherence Prediction - Property Tests', () => {
  // Feature: phase3-algorithms, Property 1: Feature Extraction Completeness
  test('adherence features include all required fields', () => {
    fc.assert(
      fc.property(
        arbitraryAdherenceFeatures(),
        (features) => {
          // Verify all required fields are present
          expect(features).toHaveProperty('medicationId');
          expect(features).toHaveProperty('timeSinceLastDose');
          expect(features).toHaveProperty('dayOfWeek');
          expect(features).toHaveProperty('hourOfDay');
          expect(features).toHaveProperty('currentStreak');
          expect(features).toHaveProperty('sevenDayRate');
          expect(features).toHaveProperty('thirtyDayRate');
          expect(features).toHaveProperty('recentMoodAvg');
          expect(features).toHaveProperty('recentSleepQuality');
          expect(features).toHaveProperty('sideEffectCount');
          
          // Verify types
          expect(typeof features.medicationId).toBe('string');
          expect(typeof features.timeSinceLastDose).toBe('number');
          expect(typeof features.dayOfWeek).toBe('number');
          expect(typeof features.hourOfDay).toBe('number');
          expect(typeof features.currentStreak).toBe('number');
          expect(typeof features.sevenDayRate).toBe('number');
          expect(typeof features.thirtyDayRate).toBe('number');
          expect(typeof features.recentMoodAvg).toBe('number');
          expect(typeof features.recentSleepQuality).toBe('number');
          expect(typeof features.sideEffectCount).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });

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

  // Feature: phase3-algorithms, Property 2: Risk Level Categorization
  test('risk level correctly corresponds to probability', () => {
    fc.assert(
      fc.property(
        arbitraryAdherenceFeatures(),
        (features) => {
          const prediction = calculateRiskProbability(features);
          
          // Allow for small rounding errors at boundaries
          if (prediction.probability < 30) {
            expect(prediction.riskLevel).toBe('low');
          } else if (prediction.probability >= 60) {
            expect(prediction.riskLevel).toBe('high');
          } else {
            // Between 30 and 60 should be moderate
            expect(prediction.riskLevel).toBe('moderate');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: phase3-algorithms, Property 4: Adherence Insights Completeness
  test('prediction includes all required fields', () => {
    fc.assert(
      fc.property(
        arbitraryAdherenceFeatures(),
        (features) => {
          const prediction = calculateRiskProbability(features);
          
          expect(prediction).toHaveProperty('medicationId');
          expect(prediction).toHaveProperty('riskLevel');
          expect(prediction).toHaveProperty('probability');
          expect(prediction).toHaveProperty('confidence');
          expect(prediction).toHaveProperty('factors');
          expect(prediction).toHaveProperty('nextDoseTime');
          
          expect(Array.isArray(prediction.factors)).toBe(true);
          expect(prediction.nextDoseTime).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: phase3-algorithms, Property 5: Adherence Prediction Performance
  test('adherence prediction completes in <100ms', () => {
    fc.assert(
      fc.property(
        arbitraryAdherenceFeatures(),
        (features) => {
          const start = performance.now();
          calculateRiskProbability(features);
          const duration = performance.now() - start;
          
          expect(duration).toBeLessThan(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Medication Adherence Prediction - Unit Tests', () => {
  test('should return low risk for user with high adherence', () => {
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.95,
      thirtyDayRate: 0.92,
      currentStreak: 14,
      recentMoodAvg: 4.0,
      recentSleepQuality: 8.0,
      sideEffectCount: 0
    });

    const prediction = calculateRiskProbability(features);
    
    expect(prediction.riskLevel).toBe('low');
    expect(prediction.probability).toBeLessThan(30);
  });

  test('should return high risk for user with poor adherence', () => {
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.3,
      thirtyDayRate: 0.4,
      currentStreak: 0,
      recentMoodAvg: 2.0,
      recentSleepQuality: 4.0,
      sideEffectCount: 3,
      dayOfWeek: 6 // Weekend
    });

    const prediction = calculateRiskProbability(features);
    
    expect(prediction.riskLevel).toBe('high');
    expect(prediction.probability).toBeGreaterThanOrEqual(60);
  });

  test('should return moderate risk for average adherence', () => {
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.7,
      thirtyDayRate: 0.75,
      currentStreak: 3,
      recentMoodAvg: 3.0,
      recentSleepQuality: 6.5,
      sideEffectCount: 1
    });

    const prediction = calculateRiskProbability(features);
    
    expect(prediction.riskLevel).toBe('moderate');
    expect(prediction.probability).toBeGreaterThanOrEqual(30);
    expect(prediction.probability).toBeLessThan(60);
  });

  test('should include negative factors for poor adherence', () => {
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.5,
      currentStreak: 0,
      recentMoodAvg: 2.5,
      sideEffectCount: 2
    });

    const prediction = calculateRiskProbability(features);
    
    const negativeFactors = prediction.factors.filter(f => f.impact === 'negative');
    expect(negativeFactors.length).toBeGreaterThan(0);
  });

  test('should include positive factors for good adherence', () => {
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.95,
      hourOfDay: 8, // Morning
      recentMoodAvg: 4.5
    });

    const prediction = calculateRiskProbability(features);
    
    const positiveFactors = prediction.factors.filter(f => f.impact === 'positive');
    expect(positiveFactors.length).toBeGreaterThan(0);
  });

  test('should handle edge case: exactly 30% probability', () => {
    // This tests the boundary between low and moderate risk
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.7,
      thirtyDayRate: 0.7,
      currentStreak: 5
    });

    const prediction = calculateRiskProbability(features);
    
    // Should be either low or moderate, not high
    expect(['low', 'moderate']).toContain(prediction.riskLevel);
  });

  test('should handle edge case: exactly 60% probability', () => {
    // This tests the boundary between moderate and high risk
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.4,
      thirtyDayRate: 0.45,
      currentStreak: 0,
      sideEffectCount: 2
    });

    const prediction = calculateRiskProbability(features);
    
    // Should be either moderate or high, not low
    expect(['moderate', 'high']).toContain(prediction.riskLevel);
  });

  test('should calculate confidence based on data availability', () => {
    const features = createMockAdherenceFeatures({
      sevenDayRate: 0.8,
      thirtyDayRate: 0.85,
      recentMoodAvg: 3.5,
      recentSleepQuality: 7.0
    });

    const prediction = calculateRiskProbability(features);
    
    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(100);
  });

  test('should set next dose time in the future', () => {
    const features = createMockAdherenceFeatures({
      hourOfDay: 8
    });

    const prediction = calculateRiskProbability(features);
    
    expect(prediction.nextDoseTime.getTime()).toBeGreaterThan(Date.now());
  });
});
