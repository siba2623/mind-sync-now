import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Wind, Zap, Music, Heart, CheckCircle2 } from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Deep Breathing",
    duration: "2 min",
    description: "Calm your nervous system with box breathing technique",
    icon: Wind,
    color: "from-blue-400 to-cyan-400",
    bestFor: "Anxiety, Stress",
  },
  {
    id: 2,
    title: "Quick Stretch",
    duration: "3 min",
    description: "Release physical tension with gentle body movements",
    icon: Zap,
    color: "from-green-400 to-emerald-400",
    bestFor: "Low energy, Tension",
  },
  {
    id: 3,
    title: "Calming Sounds",
    duration: "2 min",
    description: "Listen to nature sounds to ground yourself",
    icon: Music,
    color: "from-purple-400 to-pink-400",
    bestFor: "Overwhelm, Restlessness",
  },
  {
    id: 4,
    title: "Gratitude Moment",
    duration: "2 min",
    description: "Shift perspective by noting three good things",
    icon: Heart,
    color: "from-rose-400 to-orange-400",
    bestFor: "Low mood, Negativity",
  },
];

const Activities = () => {
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    setCompletedActivities((prev) =>
      prev.includes(id) ? prev.filter((actId) => actId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-calm bg-clip-text text-transparent">
              MindSync
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Micro-Activities
          </h1>
          <p className="text-lg text-muted-foreground">
            Quick, science-backed activities to help you feel better right now
          </p>
        </div>

        {/* Personalized Recommendation */}
        <Card className="p-8 mb-8 shadow-card animate-in slide-in-from-bottom-4 duration-700 bg-gradient-calm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                Recommended for You
              </h2>
              <p className="text-white/90 mb-4">
                Based on your recent mood patterns, try a Quick Stretch to boost your energy
              </p>
              <Button variant="secondary" size="sm">
                Start Activity
              </Button>
            </div>
          </div>
        </Card>

        {/* Activities Grid */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          {activities.map((activity, index) => {
            const isCompleted = completedActivities.includes(activity.id);
            const Icon = activity.icon;
            
            return (
              <Card
                key={activity.id}
                className={`p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 ${
                  isCompleted ? "border-2 border-primary bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                          {activity.title}
                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium">{activity.duration}</span>
                          <span>•</span>
                          <span>Best for: {activity.bestFor}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {activity.description}
                    </p>

                    <div className="flex gap-3">
                      <Button size="sm" variant={isCompleted ? "outline" : "default"}>
                        Start Activity
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleComplete(activity.id)}
                      >
                        {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        {completedActivities.length > 0 && (
          <Card className="p-6 mt-8 shadow-card animate-in fade-in duration-500 bg-gradient-card">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Great Work!</h3>
              <p className="text-muted-foreground">
                You've completed {completedActivities.length} activit
                {completedActivities.length === 1 ? "y" : "ies"} today
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Activities;
