import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscriptionService';
import { Check, Sparkles, Crown, Star } from 'lucide-react';

const Pricing = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
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

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    navigate(`/checkout?plan=${planName}&cycle=${isAnnual ? 'annual' : 'monthly'}`);
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
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Invest in your mental wellness journey
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
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
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.filter(p => p.name !== 'free').map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
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
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">R{getPrice(plan)}</span>
                    <span className="text-muted-foreground">
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
                      R{Math.round(getPrice(plan) / 12)}/month when billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.name)}
                  className="w-full"
                  variant={plan.name === 'premium' ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.name === 'platinum' ? 'Get Premium Support' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Promo Code Section */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Have a promo code?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
              <Button variant="outline">Apply</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try: LAUNCH50 for 50% off your first month
            </p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards, debit cards, and EFT payments through secure payment providers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! All paid plans come with a 7-day free trial. Cancel anytime during the trial period at no charge.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel my subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
