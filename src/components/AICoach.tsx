import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Heart, 
  Brain, 
  Lightbulb,
  AlertTriangle,
  Phone,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isCrisis?: boolean;
}

interface MoodContext {
  recentMoods: number[];
  avgMood: number;
  trend: 'improving' | 'stable' | 'declining';
  lastCheckIn?: string;
}

// Crisis keywords detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'want to die', 'no reason to live',
  'self-harm', 'hurt myself', 'cutting', 'overdose', 'hopeless',
  'can\'t go on', 'better off dead', 'ending my life'
];

// AI response templates based on context
const AI_RESPONSES: Record<string, { response: string; suggestions: string[] }> = {
  greeting: {
    response: "Hi there! I'm your MindSync AI wellness coach. I'm here to support your mental health journey. How are you feeling today?",
    suggestions: ["I'm feeling anxious", "I had a tough day", "I'm doing well!", "I need coping strategies"]
  },
  anxious: {
    response: "I hear you - anxiety can feel overwhelming. Let's work through this together. Can you tell me more about what's triggering these feelings? Sometimes naming our worries helps reduce their power over us.",
    suggestions: ["Work stress", "Relationship issues", "Health concerns", "Try a breathing exercise"]
  },
  stressed: {
    response: "Stress is your body's way of responding to demands. It's completely normal, but managing it is important. What's been weighing on you the most lately?",
    suggestions: ["Too much work", "Family responsibilities", "Financial worries", "Show me relaxation techniques"]
  },
  sad: {
    response: "I'm sorry you're feeling down. Your feelings are valid, and it takes courage to acknowledge them. Would you like to talk about what's contributing to these feelings, or would you prefer some mood-lifting activities?",
    suggestions: ["Talk about it", "Suggest activities", "I just need to vent", "Connect me with resources"]
  },
  happy: {
    response: "That's wonderful to hear! 🌟 Positive moments are worth celebrating. What's contributing to your good mood today? Recognizing these factors can help you recreate them.",
    suggestions: ["Share my wins", "Set new goals", "Help me maintain this", "Log my mood"]
  },
  coping: {
    response: "Great question! Here are some evidence-based coping strategies:\n\n🧘 **Grounding (5-4-3-2-1)**: Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste\n\n🌬️ **Box Breathing**: Inhale 4s, hold 4s, exhale 4s, hold 4s\n\n📝 **Journaling**: Write down your thoughts without judgment\n\n🚶 **Movement**: Even a 5-minute walk can shift your mood\n\nWhich would you like to try?",
    suggestions: ["Try grounding", "Start breathing exercise", "Open journal", "Go for a walk reminder"]
  },
  sleep: {
    response: "Sleep is crucial for mental health. Poor sleep can amplify anxiety and low mood. Let's look at your sleep hygiene:\n\n• Are you going to bed at consistent times?\n• Is your room dark and cool?\n• Are you avoiding screens before bed?\n• Any caffeine after 2pm?\n\nWhat's your biggest sleep challenge?",
    suggestions: ["Trouble falling asleep", "Waking up at night", "Not feeling rested", "Set sleep reminder"]
  },
  default: {
    response: "Thank you for sharing that with me. I'm here to listen and support you. Would you like to explore this further, or would you prefer some practical strategies to help you feel better?",
    suggestions: ["Tell me more", "Suggest strategies", "Try an activity", "Talk to a professional"]
  }
};


const AICoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [moodContext] = useState<MoodContext>({
    recentMoods: [3, 4, 3, 2, 3, 4, 3],
    avgMood: 3.1,
    trend: 'stable',
    lastCheckIn: 'Today at 9:00 AM'
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      const greeting: Message = {
        id: '1',
        role: 'assistant',
        content: AI_RESPONSES.greeting.response,
        timestamp: new Date(),
        suggestions: AI_RESPONSES.greeting.suggestions
      };
      setMessages([greeting]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectCrisis = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const getAIResponse = (userMessage: string): { response: string; suggestions: string[]; isCrisis: boolean } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for crisis
    if (detectCrisis(userMessage)) {
      return {
        response: "I'm concerned about what you've shared. Your safety is the top priority. Please know that you're not alone, and help is available right now.\n\n🆘 **Immediate Support:**\n• South Africa: SADAG 0800 567 567\n• Lifeline: 0861 322 322\n• SMS: 31393\n\nWould you like me to connect you with a crisis counselor, or is there someone you trust who can be with you right now?",
        suggestions: ["Call crisis line", "Contact emergency contact", "I'm safe, just venting", "Talk to a therapist"],
        isCrisis: true
      };
    }

    // Pattern matching for responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('panic')) {
      return { ...AI_RESPONSES.anxious, isCrisis: false };
    }
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm') || lowerMessage.includes('too much')) {
      return { ...AI_RESPONSES.stressed, isCrisis: false };
    }
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed') || lowerMessage.includes('low')) {
      return { ...AI_RESPONSES.sad, isCrisis: false };
    }
    if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('well')) {
      return { ...AI_RESPONSES.happy, isCrisis: false };
    }
    if (lowerMessage.includes('cope') || lowerMessage.includes('strateg') || lowerMessage.includes('help me') || lowerMessage.includes('technique')) {
      return { ...AI_RESPONSES.coping, isCrisis: false };
    }
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia') || lowerMessage.includes('rest')) {
      return { ...AI_RESPONSES.sleep, isCrisis: false };
    }

    return { ...AI_RESPONSES.default, isCrisis: false };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = getAIResponse(input);
    
    if (aiResponse.isCrisis) {
      setShowCrisisAlert(true);
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date(),
      suggestions: aiResponse.suggestions,
      isCrisis: aiResponse.isCrisis
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      {/* Crisis Alert Banner */}
      {showCrisisAlert && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800">Crisis Support Available</h4>
                <p className="text-sm text-red-700 mb-3">
                  If you're in immediate danger, please reach out for help.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="destructive" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Call SADAG: 0800 567 567
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCrisisAlert(false)}>
                    I'm safe
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">MindSync AI Coach</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Always here for you
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Brain className="w-3 h-3" />
                Mood: {moodContext.trend}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.isCrisis
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Coach</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.role === 'assistant' && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Feedback for AI messages */}
                  {message.role === 'assistant' && !message.isCrisis && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Helpful?</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">AI Coach is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Your conversations are private and encrypted. In crisis? Call SADAG: 0800 567 567
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSuggestionClick("I need coping strategies for anxiety")}>
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium">Anxiety Help</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSuggestionClick("Help me with sleep issues")}>
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">Sleep Support</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSuggestionClick("I'm feeling stressed about work")}>
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium">Stress Relief</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSuggestionClick("I want to improve my mood")}>
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Mood Boost</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICoach;
