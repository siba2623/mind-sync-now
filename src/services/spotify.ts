import { supabase } from '../integrations/supabase/client';

const getSpotifyToken = async () => {
  try {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials are not properly configured');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Failed to get Spotify token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error in getSpotifyToken:', error);
    throw error;
  }
};

export const getMoodBasedRecommendations = async (mood: string) => {
  try {
    const token = await getSpotifyToken();
    
    const moodToFeatures = {
      happy: { target_valence: '0.8', target_energy: '0.8', seed_genres: 'pop,happy' },
      sad: { target_valence: '0.3', target_energy: '0.4', seed_genres: 'acoustic,piano' },
      calm: { target_energy: '0.3', target_valence: '0.5', seed_genres: 'ambient,classical' },
      energetic: { target_energy: '0.8', seed_genres: 'dance,electronic' },
      neutral: { target_energy: '0.5', target_valence: '0.5', seed_genres: 'pop,rock' }
    };

    const features = moodToFeatures[mood.toLowerCase() as keyof typeof moodToFeatures] || moodToFeatures.neutral;
    const params = new URLSearchParams();
    Object.entries(features).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    params.append('limit', '10');

    const response = await fetch(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.tracks) {
      throw new Error('No recommendations found');
    }

    return data.tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
      album: {
        name: track.album.name,
        images: track.album.images
      }
    }));
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};
