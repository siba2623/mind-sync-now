import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, Brain, Heart, Activity, Users, CheckCircle } from 'lucide-react';

// Regulation strategies based on How We Feel's approach
const strategies = {
  thinking: {
    name: "Change Your Thinking",
    icon: <Brain className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
    description: "Cognitive strategies to address negative thought patterns",
    techniques: [
      {
        id: 1,
        name: "Reframe Your Thoughts",
        duration: "2 min",
        description: "Challenge negative thoughts by looking at situations from different perspectives",
        steps: [
          "Identify the negative thought",
          "Ask: Is this thought helpful or harmful?", 
          "Consider alternative perspectives",
          "Choose a more balanced thought"
        ],
        whenToUse: "When stuck in negative thinking loops"
      },
      {
        id: 2,
        name: "5-4-3-2-1 Grounding",
        duration: "3 min",
        description: "Use your senses to ground yourself in the present moment",
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can touch",
          "Name 3 things you can hear", 
          "Name 2 things you can smell",
          "Name 1 thing you can taste"
        ],
        whenToUse: "When feeling anxious or overwhelmed"
      },
      {
        id: 3,
        name: "Thought Stopping",
        duration: "1 min",
        description: "Interrupt negative thought spirals with a simple technique",
        steps: [
          "Notice the negative thought",
          "Say 'STOP' out loud or in your head",
          "Take 3 deep breaths",
          "Redirect to a positive or neutral thought"
        ],
        whenToUse: "When caught in rumination"
      }
    ]
  },
  movement: {
    name: "Move Your Body",
    icon: <Activity className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-800", 
    description: "Express and release emotions through physical movement",
    techniques: [
      {
        id: 4,
        name: "Progressive Muscle Relaxation",
        duration: "5 min",
        description: "Systematically tense and relax muscle groups to release physical tension",
        steps: [
          "Start with your toes, tense for 5 seconds",
          "Release and notice the relaxation",
          "Move up through each muscle group",
          "End with your face and scalp"
        ],
        whenToUse: "When feeling physically tense or stressed"
      },
      {
        id: 5,
        name: "Emotional Release Shake",
        duration: "2 min", 
        description: "Shake out stress and tension like animals do in nature",
        steps: [
          "Stand with feet shoulder-width apart",
          "Start shaking your hands gently",
          "Let the shaking spread through your body",
          "Continue for 1-2 minutes, then rest"
        ],
        whenToUse: "After stressful events or when feeling 'stuck'"
      },
      {
        id: 6,
        name: "Energy Boost Walk",
        duration: "5 min",
        description: "A quick walk to shift your energy and mood",
        steps: [
          "Step outside or walk indoors",
          "Walk at a brisk, comfortable pace",
          "Focus on your surroundings",
          "Take deep breaths as you walk"
        ],
        whenToUse: "When feeling low energy or down"
      }
    ]
  },
  mindfulness: {
    name: "Be Mindful", 
    icon: <Heart className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
    description: "Gain perspective and minimize negative emotional impact",
    techniques: [
      {
        id: 7,
        name: "Box Breathing",
        duration: "3 min",
        description: "Regulate your nervous system with structured breathing",
        steps: [
          "Inhale for 4 counts",
          "Hold for 4 counts", 
          "Exhale for 4 counts",
          "Hold empty for 4 counts",
          "Repeat 5-10 times"
        ],
        whenToUse: "When feeling anxious, angry, or need to focus"
      },
      {
        id: 8,
        name: "Body Scan Meditation",
        duration: "5 min",
        description: "Check in with your body to release tension and increase awareness",
        steps: [
          "Lie down or sit comfortably",
          "Start at the top of your head",
          "Slowly scan down through your body",
          "Notice any tension without judgment",
          "Breathe into tense areas"
        ],
        whenToUse: "When disconnected from your body or before sleep"
      },
      {
        id: 9,
        name: "Loving-Kindness Practice",
        duration: "4 min",
        description: "Cultivate compassion for yourself and others",
        steps: [
          "Start with yourself: 'May I be happy and healthy'",
          "Extend to loved ones: 'May you be happy and healthy'",
          "Include neutral people in your life",
          "Even include difficult people",
          "End by including all beings"
        ],
        whenToUse: "When feeling angry, resentful, or self-critical"
      }
    ]
  },
  social: {
    name: "Reach Out",
    icon: <Users className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
    description: "Build intimacy and trust through social connection",
    techniques: [
      {
        id: 10,
        name: "Emotional Check-In",
        duration: "5 min",
        description: "Share your feelings with someone you trust",
        steps: [
          "Choose someone you feel safe with",
          "Share how you're feeling without expecting solutions",
          "Ask them to just listen",
          "Thank them for their time and presence"
        ],
        whenToUse: "When feeling isolated or overwhelmed"
      },
      {
        id: 11,
        name: "Gratitude Sharing",
        duration: "3 min",
        description: "Express appreciation to strengthen relationships",
        steps: [
          "Think of someone who has helped you recently",
          "Send them a text, call, or tell them in person",
          "Be specific about what they did",
          "Express how it made you feel"
        ],
        whenToUse: "When feeling disconnected or wanting to spread positivity"
      },
      {
        id: 12,
        name: "Ask for Support",
        duration: "2 min",
        description: "Practice vulnerability by asking for what you need",
        steps: [
          "Identify what kind of support you need",
          "Choose the right person to ask",
          "Be specific about your request",
          "Express appreciation for their willingness to help"
        ],
        whenToUse: "When struggling and need practical or emotional support"
      }
    ]
  }
};

