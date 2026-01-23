import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Heart, Brain, Zap, Shield } from 'lucide-react';

// Emotion categories based on Yale's research
const emotionCategories = {
  pleasant_high: {
    name: "Pleasant & High Energy",
    icon: <Zap className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-800",
    emotions: [
      "Ecstatic", "Elated", "Vibrant", "Energized", "Enthusiastic", 
      "Excited", "Festive", "Joyful", "Lively", "Passionate", 
      "Playful", "Surprised", "Thrilled", "Upbeat"
    ]
  },
  pleasant_low: {
    name: "Pleasant & Low Energy", 
    icon: <Heart className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
    emotions: [
      "Blessed", "Blissful", "Calm", "Centered", "Content", 
      "Fulfilled", "Grateful", "Hopeful", "Loving", "Peaceful", 
      "Pleased", "Relaxed", "Relieved", "Satisfied", "Serene"
    ]
  },
  unpleasant_high: {
    name: "Unpleasant & High Energy",
    icon: <Zap className="w-4 h-4" />,
    color: "bg-red-100 text-red-800", 
    emotions: [
      "Angry", "Annoyed", "Anxious", "Apprehensive", "Disgusted",
      "Enraged", "Frustrated", "Furious", "Irritated", "Livid",
      "Outraged", "Panicked", "Shocked", "Stressed", "Tense"
    ]
  },
  unpleasant_low: {
    name: "Unpleasant & Low Energy",
    icon: <Shield className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
    emotions: [
      "Dejected", "Depressed", "Despairing", "Disappointed", "Discouraged",
      "Down", "Drained", "Empty", "Exhausted", "Gloomy", 
      "Hopeless", "Lonely", "Melancholy", "Sad", "Weary"
    ]
  }
};

interface EmotionVocabularyProps {
  onEmotionSelect: (emotion: string, category: string) => void;
  selectedEmotion?: string;
}

export default function EmotionVocabulary({ onEmotionSelect, selectedEmotion }: EmotionVocabularyProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter emotions based on search
  const filteredCategories = Object.entries(emotionCategories).map(([key, category]) => ({
    key,
    ...category,
    emotions: category.emotions.filter(emotion => 
      emotion.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.emotions.length > 0);

  const handleEmotionClick = (emotion: string, categoryKey: string) => {
    onEmotionSelect(emotion, categoryKey);
    
    // Save to database (you'll need to get user_id from auth context)
    // For now, we'll just log it
    console.log('Saving emotion:', { emotion, category: categoryKey });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Emotion Vocabulary
        </CardTitle>
        <CardDescription>
          Find the right word to describe how you're feeling. Based on Yale's emotion research.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search emotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {Object.entries(emotionCategories).map(([key, category]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="flex items-center gap-1"
            >
              {category.icon}
              {category.name.split(' & ')[0]}
            </Button>
          ))}
        </div>

        {/* Emotion Grid */}
        <div className="space-y-6">
          {filteredCategories
            .filter(category => !selectedCategory || category.key === selectedCategory)
            .map((category) => (
            <div key={category.key} className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                {category.icon}
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.emotions.map((emotion) => (
                  <Badge
                    key={emotion}
                    variant={selectedEmotion === emotion ? "default" : "secondary"}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${
                      selectedEmotion === emotion ? '' : category.color
                    }`}
                    onClick={() => handleEmotionClick(emotion, category.key)}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedEmotion && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedEmotion}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This emotion will be saved with your mood entry for better tracking and insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}