import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, Lightbulb, Target, Sparkles, Calendar } from 'lucide-react';
import { mentalHealthTwinService, type TwinProfile, type PatternInsight, type UserCorrelation, type PersonalPrediction, type InterventionEffectiveness } from '@/services/mentalHealthTwin';
import { supabase } from '@/integrations/supabase/client';

export default function MentalHealthTwin() {
  const [profile, setProfile] = useState<TwinProfile | null>(null);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [correlations, setCorrelations] = useState<UserCorrelation[]>([]);
  const [predictions, setPredictions] = useState<PersonalPrediction[]>([]);
  const [interventions, setInterventions] = useState<InterventionEffectiveness[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadTwinData();
  }, []);

  const loadTwinData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Get or initialize twin profile
      let twinProfile = await mentalHealthTwinService.getTwinProfile(user.id);
      if (!twinProfile) {
        twinProfile = await mentalHealthTwinService.initializeTwin(user.id);
      }
      
      // If still no profile, it means tables don't exist
      if (!twinProfile) {
        console.error('Mental Health Twin tables not found. Please run the migration.');
        setLoading(false);
        return;
      }
      
      setProfile(twinProfile);

      // Load all twin data
      const [insightsData, correlationsData, predictionsData, interventionsData] = await Promise.all([
        mentalHealthTwinService.getInsights(user.id),
        mentalHealthTwinService.getCorrelations(user.id),
        mentalHealthTwinService.getPredictions(user.id),
        mentalHealthTwinService.getInterventionEffectiveness(user.id)
      ]);

      setInsights(insightsData);
      setCorrelations(correlationsData);
      setPredictions(predictionsData);
      setInterventions(interventionsData);
    } catch (error) {
      console.error('Error loading twin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = async () => {
    if (!userId) return;
    setLoading(true);
    await mentalHealthTwinService.analyzeAndGenerateInsights(userId);
    await loadTwinData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your Mental Health Twin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertDescription>
          <div className="space-y-4">
            <p className="font-medium">Mental Health Twin Setup Required</p>
            <p className="text-sm">
              The Mental Health Twin feature requires database setup. Please run the migration SQL in your Supabase dashboard.
            </p>
            <div className="bg-white p-4 rounded border text-xs font-mono">
              <p className="font-bold mb-2">Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Click "SQL Editor" in the left sidebar</li>
                <li>Open the file: <code className="bg-gray-100 px-1">RUN_MENTAL_HEALTH_TWIN_MIGRATION.sql</code></li>
                <li>Copy and paste the SQL into the editor</li>
                <li>Click "Run" to execute</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Your Mental Health Twin</CardTitle>
                <CardDescription>
                  AI-powered personalized insights based on your unique patterns
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {Math.round(profile.profileCompleteness * 100)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Profile Completeness</span>
                <span className="font-medium">{profile.dataPointsCollected} data points</span>
              </div>
              <Progress value={profile.profileCompleteness * 100} className="h-2" />
            </div>

            {profile.profileCompleteness < 0.3 && (
              <Alert>
                <Sparkles className="w-4 h-4" />
                <AlertDescription>
                  Keep tracking your mood and activities! Your Twin gets smarter with more data.
                  {profile.dataPointsCollected < 10 && ` You need ${10 - profile.dataPointsCollected} more entries to unlock insights.`}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile.insightsGenerated}</div>
                <div className="text-sm text-muted-foreground">Insights</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile.predictionsMade}</div>
                <div className="text-sm text-muted-foreground">Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {profile.predictionAccuracyAvg ? `${Math.round(profile.predictionAccuracyAvg * 100)}%` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Calendar className="w-4 h-4 mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="correlations">
            <TrendingUp className="w-4 h-4 mr-2" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="interventions">
            <Target className="w-4 h-4 mr-2" />
            What Works
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No insights yet. Keep tracking to unlock personalized insights!
                  </p>
                  <button
                    onClick={analyzePatterns}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Analyze My Patterns
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="mt-2">{insight.description}</CardDescription>
                    </div>
                    <Badge variant={insight.confidenceScore > 0.7 ? 'default' : 'secondary'}>
                      {Math.round(insight.confidenceScore * 100)}% confident
                    </Badge>
                  </div>
                </CardHeader>
                {insight.actionableRecommendation && (
                  <CardContent>
                    <Alert>
                      <Target className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Recommendation:</strong> {insight.actionableRecommendation}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No predictions available yet. Your Twin needs more data to make accurate predictions.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {new Date(prediction.predictionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <CardDescription>
                        Predicted {prediction.predictionType}: {prediction.predictedCategory || prediction.predictedValue}
                      </CardDescription>
                    </div>
                    <Badge variant={prediction.confidenceLevel > 0.7 ? 'default' : 'secondary'}>
                      {Math.round(prediction.confidenceLevel * 100)}% confident
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prediction.contributingFactors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Contributing Factors:</h4>
                      <ul className="space-y-1">
                        {prediction.contributingFactors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {factor.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {prediction.recommendedActions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions:</h4>
                      <div className="space-y-2">
                        {prediction.recommendedActions.map((action, idx) => (
                          <Alert key={idx}>
                            <AlertDescription>
                              <strong>{action.priority.toUpperCase()}:</strong> {action.action}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-4">
          {correlations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No patterns discovered yet. Keep tracking to find your unique correlations!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            correlations.map((correlation) => (
              <Card key={correlation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg capitalize">
                        {correlation.factorType} → {correlation.outcomeType}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {correlation.effectDescription}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {correlation.correlationCoefficient > 0 ? '+' : ''}
                        {correlation.correlationCoefficient.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {correlation.sampleSize} samples
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-4">
          {interventions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No intervention data yet. Try different coping strategies to see what works best for you!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            interventions.map((intervention) => (
              <Card key={intervention.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{intervention.interventionName}</CardTitle>
                      <CardDescription className="mt-2 capitalize">
                        {intervention.interventionType} • Used {intervention.timesUsed} times
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(intervention.effectivenessRate * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">effective</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Mood Improvement:</span>
                      <span className="font-medium">+{intervention.avgMoodImprovement.toFixed(1)} points</span>
                    </div>
                    {intervention.bestTimeOfDay && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Time:</span>
                        <span className="font-medium capitalize">{intervention.bestTimeOfDay}</span>
                      </div>
                    )}
                    {intervention.bestContext && intervention.bestContext.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Works Best When:</span>
                        <span className="font-medium capitalize">{intervention.bestContext.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
