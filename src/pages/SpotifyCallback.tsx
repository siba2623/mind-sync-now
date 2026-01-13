import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Music } from "lucide-react";

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This page handles Spotify OAuth callback
    // For MindSync, we use Client Credentials Flow, so this is mainly a placeholder
    // In case Spotify redirects here, we'll redirect back to the main app
    
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card bg-gradient-card text-center">
        <CardContent className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Music className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">Spotify Integration</h1>
            <p className="text-muted-foreground">
              Processing Spotify connection...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyCallback;