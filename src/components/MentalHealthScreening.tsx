import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CrisisSupport } from "./CrisisSupport";

type AssessmentType = "PHQ-9" | "GAD-7" | null;

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export const MentalHealthScreening = () => {
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [severity, setSeverity] = useState("");
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const { toast } = useToast();

  const questions = assessmentType === "PHQ-9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const totalQuestions = questions.length;

  const handleResponse = (value: number) => {
    const newResponses = [...responses, value];
    setResponses(newResponses);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newResponses);
    }
  };

  const calculateResults = async (finalResponses: number[]) => {
    const totalScore = finalResponses.reduce((sum, val) => sum + val, 0);
    setScore(totalScore);

    let severityLevel = "";
    let requiresSupport = false;

    if (assessmentType === "PHQ-9") {
      if (totalScore <= 4) severityLevel = "Minimal depression";
      else if (totalScore <= 9) severityLevel = "Mild depression";
      else if (totalScore <= 14) severityLevel = "Moderate depression";
      else if (totalScore <= 19) severityLevel = "Moderately severe depression";
      else {
        severityLevel = "Severe depression";
        requiresSupport = true;
      }

      // Check for suicidal ideation (question 9)
      if (finalResponses[8] > 0) {
        requiresSupport = true;
      }
    } else {
      if (totalScore <= 4) severityLevel = "Minimal anxiety";
      else if (totalScore <= 9) severityLevel = "Mild anxiety";
      else if (totalScore <= 14) severityLevel = "Moderate anxiety";
      else {
        severityLevel = "Severe anxiety";
        requiresSupport = true;
      }
    }

    setSeverity(severityLevel);
    setShowCrisisSupport(requiresSupport);
    setShowResults(true);

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("mental_health_assessments").insert({
          user_id: user.id,
          assessment_type: assessmentType,
          score: totalScore,
          severity_level: severityLevel,
          responses: finalResponses,
          requires_professional_support: requiresSupport,
          recommendations: getRecommendations(totalScore, assessmentType!),
        });

        if (requiresSupport) {
          await supabase.from("support_interventions").insert({
            user_id: user.id,
            trigger_source: "assessment",
            intervention_type: "counselor_referral",
            status: "pending",
            notes: `${assessmentType} score: ${totalScore} (${severityLevel})`,
          });
        }
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
    }
  };

  const getRecommendations = (score: number, type: AssessmentType): string[] => {
    const recommendations: string[] = [];

    if (type === "PHQ-9") {
      if (score >= 15) {
        recommendations.push("Speak with a mental health professional immediately");
        recommendations.push("Contact Discovery Health mental wellness line: 0860 999 911");
        recommendations.push("Consider medication evaluation with a psychiatrist");
      } else if (score >= 10) {
        recommendations.push("Schedule an appointment with a counselor or therapist");
        recommendations.push("Use your Discovery Health counseling benefits (8 free sessions)");
        recommendations.push("Practice daily mood tracking and self-care activities");
      } else if (score >= 5) {
        recommendations.push("Continue monitoring your mood with MindSync");
        recommendations.push("Engage in regular physical activity");
        recommendations.push("Practice mindfulness and relaxation techniques");
      } else {
        recommendations.push("Maintain your current wellness routine");
        recommendations.push("Continue regular check-ins to track your mental health");
      }
    } else {
      if (score >= 15) {
        recommendations.push("Seek professional help for anxiety management");
        recommendations.push("Contact Discovery Health mental wellness line: 0860 999 911");
        recommendations.push("Consider cognitive behavioral therapy (CBT)");
      } else if (score >= 10) {
        recommendations.push("Schedule a consultation with a mental health professional");
        recommendations.push("Practice daily breathing exercises and meditation");
        recommendations.push("Use Discovery Health counseling benefits");
      } else if (score >= 5) {
        recommendations.push("Continue using MindSync breathing exercises");
        recommendations.push("Maintain regular physical activity");
        recommendations.push("Practice stress management techniques");
      } else {
        recommendations.push("Keep up your wellness practices");
        recommendations.push("Regular check-ins help maintain mental health");
      }
    }

    return recommendations;
  };

  const resetAssessment = () => {
    setAssessmentType(null);
    setCurrentQuestion(0);
    setResponses([]);
    setShowResults(false);
    setScore(0);
    setSeverity("");
    setShowCrisisSupport(false);
  };

  if (!assessmentType) {
    return (
      <div className="space-y-4">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setAssessmentType("PHQ-9")}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">PHQ-9 Depression Screening</h3>
              <p className="text-sm text-muted-foreground mb-2">
                A 9-question assessment to measure depression severity over the past 2 weeks.
              </p>
              <p className="text-xs text-muted-foreground">
                Takes 2-3 minutes • Clinically validated • Used by healthcare professionals
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setAssessmentType("GAD-7")}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">GAD-7 Anxiety Screening</h3>
              <p className="text-sm text-muted-foreground mb-2">
                A 7-question assessment to measure anxiety severity over the past 2 weeks.
              </p>
              <p className="text-xs text-muted-foreground">
                Takes 2 minutes • Clinically validated • Recognized by Discovery Health
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> These screenings are not diagnostic tools. They help identify symptoms
            that may benefit from professional evaluation. Results are shared with your wellness team
            to provide appropriate support.
          </p>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              score >= 15 ? "bg-red-100" : score >= 10 ? "bg-yellow-100" : "bg-green-100"
            }`}>
              {score >= 15 ? (
                <AlertCircle className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">{assessmentType} Results</h3>
            <p className="text-4xl font-bold text-primary mb-2">{score} / {totalQuestions * 3}</p>
            <p className="text-lg font-semibold text-muted-foreground">{severity}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Recommendations:</h4>
              <ul className="space-y-2">
                {getRecommendations(score, assessmentType).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Next Steps:</strong> Your results have been saved and shared with your wellness
                team. {score >= 10 && "A counselor may reach out to you within 24-48 hours."}
              </p>
            </div>
          </div>

          <Button onClick={resetAssessment} className="w-full mt-6">
            Take Another Assessment
          </Button>
        </Card>

        {showCrisisSupport && <CrisisSupport show={true} />}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{assessmentType}</h3>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          Over the last 2 weeks, how often have you been bothered by:
        </p>
        <h4 className="text-lg font-semibold mb-6">{questions[currentQuestion]}</h4>

        <RadioGroup onValueChange={(value) => handleResponse(parseInt(value))}>
          <div className="space-y-3">
            {RESPONSE_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
              >
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Button variant="outline" onClick={resetAssessment} className="w-full">
        Cancel Assessment
      </Button>
    </Card>
  );
};
