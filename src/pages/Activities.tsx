import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Wind, 
  Brain, 
  Heart, 
  Calendar,
  BookOpen,
  Shield,
  Moon,
  Target,
  LogOut,
  Play,
  Clock,
  Sparkles
} from "lucide-react";
import IconWrapper from "@/components/ui/icon-wrapper";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";
import DailyCheckin from "@/components/DailyCheckin";
import BreathingExercise from "@/components/BreathingExercise";
import MeditationTimer from "@/components/MeditationTimer";
import CrisisSupport from "@/components/CrisisSupport";

interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: any;
  color: string;
  benefits: string[];
  component?: string;
}

const wellnessActivities: WellnessActivity[] = [
  {
    id: 'daily-checkin',
    title: 'Daily Check-in',
    description: 'Comprehensive mood and wellness assessment to track your emotional state',
    duration: '5-10 minutes',
    category: 'Assessment',
    icon: Calendar,
    color: 'bg-blue-500',
    benefits: ['Self-awareness', 'Mood tracking', 'Pattern recognition'],
    component: 'checkin'
  },
  {
    id: 'breathing-exercise',
    title: 'Breathing Exercises',
    description: 'Guided breathing patterns to reduce stress and promote relaxation',
    duration: '3-15 minutes',
    category: 'Mindfulness',
    icon: Wind,
    color: 'bg-green-500',
    benefits: ['Stress reduction', 'Anxiety relief', 'Better focus'],
    component: 'breathing'
  },
  {
    id: 'meditation-timer',
    title: 'Meditation Timer',
    description: 'Guided meditation sessions with various techniques and ambient sounds',
    duration: '5-60 minutes',
    category: 'Mindfulness',
    icon: Brain,
    color: 'bg-purple-500',
    benefits: ['Mental clarity', 'Emotional balance', 'Inner peace'],
    component: 'meditation'
  },
  {
    id: 'crisis-support',
    title: 'Crisis Support',
    description: 'Immediate access to mental health crisis resources and helplines',
    duration: 'As needed',
    category: 'Support',
    icon: Shield,
    color: 'bg-red-500',
    benefits: ['Immediate help', 'Professional support', 'Safety resources'],
    component: 'crisis'
  },
  {
    id: 'sleep-tracker',
    title: 'Sleep Tracking',
    description: 'Monitor your sleep patterns and quality for better rest',
    duration: '2-3 minutes',
    category: 'Health',
    icon: Moon,
    color: 'bg-indigo-500',
    benefits: ['Better sleep', 'Health insights', 'Recovery tracking']
  },
  {
    id: 'journal',
    title: 'Wellness Journal',
    description: 'Express your thoughts and feelings through guided journaling',
    duration: '10-20 minutes',
    category: 'Reflection',
    icon: BookOpen,
    color: 'bg-orange-500',
    benefits: ['Emotional processing', 'Self-reflection', 'Stress relief']
  },
  {
    id: 'goals',
    title: 'Wellness Goals',
    description: 'Set and track personal wellness and mental health goals',
    duration: '5-15 minutes',
    category: 'Growth',
    icon: Target,
    color: 'bg-pink-500',
    benefits: ['Motivation', 'Progress tracking', 'Personal growth']
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: 'Daily gratitude exercises to improve mood and perspective',
    duration: '3-5 minutes',
    category: 'Positivity',
    icon: Heart,
    color: 'bg-rose-500',
    benefits: ['Positive mindset', 'Improved mood', 'Life satisfaction']
  }
];

const Activities = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<string>('overview');
  const [stats, setStats] = useState({
    completedToday: 0,
    weeklyStreak: 0,
    totalSessions: 0
  });
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
      const today = new Date().toISOString().split('T')[0];
      
      // Count today's activities
      const [checkinData, breathingData, meditationData] = await Promise.all([
        supabase
          .from('daily_checkins')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today),
        supabase
          .from('breathing_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today),
        supabase
          .from('meditation_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today)
      ]);

      const completedToday = (checkinData.data?.length || 0) + 
                            (breathingData.data?.length || 0) + 
                            (meditationData.data?.length || 0);

      setStats({
        completedToday,
        weeklyStreak: 7, // Placeholder
        totalSessions: completedToday * 5 // Placeholder
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'checkin':
        return <DailyCheckin onComplete={() => setActiveView('overview')} />;
      case 'breathing':
        return <BreathingExercise />;
      case 'meditation':
        return <MeditationTimer />;
      case 'crisis':
        return <CrisisSupport />;
      default:
        return null;
    }
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
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <IconWrapper icon={ArrowLeft} variant="minimal" size="sm" color="primary" />
                  Dashboard
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {activeView === 'overview' ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Wellness Activities</h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive tools for your mental health and wellbeing journey
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3">
                    <IconWrapper icon={Sparkles} variant="soft" size="lg" color="primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{stats.completedToday}</div>
                  <div className="text-sm text-muted-foreground">Activities Today</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3">
                    <IconWrapper icon={Target} variant="soft" size="lg" color="success" />
                  </div>
                  <div className="text-2xl font-bold text-green-500 mb-1">{stats.weeklyStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3">
                    <IconWrapper icon={Clock} variant="soft" size="lg" color="info" />
                  </div>
                  <div className="text-2xl font-bold text-blue-500 mb-1">{stats.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </CardContent>
              </Card>
            </div>

            {/* Activities Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wellnessActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <Card 
                    key={activity.id} 
                    className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => activity.component && setActiveView(activity.component)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <IconWrapper 
                          icon={Icon} 
                          variant="default" 
                          size="md" 
                          color={activity.id === 'daily-checkin' ? 'info' : 
                                 activity.id === 'breathing' ? 'success' : 
                                 activity.id === 'meditation' ? 'secondary' : 
                                 activity.id === 'crisis' ? 'danger' : 'primary'} 
                        />
                        <div>
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {activity.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {activity.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {activity.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Benefits:</div>
                        <div className="flex flex-wrap gap-1">
                          {activity.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {activity.component && (
                        <Button 
                          className="w-full mt-4 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveView(activity.component!);
                          }}
                        >
                          <IconWrapper icon={Play} variant="minimal" size="sm" color="primary" />
                          Start Activity
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Access */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>
                  Jump into your most-used wellness activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="gap-2 h-auto p-4 flex-col"
                    onClick={() => setActiveView('checkin')}
                  >
                    <IconWrapper icon={Calendar} variant="soft" size="lg" color="info" />
                    <span>Daily Check-in</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2 h-auto p-4 flex-col"
                    onClick={() => setActiveView('breathing')}
                  >
                    <IconWrapper icon={Wind} variant="soft" size="lg" color="success" />
                    <span>Quick Breathing</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2 h-auto p-4 flex-col"
                    onClick={() => setActiveView('meditation')}
                  >
                    <IconWrapper icon={Brain} variant="soft" size="lg" color="secondary" />
                    <span>5-Min Meditation</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2 h-auto p-4 flex-col border-red-200 hover:bg-red-50"
                    onClick={() => setActiveView('crisis')}
                  >
                    <Shield className="w-6 h-6 text-red-500" />
                    <span>Crisis Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('overview')}>
                ← Back to Activities
              </Button>
            </div>
            {renderActiveView()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
