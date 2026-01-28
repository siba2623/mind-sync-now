# MindSync API Documentation

## 🔌 API Overview

MindSync uses **Supabase** as the backend, providing:
- RESTful API (auto-generated from database schema)
- Real-time subscriptions (WebSocket)
- Authentication API
- Storage API
- Edge Functions (serverless)

**Base URL:** `https://fpzuagmsfvfwxyogckkp.supabase.co`

---

## 🔐 Authentication

### Register User
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    data: {
      full_name: 'John Doe',
    }
  }
});
```

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure_password',
});
```

### Logout
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## 📊 Mood Tracking APIs

### Voice Recordings

**Create Voice Recording**
```typescript
// 1. Upload audio file
const { data: fileData, error: uploadError } = await supabase.storage
  .from('mood-captures')
  .upload(`${userId}/voice/${Date.now()}.webm`, audioBlob);

// 2. Create database record
const { data, error } = await supabase
  .from('voice_recordings')
  .insert({
    user_id: userId,
    audio_url: fileData.path,
    duration_seconds: 120,
    transcription: 'AI-generated transcript',
    sentiment_score: -0.5,
    emotion_detected: 'Anxious',
    keywords: ['work', 'stress', 'deadline'],
    support_flag: false,
  })
  .select()
  .single();
```

**Get User's Voice Recordings**
```typescript
const { data, error } = await supabase
  .from('voice_recordings')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(30);
```

### Photo Mood Captures

**Create Photo Capture**
```typescript
// 1. Upload photo
const { data: fileData, error: uploadError } = await supabase.storage
  .from('mood-captures')
  .upload(`${userId}/photo/${Date.now()}.jpg`, photoBlob);

// 2. Create database record
const { data, error } = await supabase
  .from('photo_mood_captures')
  .insert({
    user_id: userId,
    photo_url: fileData.path,
    mood_detected: 'Happy',
    facial_expression_analysis: {
      emotions: { happy: 0.85, sad: 0.05, anxious: 0.10 },
      confidence: 0.92,
      dominant_emotion: 'happy'
    },
    notes: 'Feeling great today!',
  })
  .select()
  .single();
```

### Emotion Entries

**Create Emotion Entry**
```typescript
const { data, error } = await supabase
  .from('emotion_entries')
  .insert({
    user_id: userId,
    emotion: 'Anxious',
    category: 'unpleasant_high',
    intensity: 7,
    context: 'Work presentation tomorrow',
  })
  .select()
  .single();
```

**Get Recent Emotions**
```typescript
const { data, error } = await supabase
  .from('emotion_entries')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(30);
```

### Strategy Usage

**Log Strategy Usage**
```typescript
const { data, error } = await supabase
  .from('strategy_usage')
  .insert({
    user_id: userId,
    strategy_id: 7,
    strategy_name: 'Box Breathing',
    category: 'mindfulness',
    helpful: true,
    emotion_context: 'Anxious',
    duration_minutes: 5,
  })
  .select()
  .single();
```

---

## 🏥 Health & Wellness APIs

### Health Metrics

**Create/Update Daily Metrics**
```typescript
const { data, error } = await supabase
  .from('health_metrics')
  .upsert({
    user_id: userId,
    metric_date: '2026-01-27',
    steps_count: 8500,
    heart_rate_avg: 72,
    heart_rate_resting: 60,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    weight_kg: 75.5,
    bmi: 23.4,
    calories_burned: 2200,
    active_minutes: 45,
    vitality_points: 150,
  })
  .select()
  .single();
```

**Get Health Metrics (Last 30 Days)**
```typescript
const { data, error } = await supabase
  .from('health_metrics')
  .select('*')
  .eq('user_id', userId)
  .gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  .order('metric_date', { ascending: false });
```

### Wellness Programs

**Enroll in Program**
```typescript
const { data, error } = await supabase
  .from('wellness_programs')
  .insert({
    user_id: userId,
    program_name: 'Mindfulness Challenge',
    program_type: 'mental_health',
    start_date: '2026-01-27',
    status: 'active',
    progress_percentage: 0,
    goals: { daily_meditation: 10, weekly_sessions: 5 },
    achievements: [],
  })
  .select()
  .single();
```

---

## 💊 Medication APIs

### Medications

**Add Medication**
```typescript
const { data, error } = await supabase
  .from('medications')
  .insert({
    user_id: userId,
    name: 'Sertraline',
    dosage: '50mg',
    frequency: 'once daily',
    times: ['08:00'],
    prescribed_by: 'Dr. Smith',
    start_date: '2026-01-27',
    notes: 'Take with food',
    active: true,
  })
  .select()
  .single();
```

