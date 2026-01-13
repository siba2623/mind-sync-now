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
