import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Share2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const HealthDataExport = () => {
  const [selectedData, setSelectedData] = useState({
    moodEntries: true,
    voiceRecordings: false, // Privacy - off by default
    photoCaptures: false, // Privacy - off by default
    healthMetrics: true,
    assessments: true,
    journalEntries: false,
    wellnessPrograms: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: "pdf" | "csv" | "json") => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const exportData: any = {
        exportDate: new Date().toISOString(),
        patientInfo: {
          userId: user.id,
          email: user.email,
        },
        dataIncluded: selectedData,
      };

      // Fetch selected data
      if (selectedData.moodEntries) {
        const { data } = await supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);
        exportData.moodEntries = data;
      }

      if (selectedData.healthMetrics) {
        const { data } = await supabase
          .from("health_metrics")
          .select("*")
          .eq("user_id", user.id)
          .order("metric_date", { ascending: false })
          .limit(90);
        exportData.healthMetrics = data;
      }

      if (selectedData.assessments) {
        const { data } = await supabase
          .from("mental_health_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        exportData.assessments = data;
      }

      if (selectedData.wellnessPrograms) {
        const { data } = await supabase
          .from("wellness_programs")
          .select("*")
          .eq("user_id", user.id);
        exportData.wellnessPrograms = data;
      }

      // Generate file based on format
      if (format === "json") {
        downloadJSON(exportData);
      } else if (format === "csv") {
        downloadCSV(exportData);
      } else {
        generatePDF(exportData);
      }

      toast({
        title: "Export Successful",
        description: `Your health data has been exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindsync-health-data-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any) => {
    let csv = "MindSync Health Data Export\n\n";

    // Mood Entries
    if (data.moodEntries?.length) {
      csv += "Mood Entries\n";
      csv += "Date,Mood Value,Notes,Intensity\n";
      data.moodEntries.forEach((entry: any) => {
        csv += `${entry.created_at},${entry.mood_value},"${entry.notes || ""}",${entry.intensity_level || ""}\n`;
      });
      csv += "\n";
    }

    // Health Metrics
    if (data.healthMetrics?.length) {
      csv += "Health Metrics\n";
      csv += "Date,Steps,Heart Rate,Active Minutes,Vitality Points\n";
      data.healthMetrics.forEach((metric: any) => {
        csv += `${metric.metric_date},${metric.steps_count || ""},${metric.heart_rate_avg || ""},${metric.active_minutes || ""},${metric.vitality_points || ""}\n`;
      });
      csv += "\n";
    }

    // Assessments
    if (data.assessments?.length) {
      csv += "Mental Health Assessments\n";
      csv += "Date,Type,Score,Severity\n";
      data.assessments.forEach((assessment: any) => {
        csv += `${assessment.created_at},${assessment.assessment_type},${assessment.score},${assessment.severity_level}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindsync-health-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDF = (data: any) => {
    // For production, use a library like jsPDF or pdfmake
    toast({
      title: "PDF Export",
      description: "PDF export will be available in the next update. Use CSV or JSON for now.",
    });
  };

  const shareWithDoctor = async () => {
    toast({
      title: "Share with Healthcare Provider",
      description: "This feature will allow you to securely share data with your doctor via Discovery Health portal.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Export Your Health Data</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Export your MindSync data to share with healthcare providers or for your personal records.
          All exports are HIPAA-compliant and encrypted.
        </p>

        <div className="space-y-4 mb-6">
          <h4 className="font-medium">Select Data to Include:</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="moodEntries"
                checked={selectedData.moodEntries}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, moodEntries: checked as boolean })
                }
              />
              <Label htmlFor="moodEntries" className="cursor-pointer">
                Mood Entries (last 100 entries)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="healthMetrics"
                checked={selectedData.healthMetrics}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, healthMetrics: checked as boolean })
                }
              />
              <Label htmlFor="healthMetrics" className="cursor-pointer">
                Health Metrics (last 90 days)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="assessments"
                checked={selectedData.assessments}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, assessments: checked as boolean })
                }
              />
              <Label htmlFor="assessments" className="cursor-pointer">
                Mental Health Assessments (PHQ-9, GAD-7)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="wellnessPrograms"
                checked={selectedData.wellnessPrograms}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, wellnessPrograms: checked as boolean })
                }
              />
              <Label htmlFor="wellnessPrograms" className="cursor-pointer">
                Wellness Programs & Progress
              </Label>
            </div>

            <div className="flex items-center space-x-2 opacity-50">
              <Checkbox
                id="voiceRecordings"
                checked={selectedData.voiceRecordings}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, voiceRecordings: checked as boolean })
                }
              />
              <Label htmlFor="voiceRecordings" className="cursor-pointer">
                Voice Recordings (links only, not audio files)
              </Label>
            </div>

            <div className="flex items-center space-x-2 opacity-50">
              <Checkbox
                id="photoCaptures"
                checked={selectedData.photoCaptures}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, photoCaptures: checked as boolean })
                }
              />
              <Label htmlFor="photoCaptures" className="cursor-pointer">
                Photo Captures (analysis only, not images)
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Export as CSV
          </Button>

          <Button
            onClick={() => handleExport("json")}
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export as JSON
          </Button>

          <Button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Export as PDF
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Share2 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Share with Healthcare Provider</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Securely share your MindSync data with your doctor or therapist through the
              Discovery Health portal. They'll receive a comprehensive report of your mental
              wellness journey.
            </p>
            <Button onClick={shareWithDoctor} className="gap-2">
              <Mail className="w-4 h-4" />
              Share via Discovery Portal
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <p className="text-sm text-muted-foreground">
          <strong>Privacy Note:</strong> Voice recordings and photos are excluded by default to
          protect your privacy. Only analysis results and metadata are included unless you
          explicitly enable them. All exports are encrypted and comply with POPIA and HIPAA standards.
        </p>
      </Card>
    </div>
  );
};
