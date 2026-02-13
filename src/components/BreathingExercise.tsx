import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { gamificationService } from '@/services/gamificationService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wind,
  Timer,
  Heart,
  CheckCircle
} from 'lucide-react';
import IconWrapper from '@/components/ui/icon-wrapper';

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
  benefits: string[];
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: "4-7-8 Relaxation",
    description: "Perfect for reducing anxiety and promoting sleep",
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    benefits: ["Reduces anxiety", "Promotes sleep", "Calms nervous system"]
  },
  {
    name: "Box Breathing",
    description: "Used by Navy SEALs for focus and calm",
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
    benefits: ["Improves focus", "Reduces stress", "Enhances performance"]
  },
  {
    name: "Energizing Breath",
    description: "Quick energy boost and mental clarity",
    inhale: 3,
    hold: 2,
    exhale: 3,
    cycles: 8,
    benefits: ["Increases energy", "Improves alertness", "Boosts mood"]
  },
  {
    name: "Deep Calm",
    description: "Extended breathing for deep relaxation",
    inhale: 6,
    hold: 2,
    exhale: 8,
    cycles: 5,
    benefits: ["Deep relaxation", "Stress relief", "Mindfulness"]
  }
];

const BreathingExercise = () => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const phases = [
    { name: 'inhale', duration: selectedPattern.inhale, instruction: 'Breathe In', color: 'text-blue-500' },
    { name: 'hold', duration: selectedPattern.hold, instruction: 'Hold', color: 'text-yellow-500' },
    { name: 'exhale', duration: selectedPattern.exhale, instruction: 'Breathe Out', color: 'text-green-500' }
  ];

  const currentPhaseData = phases.find(p => p.name === currentPhase);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handlePhaseComplete = () => {
    const currentPhaseIndex = phases.findIndex(p => p.name === currentPhase);
    
    if (currentPhaseIndex < phases.length - 1) {
      // Move to next phase
      const nextPhase = phases[currentPhaseIndex + 1];
      setCurrentPhase(nextPhase.name as 'inhale' | 'hold' | 'exhale');
      setTimeLeft(nextPhase.duration);
    } else {
      // Complete cycle
      if (currentCycle < selectedPattern.cycles - 1) {
        setCurrentCycle(currentCycle + 1);
        setCurrentPhase('inhale');
        setTimeLeft(selectedPattern.inhale);
      } else {
        // Exercise complete
        handleComplete();
      }
    }
  };

  const handleComplete = async () => {
    setIsActive(false);
    setIsCompleted(true);
    const sessionDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTotalTime(sessionDuration);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('breathing_sessions')
          .insert([{
            user_id: user.id,
            pattern_name: selectedPattern.name,
            duration_seconds: sessionDuration,
            cycles_completed: selectedPattern.cycles,
            created_at: new Date().toISOString()
          }]);

        // GAMIFICATION: Award points for breathing exercise
        try {
          await gamificationService.awardPoints({
            points: 8,
            source: 'breathing',
            description: 'Breathing exercise completed'
          });
          
          // Check for breathing badges
          await gamificationService.checkBadgeEligibility('breathing');
          
          toast({
            title: "Breathing Exercise Complete! +8 points 🌬️",
            description: `You completed ${selectedPattern.cycles} cycles of ${selectedPattern.name}`,
          });
        } catch (gamError) {
          console.error('Gamification error:', gamError);
          toast({
            title: "Breathing Exercise Complete! 🌬️",
            description: `You completed ${selectedPattern.cycles} cycles of ${selectedPattern.name}`,
          });
        }
      }
    } catch (error) {
      console.error('Error saving breathing session:', error);
      toast({
        title: "Breathing Exercise Complete! 🌬️",
        description: `You completed ${selectedPattern.cycles} cycles of ${selectedPattern.name}`,
      });
    }
  };

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setTimeLeft(selectedPattern.inhale);
    setCurrentCycle(0);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(0);
    setCurrentCycle(0);
    setIsCompleted(false);
    setTotalTime(0);
  };

  const getCircleScale = () => {
    const progress = timeLeft / (currentPhaseData?.duration || 1);
    if (currentPhase === 'inhale') {
      return 0.5 + (0.5 * (1 - progress)); // Grow from 0.5 to 1
    } else if (currentPhase === 'exhale') {
      return 1 - (0.5 * (1 - progress)); // Shrink from 1 to 0.5
    }
    return 1; // Hold phase stays at full size
  };

  if (isCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <div className="mx-auto mb-4">
            <IconWrapper icon={CheckCircle} variant="soft" size="xl" color="success" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Well Done!</h3>
          <p className="text-muted-foreground mb-4">
            You completed {selectedPattern.cycles} cycles of {selectedPattern.name}
          </p>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconWrapper icon={Timer} variant="minimal" size="sm" color="success" />
              <span className="font-medium text-green-600">
                Session Duration: {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-sm text-green-600">
              Benefits: {selectedPattern.benefits.join(', ')}
            </div>
          </div>
          <Button onClick={resetExercise} className="w-full">
            Start Another Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Pattern Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconWrapper icon={Wind} variant="minimal" size="sm" color="primary" />
            <CardTitle>Breathing Exercise</CardTitle>
          </div>
          <CardDescription>
            Choose a breathing pattern that matches your current needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedPattern.name}
              onValueChange={(value) => {
                const pattern = breathingPatterns.find(p => p.name === value);
                if (pattern) {
                  setSelectedPattern(pattern);
                  resetExercise();
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {breathingPatterns.map((pattern) => (
                  <SelectItem key={pattern.name} value={pattern.name}>
                    {pattern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{selectedPattern.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{selectedPattern.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedPattern.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-medium">Pattern:</span> {selectedPattern.inhale}s inhale, {selectedPattern.hold}s hold, {selectedPattern.exhale}s exhale × {selectedPattern.cycles} cycles
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breathing Animation */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-8">
            {/* Breathing Circle */}
            <div className="relative w-48 h-48 mx-auto">
              <div 
                className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ease-in-out ${
                  currentPhase === 'inhale' ? 'border-blue-500 bg-blue-50' :
                  currentPhase === 'hold' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
                style={{
                  transform: `scale(${getCircleScale()})`,
                  opacity: isActive ? 1 : 0.5
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${currentPhaseData?.color || 'text-muted-foreground'}`}>
                    {isActive ? timeLeft : selectedPattern.inhale}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isActive ? currentPhaseData?.instruction : 'Ready'}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            {isActive && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Cycle {currentCycle + 1} of {selectedPattern.cycles}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCycle) / selectedPattern.cycles) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isActive ? (
                <Button onClick={startExercise} size="lg" className="gap-2">
                  <IconWrapper icon={Play} variant="minimal" size="sm" color="primary" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseExercise} size="lg" variant="outline" className="gap-2">
                  <IconWrapper icon={Pause} variant="minimal" size="sm" color="primary" />
                  Pause
                </Button>
              )}
              
              <Button onClick={resetExercise} size="lg" variant="outline" className="gap-2">
                <IconWrapper icon={RotateCcw} variant="minimal" size="sm" color="primary" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreathingExercise;