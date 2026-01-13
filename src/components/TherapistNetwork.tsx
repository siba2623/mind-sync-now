import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Calendar, 
  Video, 
  User, 
  Clock,
  Shield,
  Heart,
  Filter
} from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  availableSlots: number;
  acceptsVitality: boolean;
  vitalityTier: string;
  languages: string[];
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  nextAvailable: string;
  hourlyRate: number;
  vitalityRate: number;
  image: string;
}

const MOCK_THERAPISTS: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Sarah van der Berg',
    title: 'Clinical Psychologist',
    specializations: ['Anxiety', 'Depression', 'Stress Management', 'CBT'],
    rating: 4.9,
    reviewCount: 127,
    location: 'Sandton, Johannesburg',
    distance: '3.2 km',
    availableSlots: 5,
    acceptsVitality: true,
    vitalityTier: 'Gold',
    languages: ['English', 'Afrikaans'],
    sessionTypes: ['in-person', 'video'],
    nextAvailable: 'Tomorrow, 10:00 AM',
    hourlyRate: 1200,
    vitalityRate: 600,
    image: '',
  },
  {
    id: '2',
    name: 'Dr. Thabo Molefe',
    title: 'Psychiatrist',
    specializations: ['Mood Disorders', 'ADHD', 'Medication Management'],
    rating: 4.8,
    reviewCount: 89,
    location: 'Rosebank, Johannesburg',
    distance: '5.1 km',
    availableSlots: 3,
    acceptsVitality: true,
    vitalityTier: 'Diamond',
    languages: ['English', 'Zulu', 'Sotho'],
    sessionTypes: ['in-person', 'video', 'phone'],
    nextAvailable: 'Wed, 2:00 PM',
    hourlyRate: 1800,
    vitalityRate: 900,
    image: '',
  },
  {
    id: '3',
    name: 'Lisa Thompson',
    title: 'Counselling Psychologist',
    specializations: ['Trauma', 'Grief', 'Relationship Issues', 'EMDR'],
    rating: 4.7,
    reviewCount: 156,
    location: 'Pretoria East',
    distance: '12.4 km',
    availableSlots: 8,
    acceptsVitality: true,
    vitalityTier: 'Silver',
    languages: ['English'],
    sessionTypes: ['in-person', 'video'],
    nextAvailable: 'Today, 4:00 PM',
    hourlyRate: 950,
    vitalityRate: 475,
    image: '',
  },
  {
    id: '4',
    name: 'Dr. Priya Naidoo',
    title: 'Clinical Psychologist',
    specializations: ['Eating Disorders', 'Body Image', 'Self-Esteem', 'Mindfulness'],
    rating: 4.9,
    reviewCount: 203,
    location: 'Umhlanga, Durban',
    distance: '2.8 km',
    availableSlots: 2,
    acceptsVitality: true,
    vitalityTier: 'Gold',
    languages: ['English', 'Hindi'],
    sessionTypes: ['video', 'phone'],
    nextAvailable: 'Thu, 9:00 AM',
    hourlyRate: 1100,
    vitalityRate: 550,
    image: '',
  },
];

const TherapistNetwork = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [sessionType, setSessionType] = useState('all');
  const [therapists] = useState<Therapist[]>(MOCK_THERAPISTS);
  const { toast } = useToast();

  const filteredTherapists = therapists.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpec = specialization === 'all' || t.specializations.some(s => 
      s.toLowerCase().includes(specialization.toLowerCase()));
    const matchesType = sessionType === 'all' || t.sessionTypes.includes(sessionType as any);
    return matchesSearch && matchesSpec && matchesType;
  });

  const handleBooking = (therapist: Therapist) => {
    toast({
      title: "Booking Request Sent",
      description: `We'll confirm your appointment with ${therapist.name} shortly.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Discovery Therapist Network</h2>
              <p className="text-sm text-muted-foreground">
                Find mental health professionals covered by your Vitality membership
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Up to 50% off with Vitality membership</span>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            <SelectItem value="anxiety">Anxiety</SelectItem>
            <SelectItem value="depression">Depression</SelectItem>
            <SelectItem value="trauma">Trauma</SelectItem>
            <SelectItem value="stress">Stress Management</SelectItem>
            <SelectItem value="relationship">Relationships</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sessionType} onValueChange={setSessionType}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Session Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="in-person">In-Person</SelectItem>
            <SelectItem value="video">Video Call</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {filteredTherapists.length} therapists found
        </p>

        {filteredTherapists.map((therapist) => (
          <Card key={therapist.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Avatar */}
                <div className="sm:w-32 h-32 sm:h-auto bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <User className="w-16 h-16 text-primary/50" />
                </div>

                {/* Info */}
                <div className="flex-1 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{therapist.name}</h3>
                      <p className="text-sm text-muted-foreground">{therapist.title}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{therapist.rating}</span>
                      <span className="text-sm text-muted-foreground">({therapist.reviewCount})</span>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {therapist.specializations.slice(0, 4).map((spec, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {therapist.location} ({therapist.distance})
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {therapist.nextAvailable}
                    </div>
                    <div className="flex items-center gap-1">
                      {therapist.sessionTypes.includes('video') && <Video className="w-3 h-3 text-blue-500" />}
                      {therapist.sessionTypes.includes('phone') && <Phone className="w-3 h-3 text-green-500" />}
                      {therapist.sessionTypes.includes('in-person') && <User className="w-3 h-3 text-purple-500" />}
                      <span className="text-muted-foreground">
                        {therapist.sessionTypes.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground line-through">R{therapist.hourlyRate}</span>
                      <span className="font-semibold text-green-600">R{therapist.vitalityRate}</span>
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                        Vitality
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleBooking(therapist)}>
                      <Calendar className="w-4 h-4 mr-1" />
                      Book Appointment
                    </Button>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TherapistNetwork;
