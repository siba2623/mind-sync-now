import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscriptionService';
import { Check, Sparkles, Crown, Star, ArrowRight, X } from 'lucide-react';

interface SubscriptionSelectorProps {
  onComplete: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

const SubscriptionSelector = ({ onComplete, onSkip, showSkip = true }: SubscriptionSelectorProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data.filter(p => p.name !== 'free')); // Don't show free tier in selector
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planName: string) => {
    setSelectedPlan(planName);
    
    // For now, just navigate to dashboard
    // In production, this would go to payment flow
    toast({
      title: 'Plan Selected!',
      description: `You've selected the ${planName} plan. Redirecting to payment...`,
    });
    
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleStartFree = () => {
    toast({
      title: 'Welcome to MindSync!',
      description: 'You can upgrade anytime from your profile.',
    });
    onComplete();
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'standard':
        return <Star className="w-6 h-6" />;
      case 'premium':
        return <Sparkles className="w-6 h-6" />;
      case 'platinum':
        return <Crown className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'standard':
        return 'from-blue-500 to-cyan-500';
      case 'premium':
        return 'from-purple-500 to-pink-500';
      case 'platinum':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return isAnnual ? plan.price_annual : plan.price_monthly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (!isAnnual) return 0;
    const monthlyTotal = plan.price_monthly * 12;
    return monthlyTotal - plan.price_annual;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Start your mental wellness journey with the perfect plan for you
        </p>

        {/* Annual/Monthly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
            Annual
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              plan.name === 'premium' ? 'ring-2 ring-primary shadow-lg scale-105' : ''
            }`}
          >
            {plan.name === 'premium' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold">
                MOST POPULAR
              </div>
            )}

            <CardHeader>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(plan.name)} flex items-center justify-center text-white mb-4`}>
                {getPlanIcon(plan.name)}
              </div>
              <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">R{getPrice(plan)}</span>
                  <span className="text-muted-foreground text-sm">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                {isAnnual && getSavings(plan) > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Save R{getSavings(plan)} per year
                  </p>
                )}
                {isAnnual && (
                  <p className="text-xs text-muted-foreground mt-1">
                    R{Math.round(getPrice(plan) / 12)}/month billed annually
                  </p>
                )}
              </div>

              {/* Top Features (show first 5) */}
              <div className="space-y-2 mb-6 min-h-[140px]">
                {plan.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    +{plan.features.length - 5} more features
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleSelectPlan(plan.name)}
                className="w-full"
                variant={plan.name === 'premium' ? 'default' : 'outline'}
                size="lg"
                disabled={selectedPlan === plan.name}
              >
                {selectedPlan === plan.name ? (
                  <>Processing...</>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Free Option */}
      {showSkip && (
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-muted/30">
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Not ready to commit? Start with our free plan and upgrade anytime.
              </p>
              <Button
                variant="ghost"
                onClick={handleStartFree}
                className="gap-2"
              >
                Continue with Free Plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>7-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSelector;
