import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Wind, Zap, Music, Heart, CheckCircle2, LogOut, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";
import MoodSound from "@/components/MoodSound";
import { getWeatherData, getWeatherBasedActivitySuggestion, type WeatherData } from "@/services/weather";

const iconMap: Record<string, any> = {
  Wind,
  Zap,
  Music,
  Heart,
};

interface Activity {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  best_for: string;
}

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentMood, setCurrentMood] = useState<string>('calm');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [userCity, setUserCity] = useState<string>('London');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadActivities();
      loadCompletions();
      loadWeather();
    }
  }, [user]);

  const loadWeather = async () => {
    const weather = await getWeatherData(userCity);
    setWeather(weather);
  };

  const loadActivities = async () => {
    const [activitiesResult, moodResult] = await Promise.all([
      supabase.from("activities").select("*"),
      supabase
        .from("mood_entries")
        .select("mood_value")
        .order("created_at", { ascending: false })
        .limit(1)
    ]);

    if (activitiesResult.data) {
      setActivities(activitiesResult.data);
    }

    if (moodResult.data?.[0]) {
      // Convert mood value (1-5) to descriptive mood
      const moodMap = {
        1: 'sad',
        2: 'anxious',
        3: 'neutral',
        4: 'calm',
        5: 'happy'
      };
      setCurrentMood(moodMap[moodResult.data[0].mood_value as keyof typeof moodMap] || 'calm');
    }
  };

  const loadCompletions = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("activity_completions")
      .select("activity_id")
      .eq("user_id", user.id)
      .gte("completed_at", today.toISOString());

    if (data) {
      setCompletedActivities(data.map((c) => c.activity_id));
    }
  };

  const toggleComplete = async (activityId: string) => {
    if (!user) return;

    const isCompleted = completedActivities.includes(activityId);

    try {
      if (isCompleted) {
        const { error } = await supabase
          .from("activity_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("activity_id", activityId);

        if (error) throw error;
        setCompletedActivities((prev) => prev.filter((id) => id !== activityId));
      } else {
        const { error } = await supabase.from("activity_completions").insert({
          user_id: user.id,
          activity_id: activityId,
        });

        if (error) throw error;
        setCompletedActivities((prev) => [...prev, activityId]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update completion",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-calm bg-clip-text text-transparent">
              MindSync
            </Link>
            <div className="flex gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Micro-Activities
          </h1>
          <p className="text-lg text-muted-foreground">
            Quick, science-backed activities to help you feel better right now
          </p>
        </div>

        {/* Weather-Based Suggestion */}
        {weather && (
          <Card className="p-6 mb-8 shadow-card bg-gradient-card animate-in fade-in duration-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Today's Weather in {userCity}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {weather.temp}°C • {weather.description}
                </p>
                <p className="text-foreground">
                  {getWeatherBasedActivitySuggestion(weather)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Mood-Based Music */}
        <div className="mb-12 animate-in fade-in duration-700">
          <MoodSound currentMood={currentMood} />
        </div>

        {/* Activities Grid */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
          {activities.map((activity, index) => {
            const isCompleted = completedActivities.includes(activity.id);
            const Icon = iconMap[activity.icon_name] || Wind;

            return (
              <Card
                key={activity.id}
                className={`p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 ${
                  isCompleted ? "border-2 border-primary bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activity.color_gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                          {activity.title}
                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium">{activity.duration}</span>
                          <span>•</span>
                          <span>Best for: {activity.best_for}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {activity.description}
                    </p>

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleComplete(activity.id)}
                      >
                        {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        {completedActivities.length > 0 && (
          <Card className="p-6 mt-8 shadow-card animate-in fade-in duration-500 bg-gradient-card">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Great Work!</h3>
              <p className="text-muted-foreground">
                You've completed {completedActivities.length} activit
                {completedActivities.length === 1 ? "y" : "ies"} today
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Activities;
