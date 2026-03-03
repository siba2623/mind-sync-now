import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SubscriptionSelector from '@/components/SubscriptionSelector';
import { Heart, Brain, Target, Sparkles } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const totalSteps = 2;

  const handleSubscriptionComplete = () => {
    // Move to next step or complete onboarding
    navigate('/dashboard');
  };

  const handleSkipSubscription = () => {
    navigate('/dashboard');
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Skip
            </Button>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            {/* Welcome Step */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome to MindSync! 🎉</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                You're taking an important step towards better mental wellness. Let's personalize your experience.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Your Mood</h3>
                  <p className="text-sm text-muted-foreground">
                    Log your emotions and discover patterns in your mental health
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations based on your data
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Achieve Your Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Set wellness goals and track your progress over time
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            {/* Subscription Selection Step */}
            <SubscriptionSelector
              onComplete={handleSubscriptionComplete}
              onSkip={handleSkipSubscription}
              showSkip={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
