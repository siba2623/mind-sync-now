import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Activity, ArrowLeft } from "lucide-react";

const Insights = () => {
  const weeklyMoods = [
    { day: "Mon", value: 4, emoji: "🙂" },
    { day: "Tue", value: 5, emoji: "😊" },
    { day: "Wed", value: 3, emoji: "😐" },
    { day: "Thu", value: 4, emoji: "🙂" },
    { day: "Fri", value: 5, emoji: "😊" },
    { day: "Sat", value: 4, emoji: "🙂" },
    { day: "Sun", value: 3, emoji: "😐" },
  ];

  const insights = [
    {
      icon: TrendingUp,
      title: "Positive Trend",
      description: "Your mood has improved by 15% this week compared to last week.",
      color: "text-secondary",
    },
    {
      icon: Calendar,
      title: "Best Days",
      description: "You feel best on Tuesdays and Fridays. Try to schedule important tasks then.",
      color: "text-primary",
    },
    {
      icon: Activity,
      title: "Activity Impact",
      description: "Days with morning activities show 20% higher mood ratings.",
      color: "text-accent",
    },
  ];

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

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Insights
          </h1>
          <p className="text-lg text-muted-foreground">
            Understanding your emotional patterns over time
          </p>
        </div>

        {/* Weekly Mood Chart */}
        <Card className="p-8 mb-8 shadow-card animate-in slide-in-from-bottom-4 duration-700 bg-gradient-card">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            This Week's Mood
          </h2>
          
          <div className="space-y-6">
            {/* Chart */}
            <div className="flex items-end justify-between gap-3 h-48">
              {weeklyMoods.map((mood, index) => (
                <div key={index} className="flex flex-col items-center flex-1 gap-3">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full bg-gradient-calm rounded-t-lg transition-all duration-500 hover:opacity-80 flex items-end justify-center pb-2"
                      style={{ height: `${(mood.value / 5) * 100}%` }}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {mood.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Scale */}
            <div className="flex justify-between text-sm text-muted-foreground border-t border-border pt-4">
              <span>Struggling</span>
              <span>Low</span>
              <span>Okay</span>
              <span>Good</span>
              <span>Great</span>
            </div>
          </div>
        </Card>

        {/* Insights Grid */}
        <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          {insights.map((insight, index) => (
            <Card 
              key={index}
              className="p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-calm flex items-center justify-center flex-shrink-0">
                  <insight.icon className={`w-6 h-6 ${insight.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Patterns Section */}
        <Card className="p-8 mt-8 shadow-card animate-in slide-in-from-bottom-4 duration-700 delay-300 bg-gradient-card">
          <h2 className="text-2xl font-semibold mb-6">Your Patterns</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-primary">What Helps</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm">Morning walks increase your mood by 25%</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm">Regular sleep schedule shows better mood consistency</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm">Completing micro-activities boosts mood effectively</p>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-accent">Areas to Explore</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">→</span>
                  </div>
                  <p className="text-sm">Try evening breathing exercises for better sleep</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">→</span>
                  </div>
                  <p className="text-sm">Midweek check-ins could help maintain energy</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">→</span>
                  </div>
                  <p className="text-sm">Consider social activities on lower-mood days</p>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
