import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, Lock, Phone, Heart, Shield, Download, Moon, Sun, Bell } from "lucide-react";
import NotificationAnalytics from "@/components/NotificationAnalytics";
import NotificationPreferences from "@/components/NotificationPreferences";

interface ProfileData {
  full_name: string;
  date_of_birth: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  therapist_name: string;
  therapist_contact: string;
  personal_goals: string;
  affirmations: string;
  crisis_plan: string;
  theme_preference: string;
  notifications_enabled: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    date_of_birth: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    therapist_name: "",
    therapist_contact: "",
    personal_goals: "",
    affirmations: "",
    crisis_plan: "",
    theme_preference: "system",
    notifications_enabled: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setEmail(session.user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          date_of_birth: data.date_of_birth || "",
          phone: data.phone || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          therapist_name: data.therapist_name || "",
          therapist_contact: data.therapist_contact || "",
          personal_goals: data.personal_goals || "",
          affirmations: data.affirmations || "",
          crisis_plan: data.crisis_plan || "",
          theme_preference: data.theme_preference || "system",
          notifications_enabled: data.notifications_enabled ?? true,
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [moodData, journalData, checkinData] = await Promise.all([
        supabase.from("mood_entries").select("*").eq("user_id", user.id),
        supabase.from("journal_entries").select("*").eq("user_id", user.id),
        supabase.from("daily_checkins").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        profile,
        mood_entries: moodData.data || [],
        journal_entries: journalData.data || [],
        daily_checkins: checkinData.data || [],
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindsync-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Data exported", description: "Your data has been downloaded." });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-calm bg-clip-text text-transparent">
              MindSync
            </Link>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
            <TabsTrigger value="personal" className="gap-2">
              <User className="w-4 h-4 hidden sm:block" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-2">
              <Phone className="w-4 h-4 hidden sm:block" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="wellness" className="gap-2">
              <Heart className="w-4 h-4 hidden sm:block" />
              Wellness
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Shield className="w-4 h-4 hidden sm:block" />
              Settings
            </TabsTrigger>
          </TabsList>


          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving} className="w-full sm:w-auto">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Someone to contact in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        value={profile.emergency_contact_name}
                        onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input
                        type="tel"
                        value={profile.emergency_contact_phone}
                        onChange={(e) => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Healthcare Provider</CardTitle>
                  <CardDescription>Your therapist or doctor information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Therapist/Doctor Name</Label>
                      <Input
                        value={profile.therapist_name}
                        onChange={(e) => setProfile({ ...profile, therapist_name: e.target.value })}
                        placeholder="Provider name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Information</Label>
                      <Input
                        value={profile.therapist_contact}
                        onChange={(e) => setProfile({ ...profile, therapist_contact: e.target.value })}
                        placeholder="Phone or email"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="text-amber-800">Crisis Plan</CardTitle>
                  <CardDescription className="text-amber-700">
                    Steps to follow when you're in crisis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile.crisis_plan}
                    onChange={(e) => setProfile({ ...profile, crisis_plan: e.target.value })}
                    placeholder="Write your personal crisis plan here. Include coping strategies, people to call, and steps to take when feeling overwhelmed..."
                    className="min-h-[150px]"
                  />
                </CardContent>
              </Card>

              <Button onClick={handleUpdateProfile} disabled={saving} className="w-full sm:w-auto">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Emergency Info
              </Button>
            </div>
          </TabsContent>


          {/* Wellness Tab */}
          <TabsContent value="wellness">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Goals</CardTitle>
                  <CardDescription>What are you working towards?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile.personal_goals}
                    onChange={(e) => setProfile({ ...profile, personal_goals: e.target.value })}
                    placeholder="Write your personal wellness goals here..."
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-800">Daily Affirmations</CardTitle>
                  <CardDescription className="text-green-700">
                    Positive statements to remind yourself
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile.affirmations}
                    onChange={(e) => setProfile({ ...profile, affirmations: e.target.value })}
                    placeholder="I am worthy of love and happiness...&#10;I am capable of handling challenges...&#10;I choose to focus on what I can control..."
                    className="min-h-[150px]"
                  />
                </CardContent>
              </Card>

              <Button onClick={handleUpdateProfile} disabled={saving} className="w-full sm:w-auto">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Wellness Info
              </Button>

              {/* Notification Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Insights
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationAnalytics />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (8+ chars)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                    variant="outline"
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <NotificationPreferences />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Your Data
                  </CardTitle>
                  <CardDescription>
                    Download all your data as a JSON file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Sign Out</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
