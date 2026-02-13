import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { crisisDetectionService } from '@/services/crisisDetectionService';
import { supabase } from '@/integrations/supabase/client';

export const CrisisDetectionMonitor = () => {
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [crisisResources] = useState(crisisDetectionService.getCrisisResources());

  useEffect(() => {
    loadRecentDetections();
  }, []);

  const loadRecentDetections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('crisis_detections')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(5);

      setRecentDetections(data || []);
    } catch (error) {
      console.error('Error loading detections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'moderate':
      case 'low':
        return <Clock className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Crisis Resources - Always Visible */}
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <CardTitle className="text-base md:text-lg">24/7 Crisis Support</CardTitle>
          </div>
          <CardDescription>
            Immediate help is always available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crisisResources.map((resource, index) => (
              <div 
                key={index}
                className="p-3 md:p-4 bg-white rounded-lg border border-red-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{resource.name}</h4>
                  <Badge variant="destructive" className="text-xs">
                    {resource.available}
                  </Badge>
                </div>
                <a 
                  href={`tel:${resource.phone}`}
                  className="flex items-center gap-2 text-red-600 font-bold text-lg mb-2 hover:text-red-700"
                >
                  <Phone className="w-4 h-4" />
                  {resource.phone}
                </a>
                <p className="text-xs text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>

          <Alert className="mt-4 border-red-300 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-sm">
              <strong>If you're in immediate danger:</strong> Call 112 (Emergency Services) or go to your nearest hospital emergency room.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Safety Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base md:text-lg">Safety Monitoring</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <CardDescription>
            We monitor your wellbeing to provide timely support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                <p className="text-xs text-muted-foreground">
                  Our AI analyzes your journal entries, mood patterns, and interactions to detect signs of distress. 
                  If we're concerned, we'll reach out with support resources and alert your care team if needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Your Privacy</h4>
                <p className="text-xs text-muted-foreground">
                  Crisis detection is designed to keep you safe. Only in critical situations will we alert your 
                  emergency contacts or care coordinator. You're always in control.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Monitoring Activity */}
      {recentDetections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Wellbeing Checks</CardTitle>
            <CardDescription>
              Last 5 automated safety assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDetections.map((detection, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getLevelColor(detection.crisis_level)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(detection.crisis_level)}
                      <span className="font-semibold text-sm capitalize">
                        {detection.crisis_level} Level
                      </span>
                    </div>
                    <span className="text-xs">
                      {new Date(detection.detected_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs">
                    Confidence: {Math.round(detection.confidence * 100)}%
                  </p>
                  {detection.triggers && detection.triggers.length > 0 && (
                    <p className="text-xs mt-1">
                      Factors: {detection.triggers.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Additional Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('/crisis-support', '_blank')}
            >
              <span>Crisis Support Resources</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('/therapists', '_blank')}
            >
              <span>Find a Therapist</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('/community', '_blank')}
            >
              <span>Support Groups</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
