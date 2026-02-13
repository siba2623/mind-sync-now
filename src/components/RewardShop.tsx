import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Sparkles, Check, Coins } from 'lucide-react';
import { gamificationService, type Reward, type UserReward } from '@/services/gamificationService';
import { useToast } from '@/hooks/use-toast';

export const RewardShop = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      const [available, purchased, profile] = await Promise.all([
        gamificationService.getAvailableRewards(),
        gamificationService.getUserRewards(),
        gamificationService.getGamificationProfile(),
      ]);
      
      setRewards(available);
      setUserRewards(purchased);
      setUserPoints(profile?.total_points || 0);
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (rewardId: string) => {
    setPurchasing(rewardId);
    try {
      await gamificationService.purchaseReward(rewardId);
      await loadShopData();
      toast({
        title: '🎉 Reward Purchased!',
        description: 'Your reward has been added to your collection',
      });
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase reward',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      theme: '🎨',
      avatar: '🎭',
      feature: '⚡',
      charity: '❤️',
      premium: '👑',
    };
    return icons[category] || '🎁';
  };

  const groupByCategory = (items: Reward[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, Reward[]>);
  };

  const canAfford = (cost: number) => userPoints >= cost;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const purchasedRewardIds = new Set(userRewards.map(r => r.reward_id));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <CardTitle>Reward Shop</CardTitle>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <Coins className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{userPoints.toLocaleString()}</span>
          </div>
        </div>
        <CardDescription>
          Spend your points on exclusive rewards
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="shop" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shop">
              Shop ({rewards.length})
            </TabsTrigger>
            <TabsTrigger value="owned">
              Owned ({userRewards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-6 mt-4">
            {Object.entries(groupByCategory(rewards)).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <h3 className="text-sm font-semibold capitalize">{category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(reward => {
                    const owned = purchasedRewardIds.has(reward.id);
                    const affordable = canAfford(reward.cost_points);
                    const outOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;

                    return (
                      <Card
                        key={reward.id}
                        className={`relative ${
                          owned ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''
                        } ${!affordable && !owned ? 'opacity-60' : ''}`}
                      >
                        <CardContent className="p-4">
                          {owned && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="default" className="gap-1">
                                <Check className="w-3 h-3" />
                                Owned
                              </Badge>
                            </div>
                          )}

                          <div className="text-4xl mb-3">{reward.icon || getCategoryIcon(reward.category)}</div>

                          <h4 className="font-semibold mb-1">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {reward.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-primary" />
                              <span className="font-bold text-primary">
                                {reward.cost_points.toLocaleString()}
                              </span>
                            </div>

                            {reward.stock_quantity !== null && (
                              <Badge variant="outline" className="text-xs">
                                {reward.stock_quantity} left
                              </Badge>
                            )}
                          </div>

                          <Button
                            className="w-full mt-3"
                            disabled={owned || !affordable || outOfStock || purchasing === reward.id}
                            onClick={() => handlePurchase(reward.id)}
                          >
                            {purchasing === reward.id ? (
                              'Purchasing...'
                            ) : owned ? (
                              'Owned'
                            ) : outOfStock ? (
                              'Out of Stock'
                            ) : !affordable ? (
                              `Need ${(reward.cost_points - userPoints).toLocaleString()} more`
                            ) : (
                              'Purchase'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            {rewards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rewards available</p>
                <p className="text-sm">Check back later for new items!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="space-y-4 mt-4">
            {userRewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rewards owned yet</p>
                <p className="text-sm">Purchase rewards from the shop to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRewards.map(userReward => (
                  <Card key={userReward.id} className="border-2 border-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl">
                          {userReward.reward?.icon || getCategoryIcon(userReward.reward?.category || '')}
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>

                      <h4 className="font-semibold mb-1">{userReward.reward?.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {userReward.reward?.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Purchased {new Date(userReward.purchased_at).toLocaleDateString()}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {userReward.reward?.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Earn More Points CTA */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Need More Points?</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Complete daily check-ins, challenges, and wellness activities to earn more points!
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white dark:bg-gray-800 rounded">
              <span className="font-bold text-primary">+10</span> Daily check-in
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded">
              <span className="font-bold text-primary">+20</span> Daily challenge
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
