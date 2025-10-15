import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Activity, ArrowLeft, LogOut } from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";

const Insights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [weeklyMoods, setWeeklyMoods] = useState<any[]>([]);
  const navigate = useNavigate();

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
      loadWeeklyMoods();
    }
  }, [user]);

  const loadWeeklyMoods = async () => {
    if (!user) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const { data } = await supabase
        .from("mood_entries")
        .select("mood_value")
        .eq("user_id", user.id)
        .gte("created_at", date.toISOString())
        .lt("created_at", nextDay.toISOString());

      const avgMood = data && data.length > 0
        ? data.reduce((acc, m) => acc + m.mood_value, 0) / data.length
        : 0;

      const moodEmojis = ["", "😢", "😔", "😐", "🙂", "😊"];
      weekData.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        value: avgMood,
        emoji: avgMood > 0 ? moodEmojis[Math.round(avgMood)] : "—",
      });
    }

    setWeeklyMoods(weekData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const insights = [
    {
      icon: TrendingUp,
      title: "Track Your Patterns",
      description: "Continue logging your mood daily to unlock personalized insights about what helps you thrive.",
      color: "text-secondary",
    },
    {
      icon: Calendar,
      title: "Build Consistency",
      description: "Regular check-ins help you understand emotional patterns and identify triggers over time.",
      color: "text-primary",
    },
    {
      icon: Activity,
      title: "Activity Impact",
      description: "Complete micro-activities to see correlations between actions and mood improvements.",
      color: "text-accent",
    },
  ];

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

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Insights
          </h1>
          <p className="text-lg text-muted-foreground">
            Understanding your emotional patterns over time
          </p>
        </div>

        {/* Weekly Mood Chart */}
        <Card className="p-8 mb-8 shadow-card animate-in slide-in-from-bottom-4 duration-700 bg-gradient-card">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            This Week's Mood
          </h2>

          <div className="space-y-6">
            {/* Chart */}
            <div className="flex items-end justify-between gap-3 h-48">
              {weeklyMoods.map((mood, index) => (
                <div key={index} className="flex flex-col items-center flex-1 gap-3">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full bg-gradient-calm rounded-t-lg transition-all duration-500 hover:opacity-80 flex items-end justify-center pb-2"
                      style={{ height: mood.value > 0 ? `${(mood.value / 5) * 100}%` : "10%" }}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {mood.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Scale */}
            <div className="flex justify-between text-sm text-muted-foreground border-t border-border pt-4">
              <span>Struggling</span>
              <span>Low</span>
              <span>Okay</span>
              <span>Good</span>
              <span>Great</span>
            </div>
          </div>
        </Card>

        {/* Insights Grid */}
        <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          {insights.map((insight, index) => (
            <Card
              key={index}
              className="p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-calm flex items-center justify-center flex-shrink-0">
                  <insight.icon className={`w-6 h-6 ${insight.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
