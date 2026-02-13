import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, TrendingUp, RefreshCw } from 'lucide-react';
import { gamificationService, type LeaderboardEntry } from '@/services/gamificationService';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [board, rank] = await Promise.all([
        gamificationService.getLeaderboard(10),
        gamificationService.getMyLeaderboardRank(),
      ]);
      
      setLeaderboard(board);
      setMyRank(rank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await gamificationService.refreshLeaderboard();
      await loadLeaderboard();
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-600 to-orange-700';
    return 'from-blue-500 to-cyan-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle>Weekly Leaderboard</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Top performers this week
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* My Rank */}
        {myRank && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    #{myRank.rank}
                  </div>
                  <div>
                    <p className="font-semibold">Your Rank</p>
                    <p className="text-sm text-muted-foreground">
                      Level {myRank.current_level} • {myRank.current_streak} day streak
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">{myRank.weekly_points.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">points this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 10 */}
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const isTopThree = entry.rank <= 3;
            
            return (
              <Card
                key={entry.user_id}
                className={`${
                  isTopThree
                    ? `border-2 bg-gradient-to-r ${getRankColor(entry.rank)} bg-opacity-10`
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          isTopThree
                            ? `bg-gradient-to-br ${getRankColor(entry.rank)} text-white`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {getRankIcon(entry.rank) || `#${entry.rank}`}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {entry.rank === 1 && '👑 '}
                          User #{entry.user_id.slice(0, 8)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Level {entry.current_level}
                          </Badge>
                          {entry.current_streak > 0 && (
                            <span className="flex items-center gap-1">
                              🔥 {entry.current_streak} days
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-bold text-lg">
                          {entry.weekly_points.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No leaderboard data yet</p>
            <p className="text-sm">Be the first to earn points this week!</p>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Leaderboard resets every Monday at midnight. Keep earning points to climb the ranks! 🚀
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
