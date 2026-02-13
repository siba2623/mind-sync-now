import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { peerSupportService } from '@/services/peerSupportService';
import { useToast } from '@/hooks/use-toast';

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

const CONDITION_OPTIONS = [
  'Depression',
  'Anxiety',
  'Bipolar Disorder',
  'PTSD',
  'OCD',
  'Panic Disorder',
  'Social Anxiety',
  'Eating Disorder',
  'ADHD',
  'Borderline Personality Disorder',
  'Schizophrenia',
  'Substance Use Disorder',
  'Other',
];

const PeerProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [bio, setBio] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConditionToggle = (condition: string) => {
    if (conditions.includes(condition)) {
      setConditions(conditions.filter(c => c !== condition));
    } else {
      setConditions([...conditions, condition]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!displayName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a display name',
        variant: 'destructive'
      });
      return;
    }

    if (displayName.length < 2 || displayName.length > 30) {
      toast({
        title: 'Error',
        description: 'Display name must be 2-30 characters',
        variant: 'destructive'
      });
      return;
    }

    if (conditions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one condition',
        variant: 'destructive'
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: 'Error',
        description: 'Please agree to the community guidelines',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      await peerSupportService.createPeerProfile({
        display_name: displayName.trim(),
        avatar_color: avatarColor,
        bio: bio.trim() || undefined,
        conditions
      });

      toast({
        title: 'Success!',
        description: 'Profile created successfully',
      });

      navigate('/peer-support');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto pt-20">
        <Button
          variant="ghost"
          onClick={() => navigate('/peer-support')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-2">Create Anonymous Profile</h1>
        <p className="text-muted-foreground mb-6">
          Your peer support profile is completely anonymous. Choose a display name 
          that doesn't reveal your identity.
        </p>

        {/* Display Name */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Display Name *</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., HopefulJourney, QuietStrength"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {displayName.length}/30 characters
            </p>
          </CardContent>
        </Card>

        {/* Avatar Color */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Avatar Color *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className="relative w-12 h-12 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    border: avatarColor === color ? '3px solid #000' : '2px solid #ccc',
                  }}
                >
                  {avatarColor === color && (
                    <CheckCircle className="absolute inset-0 m-auto h-6 w-6 text-white" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Bio (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a bit about your journey..."
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {bio.length}/200 characters
            </p>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Mental Health Conditions *</CardTitle>
            <CardDescription>
              Select the conditions you're comfortable discussing. This helps us connect you with relevant support groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map(condition => (
                <Badge
                  key={condition}
                  variant={conditions.includes(condition) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleConditionToggle(condition)}
                >
                  {condition}
                  {conditions.includes(condition) && (
                    <CheckCircle className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms Agreement */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the community guidelines: be respectful, protect privacy, 
                no medical advice, and report concerning content. I understand this is 
                peer support, not professional therapy.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full mb-3"
          onClick={handleSubmit}
          disabled={loading || !displayName || conditions.length === 0 || !agreedToTerms}
        >
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate('/peer-support')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PeerProfileSetup;
