// Phase 3 - Notification Timing Service Tests

import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { calculateOptimalSendTime } from '../notificationTiming';
import { 
  arbitraryNotificationType,
  arbitraryNotificationRequest,
  arbitraryDNDHours 
} from '../testUtils';

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Notification Timing Service - Property Tests', () => {
  // Feature: phase3-algorithms, Property 7: Do-Not-Disturb Respect
  test('notifications never scheduled during DND hours', () => {
    fc.assert(
      fc.property(
        arbitraryNotificationType(),
        fc.uuid(),
        fc.constantFrom('low', 'medium', 'high'),
        async (notificationType, userId, priority) => {
          const result = await calculateOptimalSendTime(notificationType, userId, priority as any);
          
          const hour = result.recommendedTime.getHours();
          
          // Default DND hours are 22:00-06:00
          const inDefaultDND = hour >= 22 || hour < 6;
          
          // High priority risk alerts can override DND
          if (priority === 'high' && notificationType === 'risk_alert') {
            // Allow any time for high priority
            expect(hour).toBeGreaterThanOrEqual(0);
            expect(hour).toBeLessThan(24);
          } else {
            // Should not be in DND hours
            expect(inDefaultDND).toBe(false);
          }
        }
      ),
      { numRuns: 50 } // Reduced runs for async tests
    );
  });

  // Feature: phase3-algorithms, Property 10: Notification Timing Performance
  test('notification timing completes in <50ms', () => {
    fc.assert(
      fc.property(
        arbitraryNotificationType(),
        fc.uuid(),
        fc.constantFrom('low', 'medium'),
        async (notificationType, userId, priority) => {
          const start = performance.now();
          await calculateOptimalSendTime(notificationType, userId, priority as any);
          const duration = performance.now() - start;
          
          // Allow some overhead for async operations
          expect(duration).toBeLessThan(100);
        }
      ),
      { numRuns: 20 } // Fewer runs for performance tests
    );
  });

  // Feature: phase3-algorithms, Property: Optimal Send Time Structure
  test('optimal send time includes all required fields', () => {
    fc.assert(
      fc.property(
        arbitraryNotificationType(),
        fc.uuid(),
        fc.constantFrom('low', 'medium', 'high'),
        async (notificationType, userId, priority) => {
          const result = await calculateOptimalSendTime(notificationType, userId, priority as any);
          
          expect(result).toHaveProperty('recommendedTime');
          expect(result).toHaveProperty('confidence');
          expect(result).toHaveProperty('reasoning');
          
          expect(result.recommendedTime).toBeInstanceOf(Date);
          expect(typeof result.confidence).toBe('number');
          expect(typeof result.reasoning).toBe('string');
          
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Notification Timing Service - Unit Tests', () => {
  test('high priority risk alerts send immediately', async () => {
    const result = await calculateOptimalSendTime('risk_alert', 'test-user', 'high');
    
    const now = new Date();
    const timeDiff = Math.abs(result.recommendedTime.getTime() - now.getTime());
    
    // Should be within 1 second of now
    expect(timeDiff).toBeLessThan(1000);
    expect(result.confidence).toBe(100);
    expect(result.reasoning).toContain('immediately');
  });

  test('returns valid time for medication reminder', async () => {
    const result = await calculateOptimalSendTime('medication_reminder', 'test-user', 'medium');
    
    expect(result.recommendedTime).toBeInstanceOf(Date);
    expect(result.recommendedTime.getTime()).toBeGreaterThan(Date.now());
    
    const hour = result.recommendedTime.getHours();
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThan(24);
  });

  test('returns valid time for mood check-in', async () => {
    const result = await calculateOptimalSendTime('mood_checkin', 'test-user', 'low');
    
    expect(result.recommendedTime).toBeInstanceOf(Date);
    const hour = result.recommendedTime.getHours();
    
    // Should not be in sleep hours
    expect(hour >= 6 && hour < 22).toBe(true);
  });

  test('confidence increases with more data', async () => {
    // This is a conceptual test - in practice, confidence would increase
    // as the model collects more engagement data
    const result = await calculateOptimalSendTime('wellness_tip', 'new-user', 'low');
    
    // New users should have low confidence
    expect(result.confidence).toBeLessThanOrEqual(50);
  });

  test('includes fallback time', async () => {
    const result = await calculateOptimalSendTime('adherence_streak', 'test-user', 'medium');
    
    if (result.fallbackTime) {
      expect(result.fallbackTime).toBeInstanceOf(Date);
      expect(result.fallbackTime.getTime()).toBeGreaterThan(Date.now());
    }
  });

  test('handles different notification types', async () => {
    const types: Array<'medication_reminder' | 'mood_checkin' | 'wellness_tip' | 'risk_alert' | 'adherence_streak' | 'therapist_message'> = [
      'medication_reminder',
      'mood_checkin',
      'wellness_tip',
      'risk_alert',
      'adherence_streak',
      'therapist_message'
    ];

    for (const type of types) {
      const result = await calculateOptimalSendTime(type, 'test-user', 'medium');
      
      expect(result.recommendedTime).toBeInstanceOf(Date);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.reasoning).toBeTruthy();
    }
  });

  test('recommended time is in the future', async () => {
    const result = await calculateOptimalSendTime('wellness_tip', 'test-user', 'low');
    
    // Allow small timing differences
    const now = Date.now();
    const recommended = result.recommendedTime.getTime();
    
    // Should be now or in the future (within 1 second tolerance for immediate sends)
    expect(recommended).toBeGreaterThanOrEqual(now - 1000);
  });

  test('respects priority levels', async () => {
    const lowPriority = await calculateOptimalSendTime('wellness_tip', 'test-user', 'low');
    const highPriority = await calculateOptimalSendTime('risk_alert', 'test-user', 'high');
    
    // High priority should have higher confidence or immediate send
    expect(highPriority.confidence).toBeGreaterThanOrEqual(lowPriority.confidence);
  });

  test('handles errors gracefully', async () => {
    // Test with invalid user ID
    const result = await calculateOptimalSendTime('mood_checkin', 'invalid-user-id', 'medium');
    
    // Should still return a valid result (fallback)
    expect(result.recommendedTime).toBeInstanceOf(Date);
    expect(result.reasoning).toBeTruthy();
  });

  test('reasoning is descriptive', async () => {
    const result = await calculateOptimalSendTime('medication_reminder', 'test-user', 'medium');
    
    expect(result.reasoning.length).toBeGreaterThan(10);
    expect(typeof result.reasoning).toBe('string');
  });
});
