import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Lock, Star } from 'lucide-react';
import { gamificationService, type UserBadge, type Badge as BadgeType } from '@/services/gamificationService';
import { useToast } from '@/hooks/use-toast';

export const BadgeShowcase = () => {
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const [earned, all] = await Promise.all([
        gamificationService.getUserBadges(),
        gamificationService.getAllBadges(),
      ]);
      setEarnedBadges(earned);
      setAllBadges(all);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShowcase = async (badgeId: string, currentState: boolean) => {
    try {
      await gamificationService.toggleBadgeShowcase(badgeId, !currentState);
      setEarnedBadges(prev =>
        prev.map(b =>
          b.badge_id === badgeId ? { ...b, is_showcased: !currentState } : b
        )
      );
      toast({
        title: currentState ? 'Badge Hidden' : 'Badge Showcased',
        description: currentState
          ? 'Badge removed from showcase'
          : 'Badge added to showcase',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update badge',
        variant: 'destructive',
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'from-blue-400 to-purple-500';
      case 'platinum':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-400 to-orange-500';
      case 'silver':
        return 'from-gray-300 to-gray-400';
      case 'bronze':
        return 'from-orange-700 to-orange-900';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'default';
      case 'platinum':
      case 'gold':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));
  const lockedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));

  const groupByCategory = (badges: BadgeType[]) => {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.category]) acc[badge.category] = [];
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, BadgeType[]>);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <CardTitle>Badge Collection</CardTitle>
          </div>
          <Badge variant="secondary">
            {earnedBadges.length} / {allBadges.length}
          </Badge>
        </div>
        <CardDescription>
          Earn badges by completing wellness activities
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="earned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned">
              Earned ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({lockedBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="space-y-4 mt-4">
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-sm">Complete activities to earn your first badge!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {earnedBadges.map(userBadge => (
                  <Card
                    key={userBadge.id}
                    className={`relative overflow-hidden border-2 ${
                      userBadge.is_showcased ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      {userBadge.is_showcased && (
                        <div className="absolute top-2 right-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                      
                      <div className="text-4xl mb-2">{userBadge.badge?.icon}</div>
                      
                      <h4 className="font-semibold text-sm mb-1">
                        {userBadge.badge?.name}
                      </h4>
                      
                      <Badge
                        variant={getTierBadgeVariant(userBadge.badge?.tier || '')}
                        className="text-xs mb-2"
                      >
                        {userBadge.badge?.tier}
                      </Badge>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        {userBadge.badge?.description}
                      </p>
                      
                      <Button
                        size="sm"
                        variant={userBadge.is_showcased ? 'default' : 'outline'}
                        className="w-full text-xs"
                        onClick={() =>
                          handleToggleShowcase(userBadge.badge_id, userBadge.is_showcased)
                        }
                      >
                        {userBadge.is_showcased ? 'Showcased' : 'Showcase'}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-6 mt-4">
            {Object.entries(groupByCategory(lockedBadges)).map(([category, badges]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 capitalize">
                  {category} Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map(badge => (
                    <Card key={badge.id} className="relative overflow-hidden opacity-60">
                      <CardContent className="p-4 text-center">
                        <div className="absolute top-2 right-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                        
                        <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                        
                        <Badge variant="outline" className="text-xs mb-2">
                          {badge.tier}
                        </Badge>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {badge.description}
                        </p>
                        
                        <div className="text-xs font-medium text-primary">
                          +{badge.points_reward} points
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {badge.requirement_type === 'streak' &&
                            `${badge.requirement_value} day streak`}
                          {badge.requirement_type === 'count' &&
                            `Complete ${badge.requirement_value} times`}
                          {badge.requirement_type === 'milestone' &&
                            `Reach milestone ${badge.requirement_value}`}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
