/**
 * Risk Assessment Widget
 * Displays user's current mental health risk level
 * Integrates with predictive hospitalization prevention system
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { riskPredictionService, type RiskLevel } from '@/services/riskPredictionService';
import { supabase } from '@/integrations/supabase/client';

export const RiskAssessmentWidget = () => {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('GREEN');
  const [confidence, setConfidence] = useState<number>(0);
  const [factors, setFactors] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAssessment, setLastAssessment] = useState<string>('');

  useEffect(() => {
    loadLatestAssessment();
  }, []);

  const loadLatestAssessment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get latest assessment from database
      const { data: assessment } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (assessment) {
        setRiskLevel(assessment.risk_level as RiskLevel);
        setConfidence(assessment.confidence_score);
        setFactors(assessment.contributing_factors || []);
        setRecommendations(assessment.recommended_actions || []);
        setLastAssessment(new Date(assessment.timestamp).toLocaleDateString());
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const runNewAssessment = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const assessment = await riskPredictionService.assessRisk(user.id);
      
      setRiskLevel(assessment.riskLevel);
      setConfidence(assessment.confidenceScore);
      setFactors(assessment.contributingFactors);
      setRecommendations(assessment.recommendedActions);
      setLastAssessment(new Date().toLocaleDateString());
    } catch (error) {
      console.error('Error running assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'RED': return 'bg-red-500';
      case 'ORANGE': return 'bg-orange-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'GREEN': return 'bg-green-500';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'RED': return <AlertTriangle className="w-5 h-5" />;
      case 'ORANGE': return <AlertTriangle className="w-5 h-5" />;
      case 'YELLOW': return <Info className="w-5 h-5" />;
      case 'GREEN': return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getRiskMessage = (level: RiskLevel) => {
    switch (level) {
      case 'RED': return 'High Risk - Immediate Support Recommended';
      case 'ORANGE': return 'Elevated Risk - Check-in Recommended';
      case 'YELLOW': return 'Moderate - Continue Monitoring';
      case 'GREEN': return 'Stable - Keep Up the Good Work';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Wellness Risk Assessment</CardTitle>
          </div>
          <Badge className={getRiskColor(riskLevel)}>
            {riskLevel}
          </Badge>
        </div>
        <CardDescription>
          AI-powered early warning system • Last updated: {lastAssessment}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Level Display */}
        <Alert className={`border-2 ${
          riskLevel === 'RED' ? 'border-red-200 bg-red-50' :
          riskLevel === 'ORANGE' ? 'border-orange-200 bg-orange-50' :
          riskLevel === 'YELLOW' ? 'border-yellow-200 bg-yellow-50' :
          'border-green-200 bg-green-50'
        }`}>
          <div className="flex items-center gap-2">
            {getRiskIcon(riskLevel)}
            <AlertDescription className="font-medium">
              {getRiskMessage(riskLevel)}
            </AlertDescription>
          </div>
        </Alert>

        {/* Confidence Score */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence Score:</span>
          <span className="font-medium">{(confidence * 100).toFixed(0)}%</span>
        </div>

        {/* Contributing Factors */}
        {factors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Contributing Factors:</h4>
            <ul className="text-sm space-y-1">
              {factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recommended Actions:</h4>
            <ul className="text-sm space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discovery Health Integration */}
        {(riskLevel === 'ORANGE' || riskLevel === 'RED') && (
          <Alert className="bg-purple-50 border-purple-200">
            <AlertDescription className="text-sm">
              <strong>Discovery Health Support:</strong> Your care coordinator has been notified 
              and will reach out within 2 hours. You can also call 0860 999 911 for immediate support.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={runNewAssessment} 
            disabled={loading}
            className="flex-1"
          >
            Run New Assessment
          </Button>
          {(riskLevel === 'ORANGE' || riskLevel === 'RED') && (
            <Button variant="destructive" className="flex-1">
              Get Help Now
            </Button>
          )}
        </div>

        {/* Vitality Points */}
        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          Regular assessments earn you <strong>10 Vitality points</strong> per week
        </div>
      </CardContent>
    </Card>
  );
};
