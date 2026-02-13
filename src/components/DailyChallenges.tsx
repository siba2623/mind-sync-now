import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, Clock, Trophy } from 'lucide-react';
import { gamificationService, type UserChallenge, type Challenge } from '@/services/gamificationService';
import { useToast } from '@/hooks/use-toast';

export const DailyChallenges = () => {
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const [active, available] = await Promise.all([
        gamificationService.getUserChallenges(),
        gamificationService.getActiveChallenges(),
      ]);
      
      setUserChallenges(active);
      
      // Filter out challenges user is already doing
      const activeChallengeIds = new Set(active.map(c => c.challenge_id));
      const availableFiltered = available.filter(c => !activeChallengeIds.has(c.id));
      setAvailableChallenges(availableFiltered);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await gamificationService.startChallenge(challengeId);
      await loadChallenges();
      toast({
        title: '🎯 Challenge Started!',
        description: 'Good luck! You can do this!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start challenge',
        variant: 'destructive',
      });
    }
  };

  const getChallengeIcon = (category: string) => {
    const icons: Record<string, string> = {
      mood: '😊',
      meditation: '🧘',
      activity: '🏃',
      journal: '📝',
      breathing: '🌬️',
      social: '👥',
      wellness: '💚',
    };
    return icons[category] || '🎯';
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500';
      case 'weekly':
        return 'bg-purple-500';
      case 'special':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (challenge: UserChallenge) => {
    if (!challenge.challenge) return 0;
    return (challenge.current_progress / challenge.challenge.requirement_value) * 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyChallenges = userChallenges.filter(c => c.challenge?.challenge_type === 'daily');
  const weeklyChallenges = userChallenges.filter(c => c.challenge?.challenge_type === 'weekly');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Active Challenges</CardTitle>
          </div>
          <Badge variant="secondary">
            {userChallenges.length} Active
          </Badge>
        </div>
        <CardDescription>
          Complete challenges to earn bonus points
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Daily Challenges */}
        {dailyChallenges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold">Daily Challenges</h3>
              <Badge variant="outline" className="text-xs">
                Resets at midnight
              </Badge>
            </div>
            <div className="space-y-3">
              {dailyChallenges.map(userChallenge => (
                <Card key={userChallenge.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getChallengeIcon(userChallenge.challenge?.category || '')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {userChallenge.challenge?.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {userChallenge.challenge?.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getChallengeTypeColor('daily')}>
                        +{userChallenge.challenge?.points_reward} pts
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {userChallenge.current_progress} /{' '}
                          {userChallenge.challenge?.requirement_value}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(userChallenge)} className="h-2" />
                    </div>

                    {userChallenge.is_completed && (
                      <div className="mt-3 flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Challenges */}
        {weeklyChallenges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold">Weekly Challenges</h3>
              <Badge variant="outline" className="text-xs">
                Resets Monday
              </Badge>
            </div>
            <div className="space-y-3">
              {weeklyChallenges.map(userChallenge => (
                <Card key={userChallenge.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getChallengeIcon(userChallenge.challenge?.category || '')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {userChallenge.challenge?.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {userChallenge.challenge?.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getChallengeTypeColor('weekly')}>
                        +{userChallenge.challenge?.points_reward} pts
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {userChallenge.current_progress} /{' '}
                          {userChallenge.challenge?.requirement_value}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(userChallenge)} className="h-2" />
                    </div>

                    {userChallenge.is_completed && (
                      <div className="mt-3 flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Active Challenges */}
        {userChallenges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active challenges</p>
            <p className="text-sm">Start a challenge below to earn bonus points!</p>
          </div>
        )}

        {/* Available Challenges */}
        {availableChallenges.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Available Challenges</h3>
            <div className="space-y-3">
              {availableChallenges.slice(0, 3).map(challenge => (
                <Card key={challenge.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">{getChallengeIcon(challenge.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{challenge.title}</h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getChallengeTypeColor(challenge.challenge_type)}`}
                            >
                              {challenge.challenge_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>+{challenge.points_reward} points</span>
                            <span>•</span>
                            <span>
                              {challenge.requirement_type === 'count' &&
                                `Complete ${challenge.requirement_value} times`}
                              {challenge.requirement_type === 'duration' &&
                                `${challenge.requirement_value} minutes`}
                              {challenge.requirement_type === 'streak' &&
                                `${challenge.requirement_value} day streak`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartChallenge(challenge.id)}
                      >
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
