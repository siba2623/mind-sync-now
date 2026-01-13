import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, AlertTriangle, CheckCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react';

// PHQ-9 Questions (Patient Health Questionnaire)
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way",
];

// GAD-7 Questions (Generalized Anxiety Disorder)
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

type AssessmentType = 'phq9' | 'gad7' | null;

interface AssessmentResult {
  type: AssessmentType;
  score: number;
  severity: string;
  color: string;
  recommendation: string;
}

const MentalHealthAssessment = () => {
  const [activeAssessment, setActiveAssessment] = useState<AssessmentType>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const questions = activeAssessment === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const totalQuestions = questions.length;

  const startAssessment = (type: AssessmentType) => {
    setActiveAssessment(type);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    
    let severity: string;
    let color: string;
    let recommendation: string;

    if (activeAssessment === 'phq9') {
      if (totalScore <= 4) {
        severity = 'Minimal';
        color = 'bg-green-500';
        recommendation = 'Your symptoms suggest minimal depression. Continue your wellness practices and monitor your mood.';
      } else if (totalScore <= 9) {
        severity = 'Mild';
        color = 'bg-yellow-500';
        recommendation = 'Your symptoms suggest mild depression. Consider increasing self-care activities and monitoring your symptoms.';
      } else if (totalScore <= 14) {
        severity = 'Moderate';
        color = 'bg-orange-500';
        recommendation = 'Your symptoms suggest moderate depression. We recommend speaking with a healthcare provider.';
      } else if (totalScore <= 19) {
        severity = 'Moderately Severe';
        color = 'bg-red-400';
        recommendation = 'Your symptoms suggest moderately severe depression. Please consult with a mental health professional.';
      } else {
        severity = 'Severe';
        color = 'bg-red-600';
        recommendation = 'Your symptoms suggest severe depression. We strongly recommend seeking professional help immediately.';
      }
    } else {
      if (totalScore <= 4) {
        severity = 'Minimal';
        color = 'bg-green-500';
        recommendation = 'Your symptoms suggest minimal anxiety. Continue your wellness practices.';
      } else if (totalScore <= 9) {
        severity = 'Mild';
        color = 'bg-yellow-500';
        recommendation = 'Your symptoms suggest mild anxiety. Consider relaxation techniques and monitoring your symptoms.';
      } else if (totalScore <= 14) {
        severity = 'Moderate';
        color = 'bg-orange-500';
        recommendation = 'Your symptoms suggest moderate anxiety. We recommend speaking with a healthcare provider.';
      } else {
        severity = 'Severe';
        color = 'bg-red-600';
        recommendation = 'Your symptoms suggest severe anxiety. Please consult with a mental health professional.';
      }
    }

    const assessmentResult: AssessmentResult = {
      type: activeAssessment,
      score: totalScore,
      severity,
      color,
      recommendation,
    };

    setResult(assessmentResult);
    setLoading(false);

    // Award Vitality points
    toast({
      title: "Assessment Complete! +100 Vitality Points",
      description: "Thank you for completing your mental health screening.",
    });
  };

  const resetAssessment = () => {
    setActiveAssessment(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };


  // Assessment Selection Screen
  if (!activeAssessment) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              Mental Health Assessments
            </CardTitle>
            <CardDescription>
              Validated screening tools to help you understand your mental health. 
              Complete monthly for +100 Vitality Points.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                These assessments are screening tools, not diagnostic instruments. 
                Results should be discussed with a healthcare professional.
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary" onClick={() => startAssessment('phq9')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <ClipboardCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">PHQ-9</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Depression screening questionnaire. 9 questions, ~3 minutes.
                  </p>
                  <Badge variant="secondary">+100 Points</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary" onClick={() => startAssessment('gad7')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <ClipboardCheck className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-semibold mb-2">GAD-7</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Anxiety screening questionnaire. 7 questions, ~2 minutes.
                  </p>
                  <Badge variant="secondary">+100 Points</Badge>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            {result.type === 'phq9' ? 'PHQ-9 Depression Screening' : 'GAD-7 Anxiety Screening'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full ${result.color} mx-auto mb-4 flex items-center justify-center`}>
              <span className="text-3xl font-bold text-white">{result.score}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{result.severity}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{result.recommendation}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Score Interpretation</h4>
            <div className="space-y-2 text-sm">
              {result.type === 'phq9' ? (
                <>
                  <div className="flex justify-between"><span>0-4: Minimal</span><span className="text-green-600">●</span></div>
                  <div className="flex justify-between"><span>5-9: Mild</span><span className="text-yellow-600">●</span></div>
                  <div className="flex justify-between"><span>10-14: Moderate</span><span className="text-orange-600">●</span></div>
                  <div className="flex justify-between"><span>15-19: Moderately Severe</span><span className="text-red-400">●</span></div>
                  <div className="flex justify-between"><span>20-27: Severe</span><span className="text-red-600">●</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span>0-4: Minimal</span><span className="text-green-600">●</span></div>
                  <div className="flex justify-between"><span>5-9: Mild</span><span className="text-yellow-600">●</span></div>
                  <div className="flex justify-between"><span>10-14: Moderate</span><span className="text-orange-600">●</span></div>
                  <div className="flex justify-between"><span>15-21: Severe</span><span className="text-red-600">●</span></div>
                </>
              )}
            </div>
          </div>

          {result.score >= 10 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800">Professional Support Recommended</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Based on your score, we recommend speaking with a mental health professional. 
                  Discovery Health members can access the mental health provider network.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Find a Provider
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetAssessment} className="flex-1">
              Take Another Assessment
            </Button>
            <Button onClick={resetAssessment} className="flex-1">
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question Screen
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            {activeAssessment === 'phq9' ? 'PHQ-9' : 'GAD-7'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Over the last 2 weeks, how often have you been bothered by:
          </p>
          <h3 className="text-lg font-medium">{questions[currentQuestion]}</h3>
        </div>

        <RadioGroup
          value={answers[currentQuestion]?.toString()}
          onValueChange={(value) => handleAnswer(parseInt(value))}
          className="space-y-3"
        >
          {RESPONSE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
              <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-3">
          <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={nextQuestion} 
            disabled={answers[currentQuestion] === undefined}
            className="flex-1"
          >
            {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <Button variant="ghost" onClick={resetAssessment} className="w-full">
          Cancel Assessment
        </Button>
      </CardContent>
    </Card>
  );
};

export default MentalHealthAssessment;
