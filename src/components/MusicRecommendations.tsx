import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Music, Play, ExternalLink, Youtube, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { musicRecommendationService, type MusicRecommendationResponse } from '@/services/musicRecommendations';

interface MusicRecommendationsProps {
  mood: string;
  onClose?: () => void;
}

const MusicRecommendations = ({ mood, onClose }: MusicRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<MusicRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const result = await musicRecommendationService.getMoodBasedRecommendations(mood);
      setRecommendations(result);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to get music recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformClick = (url: string, platform: string) => {
    window.open(url, '_blank');
    toast({
      title: `Opening ${platform}`,
      description: 'Redirecting to music platform...',
    });
  };

  if (!recommendations && !loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Music for Your Mood</CardTitle>
          <CardDescription>
            Get personalized music recommendations based on how you're feeling: <strong>{mood}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={fetchRecommendations} size="lg" className="gap-2">
            <Headphones className="w-5 h-5" />
            Get Music Recommendations
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Finding Perfect Music for You</h3>
          <p className="text-muted-foreground text-center">
            Our AI is analyzing your mood and curating personalized recommendations...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Mood Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Music Therapy for "{mood}" Mood
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Mood Analysis</h4>
            <p className="text-muted-foreground">{recommendations?.moodAnalysis}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Wellness Advice</h4>
            <p className="text-muted-foreground">{recommendations?.generalAdvice}</p>
          </div>
        </CardContent>
      </Card>

      {/* Music Recommendations */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recommended Songs</h3>
          <Badge variant="outline">{recommendations?.recommendations.length} songs</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recommendations?.recommendations.map((song, index) => (
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
                    Apple Music
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={fetchRecommendations} variant="outline" className="gap-2">
          <Music className="w-4 h-4" />
          Get New Recommendations
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default MusicRecommendations;