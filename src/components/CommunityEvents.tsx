import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Search,
  Filter,
  CheckCircle,
  Star,
  Trophy,
  Footprints,
  Brain,
  Dumbbell,
  Coffee,
  MessageCircle,
  Video,
  Sparkles
} from 'lucide-react';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'run' | 'meditation' | 'yoga' | 'support-group' | 'workshop' | 'social' | 'fitness';
  date: string;
  time: string;
  duration: string;
  location: string;
  isVirtual: boolean;
  spotsTotal: number;
  spotsRemaining: number;
  vitalityPoints: number;
  host: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  registered: boolean;
  image?: string;
}

const MOCK_EVENTS: CommunityEvent[] = [
  {
    id: '1',
    title: 'Saturday Morning Mindful Run',
    description: 'Join us for a 5km mindful run through the park. All fitness levels welcome. We focus on being present and enjoying the movement.',
    type: 'run',
    date: '2026-01-17',
    time: '07:00',
    duration: '1 hour',
    location: 'Delta Park, Johannesburg',
    isVirtual: false,
    spotsTotal: 50,
    spotsRemaining: 12,
    vitalityPoints: 300,
    host: 'Discovery Vitality',
    difficulty: 'beginner',
    registered: false,
  },
  {
    id: '2',
    title: 'Guided Group Meditation',
    description: 'A calming 30-minute guided meditation session focused on stress relief and mental clarity. Perfect for beginners.',
    type: 'meditation',
    date: '2026-01-14',
    time: '18:00',
    duration: '45 min',
    location: 'Online via Zoom',
    isVirtual: true,
    spotsTotal: 100,
    spotsRemaining: 45,
    vitalityPoints: 150,
    host: 'Sarah Wellness Coach',
    difficulty: 'beginner',
    registered: true,
  },
  {
    id: '3',
    title: 'Anxiety Support Circle',
    description: 'A safe, confidential space to share experiences and coping strategies with others who understand. Led by a licensed therapist.',
    type: 'support-group',
    date: '2026-01-15',
    time: '19:00',
    duration: '1.5 hours',
    location: 'Discovery Wellness Centre, Sandton',
    isVirtual: false,
    spotsTotal: 15,
    spotsRemaining: 3,
    vitalityPoints: 200,
    host: 'Dr. Thabo Molefe',
    registered: false,
  },
  {
    id: '4',
    title: 'Sunrise Yoga for Mental Wellness',
    description: 'Start your day with gentle yoga poses designed to reduce anxiety and improve mood. Mats provided.',
    type: 'yoga',
    date: '2026-01-16',
    time: '06:30',
    duration: '1 hour',
    location: 'Emmarentia Dam, Johannesburg',
    isVirtual: false,
    spotsTotal: 30,
    spotsRemaining: 8,
    vitalityPoints: 250,
    host: 'Yoga with Priya',
    difficulty: 'beginner',
    registered: false,
  },
  {
    id: '5',
    title: 'Stress Management Workshop',
    description: 'Learn practical techniques for managing workplace stress, including breathing exercises, time management, and boundary setting.',
    type: 'workshop',
    date: '2026-01-18',
    time: '10:00',
    duration: '3 hours',
    location: 'Online via Teams',
    isVirtual: true,
    spotsTotal: 200,
    spotsRemaining: 89,
    vitalityPoints: 500,
    host: 'Discovery Health',
    difficulty: 'intermediate',
    registered: false,
  },
  {
    id: '6',
    title: 'Mental Health Coffee Chat',
    description: 'Casual meetup to connect with others on their mental health journey. No agenda, just good conversation and support.',
    type: 'social',
    date: '2026-01-19',
    time: '09:00',
    duration: '2 hours',
    location: 'Vida e Caffè, Rosebank',
    isVirtual: false,
    spotsTotal: 20,
    spotsRemaining: 7,
    vitalityPoints: 100,
    host: 'MindSync Community',
    registered: false,
  },
  {
    id: '7',
    title: 'HIIT for Happiness',
    description: 'High-intensity interval training proven to boost endorphins and improve mood. Get your heart pumping!',
    type: 'fitness',
    date: '2026-01-20',
    time: '17:30',
    duration: '45 min',
    location: 'Virgin Active, Sandton',
    isVirtual: false,
    spotsTotal: 25,
    spotsRemaining: 10,
    vitalityPoints: 350,
    host: 'Coach Mike',
    difficulty: 'advanced',
    registered: false,
  },
  {
    id: '8',
    title: 'Evening Wind-Down Meditation',
    description: 'End your day peacefully with a sleep-focused meditation session. Includes breathing techniques for better rest.',
    type: 'meditation',
    date: '2026-01-14',
    time: '21:00',
    duration: '30 min',
    location: 'Online via Zoom',
    isVirtual: true,
    spotsTotal: 150,
    spotsRemaining: 78,
    vitalityPoints: 150,
    host: 'Sleep Well SA',
    difficulty: 'beginner',
    registered: false,
  },
];

