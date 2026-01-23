import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { photoMoodService } from "@/services/photoMoodService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PhotoMoodCapture = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const capturePhoto = async () => {
    try {
      setIsProcessing(true);
      const photoBlob = await photoMoodService.capturePhoto();
      
      // Create preview
      const previewUrl = URL.createObjectURL(photoBlob);
      setPhotoPreview(previewUrl);
      
      // Analyze photo
      const result = await photoMoodService.analyzePhoto(photoBlob);
      setAnalysis(result);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Upload photo
      const photoUrl = await photoMoodService.uploadPhoto(photoBlob, user.id);
      
      // Save to database
      await photoMoodService.savePhotoMood(user.id, photoUrl, result, notes);
      
      toast({
        title: "Photo Captured",
        description: `Mood detected: ${result.moodDetected}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Capture Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPhotoPreview(null);
    setAnalysis(null);
    setNotes("");
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Photo Mood Capture</h3>
        <p className="text-sm text-muted-foreground">
          Take a selfie to capture your current mood. Our AI will analyze your facial expression.
        </p>
        
        {photoPreview && (
          <div className="relative w-full max-w-sm mx-auto">
            <img
              src={photoPreview}
              alt="Mood capture"
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}
        
        {analysis && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Detected Mood:</span>
              <span className="text-sm font-semibold text-primary">
                {analysis.moodDetected}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence:</span>
              <span className="text-sm">
                {analysis.facialExpressionAnalysis.confidence}%
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Insights:</span>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {analysis.insights.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
            {analysis.supportRecommended && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  We recommend speaking with a wellness professional. Support resources are available.
                </p>
              </div>
            )}
          </div>
        )}
        
        <Textarea
          placeholder="Add notes about how you're feeling (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        
        <div className="flex gap-4">
          {!photoPreview && (
            <Button
              size="lg"
              onClick={capturePhoto}
              disabled={isProcessing}
              className="gap-2 flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </>
              )}
            </Button>
          )}
          
          {photoPreview && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={reset}
                className="gap-2 flex-1"
              >
                <ImageIcon className="w-5 h-5" />
                Take Another
              </Button>
            </>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Your photos are private and secure. Facial analysis helps us understand your emotional well-being.
        </p>
      </div>
    </Card>
  );
};
