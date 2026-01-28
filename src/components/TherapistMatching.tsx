import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Star, Video, Phone, MessageSquare, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

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
  const [filters, setFilters] = useState({
    specialization: '',
    language: '',
    sessionType: '',
    location: '',
  });
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  const filteredTherapists = mockTherapists.filter((therapist) => {
    if (filters.specialization && !therapist.specializations.includes(filters.specialization)) {
      return false;
    }
    if (filters.language && !therapist.languages.includes(filters.language)) {
      return false;
    }
    if (filters.sessionType && !therapist.sessionTypes.includes(filters.sessionType as any)) {
      return false;
    }
    if (filters.location && !therapist.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleBookSession = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    toast.success(`Booking request sent to ${therapist.name}`, {
      description: 'You will receive a confirmation email within 24 hours.',
    });
  };

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
            <Select value={filters.specialization} onValueChange={(value) => setFilters({ ...filters, specialization: value })}>
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
            <Select value={filters.language} onValueChange={(value) => setFilters({ ...filters, language: value })}>
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
            <Select value={filters.sessionType} onValueChange={(value) => setFilters({ ...filters, sessionType: value })}>
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
            <Label>Location</Label>
            <Input
              placeholder="City or area"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredTherapists.length} Therapist{filteredTherapists.length !== 1 ? 's' : ''} Available
          </h3>
          <Badge variant="secondary">Discovery Network</Badge>
        </div>

        {filteredTherapists.map((therapist) => (
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
                    <Button onClick={() => handleBookSession(therapist)} className="flex-1">
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

      {filteredTherapists.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No therapists match your filters. Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
