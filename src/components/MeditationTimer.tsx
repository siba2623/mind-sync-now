import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  Square,
  Clock,
  Brain,
  Volume2,
  VolumeX,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import IconWrapper from '@/components/ui/icon-wrapper';

interface MeditationType {
  name: string;
  description: string;
  guidance: string[];
  benefits: string[];
}

const meditationTypes: MeditationType[] = [
  {
    name: "Mindfulness",
    description: "Focus on the present moment and your breath",
    guidance: [
      "Sit comfortably with your back straight",
      "Close your eyes and focus on your breathing",
      "When your mind wanders, gently return to your breath",
      "Notice thoughts without judgment, let them pass"
    ],
    benefits: ["Reduces stress", "Improves focus", "Increases awareness"]
  },
  {
    name: "Body Scan",
    description: "Progressive relaxation through body awareness",
    guidance: [
      "Lie down or sit comfortably",
      "Start from your toes and work upward",
      "Notice sensations in each part of your body",
      "Release tension as you scan each area"
    ],
    benefits: ["Releases tension", "Improves sleep", "Body awareness"]
  },
  {
    name: "Loving Kindness",
    description: "Cultivate compassion for yourself and others",
    guidance: [
      "Begin with sending love to yourself",
      "Extend kindness to loved ones",
      "Include neutral people in your thoughts",
      "Finally, send love to difficult people"
    ],
    benefits: ["Increases empathy", "Reduces negative emotions", "Builds compassion"]
  },
  {
    name: "Gratitude",
    description: "Focus on appreciation and thankfulness",
    guidance: [
      "Think of three things you're grateful for",
      "Feel the emotion of gratitude in your body",
      "Expand to include people who've helped you",
      "Appreciate the simple moments in life"
    ],
    benefits: ["Improves mood", "Increases life satisfaction", "Builds resilience"]
  }
];

const ambientSounds = [
  { name: "Silence", file: null },
  { name: "Rain", file: "/sounds/rain.mp3" },
  { name: "Ocean Waves", file: "/sounds/ocean.mp3" },
  { name: "Forest", file: "/sounds/forest.mp3" },
  { name: "White Noise", file: "/sounds/whitenoise.mp3" }
];

const MeditationTimer = () => {
  const [selectedType, setSelectedType] = useState<MeditationType>(meditationTypes[0]);
  const [duration, setDuration] = useState([10]); // minutes
  const [selectedSound, setSelectedSound] = useState(ambientSounds[0]);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleComplete = async () => {
    setIsActive(false);
    setIsCompleted(true);
    
    // Stop ambient sound
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Play completion sound (if enabled)
    if (soundEnabled) {
      const completionSound = new Audio('/sounds/bell.mp3');
      completionSound.play().catch(() => {
        // Ignore audio play errors
      });
    }

    const sessionDuration = duration[0] * 60; // Convert to seconds

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('meditation_sessions')
          .insert([{
            user_id: user.id,
            meditation_type: selectedType.name,
            duration_seconds: sessionDuration,
            ambient_sound: selectedSound.name,
            created_at: new Date().toISOString()
          }]);
      }
    } catch (error) {
      console.error('Error saving meditation session:', error);
    }

    toast({
      title: "Meditation Complete! 🧘‍♀️",
      description: `You meditated for ${duration[0]} minutes using ${selectedType.name}`,
    });
  };

  const startMeditation = () => {
    setIsActive(true);
    setTimeLeft(duration[0] * 60);
    setIsCompleted(false);
    startTimeRef.current = Date.now();

    // Start ambient sound
    if (selectedSound.file && soundEnabled) {
      audioRef.current = new Audio(selectedSound.file);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const pauseMeditation = () => {
    setIsActive(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resumeMeditation = () => {
    setIsActive(true);
    if (audioRef.current && selectedSound.file && soundEnabled) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const stopMeditation = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsCompleted(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = duration[0] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  if (isCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <div className="mx-auto mb-4">
            <IconWrapper icon={CheckCircle} variant="soft" size="xl" color="success" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Meditation Complete!</h3>
          <p className="text-muted-foreground mb-4">
            You meditated for {duration[0]} minutes using {selectedType.name}
          </p>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconWrapper icon={Sparkles} variant="minimal" size="sm" color="success" />
              <span className="font-medium text-green-600">Benefits Gained</span>
            </div>
            <div className="text-sm text-green-600">
              {selectedType.benefits.join(' • ')}
            </div>
          </div>
          <Button onClick={stopMeditation} className="w-full">
            Start New Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Setup */}
      {!isActive && timeLeft === 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconWrapper icon={Brain} variant="minimal" size="sm" color="primary" />
              <CardTitle>Meditation Timer</CardTitle>
            </div>
            <CardDescription>
              Set up your meditation session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meditation Type */}
            <div className="space-y-3">
              <label className="font-medium">Meditation Type</label>
              <Select
                value={selectedType.name}
                onValueChange={(value) => {
                  const type = meditationTypes.find(t => t.name === value);
                  if (type) setSelectedType(type);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meditationTypes.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">{selectedType.description}</p>
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Guidance:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {selectedType.guidance.map((step, index) => (
                      <li key={index}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium">Duration</label>
                <Badge variant="outline">{duration[0]} minutes</Badge>
              </div>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={60}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Ambient Sound */}
            <div className="space-y-3">
              <label className="font-medium">Ambient Sound</label>
              <Select
                value={selectedSound.name}
                onValueChange={(value) => {
                  const sound = ambientSounds.find(s => s.name === value);
                  if (sound) setSelectedSound(sound);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ambientSounds.map((sound) => (
                    <SelectItem key={sound.name} value={sound.name}>
                      {sound.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <label className="font-medium">Sound Effects</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="gap-2"
              >
                {soundEnabled ? <IconWrapper icon={Volume2} variant="minimal" size="sm" color="primary" /> : <IconWrapper icon={VolumeX} variant="minimal" size="sm" color="primary" />}
                {soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>

            <Button onClick={startMeditation} size="lg" className="w-full gap-2">
              <IconWrapper icon={Play} variant="minimal" size="sm" color="primary" />
              Start Meditation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Session */}
      {(isActive || timeLeft > 0) && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-8">
              {/* Timer Display */}
              <div className="space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-muted-foreground">
                  {selectedType.name} Meditation
                </div>
              </div>

              {/* Progress Circle */}
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconWrapper icon={Clock} variant="minimal" size="lg" color="primary" />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {isActive ? (
                  <Button onClick={pauseMeditation} size="lg" variant="outline" className="gap-2">
                    <IconWrapper icon={Pause} variant="minimal" size="sm" color="primary" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeMeditation} size="lg" className="gap-2">
                    <IconWrapper icon={Play} variant="minimal" size="sm" color="primary" />
                    Resume
                  </Button>
                )}
                
                <Button onClick={stopMeditation} size="lg" variant="outline" className="gap-2">
                  <IconWrapper icon={Square} variant="minimal" size="sm" color="primary" />
                  Stop
                </Button>
              </div>

              {/* Current Guidance */}
              <div className="bg-muted/50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  {selectedType.guidance[Math.floor((getProgress() / 100) * selectedType.guidance.length)] || selectedType.guidance[0]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeditationTimer;