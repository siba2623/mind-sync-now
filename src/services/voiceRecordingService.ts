import { supabase } from "@/integrations/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface VoiceRecordingData {
  audioBlob: Blob;
  durationSeconds: number;
}

export interface VoiceAnalysisResult {
  transcription: string;
  sentimentScore: number;
  emotionDetected: string;
  keywords: string[];
  supportFlag: boolean;
  recommendations: string[];
}

export class VoiceRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error("Failed to access microphone. Please check permissions.");
    }
  }

  async stopRecording(): Promise<VoiceRecordingData> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No active recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const durationSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve({ audioBlob, durationSeconds });
      };

      this.mediaRecorder.stop();
    });
  }

  async uploadAudio(audioBlob: Blob, userId: string): Promise<string> {
    const fileName = `voice-recordings/${userId}/${Date.now()}.webm`;
    
    const { data, error } = await supabase.storage
      .from("mood-captures")
      .upload(fileName, audioBlob, {
        contentType: "audio/webm",
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("mood-captures")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async analyzeVoiceRecording(transcription: string): Promise<VoiceAnalysisResult> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze this voice recording transcription for mental health insights:

"${transcription}"

Provide a JSON response with:
1. sentimentScore: A number from -1.0 (very negative) to 1.0 (very positive)
2. emotionDetected: Primary emotion (e.g., "anxious", "sad", "happy", "stressed", "calm")
3. keywords: Array of key emotional or mental health related words/phrases
4. supportFlag: Boolean - true if the person seems to need professional support (mentions of self-harm, severe depression, crisis)
5. recommendations: Array of 2-3 brief supportive suggestions

Return ONLY valid JSON, no markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Clean up response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        transcription,
        sentimentScore: analysis.sentimentScore || 0,
        emotionDetected: analysis.emotionDetected || "neutral",
        keywords: analysis.keywords || [],
        supportFlag: analysis.supportFlag || false,
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      console.error("Error analyzing voice recording:", error);
      // Return default analysis if AI fails
      return {
        transcription,
        sentimentScore: 0,
        emotionDetected: "neutral",
        keywords: [],
        supportFlag: false,
        recommendations: ["Take a moment to breathe", "Consider journaling your thoughts"],
      };
    }
  }

  async saveVoiceRecording(
    userId: string,
    audioUrl: string,
    durationSeconds: number,
    analysis: VoiceAnalysisResult
  ): Promise<string> {
    const { data, error } = await supabase
      .from("voice_recordings")
      .insert({
        user_id: userId,
        audio_url: audioUrl,
        duration_seconds: durationSeconds,
        transcription: analysis.transcription,
        sentiment_score: analysis.sentimentScore,
        emotion_detected: analysis.emotionDetected,
        keywords: analysis.keywords,
        support_flag: analysis.supportFlag,
      })
      .select()
      .single();

    if (error) throw error;

    // If support flag is raised, create intervention
    if (analysis.supportFlag) {
      await this.createSupportIntervention(userId, data.id);
    }

    return data.id;
  }

  private async createSupportIntervention(userId: string, recordingId: string): Promise<void> {
    await supabase.from("support_interventions").insert({
      user_id: userId,
      trigger_source: "voice_recording",
      trigger_id: recordingId,
      intervention_type: "counselor_referral",
      status: "pending",
      notes: "Automatic intervention triggered by voice analysis indicating need for support",
    });
  }

  // Web Speech API for transcription (fallback if no API available)
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve) => {
      // For now, return a placeholder
      // In production, you'd use a speech-to-text API
      resolve("Voice transcription would appear here. Integrate with Google Speech-to-Text or similar service.");
    });
  }
}

export const voiceRecordingService = new VoiceRecordingService();