**Get Active Medications**
```typescript
const { data, error } = await supabase
  .from('medications')
  .select('*')
  .eq('user_id', userId)
  .eq('active', true)
  .order('created_at', { ascending: false });
```

### Medication Logs

**Log Medication Taken**
```typescript
const { data, error } = await supabase
  .from('medication_logs')
  .insert({
    user_id: userId,
    medication_id: medicationId,
    taken_at: new Date().toISOString(),
    scheduled_time: '08:00',
    notes: 'Taken on time',
  })
  .select()
  .single();
```

**Get Adherence Rate**
```typescript
const { data, error } = await supabase
  .rpc('calculate_adherence_rate', {
    p_user_id: userId,
    p_medication_id: medicationId,
    p_days: 30
  });
```

---

## 🩺 Therapist APIs

### Therapists

**Get All Therapists**
```typescript
const { data, error } = await supabase
  .from('therapists')
  .select('*')
  .eq('discovery_network', true)
  .order('rating', { ascending: false });
```

**Filter Therapists**
```typescript
const { data, error } = await supabase
  .from('therapists')
  .select('*')
  .contains('specializations', ['Anxiety'])
  .contains('languages', ['isiZulu'])
  .ilike('location', '%Johannesburg%')
  .eq('discovery_network', true);
```

### Therapist Bookings

**Book Session**
```typescript
const { data, error } = await supabase
  .from('therapist_bookings')
  .insert({
    user_id: userId,
    therapist_id: therapistId,
    session_date: '2026-02-01T10:00:00Z',
    session_type: 'video',
    status: 'pending',
    notes: 'First session',
  })
  .select()
  .single();
```

**Get User's Bookings**
```typescript
const { data, error } = await supabase
  .from('therapist_bookings')
  .select(`
    *,
    therapists (
      name,
      title,
      specializations,
      rate
    )
  `)
  .eq('user_id', userId)
  .order('session_date', { ascending: true });
```

---

## 👥 Social Support APIs

### Support Groups

**Get All Groups**
```typescript
const { data, error } = await supabase
  .from('support_groups')
  .select('*')
  .eq('is_active', true)
  .order('member_count', { ascending: false });
```

**Join Group**
```typescript
const { data, error } = await supabase
  .from('group_memberships')
  .insert({
    user_id: userId,
    group_id: groupId,
  })
  .select()
  .single();
```

**Get User's Groups**
```typescript
const { data, error } = await supabase
  .from('group_memberships')
  .select(`
    *,
    support_groups (
      id,
      name,
      description,
      category,
      member_count
    )
  `)
  .eq('user_id', userId);
```

### Community Posts

**Create Post**
```typescript
const { data, error } = await supabase
  .from('community_posts')
  .insert({
    user_id: userId,
    group_id: groupId,
    content: 'Today was tough, but I managed...',
    is_anonymous: true,
  })
  .select()
  .single();
```

**Get Posts in Group**
```typescript
const { data, error } = await supabase
  .from('community_posts')
  .select('*')
  .eq('group_id', groupId)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Like Post**
```typescript
const { data, error } = await supabase
  .from('post_likes')
  .insert({
    user_id: userId,
    post_id: postId,
  })
  .select()
  .single();
```

**Reply to Post**
```typescript
const { data, error } = await supabase
  .from('post_replies')
  .insert({
    user_id: userId,
    post_id: postId,
    content: 'You got this! Keep going!',
    is_anonymous: false,
  })
  .select()
  .single();
```

---

## 🔔 Notification APIs

### Notification Preferences

**Get Preferences**
```typescript
const { data, error } = await supabase
  .from('notification_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**Update Preferences**
```typescript
const { data, error } = await supabase
  .from('notification_preferences')
  .upsert({
    user_id: userId,
    medication_reminders: true,
    daily_checkin: true,
    crisis_alerts: true,
    wellness_tips: false,
    community_updates: true,
    therapist_reminders: true,
  })
  .select()
  .single();
```

### Scheduled Notifications

**Schedule Notification**
```typescript
const { data, error } = await supabase
  .from('scheduled_notifications')
  .insert({
    user_id: userId,
    notification_type: 'medication_reminder',
    title: '💊 Medication Reminder',
    body: 'Time to take Sertraline 50mg',
    scheduled_at: '2026-01-28T08:00:00Z',
    metadata: { medication_id: medicationId },
  })
  .select()
  .single();
```

---

## 🎨 User Preferences APIs

### User Preferences

**Get Preferences**
```typescript
const { data, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**Update Preferences**
```typescript
const { data, error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    language: 'zu',
    theme: 'dark',
    onboarding_completed: true,
  })
  .select()
  .single();
