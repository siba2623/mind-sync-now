import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Users,
  Brain
} from "lucide-react";
import { healthMetricsService } from "@/services/healthMetricsService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DiscoveryHealthDashboard = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [vitalityPoints, setVitalityPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [metricsData, programsData, vitalityData] = await Promise.all([
        healthMetricsService.getHealthMetrics(user.id, 7),
        healthMetricsService.getWellnessPrograms(user.id),
        healthMetricsService.getVitalityPointsHistory(user.id, 7),
      ]);

      setMetrics(metricsData);
      setPrograms(programsData);
      
      const totalPoints = vitalityData.reduce((sum, day) => sum + day.points, 0);
      setVitalityPoints(totalPoints);
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInProgram = async (programType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const programNames: Record<string, string> = {
        fitness: "Discovery Vitality Fitness Challenge",
        nutrition: "Healthy Eating Program",
        mental_health: "MindSync Mental Wellness",
        preventive_care: "Preventive Health Screening",
      };

      await healthMetricsService.enrollInWellnessProgram(user.id, {
        programName: programNames[programType],
        programType: programType as any,
        startDate: new Date().toISOString().split("T")[0],
        status: "active",
        progressPercentage: 0,
        goals: {
          target: programType === "fitness" ? "10,000 steps daily" : "Complete program milestones",
        },
      });

      toast({
        title: "Enrolled Successfully",
        description: `You've been enrolled in ${programNames[programType]}`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Enrollment Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const latestMetrics = metrics[0] || {};

  return (
    <div className="space-y-6">
      {/* Vitality Points Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discovery Vitality</h2>
            <p className="text-white/80">Your wellness journey with MindSync</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{vitalityPoints}</div>
            <div className="text-sm text-white/80">Points This Week</div>
          </div>
        </div>
      </Card>

      {/* Health Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Steps Today</p>
              <p className="text-2xl font-bold">{latestMetrics.steps_count?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heart Rate</p>
              <p className="text-2xl font-bold">{latestMetrics.heart_rate_avg || "--"} bpm</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Minutes</p>
              <p className="text-2xl font-bold">{latestMetrics.active_minutes || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vitality Status</p>
              <p className="text-2xl font-bold">Gold</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Wellness Programs */}
      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programs">My Programs</TabsTrigger>
          <TabsTrigger value="available">Available Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          {programs.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Programs</h3>
              <p className="text-muted-foreground mb-4">
                Enroll in wellness programs to earn Vitality points and improve your health
              </p>
              <Button onClick={() => document.querySelector('[value="available"]')?.dispatchEvent(new Event('click'))}>
                Browse Programs
              </Button>
            </Card>
          ) : (
            programs.map((program) => (
              <Card key={program.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{program.program_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {program.program_type.replace("_", " ")}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                    {program.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{program.progress_percentage}%</span>
                  </div>
                  <Progress value={program.progress_percentage} />
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Fitness Challenge</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Achieve 10,000 steps daily and earn up to 300 Vitality points per week
                </p>
                <Button onClick={() => enrollInProgram("fitness")}>
                  <Target className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Mental Wellness Program</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete daily mood tracking and mindfulness activities for better mental health
                </p>
                <Button onClick={() => enrollInProgram("mental_health")}>
                  <Target className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Preventive Health Screening</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule annual health checks and earn bonus Vitality points
                </p>
                <Button onClick={() => enrollInProgram("preventive_care")}>
                  <Target className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Nutrition Coaching</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized meal plans and nutrition guidance from certified coaches
                </p>
                <Button onClick={() => enrollInProgram("nutrition")}>
                  <Target className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
