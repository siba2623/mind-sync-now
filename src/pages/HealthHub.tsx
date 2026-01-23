import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { PhotoMoodCapture } from "@/components/PhotoMoodCapture";
import { DiscoveryHealthDashboard } from "@/components/DiscoveryHealthDashboard";
import { MentalHealthScreening } from "@/components/MentalHealthScreening";
import { HealthDataExport } from "@/components/HealthDataExport";
import { MedicationTracker } from "@/components/MedicationTracker";
import EmotionVocabulary from "@/components/EmotionVocabulary";
import RegulationStrategies from "@/components/RegulationStrategies";
import { Mic, Camera, Heart, ClipboardCheck, Download, Pill, Brain, Zap } from "lucide-react";
import { useState } from "react";

const HealthHub = () => {
  const [currentEmotion, setCurrentEmotion] = useState<string>('');
  const [completedStrategies, setCompletedStrategies] = useState<Array<{id: number, helpful: boolean}>>([]);

  const handleEmotionSelect = (emotion: string, category: string) => {
    setCurrentEmotion(emotion);
    console.log('Selected emotion:', emotion, 'Category:', category);
  };

  const handleStrategyComplete = (strategyId: number, helpful: boolean) => {
    setCompletedStrategies(prev => [...prev, { id: strategyId, helpful }]);
    console.log('Strategy completed:', strategyId, 'Helpful:', helpful);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Hub</h1>
          <p className="text-muted-foreground">
            Comprehensive wellness tracking powered by Discovery Health
          </p>
        </div>

        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="discovery" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Discovery</span>
            </TabsTrigger>
            <TabsTrigger value="emotions" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Emotions</span>
            </TabsTrigger>
            <TabsTrigger value="strategies" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Strategies</span>
            </TabsTrigger>
            <TabsTrigger value="screening" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Screening</span>
            </TabsTrigger>
            <TabsTrigger value="medication" className="gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Medication</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="photo" className="gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discovery">
            <DiscoveryHealthDashboard />
          </TabsContent>

          <TabsContent value="emotions">
            <div className="max-w-4xl mx-auto">
              <EmotionVocabulary 
                onEmotionSelect={handleEmotionSelect}
                selectedEmotion={currentEmotion}
              />
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <div className="max-w-4xl mx-auto">
              <RegulationStrategies 
                currentEmotion={currentEmotion}
                onStrategyComplete={handleStrategyComplete}
              />
            </div>
          </TabsContent>

          <TabsContent value="screening">
            <div className="max-w-2xl mx-auto">
              <MentalHealthScreening />
            </div>
          </TabsContent>

          <TabsContent value="medication">
            <div className="max-w-4xl mx-auto">
              <MedicationTracker />
            </div>
          </TabsContent>

          <TabsContent value="voice">
            <div className="max-w-2xl mx-auto">
              <VoiceRecorder />
              
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold mb-4">How Voice Capture Works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Record yourself talking about how you feel</li>
                  <li>• Our AI analyzes your voice tone, pace, and word choice</li>
                  <li>• We detect emotional patterns and stress indicators</li>
                  <li>• If support is needed, we'll connect you with resources</li>
                  <li>• All recordings are private and encrypted</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photo">
            <div className="max-w-2xl mx-auto">
              <PhotoMoodCapture />
              
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold mb-4">How Photo Capture Works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Take a selfie showing your current state</li>
                  <li>• AI analyzes facial expressions and body language</li>
                  <li>• We detect emotions like happiness, stress, anxiety, or calm</li>
                  <li>• Track visual mood patterns over time</li>
                  <li>• Photos are stored securely and never shared</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="max-w-4xl mx-auto">
              <HealthDataExport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthHub;
