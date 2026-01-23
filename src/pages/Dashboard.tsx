import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Activity, 
  LogOut, 
  User as UserIcon,
  Calendar,
  Wind,
  Brain,
  Heart,
  Target,
  BookOpen,
  CheckCircle,
  Building2,
  Trophy,
  ClipboardCheck,
  Watch,
  Stethoscope,
  Users,
  Shield,
  Bot,
  AlertTriangle,
  Home
} from "lucide-react";
import IconWrapper from "@/components/ui/icon-wrapper";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";
import DailyCheckin from "@/components/DailyCheckin";
import BreathingExercise from "@/components/BreathingExercise";
import MeditationTimer from "@/components/MeditationTimer";
import Journal from "@/components/Journal";
import VitalityPoints from "@/components/VitalityPoints";
import MentalHealthAssessment from "@/components/MentalHealthAssessment";
import WellnessChallenges from "@/components/WellnessChallenges";
import WearableSync from "@/components/WearableSync";
import TherapistNetwork from "@/components/TherapistNetwork";
import CorporateDashboard from "@/components/CorporateDashboard";
import CommunityEvents from "@/components/CommunityEvents";
import AICoach from "@/components/AICoach";
import CrisisDetection from "@/components/CrisisDetection";
import FamilyWellnessHub from "@/components/FamilyWellnessHub";

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
  const [stats, setStats] = useState({ 
    streak: 0, 
    avgMood: 0, 
    activitiesCompleted: 0,
    meditationMinutes: 0,
    breathingSessions: 0,
    journalEntries: 0
  });
  const [activeView, setActiveView] = useState<'dashboard' | 'checkin' | 'breathing' | 'meditation' | 'journal' | 'vitality' | 'assessments' | 'challenges' | 'wearables' | 'therapists' | 'corporate' | 'community' | 'aicoach' | 'crisis' | 'family'>('dashboard');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
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
      // Check if user has checked in today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayCheckin } = await supabase
        .from("daily_checkins")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", today)
        .single();
      
      setHasCheckedInToday(!!todayCheckin);

      // Load mood data
      const { data: moodData } = await supabase
        .from("mood_entries")
        .select("mood_value, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Load activity completions
      const { data: completionsData } = await supabase
        .from("activity_completions")
        .select("id")
        .eq("user_id", user.id);

      // Load meditation sessions
      const { data: meditationData } = await supabase
        .from("meditation_sessions")
        .select("duration_seconds")
        .eq("user_id", user.id);

      // Load breathing sessions
      const { data: breathingData } = await supabase
        .from("breathing_sessions")
        .select("id")
        .eq("user_id", user.id);

      // Load journal entries
      const { data: journalData } = await supabase
        .from("journal_entries")
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

        const totalMeditationMinutes = meditationData?.reduce((acc, session) => 
          acc + Math.round(session.duration_seconds / 60), 0) || 0;

        setStats({
          streak,
          avgMood: Math.round(avgMood * 10) / 10,
          activitiesCompleted: completionsData?.length || 0,
          meditationMinutes: totalMeditationMinutes,
          breathingSessions: breathingData?.length || 0,
          journalEntries: journalData?.length || 0
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
    <div className="min-h-screen bg-gradient-subtle mobile-page">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-calm bg-clip-text text-transparent">
              MindSync
            </Link>
            <div className="hidden md:flex gap-4">
              <Link to="/insights">
                <Button variant="ghost" size="sm" className="gap-2">
                  <IconWrapper icon={TrendingUp} variant="minimal" size="sm" color="primary" />
                  Insights
                </Button>
              </Link>
              <Link to="/activities">
                <Button variant="ghost" size="sm" className="gap-2">
                  <IconWrapper icon={Activity} variant="minimal" size="sm" color="primary" />
                  Activities
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <IconWrapper icon={UserIcon} variant="minimal" size="sm" color="primary" />
                  Profile
                </Button>
              </Link>
              <Link to="/enterprise">
                <Button variant="ghost" size="sm" className="gap-2">
                  <IconWrapper icon={Building2} variant="minimal" size="sm" color="primary" />
                  Enterprise
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <IconWrapper icon={Shield} variant="minimal" size="sm" color="secondary" />
                  Admin
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <IconWrapper icon={LogOut} variant="minimal" size="sm" color="danger" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {activeView === 'dashboard' && (
          <>
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
              </h1>
              <p className="text-muted-foreground">
                {hasCheckedInToday 
                  ? "You've completed your daily check-in. Great job!" 
                  : "How are you feeling today? Start with your daily check-in."
                }
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <Link to="/health-hub" className="block">
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-red/20 ring-2 ring-red-200">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <IconWrapper icon={Heart} variant="gradient" size="lg" color="danger" />
                    </div>
                    <h3 className="font-semibold mb-1 text-gray-900 text-sm">Health Hub</h3>
                    <p className="text-xs text-gray-600">Discovery</p>
                  </CardContent>
                </Card>
              </Link>

              <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm ${!hasCheckedInToday ? 'ring-1 ring-primary/30 bg-gradient-to-br from-primary/5 to-primary/10' : 'hover:shadow-primary/10'}`}>
                <CardContent className="p-4 md:p-6 text-center" onClick={() => setActiveView('checkin')}>
                  <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconWrapper icon={Calendar} variant="gradient" size="lg" color="info" />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-900 text-sm">Check-in</h3>
                  <p className="text-xs text-gray-600">
                    {hasCheckedInToday ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Done
                      </span>
                    ) : (
                      'Start'
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-amber/20">
                <CardContent className="p-4 md:p-6 text-center" onClick={() => setActiveView('vitality')}>
                  <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconWrapper icon={Trophy} variant="gradient" size="lg" color="warning" />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-900 text-sm">Vitality</h3>
                  <p className="text-xs text-gray-600">Earn Points</p>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm hover:shadow-emerald/10">
                <CardContent className="p-4 md:p-6 text-center" onClick={() => setActiveView('breathing')}>
                  <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconWrapper icon={Wind} variant="gradient" size="lg" color="success" />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-900 text-sm">Breathing</h3>
                  <p className="text-xs text-gray-600">Calm</p>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm hover:shadow-purple/10">
                <CardContent className="p-4 md:p-6 text-center" onClick={() => setActiveView('meditation')}>
                  <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconWrapper icon={Brain} variant="gradient" size="lg" color="secondary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-900 text-sm">Meditate</h3>
                  <p className="text-xs text-gray-600">Peace</p>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm hover:shadow-amber/10">
                <CardContent className="p-4 md:p-6 text-center" onClick={() => setActiveView('journal')}>
                  <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconWrapper icon={BookOpen} variant="gradient" size="lg" color="warning" />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-900 text-sm">Journal</h3>
                  <p className="text-xs text-gray-600">Reflect</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Daily
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.streak}</p>
                    <p className="text-sm font-medium text-gray-700">Day Streak</p>
                    <p className="text-xs text-gray-500">Keep it going!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/20 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-violet-600" strokeWidth={1.5} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Total
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.meditationMinutes}</p>
                    <p className="text-sm font-medium text-gray-700">Meditation</p>
                    <p className="text-xs text-gray-500">Minutes practiced</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 flex items-center justify-center">
                      <Wind className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Sessions
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.breathingSessions}</p>
                    <p className="text-sm font-medium text-gray-700">Breathing</p>
                    <p className="text-xs text-gray-500">Exercises done</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/20 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-rose-600" strokeWidth={1.5} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Weekly
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.avgMood > 0 ? stats.avgMood : "—"}
                    </p>
                    <p className="text-sm font-medium text-gray-700">Avg Mood</p>
                    <p className="text-xs text-gray-500">This week</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Mood Check */}
            <Card className="mb-8 border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Quick Mood Check</CardTitle>
                    <CardDescription className="text-gray-600">
                      How are you feeling right now?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`
                        group p-4 rounded-2xl border transition-all duration-300
                        hover:shadow-md hover:-translate-y-1
                        ${
                          selectedMood === mood.value
                            ? "border-primary/30 bg-primary/5 shadow-md -translate-y-1"
                            : "border-gray-200 hover:border-primary/30 bg-white"
                        }
                      `}
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                        {mood.emoji}
                      </div>
                      <div className="text-xs font-medium text-gray-700">{mood.label}</div>
                    </button>
                  ))}
                </div>

                {selectedMood !== null && (
                  <div className="text-center">
                    <Button
                      onClick={handleSubmit}
                      className="gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                      disabled={submitted}
                    >
                      {submitted ? (
                        <>
                          <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                          Logged!
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" strokeWidth={1.5} />
                          Log Mood
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discovery Vitality Features */}
            <Card className="mb-8 border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/30 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Discovery Vitality</CardTitle>
                    <CardDescription className="text-gray-600">
                      Access your Vitality wellness features
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                    onClick={() => setActiveView('aicoach')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Bot className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-sm">AI Coach</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      24/7 mental health support
                    </p>
                  </div>

                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                    onClick={() => setActiveView('crisis')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h4 className="font-medium text-sm">Crisis Safety</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Emergency contacts & help
                    </p>
                  </div>

                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
                    onClick={() => setActiveView('family')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Home className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium text-sm">Family Hub</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Family wellness & monitoring
                    </p>
                  </div>

                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-white/50"
                    onClick={() => setActiveView('community')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-pink-500" />
                      <h4 className="font-medium text-sm">Community</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Events & meetups
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-white/50"
                    onClick={() => setActiveView('wearables')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Watch className="w-5 h-5 text-purple-500" />
                      <h4 className="font-medium text-sm">Wearables</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sync devices
                    </p>
                  </div>

                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-white/50"
                    onClick={() => setActiveView('therapists')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium text-sm">Therapists</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Discovery network
                    </p>
                  </div>

                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-white/50"
                    onClick={() => setActiveView('corporate')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-indigo-500" />
                      <h4 className="font-medium text-sm">HR Dashboard</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Corporate wellness
                    </p>
                  </div>

                  <div 
                    className="p-4 border rounded-xl hover:bg-white/80 transition-all cursor-pointer hover:shadow-md bg-white/50"
                    onClick={() => setActiveView('assessments')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ClipboardCheck className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium text-sm">Assessments</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PHQ-9 & GAD-7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Your Wellness Journey</CardTitle>
                <CardDescription>
                  Recommended activities based on your recent patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setActiveView('breathing')}>
                    <div className="flex items-center gap-3 mb-2">
                      <Wind className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium">5-Minute Breathing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quick stress relief with guided breathing
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setActiveView('journal')}>
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium">Gratitude Journal</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Write about what you're thankful for today
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeView === 'checkin' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Daily Check-in</h2>
            </div>
            <DailyCheckin onComplete={() => {
              setActiveView('dashboard');
              setHasCheckedInToday(true);
              loadStats();
            }} />
          </div>
        )}

        {activeView === 'breathing' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Breathing Exercise</h2>
            </div>
            <BreathingExercise />
          </div>
        )}

        {activeView === 'meditation' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Meditation Timer</h2>
            </div>
            <MeditationTimer />
          </div>
        )}

        {activeView === 'journal' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <Journal />
          </div>
        )}

        {activeView === 'vitality' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Vitality Wellness</h2>
            </div>
            
            {/* Vitality Sub-navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('vitality')}
              >
                <Trophy className="w-4 h-4" />
                Points
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('assessments')}
              >
                <ClipboardCheck className="w-4 h-4" />
                Assessments
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('challenges')}
              >
                <Target className="w-4 h-4" />
                Challenges
              </Button>
            </div>
            
            <VitalityPoints />
          </div>
        )}

        {activeView === 'assessments' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Mental Health Assessments</h2>
            </div>
            
            {/* Vitality Sub-navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('vitality')}
              >
                <Trophy className="w-4 h-4" />
                Points
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('assessments')}
              >
                <ClipboardCheck className="w-4 h-4" />
                Assessments
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('challenges')}
              >
                <Target className="w-4 h-4" />
                Challenges
              </Button>
            </div>
            
            <MentalHealthAssessment />
          </div>
        )}

        {activeView === 'challenges' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Wellness Challenges</h2>
            </div>
            
            {/* Vitality Sub-navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('vitality')}
              >
                <Trophy className="w-4 h-4" />
                Points
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('assessments')}
              >
                <ClipboardCheck className="w-4 h-4" />
                Assessments
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveView('challenges')}
              >
                <Target className="w-4 h-4" />
                Challenges
              </Button>
            </div>
            
            <WellnessChallenges />
          </div>
        )}

        {activeView === 'wearables' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Wearable Devices</h2>
            </div>
            <WearableSync />
          </div>
        )}

        {activeView === 'therapists' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Find a Therapist</h2>
            </div>
            <TherapistNetwork />
          </div>
        )}

        {activeView === 'corporate' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <CorporateDashboard />
          </div>
        )}

        {activeView === 'community' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Community Events</h2>
            </div>
            <CommunityEvents />
          </div>
        )}

        {activeView === 'aicoach' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">AI Mental Health Coach</h2>
            </div>
            <AICoach />
          </div>
        )}

        {activeView === 'crisis' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Crisis Detection & Safety</h2>
            </div>
            <CrisisDetection />
          </div>
        )}

        {activeView === 'family' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">Family Wellness Hub</h2>
            </div>
            <FamilyWellnessHub />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
