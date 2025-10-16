import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getTopTracks, getMoodBasedRecommendations } from '../services/spotify';
import { useToast } from '../hooks/use-toast';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface MoodSoundProps {
  currentMood: string;
}

const MoodSound: React.FC<MoodSoundProps> = ({ currentMood }) => {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const getMoodBasedSongs = async () => {
    setIsLoading(true);
    setError(null);
    setTracks([]);
    
    try {
      console.log('Starting recommendation request for mood:', currentMood);
      const recommendations = await getMoodBasedRecommendations(currentMood);
      
      if (!recommendations || recommendations.length === 0) {
        throw new Error('No recommendations found for your current mood');
      }

      console.log('Received recommendations:', recommendations);
      setTracks(recommendations);
      
      toast({
        title: "Music Loaded",
        description: `Found ${recommendations.length} tracks matching your ${currentMood} mood`,
      });
    } catch (err: any) {
      console.error('Error in getMoodBasedSongs:', err);
      const errorMessage = err.message || 'Failed to load recommendations. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Error Loading Music",
        description: errorMessage,
        variant: "destructive",
      });

      // Show technical error details in console for debugging
      if (err.stack) {
        console.error('Error stack:', err.stack);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playPreview = (track: Track) => {
    if (audio) {
      audio.pause();
    }
    if (track.preview_url) {
      const newAudio = new Audio(track.preview_url);
      newAudio.play();
      setAudio(newAudio);
      setCurrentlyPlaying(track.id);
    }
  };

  const stopPreview = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
      setCurrentlyPlaying(null);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      calm: '😌',
      energetic: '⚡',
      anxious: '😰',
      neutral: '😐'
    };
    return moodEmojis[mood.toLowerCase()] || '🎵';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {getMoodEmoji(currentMood)} Music for your {currentMood} Mood
        </h2>
        <Button
          onClick={getMoodBasedSongs}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Get Recommendations'}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 p-4 rounded-md bg-red-50">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <Card key={track.id} className="p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2">{track.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {track.artists.map(artist => artist.name).join(', ')}
            </p>
            <div className="flex space-x-2">
              {track.preview_url ? (
                <Button
                  variant={currentlyPlaying === track.id ? "destructive" : "default"}
                  size="sm"
                  onClick={() => currentlyPlaying === track.id ? stopPreview() : playPreview(track)}
                >
                  {currentlyPlaying === track.id ? 'Stop' : 'Preview'}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled>
                  No preview available
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(track.external_urls.spotify, '_blank')}
              >
                Open in Spotify
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {tracks.length === 0 && !isLoading && (
        <div className="text-center p-8 text-gray-500">
          Click 'Get Recommendations' to discover music that matches your mood
        </div>
      )}
    </div>
  );
};

export default MoodSound;