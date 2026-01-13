import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { musicRecommendationService, type MusicRecommendationResponse } from '../services/musicRecommendations';
import { Loader2, Music, Youtube, Play, ExternalLink, Headphones, TestTube } from 'lucide-react';

interface MoodSoundProps {
  currentMood: string;
}

const MoodSound: React.FC<MoodSoundProps> = ({ currentMood }) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<MusicRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setIsLoading(true);
    try {
      const result = await musicRecommendationService.testGeminiConnection();
      if (result.success) {
        toast({
          title: "✅ API Test Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "❌ API Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Test Error",
        description: "Could not test API connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodBasedSongs = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    
    try {
      console.log('Getting AI music recommendations for mood:', currentMood);
      const result = await musicRecommendationService.getMoodBasedRecommendations(currentMood);
      
      setRecommendations(result);
      
      toast({
        title: "Music Recommendations Ready! 🎵",
        description: `Found ${result.recommendations.length} personalized songs for your ${currentMood} mood`,
      });
    } catch (err: any) {
      console.error('Error getting music recommendations:', err);
      const errorMessage = err.message || 'Failed to get recommendations. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Error Loading Music",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformClick = (url: string, platform: string) => {
    window.open(url, '_blank');
    toast({
      title: `Opening ${platform}`,
      description: 'Redirecting to music platform...',
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      calm: '😌',
      energetic: '⚡',
      anxious: '😰',
      neutral: '😐',
      excited: '🤩',
      relaxed: '😌',
      stressed: '😤',
      peaceful: '🕊️'
    };
    return moodEmojis[mood.toLowerCase()] || '🎵';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Creating Your Personal Playlist</h3>
          <p className="text-muted-foreground text-center">
            Our AI is analyzing your {currentMood} mood and finding the perfect songs...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {getMoodEmoji(currentMood)} Music for Your {currentMood} Mood
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={testAPI}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test API
          </Button>
          <Button
            onClick={getMoodBasedSongs}
            disabled={isLoading}
            className="gap-2"
          >
            <Headphones className="w-4 h-4" />
            {recommendations ? 'Get New Recommendations' : 'Get AI Recommendations'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <h3 className="font-semibold mb-2">Unable to Load Music</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div className="space-y-6">
          {/* Mood Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                AI Music Therapy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Your Mood Analysis</h4>
                <p className="text-muted-foreground">{recommendations.moodAnalysis}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Wellness Advice</h4>
                <p className="text-muted-foreground">{recommendations.generalAdvice}</p>
              </div>
            </CardContent>
          </Card>

          {/* Song Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recommended Songs</h3>
              <Badge variant="outline">{recommendations.recommendations.length} songs</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.recommendations.map((song, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{song.title}</CardTitle>
                        <CardDescription className="text-base font-medium text-foreground/80">
                          {song.artist}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {song.genre}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{song.reason}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePlatformClick(song.youtubeSearchUrl, 'YouTube')}
                        className="gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlatformClick(song.spotifySearchUrl!, 'Spotify')}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Spotify
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlatformClick(song.appleMusicSearchUrl!, 'Apple Music')}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Apple
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!recommendations && !isLoading && !error && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready for Some Music Therapy?</h3>
            <p className="text-muted-foreground mb-4">
              Get AI-powered music recommendations tailored to your {currentMood} mood
            </p>
            <Button onClick={getMoodBasedSongs} className="gap-2">
              <Headphones className="w-4 h-4" />
              Discover Music for Your Mood
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoodSound;