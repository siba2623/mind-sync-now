import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, 
  MessageSquare, 
  Globe, 
  Clock, 
  Heart,
  AlertTriangle,
  ExternalLink,
  Shield
} from 'lucide-react';
import IconWrapper from '@/components/ui/icon-wrapper';

interface CrisisResource {
  id: string;
  country_code: string;
  organization_name: string;
  phone_number?: string;
  website_url?: string;
  description: string;
  category: string;
  is_24_7: boolean;
  languages: string[];
}

const CrisisSupport = () => {
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userCountry, setUserCountry] = useState<string>('US');

  const categories = [
    { value: 'all', label: 'All Resources' },
    { value: 'suicide_prevention', label: 'Suicide Prevention' },
    { value: 'crisis_text', label: 'Crisis Text Lines' },
    { value: 'mental_health', label: 'Mental Health Support' },
    { value: 'domestic_violence', label: 'Domestic Violence' }
  ];

  useEffect(() => {
    loadCrisisResources();
    detectUserCountry();
  }, []);

  const detectUserCountry = async () => {
    try {
      // Try to detect user's country (you could use a geolocation API)
      // For now, we'll default to US
      setUserCountry('US');
    } catch (error) {
      console.error('Error detecting country:', error);
    }
  };

  const loadCrisisResources = async () => {
    try {
      let query = supabase
        .from('crisis_resources')
        .select('*')
        .order('country_code', { ascending: true });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading crisis resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrisisResources();
  }, [selectedCategory]);

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWebsite = (url: string) => {
    window.open(url, '_blank');
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'ES': '🇪🇸',
      'IT': '🇮🇹',
      'JP': '🇯🇵',
      'IN': '🇮🇳'
    };
    return flags[countryCode] || '🌍';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'suicide_prevention':
        return <IconWrapper icon={Heart} variant="minimal" size="sm" color="danger" />;
      case 'crisis_text':
        return <IconWrapper icon={MessageSquare} variant="minimal" size="sm" color="info" />;
      case 'mental_health':
        return <IconWrapper icon={Shield} variant="minimal" size="sm" color="success" />;
      case 'domestic_violence':
        return <IconWrapper icon={AlertTriangle} variant="minimal" size="sm" color="warning" />;
      default:
        return <IconWrapper icon={Phone} variant="minimal" size="sm" color="primary" />;
    }
  };

  // Prioritize user's country resources
  const sortedResources = resources.sort((a, b) => {
    if (a.country_code === userCountry && b.country_code !== userCountry) return -1;
    if (b.country_code === userCountry && a.country_code !== userCountry) return 1;
    return 0;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Emergency Alert */}
      <Alert className="border-red-200 bg-red-50">
        <IconWrapper icon={AlertTriangle} variant="minimal" size="sm" color="danger" />
        <AlertDescription className="text-red-800">
          <strong>If you're in immediate danger or having thoughts of self-harm, please contact emergency services (911, 999, etc.) or go to your nearest emergency room immediately.</strong>
        </AlertDescription>
      </Alert>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconWrapper icon={Heart} variant="minimal" size="md" color="danger" />
            <CardTitle>Crisis Support Resources</CardTitle>
          </div>
          <CardDescription>
            Free, confidential support is available 24/7. You're not alone, and help is just a call or text away.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading resources...</p>
            </CardContent>
          </Card>
        ) : sortedResources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No resources found for the selected category.</p>
            </CardContent>
          </Card>
        ) : (
          sortedResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(resource.category)}
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {resource.organization_name}
                        <span className="text-lg">{getCountryFlag(resource.country_code)}</span>
                      </h3>
                      <p className="text-muted-foreground text-sm">{resource.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {resource.is_24_7 && (
                      <Badge variant="secondary" className="gap-1">
                        <IconWrapper icon={Clock} variant="minimal" size="sm" color="primary" />
                        24/7
                      </Badge>
                    )}
                    {resource.country_code === userCountry && (
                      <Badge variant="default">Your Country</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {resource.phone_number && (
                    <Button
                      onClick={() => handleCall(resource.phone_number!)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <IconWrapper icon={Phone} variant="minimal" size="sm" color="primary" />
                      Call {resource.phone_number}
                    </Button>
                  )}
                  
                  {resource.website_url && (
                    <Button
                      variant="outline"
                      onClick={() => handleWebsite(resource.website_url!)}
                      className="gap-2"
                    >
                      <IconWrapper icon={Globe} variant="minimal" size="sm" color="primary" />
                      Visit Website
                      <IconWrapper icon={ExternalLink} variant="minimal" size="sm" color="primary" />
                    </Button>
                  )}
                </div>

                {resource.languages.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Languages:</strong> {resource.languages.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Additional Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWrapper icon={Shield} variant="minimal" size="sm" color="primary" />
            Additional Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Immediate Safety</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Remove means of self-harm</li>
                <li>• Stay with someone you trust</li>
                <li>• Go to a safe, public place</li>
                <li>• Call emergency services if needed</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Coping Strategies</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Practice deep breathing</li>
                <li>• Use grounding techniques (5-4-3-2-1)</li>
                <li>• Reach out to a trusted friend</li>
                <li>• Engage in physical activity</li>
              </ul>
            </div>
          </div>

          <Alert>
            <IconWrapper icon={Heart} variant="minimal" size="sm" color="danger" />
            <AlertDescription>
              Remember: Crisis feelings are temporary. You matter, your life has value, and there are people who want to help you through this difficult time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisSupport;