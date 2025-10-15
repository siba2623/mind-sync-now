import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-calm.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm opacity-10"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Your wellness companion</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Track Your Mood,
                <span className="bg-gradient-calm bg-clip-text text-transparent block">
                  Transform Your Day
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                MindSync helps students and young professionals identify stress patterns 
                and manage emotions with personalized, science-backed micro-activities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 shadow-soft hover:shadow-glow transition-all duration-300 w-full sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/insights">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-in slide-in-from-right duration-700">
              <div className="absolute inset-0 bg-gradient-calm opacity-20 blur-3xl rounded-full"></div>
              <img
                src={heroImage}
                alt="Peaceful landscape representing calm and wellness"
                className="relative rounded-3xl shadow-card w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why MindSync?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, effective tools designed for busy students and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-in slide-in-from-bottom-4 duration-700">
              <div className="w-16 h-16 rounded-2xl bg-gradient-calm flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick Mood Check-ins</h3>
              <p className="text-muted-foreground leading-relaxed">
                Log your mood in seconds with our intuitive emoji-based system. 
                No complicated forms or lengthy surveys.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-calm flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover patterns between your mood and daily activities. 
                Understand what helps you thrive.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-calm flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Micro-Activities</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get personalized 2-3 minute activities when you need them most. 
                Evidence-based techniques for immediate relief.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-calm rounded-3xl p-12 md:p-16 shadow-card animate-in zoom-in duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Wellness?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students and professionals using MindSync 
              to build better emotional awareness and resilience.
            </p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2 shadow-soft hover:scale-105 transition-transform duration-300">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-bold bg-gradient-calm bg-clip-text text-transparent">
              MindSync
            </div>
            <p className="text-sm text-muted-foreground">
              Your wellness companion for a balanced life
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
