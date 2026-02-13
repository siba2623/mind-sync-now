import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Star, Video, Phone, MessageSquare, Clock, Award, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { findMatches, getMatchExplanation, recordBooking, type TherapistSearchCriteria, type TherapistMatch } from '@/services/phase3/therapistMatching';
import { supabase } from '@/integrations/supabase/client';

interface Therapist {
  id: number;
  name: string;
  title: string;
  specializations: string[];
  languages: string[];
  location: string;
  rating: number;
  reviews: number;
  experience: number;
  availability: string[];
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  rate: number;
  discoveryNetwork: boolean;
  image?: string;
  bio: string;
}

const mockTherapists: Therapist[] = [
  {
    id: 1,
    name: 'Dr. Thandi Mthembu',
    title: 'Clinical Psychologist',
    specializations: ['Anxiety', 'Depression', 'Trauma', 'CBT'],
    languages: ['English', 'isiZulu', 'isiXhosa'],
    location: 'Sandton, Johannesburg',
    rating: 4.9,
    reviews: 127,
    experience: 12,
    availability: ['Mon', 'Wed', 'Fri'],
    sessionTypes: ['in-person', 'video'],
    rate: 950,
    discoveryNetwork: true,
    bio: 'Specializing in trauma-informed care with a focus on culturally sensitive approaches.',
  },
  {
    id: 2,
    name: 'Dr. Johan van der Merwe',
    title: 'Psychiatrist',
    specializations: ['Bipolar', 'Schizophrenia', 'Medication Management'],
    languages: ['English', 'Afrikaans'],
    location: 'Cape Town CBD',
    rating: 4.8,
    reviews: 89,
    experience: 18,
    availability: ['Tue', 'Thu'],
    sessionTypes: ['in-person', 'video', 'phone'],
    rate: 1200,
    discoveryNetwork: true,
    bio: 'Board-certified psychiatrist with expertise in complex mood disorders.',
  },
  {
    id: 3,
    name: 'Lerato Khumalo',
    title: 'Counselling Psychologist',
    specializations: ['Stress Management', 'Relationships', 'Life Transitions'],
    languages: ['English', 'Sesotho', 'Setswana'],
    location: 'Pretoria East',
    rating: 4.7,
    reviews: 64,
    experience: 8,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    sessionTypes: ['video', 'phone'],
    rate: 750,
    discoveryNetwork: true,
    bio: 'Warm, empathetic approach to helping young professionals navigate life challenges.',
  },
];

