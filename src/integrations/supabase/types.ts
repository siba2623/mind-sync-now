export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          best_for: string
          color_gradient: string
          created_at: string
          description: string
          duration: string
          icon_name: string
          id: string
          title: string
        }
        Insert: {
          best_for: string
          color_gradient: string
          created_at?: string
          description: string
          duration: string
          icon_name: string
          id?: string
          title: string
        }
        Update: {
          best_for?: string
          color_gradient?: string
          created_at?: string
          description?: string
          duration?: string
          icon_name?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      activity_completions: {
        Row: {
          activity_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood_value: number
          user_id: string
          notes: string | null
          emotion_tags: string[] | null
          intensity_level: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          mood_value: number
          user_id: string
          notes?: string | null
          emotion_tags?: string[] | null
          intensity_level?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          mood_value?: number
          user_id?: string
          notes?: string | null
          emotion_tags?: string[] | null
          intensity_level?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          therapist_name: string | null
          therapist_contact: string | null
          personal_goals: string | null
          affirmations: string | null
          crisis_plan: string | null
          timezone: string | null
          theme_preference: string | null
          notifications_enabled: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          therapist_name?: string | null
          therapist_contact?: string | null
          personal_goals?: string | null
          affirmations?: string | null
          crisis_plan?: string | null
          timezone?: string | null
          theme_preference?: string | null
          notifications_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          therapist_name?: string | null
          therapist_contact?: string | null
          personal_goals?: string | null
          affirmations?: string | null
          crisis_plan?: string | null
          timezone?: string | null
          theme_preference?: string | null
          notifications_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood_at_time: number | null
          tags: string[] | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          mood_at_time?: number | null
          tags?: string[] | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood_at_time?: number | null
          tags?: string[] | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          checkin_date: string | null
          mood_score: number | null
          energy_score: number | null
          stress_score: number | null
          sleep_score: number | null
          sleep_hours: number | null
          social_score: number | null
          productivity_score: number | null
          anxiety_triggers: string[] | null
          self_care_activities: string[] | null
          water_intake: number | null
          exercise_minutes: number | null
          medication_taken: boolean | null
          gratitude_note: string | null
          challenges_note: string | null
          goals_note: string | null
          additional_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          checkin_date?: string | null
          mood_score?: number | null
          energy_score?: number | null
          stress_score?: number | null
          sleep_score?: number | null
          sleep_hours?: number | null
          social_score?: number | null
          productivity_score?: number | null
          anxiety_triggers?: string[] | null
          self_care_activities?: string[] | null
          water_intake?: number | null
          exercise_minutes?: number | null
          medication_taken?: boolean | null
          gratitude_note?: string | null
          challenges_note?: string | null
          goals_note?: string | null
          additional_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          checkin_date?: string | null
          mood_score?: number | null
          energy_score?: number | null
          stress_score?: number | null
          sleep_score?: number | null
          sleep_hours?: number | null
          social_score?: number | null
          productivity_score?: number | null
          anxiety_triggers?: string[] | null
          self_care_activities?: string[] | null
          water_intake?: number | null
          exercise_minutes?: number | null
          medication_taken?: boolean | null
          gratitude_note?: string | null
          challenges_note?: string | null
          goals_note?: string | null
          additional_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }

      breathing_sessions: {
        Row: {
          id: string
          user_id: string
          pattern_name: string
          duration_seconds: number
          cycles_completed: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pattern_name: string
          duration_seconds: number
          cycles_completed: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pattern_name?: string
          duration_seconds?: number
          cycles_completed?: number
          created_at?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          id: string
          user_id: string
          meditation_type: string
          duration_seconds: number
          ambient_sound: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meditation_type: string
          duration_seconds: number
          ambient_sound?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meditation_type?: string
          duration_seconds?: number
          ambient_sound?: string | null
          completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          id: string
          user_id: string
          audio_url: string
          duration_seconds: number
          transcription: string | null
          sentiment_score: number | null
          emotion_detected: string | null
          keywords: string[] | null
          support_flag: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          audio_url: string
          duration_seconds: number
          transcription?: string | null
          sentiment_score?: number | null
          emotion_detected?: string | null
          keywords?: string[] | null
          support_flag?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          audio_url?: string
          duration_seconds?: number
          transcription?: string | null
          sentiment_score?: number | null
          emotion_detected?: string | null
          keywords?: string[] | null
          support_flag?: boolean
          created_at?: string
        }
        Relationships: []
      }
      photo_mood_captures: {
        Row: {
          id: string
          user_id: string
          photo_url: string
          mood_detected: string | null
          facial_expression_analysis: Json | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_url: string
          mood_detected?: string | null
          facial_expression_analysis?: Json | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          photo_url?: string
          mood_detected?: string | null
          facial_expression_analysis?: Json | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          id: string
          user_id: string
          metric_date: string
          steps_count: number | null
          heart_rate_avg: number | null
          heart_rate_resting: number | null
          blood_pressure_systolic: number | null
          blood_pressure_diastolic: number | null
          weight_kg: number | null
          bmi: number | null
          calories_burned: number | null
          active_minutes: number | null
          vitality_points: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_date: string
          steps_count?: number | null
          heart_rate_avg?: number | null
          heart_rate_resting?: number | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          weight_kg?: number | null
          bmi?: number | null
          calories_burned?: number | null
          active_minutes?: number | null
          vitality_points?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_date?: string
          steps_count?: number | null
          heart_rate_avg?: number | null
          heart_rate_resting?: number | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          weight_kg?: number | null
          bmi?: number | null
          calories_burned?: number | null
          active_minutes?: number | null
          vitality_points?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      wellness_programs: {
        Row: {
          id: string
          user_id: string
          program_name: string
          program_type: string
          start_date: string
          end_date: string | null
          status: string
          progress_percentage: number
          goals: Json | null
          achievements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_name: string
          program_type: string
          start_date: string
          end_date?: string | null
          status?: string
          progress_percentage?: number
          goals?: Json | null
          achievements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_name?: string
          program_type?: string
          start_date?: string
          end_date?: string | null
          status?: string
          progress_percentage?: number
          goals?: Json | null
          achievements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mental_health_assessments: {
        Row: {
          id: string
          user_id: string
          assessment_type: string
          score: number
          severity_level: string | null
          responses: Json | null
          recommendations: string[] | null
          requires_professional_support: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_type: string
          score: number
          severity_level?: string | null
          responses?: Json | null
          recommendations?: string[] | null
          requires_professional_support?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_type?: string
          score?: number
          severity_level?: string | null
          responses?: Json | null
          recommendations?: string[] | null
          requires_professional_support?: boolean
          created_at?: string
        }
        Relationships: []
      }
      support_interventions: {
        Row: {
          id: string
          user_id: string
          trigger_source: string
          trigger_id: string | null
          intervention_type: string
          status: string
          notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          trigger_source: string
          trigger_id?: string | null
          intervention_type: string
          status?: string
          notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          trigger_source?: string
          trigger_id?: string | null
          intervention_type?: string
          status?: string
          notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      crisis_detections: {
        Row: {
          detection_id: string
          user_id: string
          text_analyzed: string
          crisis_level: 'none' | 'low' | 'moderate' | 'high' | 'critical'
          confidence: number
          triggers: string[]
          recommended_action: string
          detected_at: string
          intervention_triggered: boolean
          intervention_type: string | null
          created_at: string
        }
        Insert: {
          detection_id?: string
          user_id: string
          text_analyzed: string
          crisis_level: 'none' | 'low' | 'moderate' | 'high' | 'critical'
          confidence: number
          triggers: string[]
          recommended_action: string
          detected_at?: string
          intervention_triggered?: boolean
          intervention_type?: string | null
          created_at?: string
        }
        Update: {
          detection_id?: string
          user_id?: string
          text_analyzed?: string
          crisis_level?: 'none' | 'low' | 'moderate' | 'high' | 'critical'
          confidence?: number
          triggers?: string[]
          recommended_action?: string
          detected_at?: string
          intervention_triggered?: boolean
          intervention_type?: string | null
          created_at?: string
        }
        Relationships: []
      }
      care_coordinator_alerts: {
        Row: {
          alert_id: string
          user_id: string
          assessment_id: string | null
          alert_type: string
          risk_level: string
          details: Json
          status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated'
          priority: string
          assigned_to: string | null
          acknowledged_at: string | null
          resolved_at: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          alert_id?: string
          user_id: string
          assessment_id?: string | null
          alert_type: string
          risk_level: string
          details: Json
          status?: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated'
          priority: string
          assigned_to?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          alert_id?: string
          user_id?: string
          assessment_id?: string | null
          alert_type?: string
          risk_level?: string
          details?: Json
          status?: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated'
          priority?: string
          assigned_to?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          contact_id: string
          user_id: string
          name: string
          relationship: string | null
          phone_encrypted: string
          email_encrypted: string | null
          alert_enabled: boolean
          priority_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          contact_id?: string
          user_id: string
          name: string
          relationship?: string | null
          phone_encrypted: string
          email_encrypted?: string | null
          alert_enabled?: boolean
          priority_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          user_id?: string
          name?: string
          relationship?: string | null
          phone_encrypted?: string
          email_encrypted?: string | null
          alert_enabled?: boolean
          priority_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          notification_id: string
          user_id: string
          type: string
          title: string
          message: string
          priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
          read: boolean
          read_at: string | null
          action_url: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          notification_id?: string
          user_id: string
          type: string
          title: string
          message: string
          priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
          read?: boolean
          read_at?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          notification_id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
          read?: boolean
          read_at?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Row"]

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Update"]
