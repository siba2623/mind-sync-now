import { supabase } from '../integrations/supabase/client';

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

const getSpotifyAccessToken = async () => {
  // First, try to get the token from Supabase auth session
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.provider_token) {
    return session.provider_token;
  }

  // If no session token, use client credentials flow
  if (!accessToken || (tokenExpiration && Date.now() > tokenExpiration)) {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (data.access_token) {
      accessToken = data.access_token;
      tokenExpiration = Date.now() + (data.expires_in * 1000);
      return accessToken;
    }
  }

  return accessToken;
};

export const fetchWebApi = async (endpoint: string, method: string, body?: any) => {
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      throw new Error('No Spotify token available');
    }

    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Spotify API error: ${errorData.error?.message || res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching from Spotify API:', error);
    throw error;
  }
};

export const getTopTracks = async () => {
  try {
    const response = await fetchWebApi(
      'v1/me/top/tracks?time_range=long_term&limit=5',
      'GET'
    );
    return response.items;
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
};

export const getMoodBasedRecommendations = async (mood: string) => {
  try {
    // Map moods to Spotify audio features and seed genres
    const moodMappings: Record<string, { features: Record<string, number>; genres: string[] }> = {
      happy: {
        features: {
          min_valence: 0.7,
          target_energy: 0.8,
          target_danceability: 0.7
        },
        genres: ['pop', 'happy', 'dance']
      },
      sad: {
        features: {
          max_valence: 0.3,
          target_energy: 0.4,
          target_acousticness: 0.8
        },
        genres: ['sad', 'acoustic', 'piano']
      },
      calm: {
        features: {
          max_energy: 0.4,
          target_valence: 0.5,
          min_instrumentalness: 0.5,
          target_tempo: 100
        },
        genres: ['ambient', 'chill', 'sleep']
      },
      energetic: {
        features: {
          min_energy: 0.7,
          target_valence: 0.6,
          target_tempo: 130
        },
        genres: ['workout', 'dance', 'electronic']
      },
      anxious: {
        features: {
          target_energy: 0.3,
          target_valence: 0.5,
          target_instrumentalness: 0.7
        },
        genres: ['classical', 'ambient', 'meditation']
      },
      neutral: {
        features: {
          target_energy: 0.5,
          target_valence: 0.5,
          target_popularity: 70
        },
        genres: ['pop', 'indie', 'alternative']
      }
    };

    const moodConfig = moodMappings[mood.toLowerCase()] || moodMappings.calm;
    const params = new URLSearchParams({
      ...moodConfig.features,
      seed_genres: moodConfig.genres.join(','),
      limit: '9'
    });
    
    const response = await fetchWebApi(
      `v1/recommendations?${params.toString()}`,
      'GET'
    );

    // Add audio features to each track
    const tracks = response.tracks;
    if (tracks.length > 0) {
      const trackIds = tracks.map((track: any) => track.id).join(',');
      const audioFeatures = await fetchWebApi(
        `v1/audio-features?ids=${trackIds}`,
        'GET'
      );
      
      return tracks.map((track: any, index: number) => ({
        ...track,
        audioFeatures: audioFeatures.audio_features[index]
      }));
    }

    return tracks;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};