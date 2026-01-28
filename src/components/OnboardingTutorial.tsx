import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  Brain, 
  Users, 
  Shield, 
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to MindSync',
    description: 'Your personal mental wellness companion, powered by AI and backed by clinical research.',
    icon: <Heart className="h-16 w-16 text-primary" />,
    features: [
      'Track your mood with voice and photo capture',
      'Get personalized wellness recommendations',
      'Connect with licensed therapists',
      'Join supportive communities',
    ],
  },
  {
    title: 'Track Your Wellness',
    description: 'Multiple ways to capture how you\'re feeling, from quick check-ins to detailed assessments.',
    icon: <Activity className="h-16 w-16 text-primary" />,
    features: [
      'Daily mood tracking with emotion vocabulary',
      'Voice recordings with AI sentiment analysis',
      'Photo mood capture with facial expression analysis',
      'Clinical assessments (PHQ-9, GAD-7)',
    ],
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations based on your patterns and preferences.',
    icon: <Brain className="h-16 w-16 text-primary" />,
    features: [
      'Predictive wellness alerts',
      'Personalized coping strategies',
      'Mood trend analysis',
      'Early intervention recommendations',
    ],
  },
  {
    title: 'Connect & Support',
    description: 'You\'re not alone. Connect with professionals and peers who understand.',
    icon: <Users className="h-16 w-16 text-primary" />,
    features: [
      'Find and book therapists in your area',
      'Join moderated support groups',
      'Connect with accountability buddies',
      'Share your journey anonymously',
    ],
  },
  {
    title: 'Your Privacy Matters',
    description: 'Your data is encrypted and secure. You control what you share and with whom.',
    icon: <Shield className="h-16 w-16 text-primary" />,
    features: [
      'End-to-end encryption',
      'POPIA & HIPAA compliant',
      'Anonymous community participation',
      'Delete your data anytime',
    ],
  },
  {
    title: 'Stay Connected',
    description: 'Enable notifications to get reminders and support when you need it most.',
    icon: <Bell className="h-16 w-16 text-primary" />,
    features: [
      'Medication reminders',
      'Daily check-in prompts',
      'Crisis support alerts',
      'Wellness tips and encouragement',
    ],
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              {step.icon}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{step.title}</h2>
              <p className="text-muted-foreground text-lg">
                {step.description}
              </p>
            </div>

            <div className="space-y-3 text-left max-w-md mx-auto">
              {step.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
