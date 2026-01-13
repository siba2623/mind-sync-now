import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Heart, 
  Trophy, 
  Target, 
  Plus, 
  Crown,
  Shield,
  Eye,
  EyeOff,
  Bell,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Gift,
  MessageCircle,
  Calendar,
  Activity,
  AlertTriangle,
  UserPlus,
  Settings,
  Lock
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'adult' | 'teen' | 'child';
  avatar: string;
  age?: number;
  wellnessScore: number;
  moodToday?: number;
  streakDays: number;
  vitalityPoints: number;
  lastActive: string;
  parentalMonitoring?: boolean;
  consentGiven?: boolean;
}

interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'exercise' | 'gratitude' | 'sleep' | 'connection';
  target: number;
  progress: number;
  unit: string;
  deadline: string;
  participants: string[];
  reward: number;
  status: 'active' | 'completed' | 'upcoming';
}

interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  createdBy: string;
}

const MOCK_FAMILY: FamilyMember[] = [
  { id: '1', name: 'You', email: 'parent@family.com', role: 'admin', avatar: '👨', wellnessScore: 78, moodToday: 4, streakDays: 12, vitalityPoints: 4500, lastActive: 'Now' },
  { id: '2', name: 'Sarah', email: 'sarah@family.com', role: 'adult', avatar: '👩', wellnessScore: 82, moodToday: 5, streakDays: 8, vitalityPoints: 3200, lastActive: '2 hours ago' },
  { id: '3', name: 'Jake', email: 'jake@family.com', role: 'teen', avatar: '👦', age: 16, wellnessScore: 65, moodToday: 3, streakDays: 5, vitalityPoints: 1800, lastActive: 'Yesterday', parentalMonitoring: true, consentGiven: true },
  { id: '4', name: 'Emma', email: 'emma@family.com', role: 'teen', avatar: '👧', age: 14, wellnessScore: 71, moodToday: 4, streakDays: 15, vitalityPoints: 2100, lastActive: '3 hours ago', parentalMonitoring: true, consentGiven: true },
];

const MOCK_CHALLENGES: FamilyChallenge[] = [
  { id: '1', title: 'Family Meditation Week', description: 'Complete 7 days of meditation together', type: 'meditation', target: 7, progress: 4, unit: 'days', deadline: '2026-01-19', participants: ['1', '2', '3', '4'], reward: 500, status: 'active' },
  { id: '2', title: 'Gratitude Chain', description: 'Share one thing you\'re grateful for daily', type: 'gratitude', target: 14, progress: 14, unit: 'entries', deadline: '2026-01-10', participants: ['1', '2', '4'], reward: 300, status: 'completed' },
  { id: '3', title: 'Weekend Walk Challenge', description: 'Take a 30-min family walk this weekend', type: 'exercise', target: 1, progress: 0, unit: 'walks', deadline: '2026-01-18', participants: ['1', '2', '3', '4'], reward: 200, status: 'upcoming' },
];

const MOCK_GOALS: FamilyGoal[] = [
  { id: '1', title: 'Improve Family Communication', description: 'Have weekly family check-ins', targetDate: '2026-03-01', progress: 45, createdBy: 'You' },
  { id: '2', title: 'Screen-Free Dinners', description: 'No phones during dinner time', targetDate: '2026-02-01', progress: 70, createdBy: 'Sarah' },
];

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊'];


