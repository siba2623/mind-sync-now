import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Zap,
  AlertCircle,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { moodPatternAnalysisService, type MoodAnalysis } from '@/services/moodPatternAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const MoodPatternInsights = () => {
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 60 | 90>(30);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalysis();
  }, [selectedPeriod]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await moodPatternAnalysisService.analyzeMoodPatterns(
        user.id,
        selectedPeriod
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Error loading mood analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mood insights',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing your mood patterns...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const getTrendIcon = () => {
    switch (analysis.trend.direction) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (analysis.trend.direction) {
      case 'improving':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'declining':
        return 'from-red-50 to-orange-50 border-red-200';
      default:
        return 'from-blue-50 to-cyan-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant={selectedPeriod === 30 ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod(30)}
        >
          30 Days
        </Button>
        <Button
          size="sm"
          variant={selectedPeriod === 60 ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod(60)}
        >
          60 Days
        </Button>
        <Button
          size="sm"
          variant={selectedPeriod === 90 ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod(90)}
        >
          90 Days
        </Button>
      </div>

      {/* Trend Overview */}
      <Card className={`border-2 bg-gradient-to-br ${getTrendColor()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTrendIcon()}
              <div>
                <CardTitle className="text-lg">Mood Trend</CardTitle>
                <CardDescription className="capitalize">
                  {analysis.trend.direction}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {Math.round(analysis.trend.confidence * 100)}% confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={analysis.trend.confidence * 100} 
            className="h-2 mb-2"
          />
          <p className="text-sm text-muted-foreground">
            {analysis.trend.direction === 'improving' && 
              'Your mood has been steadily improving. Keep up the positive momentum!'}
            {analysis.trend.direction === 'declining' && 
              'Your mood has been declining. Consider reaching out to your support network.'}
            {analysis.trend.direction === 'stable' && 
              'Your mood has been relatively stable. Continue your current wellness practices.'}
          </p>
        </CardContent>
      </Card>

      {/* Cycles Detected */}
      {analysis.cycles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-base md:text-lg">Mood Cycles Detected</CardTitle>
            </div>
            <CardDescription>
              Recurring patterns in your mood
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.cycles.map((cycle, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {cycle.period}-Day Cycle
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(cycle.confidence * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Amplitude: {cycle.amplitude.toFixed(2)} • 
                    Phase: {Math.round(cycle.phase * cycle.period)} days into cycle
                  </p>
                  <p className="text-xs mt-2">
                    {cycle.period === 7 && 'Weekly pattern - plan self-care for low days'}
                    {cycle.period === 28 && 'Monthly pattern - track hormonal or environmental factors'}
                    {cycle.period === 30 && 'Monthly pattern - consider lifestyle factors'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triggers */}
      {analysis.triggers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-base md:text-lg">Mood Triggers</CardTitle>
            </div>
            <CardDescription>
              Factors that influence your mood
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.triggers.slice(0, 6).map((trigger, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    trigger.impact === 'positive' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium">{trigger.trigger}</span>
                    <Badge 
                      variant={trigger.impact === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {trigger.impact === 'positive' ? '+' : '-'}
                      {Math.abs(Math.round(trigger.correlation * 100))}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Occurs {Math.round(trigger.frequency * 100)}% of the time
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patterns & Anomalies */}
      {analysis.patterns.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-base md:text-lg">Notable Patterns</CardTitle>
            </div>
            <CardDescription>
              Important observations from your mood data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.patterns.map((pattern, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{pattern.description}</p>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      {Math.round(pattern.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions */}
      {analysis.predictions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base md:text-lg">7-Day Forecast</CardTitle>
            </div>
            <CardDescription>
              Predicted mood based on your patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.predictions.map((pred, index) => {
                const date = new Date(pred.date);
                const moodEmoji = pred.predictedMood >= 4 ? '😊' : 
                                 pred.predictedMood >= 3 ? '😐' : '😔';
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{moodEmoji}</span>
                      <div>
                        <p className="text-sm font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Range: {pred.range.min.toFixed(1)} - {pred.range.max.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{pred.predictedMood.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(pred.confidence * 100)}% sure
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base md:text-lg">Personalized Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={loadAnalysis}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
};
