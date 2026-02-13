# Gamification Integration Guide

## 🎯 How to Integrate Gamification into Existing Features

This guide shows you how to hook the gamification system into your existing wellness actions to automatically award points, update challenges, and check badge eligibility.

## 📦 Import the Service

```typescript
import { gamificationService } from '@/services/gamificationService';
```

## 1️⃣ Daily Check-in Integration

**File:** `src/components/DailyCheckin.tsx`

```typescript
// After successful check-in submission
const handleSubmit = async () => {
  // ... existing check-in logic ...
  
  try {
    // Award points for check-in
    await gamificationService.awardPoints({
      points: 10,
      source: 'checkin',
      description: 'Daily check-in completed'
    });
    
    // Update streak
    await gamificationService.updateStreak();
    
    // Check for wellness badges
    await gamificationService.checkBadgeEligibility('wellness');
    
    // Update daily challenge progress (if exists)
    // This would need to track which challenge is the "daily checkin" challenge
    
  } catch (error) {
    console.error('Gamification error:', error);
    // Don't block the main flow if gamification fails
  }
};
```

## 2️⃣ Mood Log Integration

**File:** `src/pages/Dashboard.tsx` (handleSubmit function)

```typescript
const handleSubmit = async () => {
  if (selectedMood !== null && user) {
    try {
      const { error } = await supabase.from("mood_entries").insert({
        user_id: user.id,
        mood_value: selectedMood,
      });

      if (error) throw error;

      // GAMIFICATION: Award points for mood log
      try {
        await gamificationService.awardPoints({
          points: 5,
          source: 'mood',
          description: 'Mood logged'
        });
        
        // Check for mood tracking badges
        await gamificationService.checkBadgeEligibility('mood');
        
        // Update "Daily Mood Check" challenge if active
        // You'd need to get the challenge ID and current progress first
        
      } catch (gamError) {
        console.error('Gamification error:', gamError);
      }

      setSubmitted(true);
      toast({
        title: "Mood logged! +5 points 🎉",
        description: "Your mood has been recorded successfully.",
      });

      setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
        loadStats();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log mood",
        variant: "destructive",
      });
    }
  }
};
```

## 3️⃣ Meditation Integration

**File:** `src/components/MeditationTimer.tsx`

```typescript
// After meditation session completes
const handleComplete = async () => {
  // ... existing meditation save logic ...
  
  const durationMinutes = Math.round(duration / 60);
  
  try {
    // Award points (2 points per minute)
    await gamificationService.awardPoints({
      points: durationMinutes * 2,
      source: 'meditation',
      description: `Meditated for ${durationMinutes} minutes`
    });
    
    // Check for meditation badges
    await gamificationService.checkBadgeEligibility('meditation');
    
    // Update meditation challenges
    // Get active meditation challenges and update progress
    const challenges = await gamificationService.getUserChallenges();
    const meditationChallenge = challenges.find(c => 
      c.challenge?.category === 'meditation' && !c.is_completed
    );
    
    if (meditationChallenge) {
      await gamificationService.updateChallengeProgress(
        meditationChallenge.challenge_id,
        meditationChallenge.current_progress + 1
      );
    }
    
  } catch (error) {
    console.error('Gamification error:', error);
  }
};
```

## 4️⃣ Activity Completion Integration

**File:** `src/pages/Activities.tsx`

```typescript
// After activity is completed
const handleActivityComplete = async (activityId: string) => {
  // ... existing activity completion logic ...
  
  try {
    // Award points for activity
    await gamificationService.awardPoints({
      points: 15,
      source: 'activity',
      description: 'Wellness activity completed'
    });
    
    // Check for activity badges
    await gamificationService.checkBadgeEligibility('activity');
    
    // Update activity challenges
    const challenges = await gamificationService.getUserChallenges();
    const activityChallenge = challenges.find(c => 
      c.challenge?.category === 'activity' && !c.is_completed
    );
    
    if (activityChallenge) {
      await gamificationService.updateChallengeProgress(
        activityChallenge.challenge_id,
        activityChallenge.current_progress + 1
      );
    }
    
  } catch (error) {
    console.error('Gamification error:', error);
  }
};
```

## 5️⃣ Journal Entry Integration

**File:** `src/components/Journal.tsx`

```typescript
// After journal entry is saved
const handleSave = async () => {
  // ... existing journal save logic ...
  
  try {
    // Award points for journal entry
    await gamificationService.awardPoints({
      points: 10,
      source: 'journal',
      description: 'Journal entry written'
    });
    
    // Check for journal badges
    await gamificationService.checkBadgeEligibility('journal');
    
    // Update journal challenges
    const challenges = await gamificationService.getUserChallenges();
    const journalChallenge = challenges.find(c => 
      c.challenge?.category === 'journal' && !c.is_completed
    );
    
    if (journalChallenge) {
      await gamificationService.updateChallengeProgress(
        journalChallenge.challenge_id,
        journalChallenge.current_progress + 1
      );
    }
    
  } catch (error) {
    console.error('Gamification error:', error);
  }
};
```

## 6️⃣ Breathing Exercise Integration

**File:** `src/components/BreathingExercise.tsx`

```typescript
// After breathing exercise completes
const handleComplete = async () => {
  // ... existing breathing save logic ...
  
  try {
    // Award points for breathing exercise
    await gamificationService.awardPoints({
      points: 8,
      source: 'breathing',
      description: 'Breathing exercise completed'
    });
    
    // Check for breathing badges
    await gamificationService.checkBadgeEligibility('breathing');
    
    // Update breathing challenges
    const challenges = await gamificationService.getUserChallenges();
    const breathingChallenge = challenges.find(c => 
      c.challenge?.category === 'breathing' && !c.is_completed
    );
    
    if (breathingChallenge) {
      await gamificationService.updateChallengeProgress(
        breathingChallenge.challenge_id,
        breathingChallenge.current_progress + 1
      );
    }
    
  } catch (error) {
    console.error('Gamification error:', error);
  }
};
```

