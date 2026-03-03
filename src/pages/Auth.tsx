import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowLeft, Heart, Shield, Users } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationData = authSchema.parse({
        email,
        password,
        fullName: isLogin ? undefined : fullName,
      });

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validationData.email,
          password: validationData.password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You've been successfully logged in." });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: validationData.email,
          password: validationData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { full_name: validationData.fullName || "" },
          },
        });
        if (error) throw error;
        
        // If email is auto-confirmed (dev mode), redirect to onboarding
        if (data.user?.email_confirmed_at) {
          toast({
            title: "Account created!",
            description: "Welcome to MindSync! Let's get you started.",
          });
          navigate('/onboarding');
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter your email address", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We've sent you a password reset link." });
      setResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-calm bg-clip-text text-transparent mb-4">MindSync</h1>
              <p className="text-xl text-muted-foreground mb-8">Your personal wellness companion for mental health</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Personalized Mood Tracking</h3>
                  <p className="text-muted-foreground">Track your emotions and discover patterns</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Secure & Private</h3>
                  <p className="text-muted-foreground">Your data is encrypted and stored securely</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI-Powered Support</h3>
                  <p className="text-muted-foreground">Get personalized recommendations</p>
                </div>
              </div>
            </div>
          </div>


          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {isLogin ? "Sign in to continue your wellness journey" : "Join thousands improving their mental health"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={isLogin ? "Enter your password" : "Create a password (8+ chars)"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isLogin ? "Signing in..." : "Creating account..."}
                      </>
                    ) : (
                      isLogin ? "Sign In" : "Create Account"
                    )}
                  </Button>

                  {isLogin && (
                    <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="w-full text-sm p-0">
                          Forgot your password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Enter your email and we'll send you a reset link.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Enter your email"
                          />
                          <Button onClick={handleForgotPassword} className="w-full">
                            Send Reset Link
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      disabled={loading}
                    >
                      {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
