import { supabase } from "@/integrations/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface PhotoAnalysisResult {
  moodDetected: string;
  facialExpressionAnalysis: {
    dominantEmotion: string;
    confidence: number;
    emotions: {
      happy: number;
      sad: number;
      anxious: number;
      neutral: number;
      stressed: number;
    };
  };
  insights: string[];
  supportRecommended: boolean;
}

export class PhotoMoodService {
  async capturePhoto(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "user"; // Use front camera on mobile

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error("No photo selected"));
        }
      };

      input.click();
    });
  }

  async uploadPhoto(photoBlob: Blob, userId: string): Promise<string> {
    const fileName = `photo-moods/${userId}/${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from("mood-captures")
      .upload(fileName, photoBlob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("mood-captures")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async analyzePhoto(photoBlob: Blob): Promise<PhotoAnalysisResult> {
    try {
      // Convert blob to base64
      const base64Image = await this.blobToBase64(photoBlob);
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this selfie photo for mood and emotional state. 
      
Look at facial expressions, body language, and overall appearance to determine:
1. The person's dominant mood/emotion
2. Confidence level in your assessment (0-100)
3. Breakdown of emotions detected (happy, sad, anxious, neutral, stressed) as percentages
4. Brief insights about their emotional state
5. Whether professional support might be beneficial

Provide response as JSON with this structure:
{
  "dominantEmotion": "string",
  "confidence": number,
  "emotions": {
    "happy": number,
    "sad": number,
    "anxious": number,
    "neutral": number,
    "stressed": number
  },
  "insights": ["string"],
  "supportRecommended": boolean
}

Return ONLY valid JSON, no markdown.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1],
          },
        },
      ]);

      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        moodDetected: analysis.dominantEmotion || "neutral",
        facialExpressionAnalysis: {
          dominantEmotion: analysis.dominantEmotion || "neutral",
          confidence: analysis.confidence || 50,
          emotions: analysis.emotions || {
            happy: 20,
            sad: 20,
            anxious: 20,
            neutral: 20,
            stressed: 20,
          },
        },
        insights: analysis.insights || ["Unable to analyze photo"],
        supportRecommended: analysis.supportRecommended || false,
      };
    } catch (error) {
      console.error("Error analyzing photo:", error);
      // Return default analysis
      return {
        moodDetected: "neutral",
        facialExpressionAnalysis: {
          dominantEmotion: "neutral",
          confidence: 0,
          emotions: {
            happy: 20,
            sad: 20,
            anxious: 20,
            neutral: 20,
            stressed: 20,
          },
        },
        insights: ["Photo analysis unavailable"],
        supportRecommended: false,
      };
    }
  }

  async savePhotoMood(
    userId: string,
    photoUrl: string,
    analysis: PhotoAnalysisResult,
    notes?: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from("photo_mood_captures")
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        mood_detected: analysis.moodDetected,
        facial_expression_analysis: analysis.facialExpressionAnalysis,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const photoMoodService = new PhotoMoodService();
