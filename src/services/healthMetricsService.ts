import { supabase } from "@/integrations/supabase/client";

export interface HealthMetrics {
  metricDate: string;
  stepsCount?: number;
  heartRateAvg?: number;
  heartRateResting?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  weightKg?: number;
  bmi?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  vitalityPoints?: number;
}

export interface WellnessProgram {
  programName: string;
  programType: "fitness" | "nutrition" | "mental_health" | "preventive_care";
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "paused";
  progressPercentage: number;
  goals?: any;
  achievements?: any;
}

export class HealthMetricsService {
  async saveHealthMetrics(userId: string, metrics: HealthMetrics): Promise<void> {
    const { error } = await supabase.from("health_metrics").upsert({
      user_id: userId,
      metric_date: metrics.metricDate,
      steps_count: metrics.stepsCount,
      heart_rate_avg: metrics.heartRateAvg,
      heart_rate_resting: metrics.heartRateResting,
      blood_pressure_systolic: metrics.bloodPressureSystolic,
      blood_pressure_diastolic: metrics.bloodPressureDiastolic,
      weight_kg: metrics.weightKg,
      bmi: metrics.bmi,
      calories_burned: metrics.caloriesBurned,
      active_minutes: metrics.activeMinutes,
      vitality_points: metrics.vitalityPoints,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  async getHealthMetrics(userId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
      .gte("metric_date", startDate.toISOString().split("T")[0])
      .order("metric_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async enrollInWellnessProgram(userId: string, program: WellnessProgram): Promise<string> {
    const { data, error } = await supabase
      .from("wellness_programs")
      .insert({
        user_id: userId,
        program_name: program.programName,
        program_type: program.programType,
        start_date: program.startDate,
        end_date: program.endDate,
        status: program.status,
        progress_percentage: program.progressPercentage,
        goals: program.goals,
        achievements: program.achievements,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getWellnessPrograms(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("wellness_programs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateProgramProgress(programId: string, progressPercentage: number): Promise<void> {
    const { error } = await supabase
      .from("wellness_programs")
      .update({
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);

    if (error) throw error;
  }

  calculateVitalityPoints(metrics: HealthMetrics): number {
    let points = 0;

    // Steps (up to 30 points)
    if (metrics.stepsCount) {
      points += Math.min(30, Math.floor(metrics.stepsCount / 1000) * 3);
    }

    // Active minutes (up to 20 points)
    if (metrics.activeMinutes) {
      points += Math.min(20, Math.floor(metrics.activeMinutes / 3));
    }

    // Heart rate health (up to 10 points)
    if (metrics.heartRateResting && metrics.heartRateResting >= 60 && metrics.heartRateResting <= 80) {
      points += 10;
    }

    // BMI health (up to 10 points)
    if (metrics.bmi && metrics.bmi >= 18.5 && metrics.bmi <= 24.9) {
      points += 10;
    }

    return points;
  }

  async getVitalityPointsHistory(userId: string, days: number = 30): Promise<any[]> {
    const metrics = await this.getHealthMetrics(userId, days);
    return metrics.map((m) => ({
      date: m.metric_date,
      points: m.vitality_points || 0,
    }));
  }
}

export const healthMetricsService = new HealthMetricsService();
