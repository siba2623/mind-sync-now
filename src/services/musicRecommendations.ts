import axios from 'axios';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface MusicRecommendation {
  title: string;
  artist: string;
  genre: string;
  reason: string;
  youtubeSearchUrl: string;
  spotifySearchUrl?: string;
  appleMusicSearchUrl?: string;
}

export interface MusicRecommendationResponse {
  recommendations: MusicRecommendation[];
  moodAnalysis: string;
  generalAdvice: string;
}

export const musicRecommendationService = {
  // Test function to verify API key works
  async testGeminiConnection(): Promise<{ success: boolean; message: string }> {
    const modelsToTry = [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
    ];

    if (!GEMINI_API_KEY) {
      return { success: false, message: 'API key not configured' };
    }

    console.log('Testing Gemini API with key:', GEMINI_API_KEY.substring(0, 10) + '...');

    for (const modelUrl of modelsToTry) {
      try {
        console.log('Trying model:', modelUrl);
        
        const response = await axios.post(
          `${modelUrl}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: 'Say "Hello, I am working!" and nothing else.' }]
              }
            ]
          }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('✅ Working model found:', modelUrl);
        return { success: true, message: `${text} (Using: ${modelUrl.split('/').pop()})` };
        
      } catch (error) {
        console.log('❌ Model failed:', modelUrl, error.response?.status);
        continue;
      }
    }

    return { success: false, message: 'All models failed. Check your API key or try again later.' };
  },

  async getMoodBasedRecommendations(mood: string, additionalContext?: string): Promise<MusicRecommendationResponse> {
    const modelsToTry = [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    ];

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const prompt = `You are a music therapist and wellness expert. Based on the user's current mood: "${mood}" ${additionalContext ? `and additional context: "${additionalContext}"` : ''}, provide personalized music recommendations that can help improve their emotional well-being.

Please respond with a JSON object in this exact format:
{
  "moodAnalysis": "Brief analysis of the user's mood and how music can help (2-3 sentences)",
  "generalAdvice": "General wellness advice related to their mood (2-3 sentences)",
  "recommendations": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "genre": "Genre",
      "reason": "Why this song helps with their current mood (1-2 sentences)"
    }
  ]
}

Guidelines:
- Provide 5-8 diverse music recommendations
- Include a mix of genres (pop, classical, indie, ambient, etc.)
- Consider both uplifting and calming songs based on the mood
- Choose well-known songs that are likely available on YouTube
- Explain why each song helps with the specific mood
- Keep reasons concise but meaningful
- Focus on songs that promote emotional wellness

Current mood: ${mood}
${additionalContext ? `Additional context: ${additionalContext}` : ''}`;

    // Try different models until one works
    for (const modelUrl of modelsToTry) {
      try {
        console.log('Trying model for music recommendations:', modelUrl);
        
        const response = await axios.post(
          `${modelUrl}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ]
          }
        );

        console.log('✅ Music API Response from:', modelUrl, response.data);
        
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.log('❌ No text in response from:', modelUrl);
          continue;
        }

        console.log('Gemini API Response:', text);

        // Parse the JSON response
        let parsedResponse: any;
        try {
          // Extract JSON from the response (in case there's extra text)
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          console.error('Raw response:', text);
          
          // Fallback response
          parsedResponse = {
            moodAnalysis: `Based on your ${mood} mood, music can be a powerful tool for emotional regulation and wellness.`,
            generalAdvice: "Consider taking some time for self-care and mindfulness. Music can help process emotions and improve your mental state.",
            recommendations: [
              {
                title: "Weightless",
                artist: "Marconi Union",
                genre: "Ambient",
                reason: "Scientifically designed to reduce anxiety and promote relaxation."
              },
              {
                title: "Clair de Lune",
                artist: "Claude Debussy",
                genre: "Classical",
                reason: "Beautiful, calming classical piece that soothes the mind."
              },
              {
                title: "Here Comes the Sun",
                artist: "The Beatles",
                genre: "Pop/Rock",
                reason: "Uplifting and hopeful song that can brighten your mood."
              },
              {
                title: "Breathe Me",
                artist: "Sia",
                genre: "Pop",
                reason: "Emotional and cathartic song that helps process feelings."
              },
              {
                title: "Mad World",
                artist: "Gary Jules",
                genre: "Alternative",
                reason: "Melancholic but beautiful, helps validate difficult emotions."
              }
            ]
          };
        }

        // Add YouTube and other platform search URLs
        const enhancedRecommendations: MusicRecommendation[] = parsedResponse.recommendations.map((rec: any) => ({
          ...rec,
          youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${rec.artist} ${rec.title}`)}`,
          spotifySearchUrl: `https://open.spotify.com/search/${encodeURIComponent(`${rec.artist} ${rec.title}`)}`,
          appleMusicSearchUrl: `https://music.apple.com/search?term=${encodeURIComponent(`${rec.artist} ${rec.title}`)}`
        }));

        return {
          recommendations: enhancedRecommendations,
          moodAnalysis: parsedResponse.moodAnalysis,
          generalAdvice: parsedResponse.generalAdvice
        };

      } catch (error) {
        console.log('❌ Model failed:', modelUrl, error.response?.status);
        continue;
      }
    }

    // If all models fail, throw error
    throw new Error('All Gemini models failed. Please check your API key or try again later.');
  },

  async getPlaylistForMood(mood: string, duration: 'short' | 'medium' | 'long' = 'medium'): Promise<MusicRecommendationResponse> {
    const durationMap = {
      short: '3-5 songs for a quick mood boost',
      medium: '6-8 songs for a 30-minute session',
      long: '10-12 songs for an hour-long wellness session'
    };

    return this.getMoodBasedRecommendations(
      mood, 
      `Create a ${durationMap[duration]} playlist`
    );
  },

  async getActivityBasedMusic(activity: string, mood?: string): Promise<MusicRecommendationResponse> {
    const context = mood 
      ? `for ${activity} while feeling ${mood}`
      : `for ${activity}`;
    
    return this.getMoodBasedRecommendations(
      mood || 'focused',
      `Recommend music ${context}`
    );
  }
};