import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Target, ShoppingBag, TrendingUp, Flame } from 'lucide-react';
import { StreakWidget } from '@/components/StreakWidget';
import { BadgeShowcase } from '@/components/BadgeShowcase';
import { LevelProgress } from '@/components/LevelProgress';
import { DailyChallenges } from '@/components/DailyChallenges';
import { RewardShop } from '@/components/RewardShop';
import { Leaderboard } from '@/components/Leaderboard';

const Achievements = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle mobile-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Achievements & Rewards
          </h1>
          <p className="text-muted-foreground">
            Track your progress, earn badges, and unlock exclusive rewards
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <StreakWidget />
          <LevelProgress />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <DailyChallenges />
          </TabsContent>

          <TabsContent value="badges">
            <BadgeShowcase />
          </TabsContent>

          <TabsContent value="shop">
            <RewardShop />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Achievements;
