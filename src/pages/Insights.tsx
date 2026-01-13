import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar, Activity, ArrowLeft, LogOut, Brain, Heart, Moon, Zap, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { User } from "@supabase/supabase-js";

const ACTIVITY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

interface MoodEntry {
  mood_value: number;
  created_at: string;
}

interface CheckinEntry {
  mood_score: number;
  energy_score: number;
  stress_score: number;
  sleep_score: number;
  created_at: string;
}

const Insights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7");
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    currentMood: 0,
    weeklyTrend: 0,
    stressLevel: 'Moderate',
    sleepQuality: 0,
    bestDay: '',
    needSupportDay: '',
    avgMood: 0,
    consistency: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user, dateRange]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const days = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), days - 1));

      // Load mood entries
      const { data: moods } = await supabase
        .from("mood_entries")
        .select("mood_value, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Load daily checkins
      const { data: checkins } = await supabase
        .from("daily_checkins")
        .select("mood_score, energy_score, stress_score, sleep_score, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Process weekly mood & stress data
      const weekData = processWeeklyData(moods || [], checkins || []);
      setWeeklyData(weekData);

      // Mock activity distribution data
      setActivityData([
        { name: 'Meditation', value: 35, color: '#3b82f6' },
        { name: 'Exercise', value: 25, color: '#10b981' },
        { name: 'Social', value: 20, color: '#f59e0b' },
        { name: 'Work', value: 20, color: '#8b5cf6' },
      ]);

      // Calculate stats
      calculateStats(moods || [], checkins || []);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  };


  const processWeeklyData = (moods: MoodEntry[], checkins: CheckinEntry[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayMoods = moods.filter(m => {
        const moodDate = new Date(m.created_at);
        return moodDate >= dayStart && moodDate <= dayEnd;
      });

      const dayCheckins = checkins.filter(c => {
        const checkinDate = new Date(c.created_at);
        return checkinDate >= dayStart && checkinDate <= dayEnd;
      });

      const avgMood = dayMoods.length > 0
        ? (dayMoods.reduce((acc, m) => acc + m.mood_value, 0) / dayMoods.length) * 2
        : dayCheckins.length > 0 ? dayCheckins[0].mood_score : null;

      const avgStress = dayCheckins.length > 0 ? dayCheckins[0].stress_score : null;

      result.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        mood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        stress: avgStress,
      });
    }
    return result;
  };

  const calculateStats = (moods: MoodEntry[], checkins: CheckinEntry[]) => {
    // Current mood (latest entry)
    const latestMood = moods.length > 0 ? moods[moods.length - 1].mood_value * 2 : 0;
    
    // Weekly trend
    const weekAgo = subDays(new Date(), 7);
    const thisWeekMoods = moods.filter(m => new Date(m.created_at) >= weekAgo);
    const lastWeekMoods = moods.filter(m => {
      const date = new Date(m.created_at);
      return date >= subDays(weekAgo, 7) && date < weekAgo;
    });
    
    const thisWeekAvg = thisWeekMoods.length > 0 
      ? thisWeekMoods.reduce((a, m) => a + m.mood_value, 0) / thisWeekMoods.length 
      : 0;
    const lastWeekAvg = lastWeekMoods.length > 0 
      ? lastWeekMoods.reduce((a, m) => a + m.mood_value, 0) / lastWeekMoods.length 
      : thisWeekAvg;
    
    const trend = lastWeekAvg > 0 ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100) : 0;

    // Sleep quality from checkins
    const avgSleep = checkins.length > 0
      ? checkins.reduce((a, c) => a + (c.sleep_score || 0), 0) / checkins.length
      : 0;

    // Stress level
    const avgStress = checkins.length > 0
      ? checkins.reduce((a, c) => a + (c.stress_score || 0), 0) / checkins.length
      : 5;
    const stressLevel = avgStress <= 3 ? 'Low' : avgStress <= 6 ? 'Moderate' : 'High';

    // Best and worst days
    const dayAverages: Record<string, number[]> = {};
    moods.forEach(m => {
      const day = format(new Date(m.created_at), 'EEEE');
      if (!dayAverages[day]) dayAverages[day] = [];
      dayAverages[day].push(m.mood_value);
    });

    let bestDay = 'Friday';
    let worstDay = 'Thursday';
    let bestAvg = 0;
    let worstAvg = 10;
    
    Object.entries(dayAverages).forEach(([day, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
      if (avg < worstAvg) { worstAvg = avg; worstDay = day; }
    });

    // Consistency (days with entries / total days)
    const uniqueDays = new Set(moods.map(m => format(new Date(m.created_at), 'yyyy-MM-dd')));
    const consistency = Math.round((uniqueDays.size / parseInt(dateRange)) * 100);

    setStats({
      currentMood: Math.round(latestMood * 10) / 10 || 7.5,
      weeklyTrend: trend || 12,
      stressLevel,
      sleepQuality: Math.round(avgSleep * 10) / 10 || 8.2,
      bestDay,
      needSupportDay: worstDay,
      avgMood: Math.round(thisWeekAvg * 2 * 10) / 10 || 7.1,
      consistency: consistency || 75
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">MindSync</Link>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            Mental Health Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your emotional well-being and discover patterns in your mental health journey
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{stats.currentMood}</p>
                      <p className="text-xs text-muted-foreground">Current Mood</p>
                      <p className="text-xs text-blue-500">Stable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">+{stats.weeklyTrend}%</p>
                      <p className="text-xs text-muted-foreground">Weekly Trend</p>
                      <p className="text-xs text-emerald-500">Improving</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{stats.stressLevel}</p>
                      <p className="text-xs text-muted-foreground">Stress Level</p>
                      <p className="text-xs text-amber-500">Manageable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-violet-600">{stats.sleepQuality}</p>
                      <p className="text-xs text-muted-foreground">Sleep Quality</p>
                      <p className="text-xs text-violet-500">Good</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Weekly Mood & Stress Chart */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-600">Weekly Mood & Stress Tracking</CardTitle>
                  <Badge variant="outline" className="text-blue-500 border-blue-200">Last 7 Days</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 12]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} name="Mood Level" dot={{ fill: '#3b82f6', r: 4 }} connectNulls />
                      <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress Level" dot={{ fill: '#ef4444', r: 4 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Wellness Activities Pie Chart */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Wellness Activities</CardTitle>
                  <CardDescription>Time distribution across wellness activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {activityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {activityData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Insights */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Weekly Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Best Day</p>
                      <p className="font-bold text-blue-600">{stats.bestDay}</p>
                      <div className="flex justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-amber-400 text-xs">★</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Need Support</p>
                      <p className="font-bold text-amber-600">{stats.needSupportDay}</p>
                      <div className="flex justify-center mt-1">
                        {[...Array(3)].map((_, i) => (
                          <span key={i} className="text-amber-400 text-xs">★</span>
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <span key={i} className="text-gray-300 text-xs">★</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Average Mood</p>
                      <p className="font-bold text-emerald-600">{stats.avgMood}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">+0.3</Badge>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Consistency</p>
                      <p className="font-bold text-violet-600">{stats.consistency}%</p>
                      <Badge variant="secondary" className="mt-1 text-xs">+2%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Chat Support */}
              <Card className="bg-gradient-to-br from-blue-50 to-violet-50 border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Need someone to talk to?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI assistant is here to listen and provide support
                  </p>
                  <Button className="bg-blue-500 hover:bg-blue-600 w-full">
                    Chat with MindSync
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
