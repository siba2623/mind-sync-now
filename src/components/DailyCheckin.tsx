import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { gamificationService } from '@/services/gamificationService';
import { 
  Heart, 
  Brain, 
  Zap, 
  Moon, 
  Users, 
  Target,
  CheckCircle,
  Calendar
} from 'lucide-react';
import IconWrapper from '@/components/ui/icon-wrapper';

interface CheckinData {
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  social: number;
  productivity: number;
  gratitude: string;
  challenges: string;
  goals: string;
  notes: string;
}

const DailyCheckin = ({ onComplete }: { onComplete?: () => void }) => {
  const [checkinData, setCheckinData] = useState<CheckinData>({
    mood: 5,
    energy: 5,
    stress: 5,
    sleep: 5,
    social: 5,
    productivity: 5,
    gratitude: '',
    challenges: '',
    goals: '',
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const steps = [
    {
      title: "How are you feeling?",
      description: "Rate different aspects of your wellbeing",
      component: "ratings"
    },
    {
      title: "Reflect on your day",
      description: "Take a moment for mindful reflection",
      component: "reflection"
    },
    {
      title: "Set intentions",
      description: "What do you want to focus on?",
      component: "intentions"
    }
  ];

  const handleSliderChange = (field: keyof CheckinData, value: number[]) => {
    setCheckinData(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleTextChange = (field: keyof CheckinData, value: string) => {
    setCheckinData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save to daily_checkins table
      const { error } = await supabase
        .from('daily_checkins')
        .insert([{
          user_id: user.id,
          mood_score: checkinData.mood,
          energy_score: checkinData.energy,
          stress_score: checkinData.stress,
          sleep_score: checkinData.sleep,
          social_score: checkinData.social,
          productivity_score: checkinData.productivity,
          gratitude_note: checkinData.gratitude,
          challenges_note: checkinData.challenges,
          goals_note: checkinData.goals,
          additional_notes: checkinData.notes,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // GAMIFICATION: Award points and update streak
      try {
        await gamificationService.awardPoints({
          points: 10,
          source: 'checkin',
          description: 'Daily check-in completed'
        });
        
        // Update streak
        const newStreak = await gamificationService.updateStreak();
        
        // Check for wellness badges
        await gamificationService.checkBadgeEligibility('wellness');
        
        toast({
          title: `Check-in Complete! +10 points 🌟`,
          description: `Your daily reflection has been saved. ${newStreak > 1 ? `${newStreak} day streak! 🔥` : ''}`,
        });
      } catch (gamError) {
        console.error('Gamification error:', gamError);
        toast({
          title: "Check-in Complete! 🌟",
          description: "Your daily reflection has been saved.",
        });
      }

      onComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const RatingsStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Heart} variant="minimal" size="sm" color="danger" />
            <label className="font-medium">Mood</label>
            <Badge variant="outline">{checkinData.mood}/10</Badge>
          </div>
          <Slider
            value={[checkinData.mood]}
            onValueChange={(value) => handleSliderChange('mood', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Low</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Zap} variant="minimal" size="sm" color="warning" />
            <label className="font-medium">Energy Level</label>
            <Badge variant="outline">{checkinData.energy}/10</Badge>
          </div>
          <Slider
            value={[checkinData.energy]}
            onValueChange={(value) => handleSliderChange('energy', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Brain} variant="minimal" size="sm" color="secondary" />
            <label className="font-medium">Stress Level</label>
            <Badge variant="outline">{checkinData.stress}/10</Badge>
          </div>
          <Slider
            value={[checkinData.stress]}
            onValueChange={(value) => handleSliderChange('stress', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Calm</span>
            <span>Very Stressed</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Moon} variant="minimal" size="sm" color="info" />
            <label className="font-medium">Sleep Quality</label>
            <Badge variant="outline">{checkinData.sleep}/10</Badge>
          </div>
          <Slider
            value={[checkinData.sleep]}
            onValueChange={(value) => handleSliderChange('sleep', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Users} variant="minimal" size="sm" color="success" />
            <label className="font-medium">Social Connection</label>
            <Badge variant="outline">{checkinData.social}/10</Badge>
          </div>
          <Slider
            value={[checkinData.social]}
            onValueChange={(value) => handleSliderChange('social', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Target} variant="minimal" size="sm" color="warning" />
            <label className="font-medium">Productivity</label>
            <Badge variant="outline">{checkinData.productivity}/10</Badge>
          </div>
          <Slider
            value={[checkinData.productivity]}
            onValueChange={(value) => handleSliderChange('productivity', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const ReflectionStep = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="font-medium">What are you grateful for today?</label>
        <Textarea
          placeholder="Write about something that brought you joy or that you're thankful for..."
          value={checkinData.gratitude}
          onChange={(e) => handleTextChange('gratitude', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <label className="font-medium">What challenges did you face?</label>
        <Textarea
          placeholder="Reflect on any difficulties or obstacles you encountered..."
          value={checkinData.challenges}
          onChange={(e) => handleTextChange('challenges', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <label className="font-medium">Additional thoughts</label>
        <Textarea
          placeholder="Any other thoughts, feelings, or observations about your day..."
          value={checkinData.notes}
          onChange={(e) => handleTextChange('notes', e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const IntentionsStep = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="font-medium">What do you want to focus on tomorrow?</label>
        <Textarea
          placeholder="Set intentions or goals for tomorrow. What would make it a good day?"
          value={checkinData.goals}
          onChange={(e) => handleTextChange('goals', e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <div className="bg-primary/5 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Your Check-in Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Mood: {checkinData.mood}/10</div>
          <div>Energy: {checkinData.energy}/10</div>
          <div>Stress: {checkinData.stress}/10</div>
          <div>Sleep: {checkinData.sleep}/10</div>
          <div>Social: {checkinData.social}/10</div>
          <div>Productivity: {checkinData.productivity}/10</div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep].component) {
      case 'ratings':
        return <RatingsStep />;
      case 'reflection':
        return <ReflectionStep />;
      case 'intentions':
        return <IntentionsStep />;
      default:
        return <RatingsStep />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle>Daily Check-in</CardTitle>
        </div>
        <CardDescription>
          {steps[currentStep].description}
        </CardDescription>
        
        {/* Progress indicator */}
        <div className="flex gap-2 mt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{steps[currentStep].title}</h3>
          {renderCurrentStep()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Check-in
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCheckin;