import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, Activity, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";

const moods = [
  { emoji: "😊", label: "Great", value: 5, color: "from-green-400 to-emerald-400" },
  { emoji: "🙂", label: "Good", value: 4, color: "from-blue-400 to-cyan-400" },
  { emoji: "😐", label: "Okay", value: 3, color: "from-yellow-400 to-amber-400" },
  { emoji: "😔", label: "Low", value: 2, color: "from-orange-400 to-red-400" },
  { emoji: "😢", label: "Struggling", value: 1, color: "from-red-400 to-rose-400" },
];

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState({ streak: 0, avgMood: 0, activitiesCompleted: 0 });
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
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const { data: moodData } = await supabase
        .from("mood_entries")
        .select("mood_value, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: completionsData } = await supabase
        .from("activity_completions")
        .select("id")
        .eq("user_id", user.id);

      if (moodData && moodData.length > 0) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekMoods = moodData.filter(
          (m) => new Date(m.created_at) >= weekAgo
        );
        const avgMood = weekMoods.reduce((acc, m) => acc + m.mood_value, 0) / weekMoods.length;

        const dates = new Set(
          moodData.map((m) => new Date(m.created_at).toDateString())
        );
        const streak = Array.from(dates).length;

        setStats({
          streak,
          avgMood: Math.round(avgMood * 10) / 10,
          activitiesCompleted: completionsData?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSubmit = async () => {
    if (selectedMood !== null && user) {
      try {
        const { error } = await supabase.from("mood_entries").insert({
          user_id: user.id,
          mood_value: selectedMood,
        });

        if (error) throw error;

        setSubmitted(true);
        toast({
          title: "Mood logged!",
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
              <Link to="/insights">
                <Button variant="ghost" size="sm" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Insights
                </Button>
              </Link>
              <Link to="/activities">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Activities
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How are you feeling?
          </h1>
          <p className="text-lg text-muted-foreground">
            Take a moment to check in with yourself
          </p>
        </div>

        {/* Mood Selection */}
        <Card className="p-8 md:p-12 shadow-card animate-in slide-in-from-bottom-4 duration-700 bg-gradient-card">
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300
                    hover:scale-105 hover:shadow-glow
                    ${
                      selectedMood === mood.value
                        ? "border-primary bg-primary/10 scale-105 shadow-glow"
                        : "border-border bg-card hover:border-primary/50"
                    }
                  `}
                >
                  <div className="text-5xl md:text-6xl mb-3">{mood.emoji}</div>
                  <div className="text-sm font-medium text-foreground">{mood.label}</div>
                </button>
              ))}
            </div>

            {selectedMood !== null && (
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  className="gap-2 shadow-soft hover:shadow-glow transition-all duration-300"
                >
                  {submitted ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      Mood Logged!
                    </>
                  ) : (
                    <>Log Mood</>
                  )}
                </Button>
                {!submitted && (
                  <p className="text-sm text-muted-foreground">
                    We'll use this to provide personalized insights and activities
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          <Card className="p-6 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Your Streak</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.streak} days</p>
            <p className="text-sm text-muted-foreground mt-1">Keep it going!</p>
          </Card>

          <Card className="p-6 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-semibold">This Week</h3>
            </div>
            <p className="text-3xl font-bold text-secondary">
              {stats.avgMood > 0 ? stats.avgMood : "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Average mood</p>
          </Card>

          <Card className="p-6 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold">Activities</h3>
            </div>
            <p className="text-3xl font-bold text-accent">{stats.activitiesCompleted}</p>
            <p className="text-sm text-muted-foreground mt-1">Completed</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