## 7️⃣ Medication Tracking Integration

**File:** `src/components/MedicationTracker.tsx`

```typescript
// After medication is logged
const handleMedicationLog = async () => {
  // ... existing medication log logic ...
  
  try {
    // Award points for medication tracking
    await gamificationService.awardPoints({
      points: 5,
      source: 'medication',
      description: 'Medication tracked'
    });
    
    // Check for medication badges
    await gamificationService.checkBadgeEligibility('medication');
    
  } catch (error) {
    console.error('Gamification error:', error);
  }
};
```

## 8️⃣ Peer Support Integration

**File:** `src/services/peerSupportService.ts`

```typescript
// After sending a peer support message
async sendMessage(params: {...}) {
  // ... existing message send logic ...
  
  try {
    // Award points for peer support
    await gamificationService.awardPoints({
      points: 3,
      source: 'peer_support',
      description: 'Helped someone in peer support'
    });
    
    // Check for peer support badges
    await gamificationService.checkBadgeEligibility('peer');
    
    // Update social challenges
    const challenges = await gamificationService.getUserChallenges();
    const socialChallenge = challenges.find(c => 
      c.challenge?.category === 'social' && !c.is_completed
    );
    
    if (socialChallenge) {
      await gamificationService.updateChallengeProgress(
        socialChallenge.challenge_id,
        socialChallenge.current_progress + 1
      );
    }
    
  } catch (error) {
    console.error('Gamification error:', error);
  }
}
```

## 🎊 Celebration Animations (Optional)

Add visual feedback when users earn points or level up:

```typescript
import confetti from 'canvas-confetti';

// After awarding points
const celebratePoints = (points: number) => {
  toast({
    title: `+${points} points! 🎉`,
    description: 'Keep up the great work!',
  });
};

// After level up
const celebrateLevelUp = (newLevel: number) => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  toast({
    title: `🎉 Level Up! You're now Level ${newLevel}!`,
    description: 'Amazing progress! Keep going!',
  });
};

// After badge unlock
const celebrateBadge = (badgeName: string) => {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 }
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 }
  });
  
  toast({
    title: `🏆 Badge Unlocked: ${badgeName}!`,
    description: 'You earned a new achievement!',
  });
};
```

## 🔄 Auto-Initialize Profile

Add this to your auth flow to ensure every user has a gamification profile:

```typescript
// In your auth success handler
const handleAuthSuccess = async (user: User) => {
  try {
    // Check if gamification profile exists
    const profile = await gamificationService.getGamificationProfile();
    
    if (!profile) {
      // Initialize profile for new user
      await gamificationService.initializeProfile();
    }
  } catch (error) {
    console.error('Failed to initialize gamification:', error);
  }
};
```

## 📊 Dashboard Integration

The gamification widgets are already added to the dashboard. To refresh them after actions:

```typescript
// After any gamification action
const refreshGamification = () => {
  // The widgets will auto-refresh on mount
  // Or you can use a context/state management to trigger refresh
};
```

## 🎯 Challenge Auto-Start

Optionally auto-start daily challenges for users:

```typescript
// Run this daily (e.g., in a cron job or on first login of the day)
const autoStartDailyChallenges = async () => {
  try {
    const challenges = await gamificationService.getActiveChallenges();
    const dailyChallenges = challenges.filter(c => c.challenge_type === 'daily');
    
    for (const challenge of dailyChallenges) {
      try {
        await gamificationService.startChallenge(challenge.id);
      } catch (error) {
        // Challenge might already be started
        console.log('Challenge already started:', challenge.id);
      }
    }
  } catch (error) {
    console.error('Failed to auto-start challenges:', error);
  }
};
```

## 🔔 Streak Reminder Notifications

Add streak reminders to keep users engaged:

```typescript
// Check if user needs streak reminder
const checkStreakReminder = async () => {
  const profile = await gamificationService.getGamificationProfile();
  
  if (!profile) return;
  
  const today = new Date().toISOString().split('T')[0];
  const lastCheckin = profile.last_checkin_date;
  
  if (lastCheckin !== today) {
    // User hasn't checked in today
    // Send notification or show reminder
    toast({
      title: '🔥 Don\'t lose your streak!',
      description: `You have a ${profile.current_streak} day streak. Check in today to keep it going!`,
    });
  }
};
```

## ✅ Testing Integration

Test each integration point:

1. Complete an action (e.g., log mood)
2. Check that points were awarded
3. Check that challenges updated
4. Check that badges were checked
5. Verify toast notifications appear
6. Check dashboard widgets refresh

## 🚀 Deployment Checklist

- [ ] Run database migration
- [ ] Test all integration points
- [ ] Verify points are awarded correctly
- [ ] Test challenge progress updates
- [ ] Test badge eligibility checks
- [ ] Test streak updates
- [ ] Test level progression
- [ ] Test reward purchases
- [ ] Test leaderboard
- [ ] Add celebration animations (optional)
- [ ] Set up streak reminders (optional)
- [ ] Configure auto-start challenges (optional)

---

**Note:** All gamification calls are wrapped in try-catch blocks to ensure they don't break the main user flow if something goes wrong. The gamification system should enhance the experience, not block it.
