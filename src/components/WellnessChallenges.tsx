import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Calendar, Target, CheckCircle, Clock, Flame, Star } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'company';
  duration: string;
  goal: number;
  unit: string;
  points: number;
  icon: React.ReactNode;
  color: string;
  progress?: number;
  joined?: boolean;
  participants?: number;
  endDate?: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: '7day_mindfulness',
    title: '7-Day Mindfulness',
    description: 'Complete a meditation or breathing exercise every day for 7 days',
    type: 'individual',
    duration: '7 days',
    goal: 7,
    unit: 'sessions',
    points: 200,
    icon: <Target className="w-5 h-5" />,
    color: 'from-purple-500 to-indigo-500',
    participants: 1247,
  },
  {
    id: 'gratitude_week',
    title: 'Gratitude Week',
    description: 'Write in your journal about gratitude for 7 consecutive days',
    type: 'individual',
    duration: '7 days',
    goal: 7,
    unit: 'entries',
    points: 150,
    icon: <Star className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
    participants: 892,
  },
  {
    id: 'mood_tracker',
    title: 'Mood Master',
    description: 'Log your mood at least twice daily for 14 days',
    type: 'individual',
    duration: '14 days',
    goal: 28,
    unit: 'logs',
    points: 300,
    icon: <Flame className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-500',
    participants: 2103,
  },
  {
    id: 'team_wellness',
    title: 'Team Wellness Week',
    description: 'Your team collectively completes 100 wellness activities',
    type: 'team',
    duration: '7 days',
    goal: 100,
    unit: 'activities',
    points: 500,
    icon: <Users className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-500',
    participants: 45,
  },
  {
    id: 'company_mental_health',
    title: 'Mental Health Month',
    description: 'Company-wide challenge: 10,000 collective check-ins',
    type: 'company',
    duration: '30 days',
    goal: 10000,
    unit: 'check-ins',
    points: 1000,
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-500',
    participants: 3421,
  },
];

const WellnessChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('available');
  const { toast } = useToast();

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, joined: true, progress: 0 } : c
    ));
    toast({
      title: "Challenge Joined! 🎯",
      description: "Good luck! Complete the challenge to earn bonus points.",
    });
  };

  const activeChallenges = challenges.filter(c => c.joined && (c.progress || 0) < c.goal);
  const availableChallenges = challenges.filter(c => !c.joined);
  const completedChallenges = challenges.filter(c => c.joined && (c.progress || 0) >= c.goal);

  const displayChallenges = activeTab === 'active' ? activeChallenges 
    : activeTab === 'completed' ? completedChallenges 
    : availableChallenges;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{activeChallenges.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{completedChallenges.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {completedChallenges.reduce((sum, c) => sum + c.points, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Points Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['available', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'active' && activeChallenges.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeChallenges.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {displayChallenges.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">
              {activeTab === 'active' ? 'No Active Challenges' : 
               activeTab === 'completed' ? 'No Completed Challenges Yet' : 
               'All Challenges Joined!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'available' 
                ? 'Check back later for new challenges' 
                : 'Join a challenge to get started'}
            </p>
          </Card>
        ) : (
          displayChallenges.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${challenge.color}`} />
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {challenge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {challenge.type === 'individual' ? 'Solo' : 
                         challenge.type === 'team' ? 'Team' : 'Company'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {challenge.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {challenge.goal} {challenge.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {challenge.participants?.toLocaleString()} joined
                      </span>
                    </div>

                    {challenge.joined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{challenge.progress || 0} / {challenge.goal}</span>
                        </div>
                        <Progress value={((challenge.progress || 0) / challenge.goal) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <Trophy className="w-3 h-3 mr-1" />
                        {challenge.points} points
                      </Badge>
                      
                      {!challenge.joined ? (
                        <Button size="sm" onClick={() => joinChallenge(challenge.id)}>
                          Join Challenge
                        </Button>
                      ) : (challenge.progress || 0) >= challenge.goal ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WellnessChallenges;