const EVENT_ICONS: Record<string, any> = {
  'run': Footprints,
  'meditation': Brain,
  'yoga': Sparkles,
  'support-group': MessageCircle,
  'workshop': Star,
  'social': Coffee,
  'fitness': Dumbbell,
};

const EVENT_COLORS: Record<string, string> = {
  'run': 'bg-green-100 text-green-700 border-green-200',
  'meditation': 'bg-purple-100 text-purple-700 border-purple-200',
  'yoga': 'bg-pink-100 text-pink-700 border-pink-200',
  'support-group': 'bg-blue-100 text-blue-700 border-blue-200',
  'workshop': 'bg-amber-100 text-amber-700 border-amber-200',
  'social': 'bg-orange-100 text-orange-700 border-orange-200',
  'fitness': 'bg-red-100 text-red-700 border-red-200',
};

const CommunityEvents = () => {
  const [events, setEvents] = useState<CommunityEvent[]>(MOCK_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents.filter(e => !e.registered);
  const myEvents = events.filter(e => e.registered);

  const handleRegister = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return { ...e, registered: true, spotsRemaining: e.spotsRemaining - 1 };
      }
      return e;
    }));
    
    const event = events.find(e => e.id === eventId);
    toast({
      title: "You're registered! 🎉",
      description: `See you at "${event?.title}". You'll earn ${event?.vitalityPoints} Vitality points!`,
    });
  };

  const handleCancel = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return { ...e, registered: false, spotsRemaining: e.spotsRemaining + 1 };
      }
      return e;
    }));
    
    toast({
      title: "Registration cancelled",
      description: "You've been removed from this event.",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const EventCard = ({ event, showActions = true }: { event: CommunityEvent; showActions?: boolean }) => {
    const Icon = EVENT_ICONS[event.type] || Heart;
    const colorClass = EVENT_COLORS[event.type] || 'bg-gray-100 text-gray-700';
    
    return (
      <Card className="overflow-hidden hover:shadow-md transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Event Type Icon */}
            <div className={`sm:w-24 h-20 sm:h-auto ${colorClass.split(' ')[0]} flex items-center justify-center`}>
              <Icon className={`w-10 h-10 ${colorClass.split(' ')[1]}`} />
            </div>

            {/* Event Details */}
            <div className="flex-1 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    {event.registered && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Registered
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                </div>
              </div>

              {/* Event Meta */}
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(event.date)} at {event.time}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {event.duration}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {event.isVirtual ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {event.location}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={colorClass}>
                    {event.type.replace('-', ' ')}
                  </Badge>
                  {event.difficulty && (
                    <Badge variant="secondary" className="text-xs">
                      {event.difficulty}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className={event.spotsRemaining < 5 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                      {event.spotsRemaining} spots left
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium text-sm">+{event.vitalityPoints} pts</span>
                  </div>
                  
                  {showActions && (
                    event.registered ? (
                      <Button size="sm" variant="outline" onClick={() => handleCancel(event.id)}>
                        Cancel
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleRegister(event.id)}
                        disabled={event.spotsRemaining === 0}
                      >
                        {event.spotsRemaining === 0 ? 'Full' : 'Join Event'}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Discovery Mental Health Community</h2>
              <p className="text-sm text-muted-foreground">
                Connect, move, and grow together with wellness events
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Earn Vitality points for every event</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Build meaningful connections</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'run', 'meditation', 'yoga', 'support-group', 'workshop', 'fitness', 'social'].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
              className="whitespace-nowrap"
            >
              {type === 'all' ? 'All Events' : type.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="my-events">
            My Events
            {myEvents.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myEvents.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No events found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          {myEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">You haven't registered for any events yet</p>
                <p className="text-sm text-muted-foreground">Browse upcoming events and join the community!</p>
              </CardContent>
            </Card>
          ) : (
            myEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityEvents;