interface RegulationStrategiesProps {
  currentEmotion?: string;
  onStrategyComplete: (strategyId: number, helpful: boolean) => void;
}

export default function RegulationStrategies({ currentEmotion, onStrategyComplete }: RegulationStrategiesProps) {
  const [activeStrategy, setActiveStrategy] = useState<number | null>(null);
  const [completedStrategies, setCompletedStrategies] = useState<Set<number>>(new Set());

  const handleStrategyStart = (strategyId: number) => {
    setActiveStrategy(strategyId);
  };

  const handleStrategyComplete = (strategyId: number, helpful: boolean) => {
    setCompletedStrategies(prev => new Set([...prev, strategyId]));
    setActiveStrategy(null);
    onStrategyComplete(strategyId, helpful);
    
    // Save to database (you'll need to get user_id from auth context)
    console.log('Saving strategy usage:', { strategyId, helpful, currentEmotion });
  };

  const getRecommendedStrategies = () => {
    if (!currentEmotion) return [];
    
    const emotion = currentEmotion.toLowerCase();
    
    // Simple emotion-to-strategy mapping
    if (emotion.includes('anxious') || emotion.includes('worried') || emotion.includes('stressed')) {
      return [7, 1, 4]; // Box breathing, reframe thoughts, muscle relaxation
    }
    if (emotion.includes('sad') || emotion.includes('down') || emotion.includes('depressed')) {
      return [6, 11, 9]; // Energy walk, gratitude sharing, loving-kindness
    }
    if (emotion.includes('angry') || emotion.includes('frustrated') || emotion.includes('irritated')) {
      return [5, 3, 9]; // Emotional shake, thought stopping, loving-kindness
    }
    if (emotion.includes('tired') || emotion.includes('exhausted') || emotion.includes('drained')) {
      return [8, 4, 6]; // Body scan, muscle relaxation, energy walk
    }
    
    return [7, 1, 10]; // Default: box breathing, reframe thoughts, emotional check-in
  };

  const recommendedIds = getRecommendedStrategies();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Regulation Strategies
        </CardTitle>
        <CardDescription>
          Quick techniques to help you navigate your emotions in the moment
        </CardDescription>
        {currentEmotion && (
          <Badge variant="outline" className="w-fit">
            Personalized for: {currentEmotion}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="thinking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(strategies).map(([key, strategy]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                {strategy.icon}
                <span className="hidden sm:inline">{strategy.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(strategies).map(([key, strategy]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-medium text-lg">{strategy.name}</h3>
                <p className="text-sm text-gray-600">{strategy.description}</p>
              </div>

              <div className="grid gap-4">
                {strategy.techniques.map((technique) => {
                  const isRecommended = recommendedIds.includes(technique.id);
                  const isCompleted = completedStrategies.has(technique.id);
                  const isActive = activeStrategy === technique.id;

                  return (
                    <Card key={technique.id} className={`${isRecommended ? 'ring-2 ring-blue-200' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{technique.name}</CardTitle>
                            {isRecommended && (
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            )}
                            {isCompleted && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {technique.duration}
                          </div>
                        </div>
                        <CardDescription>{technique.description}</CardDescription>
                        <p className="text-xs text-blue-600">
                          <strong>When to use:</strong> {technique.whenToUse}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {!isActive ? (
                          <Button 
                            onClick={() => handleStrategyStart(technique.id)}
                            className="w-full"
                            variant={isRecommended ? "default" : "outline"}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Strategy
                          </Button>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-sm mb-2">Follow these steps:</h4>
                              <ol className="space-y-2">
                                {technique.steps.map((step, index) => (
                                  <li key={index} className="text-sm flex items-start gap-2">
                                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                      {index + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleStrategyComplete(technique.id, true)}
                                className="flex-1"
                              >
                                This Helped
                              </Button>
                              <Button 
                                onClick={() => handleStrategyComplete(technique.id, false)}
                                variant="outline"
                                className="flex-1"
                              >
                                Try Different
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}