export default function TherapistMatching() {
  const [filters, setFilters] = useState<TherapistSearchCriteria>({
    specializations: [],
    languages: [],
    sessionType: undefined,
    maxDistance: undefined,
    insurance: undefined,
  });
  const [matches, setMatches] = useState<TherapistMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TherapistMatch | null>(null);
  const [matchExplanation, setMatchExplanation] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    if (user?.id) {
      searchTherapists(user.id);
    }
  };

  const searchTherapists = async (uid: string) => {
    setLoading(true);
    try {
      const results = await findMatches(uid, filters);
      setMatches(results);
    } catch (error) {
      console.error('Failed to find matches:', error);
      toast.error('Failed to search therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TherapistSearchCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (userId) {
      searchTherapists(userId);
    }
  };

  const handleViewExplanation = async (match: TherapistMatch) => {
    if (!userId) return;
    
    setSelectedMatch(match);
    setShowExplanation(true);
    
    try {
      const explanation = await getMatchExplanation(userId, match.therapist.id);
      setMatchExplanation(explanation);
    } catch (error) {
      console.error('Failed to get explanation:', error);
    }
  };

  const handleBookSession = async (match: TherapistMatch) => {
    if (!userId) {
      toast.error('Please log in to book a session');
      return;
    }

    try {
      await recordBooking(userId, match.therapist.id, true);
      toast.success(`Booking request sent to ${match.therapist.name}`, {
        description: 'You will receive a confirmation email within 24 hours.',
      });
    } catch (error) {
      console.error('Failed to record booking:', error);
      toast.error('Failed to send booking request');
    }
  };

  const filteredTherapists = mockTherapists.filter((therapist) => {
    if (filters.specializations && filters.specializations.length > 0 && 
        !filters.specializations.some(s => therapist.specializations.includes(s))) {
      return false;
    }
    if (filters.languages && filters.languages.length > 0 && 
        !filters.languages.some(l => therapist.languages.includes(l))) {
      return false;
    }
    if (filters.sessionType && !therapist.sessionTypes.includes(filters.sessionType as any)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Find Your Therapist</h2>
        <p className="text-muted-foreground">
          Connect with qualified mental health professionals in the Discovery Health network
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Therapists</CardTitle>
          <CardDescription>Find the perfect match for your needs</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Specialization</Label>
            <Select 
              value={filters.specializations?.[0] || ''} 
              onValueChange={(value) => handleFilterChange('specializations', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="Anxiety">Anxiety</SelectItem>
                <SelectItem value="Depression">Depression</SelectItem>
                <SelectItem value="Trauma">Trauma</SelectItem>
                <SelectItem value="Stress Management">Stress Management</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select 
              value={filters.languages?.[0] || ''} 
              onValueChange={(value) => handleFilterChange('languages', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                <SelectItem value="isiZulu">isiZulu</SelectItem>
                <SelectItem value="isiXhosa">isiXhosa</SelectItem>
                <SelectItem value="Sesotho">Sesotho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select 
              value={filters.sessionType || ''} 
              onValueChange={(value) => handleFilterChange('sessionType', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Distance (km)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={filters.maxDistance || ''}
              onChange={(e) => handleFilterChange('maxDistance', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {loading ? 'Searching...' : `${matches.length || filteredTherapists.length} Therapist${(matches.length || filteredTherapists.length) !== 1 ? 's' : ''} Available`}
          </h3>
          <Badge variant="secondary">
            {userId && matches.length > 0 ? 'AI-Matched' : 'Discovery Network'}
          </Badge>
        </div>

        {/* AI-Matched Results */}
        {userId && matches.length > 0 && matches.map((match) => (
          <Card key={match.therapist.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24">
                  <AvatarImage src={match.therapist.photo} />
                  <AvatarFallback className="text-2xl">
                    {match.therapist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-semibold">{match.therapist.name}</h4>
                        <p className="text-muted-foreground">{match.therapist.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {match.matchPercentage}% Match
                        </Badge>
                        <Badge variant="secondary">Discovery Network</Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{match.therapist.bio}</p>

                  {/* Match Factors */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Why this is a great match:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {match.keyMatchingFactors.slice(0, 3).map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {match.therapist.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{match.therapist.rating} ({match.therapist.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{match.therapist.yearsExperience} years exp.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{match.therapist.location.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>R{match.therapist.rate}/session</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Languages:</span>
                    <span className="text-muted-foreground">{match.therapist.languages.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {match.therapist.sessionTypes.includes('in-person') && (
                      <Badge variant="secondary"><MapPin className="h-3 w-3 mr-1" />In-Person</Badge>
                    )}
                    {match.therapist.sessionTypes.includes('video') && (
                      <Badge variant="secondary"><Video className="h-3 w-3 mr-1" />Video</Badge>
                    )}
                    {match.therapist.sessionTypes.includes('phone') && (
                      <Badge variant="secondary"><Phone className="h-3 w-3 mr-1" />Phone</Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleBookSession(match)} className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button variant="outline" onClick={() => handleViewExplanation(match)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Why This Match?
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Fallback to filtered results */}
        {(!userId || matches.length === 0) && filteredTherapists.map((therapist) => (
          <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24">
                  <AvatarImage src={therapist.image} />
                  <AvatarFallback className="text-2xl">
                    {therapist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-semibold">{therapist.name}</h4>
                        <p className="text-muted-foreground">{therapist.title}</p>
                      </div>
                      {therapist.discoveryNetwork && (
                        <Badge className="bg-green-500">Discovery Network</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{therapist.bio}</p>

                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{therapist.rating} ({therapist.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{therapist.experience} years exp.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{therapist.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>R{therapist.rate}/session</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Languages:</span>
                    <span className="text-muted-foreground">{therapist.languages.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {therapist.sessionTypes.includes('in-person') && (
                      <Badge variant="secondary"><MapPin className="h-3 w-3 mr-1" />In-Person</Badge>
                    )}
                    {therapist.sessionTypes.includes('video') && (
                      <Badge variant="secondary"><Video className="h-3 w-3 mr-1" />Video</Badge>
                    )}
                    {therapist.sessionTypes.includes('phone') && (
                      <Badge variant="secondary"><Phone className="h-3 w-3 mr-1" />Phone</Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleBookSession({ therapist, matchScore: 0, matchPercentage: 0, keyMatchingFactors: [], availableSlots: [], estimatedWaitTime: '' } as TherapistMatch)} className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTherapists.length === 0 && matches.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No therapists match your filters. Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Match Explanation Dialog */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Why {selectedMatch?.therapist.name} is a Great Match
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis of compatibility factors
            </DialogDescription>
          </DialogHeader>

          {matchExplanation && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                <div className="text-5xl font-bold mb-2">
                  {matchExplanation.overallScore}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Match Score</p>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold">Match Breakdown</h4>
                {matchExplanation.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">
                        {item.score}% (weight: {item.weight * 100}%)
                      </span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{item.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <h4 className="font-semibold">Key Strengths</h4>
                <div className="space-y-2">
                  {matchExplanation.strengths.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Considerations */}
              {matchExplanation.considerations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Things to Consider</h4>
                  <div className="space-y-2">
                    {matchExplanation.considerations.map((consideration: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-600 dark:text-yellow-400 text-xs">!</span>
                        </div>
                        <span>{consideration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Patient Success */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Similar Patient Success Rate</span>
                  <span className="text-2xl font-bold">{matchExplanation.similarPatientSuccess}%</span>
                </div>
                <Progress value={matchExplanation.similarPatientSuccess} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on outcomes from patients with similar needs and demographics
                </p>
              </div>

              <Button onClick={() => selectedMatch && handleBookSession(selectedMatch)} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Book Session with {selectedMatch?.therapist.name}
              </Button>
            </div>
          )}

          {!matchExplanation && (
            <div className="text-center py-8 text-muted-foreground">
              Loading match analysis...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