const FamilyWellnessHub = () => {
  const [family, setFamily] = useState<FamilyMember[]>(MOCK_FAMILY);
  const [challenges, setChallenges] = useState<FamilyChallenge[]>(MOCK_CHALLENGES);
  const [goals, setGoals] = useState<FamilyGoal[]>(MOCK_GOALS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('adult');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const { toast } = useToast();

  const familyWellnessAvg = Math.round(family.reduce((acc, m) => acc + m.wellnessScore, 0) / family.length);
  const totalFamilyPoints = family.reduce((acc, m) => acc + m.vitalityPoints, 0);

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" });
      return;
    }
    toast({
      title: "Invitation Sent! 📧",
      description: `An invitation has been sent to ${inviteEmail}`,
    });
    setInviteEmail('');
    setShowInvite(false);
  };

  const handleToggleMonitoring = (memberId: string) => {
    setFamily(family.map(m => {
      if (m.id === memberId) {
        const newState = !m.parentalMonitoring;
        toast({
          title: newState ? "Monitoring Enabled" : "Monitoring Disabled",
          description: newState 
            ? `You'll receive wellness updates for ${m.name}` 
            : `Monitoring disabled for ${m.name}`,
        });
        return { ...m, parentalMonitoring: newState };
      }
      return m;
    }));
  };

  const handleJoinChallenge = (challengeId: string) => {
    toast({
      title: "Joined Challenge! 🎯",
      description: "You've joined the family challenge. Let's do this together!",
    });
  };

  const getWellnessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return '🧘';
      case 'exercise': return '🏃';
      case 'gratitude': return '🙏';
      case 'sleep': return '😴';
      case 'connection': return '💬';
      default: return '⭐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Overview Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Family Wellness Hub</h2>
                <p className="text-muted-foreground">Connected through Discovery Health</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    {family.length} Members
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    {totalFamilyPoints.toLocaleString()} pts
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">Family Wellness Score</p>
              <p className={`text-4xl font-bold ${getWellnessColor(familyWellnessAvg)}`}>{familyWellnessAvg}</p>
              <Progress value={familyWellnessAvg} className="w-32 h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="monitoring">Teen Safety</TabsTrigger>
        </TabsList>

        {/* Family Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Family Members</h3>
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {showInvite && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Invite Family Member</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="Email address" 
                    value={inviteEmail} 
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="teen">Teen (13-17)</SelectItem>
                      <SelectItem value="child">Child (under 13)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite}>Send Invite</Button>
                  <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                </div>
                {inviteRole === 'teen' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Teen accounts include optional parental monitoring with consent
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {family.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{member.name}</p>
                          {member.role === 'admin' && <Crown className="w-4 h-4 text-amber-500" />}
                          {member.role === 'teen' && <Badge variant="secondary" className="text-xs">Teen</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.lastActive}</p>
                      </div>
                    </div>
                    {member.moodToday && (
                      <span className="text-2xl">{MOOD_EMOJIS[member.moodToday - 1]}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className={`text-lg font-bold ${getWellnessColor(member.wellnessScore)}`}>{member.wellnessScore}</p>
                      <p className="text-xs text-muted-foreground">Wellness</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-orange-500">{member.streakDays}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-amber-500">{member.vitalityPoints}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                  </div>

                  {member.role === 'teen' && member.parentalMonitoring && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                      <Eye className="w-3 h-3" />
                      Parental monitoring active (with consent)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Family Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Family Challenges</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </div>

          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={challenge.status === 'completed' ? 'bg-green-50/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getChallengeIcon(challenge.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <Badge variant={
                            challenge.status === 'completed' ? 'default' :
                            challenge.status === 'active' ? 'secondary' : 'outline'
                          }>
                            {challenge.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-100 text-amber-700">
                        <Gift className="w-3 h-3 mr-1" />
                        +{challenge.reward} pts
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.target} {challenge.unit}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {challenge.participants.slice(0, 4).map((pId) => {
                          const member = family.find(m => m.id === pId);
                          return member ? (
                            <div key={pId} className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs border-2 border-white">
                              {member.avatar}
                            </div>
                          ) : null;
                        })}
                      </div>
                      <span className="text-sm text-muted-foreground">{challenge.participants.length} participating</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(challenge.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Family Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Shared Family Goals</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant="outline">
                      <Target className="w-3 h-3 mr-1" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">Created by {goal.createdBy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Teen Safety / Parental Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Teen Mental Health Monitoring</h4>
                  <p className="text-sm text-blue-700">
                    Monitor your teen's wellness with their consent. This feature helps you stay informed 
                    about their mental health journey while respecting their privacy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {family.filter(m => m.role === 'teen').map((teen) => (
              <Card key={teen.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {teen.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{teen.name}</CardTitle>
                        <CardDescription>Age {teen.age} • {teen.lastActive}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Monitoring</span>
                      <Switch 
                        checked={teen.parentalMonitoring} 
                        onCheckedChange={() => handleToggleMonitoring(teen.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {teen.parentalMonitoring ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className={`text-2xl font-bold ${getWellnessColor(teen.wellnessScore)}`}>{teen.wellnessScore}</p>
                          <p className="text-xs text-muted-foreground">Wellness Score</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl">{teen.moodToday ? MOOD_EMOJIS[teen.moodToday - 1] : '—'}</p>
                          <p className="text-xs text-muted-foreground">Today's Mood</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-orange-500">{teen.streakDays}</p>
                          <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-500">Normal</p>
                          <p className="text-xs text-muted-foreground">Risk Level</p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Recent Activity
                        </h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>✓ Completed daily check-in</li>
                          <li>✓ 10-minute meditation session</li>
                          <li>✓ Joined family gratitude challenge</li>
                        </ul>
                      </div>

                      {teen.consentGiven && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                          <CheckCircle className="w-4 h-4" />
                          {teen.name} has consented to parental monitoring
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <EyeOff className="w-8 h-8 mx-auto mb-2" />
                      <p>Monitoring is disabled for {teen.name}</p>
                      <p className="text-sm">Enable to see wellness insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {family.filter(m => m.role === 'teen').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No teen members in your family</p>
                  <p className="text-sm text-muted-foreground">Invite teen family members to enable monitoring features</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyWellnessHub;
