import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";
import { voiceRecordingService } from "@/services/voiceRecordingService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      await voiceRecordingService.startRecording();
      setIsRecording(true);
      
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      // Store interval ID
      (window as any).recordingInterval = interval;
    } catch (error: any) {
      toast({
        title: "Recording Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Clear timer
      clearInterval((window as any).recordingInterval);
      
      const { audioBlob, durationSeconds } = await voiceRecordingService.stopRecording();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload audio
      const audioUrl = await voiceRecordingService.uploadAudio(audioBlob, user.id);
      
      // Transcribe (placeholder for now)
      const transcription = await voiceRecordingService.transcribeAudio(audioBlob);
      
      // Analyze
      const analysis = await voiceRecordingService.analyzeVoiceRecording(transcription);
      
      // Save to database
      await voiceRecordingService.saveVoiceRecording(user.id, audioUrl, durationSeconds, analysis);
      
      toast({
        title: "Recording Saved",
        description: analysis.supportFlag 
          ? "We've detected you might need support. A wellness coach will reach out soon."
          : `Mood detected: ${analysis.emotionDetected}`,
      });
      
      setRecordingTime(0);
    } catch (error: any) {
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-semibold">Voice Mood Capture</h3>
        <p className="text-sm text-muted-foreground text-center">
          Record how you're feeling. We'll analyze your voice to understand your emotional state.
        </p>
        
        {isRecording && (
          <div className="text-2xl font-mono text-primary">
            {formatTime(recordingTime)}
          </div>
        )}
        
        <div className="flex gap-4">
          {!isRecording && !isProcessing && (
            <Button
              size="lg"
              onClick={startRecording}
              className="gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </Button>
          )}
          
          {isProcessing && (
            <Button size="lg" disabled className="gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Your voice recording is private and secure. We use AI to detect emotional patterns
          and provide personalized support when needed.
        </p>
      </div>
    </Card>
  );
};
