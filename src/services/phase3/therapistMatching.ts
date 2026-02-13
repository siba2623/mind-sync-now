// Phase 3 - Therapist Matching Service

import { supabase } from '@/integrations/supabase/client';
import type {
  TherapistSearchCriteria,
  TherapistMatch,
  TherapistProfile,
  MatchExplanation,
  ScoreBreakdown,
  TherapyOutcome,
  UserProfile,
  Demographics
} from './types';

// ============================================================================
// Hard Constraint Filtering (Task 8.1)
// ============================================================================

/**
 * Apply hard constraints to filter therapists
 * Requirements: 3.1
 */
export function applyHardConstraints(
  therapists: TherapistProfile[],
  criteria: TherapistSearchCriteria,
  userLocation?: { lat: number; lng: number }
): TherapistProfile[] {
  return therapists.filter(therapist => {
    // Insurance compatibility (must match)
    if (criteria.insurance && !therapist.insurance.includes(criteria.insurance)) {
      return false;
    }

    // Distance constraint
    if (criteria.maxDistance && userLocation && therapist.location.coordinates) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        therapist.location.coordinates.lat,
        therapist.location.coordinates.lng
      );
      if (distance > criteria.maxDistance) {
        return false;
      }
    }

    // Language requirement (must speak at least one required language)
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

/**
 * Check if therapist availability matches criteria
 */
function matchesAvailability(
  therapistAvailability: { weekdays: boolean; weekends: boolean; evenings: boolean },
  requirement: 'weekday' | 'weekend' | 'evening' | 'any'
): boolean {
  switch (requirement) {
    case 'weekday':
      return therapistAvailability.weekdays;
    case 'weekend':
      return therapistAvailability.weekends;
    case 'evening':
      return therapistAvailability.evenings;
    case 'any':
      return true;
    default:
      return true;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================================================
// Multi-Criteria Scoring (Task 8.3)
// ============================================================================

/**
 * Calculate match score for a therapist
 * Requirements: 3.2
 */
export function calculateMatchScore(
  therapist: TherapistProfile,
  user: UserProfile,
  criteria: TherapistSearchCriteria,
  similarPatientSuccess?: number
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
  const successScore = similarPatientSuccess ?? 50; // Default to neutral if not provided
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

/**
 * Calculate specialization match score
 */
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

/**
 * Calculate age preference match score
 */
function calculateAgePreferenceMatch(
  therapistAge: number | undefined,
  userAge: number,
  preference?: 'younger' | 'similar' | 'older' | 'no-preference'
): number {
  if (!therapistAge || !preference || preference === 'no-preference') {
    return 100; // Full points if no preference or age unknown
  }

  const ageDiff = therapistAge - userAge;

  switch (preference) {
    case 'younger':
      return ageDiff < -5 ? 100 : ageDiff < 0 ? 75 : 50;
    case 'similar':
      return Math.abs(ageDiff) <= 10 ? 100 : Math.abs(ageDiff) <= 20 ? 75 : 50;
    case 'older':
      return ageDiff > 5 ? 100 : ageDiff > 0 ? 75 : 50;
    default:
      return 100;
  }
}

// ============================================================================
// Collaborative Filtering (Task 8.5)
// ============================================================================

/**
 * Find similar patients based on demographics and conditions
 * Requirements: 3.3
 */
export async function findSimilarPatients(
  targetDemographics: Demographics,
  targetConditions: string[],
  minSimilarity: number = 0.7
): Promise<string[]> {
  try {
    // In a real implementation, this would query the database
    // For now, return empty array (will be implemented with real data)
    return [];
  } catch (error) {
    console.error('Error finding similar patients:', error);
    return [];
  }
}

/**
 * Calculate similarity between two patients
 */
export function calculateSimilarity(
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

  // Location similarity (10% weight)
  const locationMatch = demo1.location === demo2.location ? 1 : 0;
  similarity += locationMatch * 0.10;

  // Condition overlap (60% weight)
  const conditionOverlap = calculateOverlap(conditions1, conditions2);
  similarity += conditionOverlap * 0.60;

  return similarity;
}

/**
 * Calculate overlap between two arrays
 */
function calculateOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) {
    return 0;
  }

  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Calculate therapist success rate with similar patients
 * Requirements: 3.3
 */
export async function calculateSimilarPatientSuccess(
  therapistId: string,
  userDemographics: Demographics,
  userConditions: string[]
): Promise<number> {
  try {
    // Find similar patients
    const similarPatients = await findSimilarPatients(
      userDemographics,
      userConditions,
      0.7
    );

    if (similarPatients.length === 0) {
      return 50; // Neutral score if no similar patients
    }

    // Get outcomes for this therapist with similar patients
    const { data: outcomes, error } = await supabase
      .from('therapy_outcomes')
      .select('*')
      .eq('therapist_id', therapistId)
      .in('user_id', similarPatients);

    if (error || !outcomes || outcomes.length === 0) {
      return 50; // Neutral score if no history
    }

    // Calculate success rate
    const successfulOutcomes = outcomes.filter(outcome =>
      outcome.continued_therapy &&
      outcome.satisfaction_rating >= 4 &&
      outcome.outcome_improvement > 20
    );

    const successRate = successfulOutcomes.length / outcomes.length;

    // Weight recent outcomes more heavily
    const weightedScore = calculateWeightedScore(outcomes);

    return Math.round(weightedScore * 100);
  } catch (error) {
    console.error('Error calculating similar patient success:', error);
    return 50;
  }
}

/**
 * Calculate weighted score favoring recent outcomes
 */
function calculateWeightedScore(outcomes: TherapyOutcome[]): number {
  if (outcomes.length === 0) return 0.5;

  const now = Date.now();
  let totalWeight = 0;
  let weightedSum = 0;

  outcomes.forEach(outcome => {
    // Calculate age of outcome in days
    const outcomeDate = new Date(outcome.start_date).getTime();
    const ageInDays = (now - outcomeDate) / (1000 * 60 * 60 * 24);

    // Exponential decay: more recent = higher weight
    const weight = Math.exp(-ageInDays / 180); // Half-life of 180 days

    // Success score for this outcome
    const success =
      (outcome.continued_therapy ? 0.4 : 0) +
      (outcome.satisfaction_rating / 5) * 0.4 +
      (Math.max(0, outcome.outcome_improvement) / 100) * 0.2;

    weightedSum += success * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
}

// ============================================================================
// Ranking and Formatting (Task 8.7)
// ============================================================================

/**
 * Rank and format therapist matches
 * Requirements: 3.4
 */
export function rankAndFormatMatches(
  matches: Array<{ therapist: TherapistProfile; score: number }>,
  topN: number = 10
): TherapistMatch[] {
  // Sort by match score (descending)
  const sorted = matches.sort((a, b) => b.score - a.score);

  // Take top N
  const topMatches = sorted.slice(0, topN);

  // Format matches
  return topMatches.map(match => ({
    therapist: match.therapist,
    matchScore: match.score,
    matchPercentage: match.score,
    keyMatchingFactors: identifyKeyFactors(match.therapist, match.score),
    availableSlots: [], // Would be populated from calendar API
    estimatedWaitTime: calculateWaitTime(match.therapist)
  }));
}

/**
 * Identify key matching factors for display
 */
function identifyKeyFactors(therapist: TherapistProfile, score: number): string[] {
  const factors: string[] = [];

  // Add top matching factors
  if (therapist.specializations.length > 0) {
    factors.push(`Specializes in ${therapist.specializations[0]}`);
  }

  if (therapist.rating >= 4.5) {
    factors.push(`Highly rated (${therapist.rating.toFixed(1)}/5.0)`);
  }

  if (therapist.yearsExperience >= 10) {
    factors.push(`${therapist.yearsExperience} years experience`);
  }

  if (therapist.reviewCount >= 50) {
    factors.push(`${therapist.reviewCount}+ verified reviews`);
  }

  if (score >= 90) {
    factors.push('Excellent match for your needs');
  }

  return factors.slice(0, 3); // Return top 3 factors
}

/**
 * Calculate estimated wait time
 */
function calculateWaitTime(therapist: TherapistProfile): string {
  const nextAvailable = new Date(therapist.availability.nextAvailable);
  const now = new Date();
  const daysUntil = Math.ceil((nextAvailable.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0) {
    return 'Available now';
  } else if (daysUntil === 1) {
    return 'Available tomorrow';
  } else if (daysUntil <= 7) {
    return `Available in ${daysUntil} days`;
  } else if (daysUntil <= 14) {
    return 'Available in 1-2 weeks';
  } else if (daysUntil <= 30) {
    return 'Available in 2-4 weeks';
  } else {
    return 'Available in 1+ months';
  }
}

// ============================================================================
// Main Service Functions
// ============================================================================

/**
 * Find matching therapists for a user
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export async function findMatches(
  userId: string,
  searchCriteria: TherapistSearchCriteria
): Promise<TherapistMatch[]> {
  const startTime = performance.now();

  try {
    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
    }

    // Get all therapists
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*');

    if (therapistsError || !therapists) {
      throw new Error('Failed to fetch therapists');
    }

    // Convert to TherapistProfile format
    const therapistProfiles: TherapistProfile[] = therapists.map(t => ({
      id: t.id,
      name: t.name,
      title: t.title,
      specializations: t.specializations || [],
      languages: t.languages || [],
      location: {
        city: t.city,
        province: t.province,
        coordinates: t.latitude && t.longitude ? { lat: t.latitude, lng: t.longitude } : undefined
      },
      rating: t.rating || 0,
      reviewCount: t.review_count || 0,
      yearsExperience: t.years_experience || 0,
      sessionTypes: t.session_types || [],
      rate: t.rate || 0,
      insurance: t.insurance_accepted || [],
      bio: t.bio || '',
      photo: t.photo_url,
      availability: {
        weekdays: t.weekday_availability || false,
        weekends: t.weekend_availability || false,
        evenings: t.evening_availability || false,
        nextAvailable: new Date(t.next_available || Date.now())
      },
      gender: t.gender,
      age: t.age
    }));

    // Apply hard constraints
    const userLocation = userProfile?.latitude && userProfile?.longitude
      ? { lat: userProfile.latitude, lng: userProfile.longitude }
      : undefined;

    const filteredTherapists = applyHardConstraints(
      therapistProfiles,
      searchCriteria,
      userLocation
    );

    if (filteredTherapists.length === 0) {
      return [];
    }

    // Create user profile for scoring
    const user: UserProfile = {
      id: userId,
      demographics: {
        age: userProfile?.age || 30,
        gender: userProfile?.gender || 'other',
        location: userProfile?.city || 'Unknown'
      },
      needs: searchCriteria.specializations || [],
      conditions: searchCriteria.specializations || [],
      age: userProfile?.age || 30
    };

    // Calculate scores for each therapist
    const scoredMatches = await Promise.all(
      filteredTherapists.map(async therapist => {
        const similarPatientSuccess = await calculateSimilarPatientSuccess(
          therapist.id,
          user.demographics,
          user.conditions
        );

        const score = calculateMatchScore(
          therapist,
          user,
          searchCriteria,
          similarPatientSuccess
        );

        return { therapist, score };
      })
    );

    // Rank and format matches
    const rankedMatches = rankAndFormatMatches(scoredMatches, 10);

    // Ensure performance requirement (<500ms)
    const duration = performance.now() - startTime;
    if (duration > 500) {
      console.warn(`Therapist matching took ${duration}ms (>500ms threshold)`);
    }

    return rankedMatches;

  } catch (error) {
    console.error('Error finding therapist matches:', error);
    return [];
  }
}

/**
 * Get detailed match explanation
 * Requirements: 3.4
 */
export async function getMatchExplanation(
  userId: string,
  therapistId: string
): Promise<MatchExplanation> {
  try {
    // This would fetch detailed breakdown
    // For now, return a basic explanation
    return {
      overallScore: 85,
      breakdown: [
        {
          category: 'Specialization Match',
          score: 90,
          weight: 40,
          explanation: 'Therapist specializes in your areas of need'
        },
        {
          category: 'Similar Patient Success',
          score: 85,
          weight: 35,
          explanation: 'High success rate with patients like you'
        },
        {
          category: 'Preferences',
          score: 80,
          weight: 25,
          explanation: 'Matches your gender and age preferences'
        }
      ],
      strengths: [
        'Highly experienced in anxiety and depression',
        'Excellent patient reviews',
        'Convenient location'
      ],
      considerations: [
        'Higher rate than average',
        'Limited weekend availability'
      ],
      similarPatientSuccess: 85
    };
  } catch (error) {
    console.error('Error getting match explanation:', error);
    throw error;
  }
}

/**
 * Record booking outcome
 * Requirements: 3.5
 */
export async function recordBooking(
  userId: string,
  therapistId: string,
  booked: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('therapist_bookings')
      .insert({
        user_id: userId,
        therapist_id: therapistId,
        booked,
        booking_date: booked ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording booking:', error);
    }
  } catch (error) {
    console.error('Error in recordBooking:', error);
  }
}

/**
 * Update match model with therapy outcome
 * Requirements: 3.3
 */
export async function updateMatchModel(
  userId: string,
  therapistId: string,
  outcome: TherapyOutcome
): Promise<void> {
  try {
    const { error } = await supabase
      .from('therapy_outcomes')
      .upsert({
        user_id: userId,
        therapist_id: therapistId,
        session_count: outcome.sessionCount,
        continued_therapy: outcome.continuedTherapy,
        satisfaction_rating: outcome.satisfactionRating,
        outcome_improvement: outcome.outcomeImprovement,
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,therapist_id'
      });

    if (error) {
      console.error('Error updating match model:', error);
    }
  } catch (error) {
    console.error('Error in updateMatchModel:', error);
  }
}

// ============================================================================
// Service Export
// ============================================================================

export const therapistMatchingService = {
  findMatches,
  getMatchExplanation,
  recordBooking,
  updateMatchModel,
  applyHardConstraints,
  calculateMatchScore,
  calculateSimilarPatientSuccess
};