```

---

## 📊 Analytics APIs

### User Activity Summary

**Get Activity Stats**
```typescript
const { data, error } = await supabase
  .rpc('get_user_activity_summary', {
    p_user_id: userId,
    p_days: 30
  });

// Returns:
// {
//   emotion_entries: 45,
//   strategy_usages: 30,
//   medication_logs: 60,
//   community_posts: 5,
//   voice_recordings: 15,
//   photo_captures: 10
// }
```

### Mood Trends

**Get Mood Trend**
```typescript
const { data, error } = await supabase
  .from('emotion_entries')
  .select('emotion, category, intensity, created_at')
  .eq('user_id', userId)
  .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: true });
```

---

## 🔄 Real-time Subscriptions

### Subscribe to New Posts
```typescript
const subscription = supabase
  .channel('community_posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'community_posts',
      filter: `group_id=eq.${groupId}`
    },
    (payload) => {
      console.log('New post:', payload.new);
    }
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

### Subscribe to Notifications
```typescript
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'scheduled_notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

---

## 🗄️ Storage APIs

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('mood-captures')
  .upload(`${userId}/voice/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('mood-captures')
  .getPublicUrl(filePath);

console.log(data.publicUrl);
```

### Download File
```typescript
const { data, error } = await supabase.storage
  .from('mood-captures')
  .download(filePath);
```

### Delete File
```typescript
const { data, error } = await supabase.storage
  .from('mood-captures')
  .remove([filePath]);
```

---

## 🔧 Edge Functions (Serverless)

### AI Sentiment Analysis
```typescript
const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
  body: {
    text: 'I feel anxious about tomorrow',
    type: 'voice_transcription'
  }
});

// Returns:
// {
//   sentiment_score: -0.6,
//   emotion: 'Anxious',
//   keywords: ['anxious', 'tomorrow'],
//   support_flag: false
// }
```

### Generate Recommendations
```typescript
const { data, error } = await supabase.functions.invoke('get-recommendations', {
  body: {
    user_id: userId,
    emotion: 'Anxious',
    intensity: 7
  }
});

// Returns:
// {
//   strategies: [
//     { id: 7, name: 'Box Breathing', category: 'mindfulness' },
//     { id: 3, name: 'Progressive Muscle Relaxation', category: 'movement' }
//   ],
//   therapists: [...],
//   resources: [...]
// }
```

---

## ⚠️ Error Handling

### Common Errors

**Authentication Error**
```typescript
{
  error: {
    message: 'Invalid login credentials',
    status: 400
  }
}
```

**Permission Error**
```typescript
{
  error: {
    message: 'new row violates row-level security policy',
    status: 403
  }
}
```

**Not Found**
```typescript
{
  error: {
    message: 'No rows found',
    status: 404
  }
}
```

### Error Handling Pattern
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error
  return;
}

// Use data
console.log(data);
```

---

## 🔒 Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use Row-Level Security (RLS)** for all user data
3. **Validate input** on both client and server
4. **Use prepared statements** to prevent SQL injection
5. **Implement rate limiting** for API calls
6. **Enable HTTPS** for all requests
7. **Rotate API keys** regularly
8. **Monitor for suspicious activity**

---

## 📈 Rate Limits

**Supabase Free Tier:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users

**Supabase Pro Tier ($25/month):**
- 8GB database
- 100GB file storage
- 250GB bandwidth
- Unlimited monthly active users

---

## 🧪 Testing

### Test User Creation
```typescript
// Create test user
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test_password_123',
});

// Clean up
await supabase.auth.admin.deleteUser(data.user.id);
```

### Mock Data
```typescript
// Insert test data
const { data, error } = await supabase
  .from('emotion_entries')
  .insert([
    { user_id: userId, emotion: 'Happy', category: 'pleasant_high', intensity: 8 },
    { user_id: userId, emotion: 'Calm', category: 'pleasant_low', intensity: 7 },
    { user_id: userId, emotion: 'Anxious', category: 'unpleasant_high', intensity: 6 },
  ]);
```

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript
- **Row-Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Real-time:** https://supabase.com/docs/guides/realtime

---

**Last Updated:** January 27, 2026  
**API Version:** 1.0  
**Support:** api@mindsync.app
