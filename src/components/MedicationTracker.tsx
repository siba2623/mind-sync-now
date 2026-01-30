import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Pill, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Bell,
  Flame,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Trophy,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, differenceInDays } from "date-fns";
import { notificationService } from "@/services/notificationService";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  refillDate?: string;
  pillsRemaining?: number;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  sideEffects?: string;
}

interface AdherenceStats {
  streak: number;
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
}

export const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [todaysTaken, setTodaysTaken] = useState<Set<string>>(new Set());
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats>({
    streak: 0,
    adherenceRate: 0,
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSideEffectForm, setShowSideEffectForm] = useState<string | null>(null);
  const [sideEffectNote, setSideEffectNote] = useState('');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once daily',
    time: '08:00',
    prescribedBy: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    refillDate: '',
    pillsRemaining: 30
  });

  useEffect(() => {
    loadMedications();
    loadMedicationLogs();
  }, []);

  useEffect(() => {
    if (medications.length > 0 && medicationLogs.length >= 0) {
      calculateAdherenceStats();
    }
  }, [medications, medicationLogs]);

  const loadMedications = async () => {
    try {
      // First, try to load from local storage
      const stored = localStorage.getItem('medications');
      if (stored) {
        setMedications(JSON.parse(stored));
        return;
      }

      // Then try database if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const formattedMeds = data.map(med => ({
              id: med.id,
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              times: med.times || ['08:00'],
              prescribedBy: med.prescribed_by || '',
              startDate: med.start_date,
              endDate: med.end_date,
              notes: med.notes
            }));
            setMedications(formattedMeds);
            localStorage.setItem('medications', JSON.stringify(formattedMeds));
            return;
          }
        } catch (dbError) {
          console.log('Database load failed, using local storage');
        }
      }

      // Show mock data if nothing else works
      const mockData = [
        {
          id: "1",
          name: "Sertraline (Zoloft)",
          dosage: "50mg",
          frequency: "Once daily",
          times: ["08:00"],
          prescribedBy: "Dr. Smith",
          startDate: "2026-01-01",
          notes: "Take with food",
        },
      ];
      setMedications(mockData);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const loadMedicationLogs = async () => {
    try {
      const stored = localStorage.getItem('medicationLogs');
      if (stored) {
        const logs = JSON.parse(stored);
        setMedicationLogs(logs);
        
        // Update today's taken set
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayLogs = logs.filter((log: MedicationLog) => 
          log.takenAt.startsWith(today)
        );
        setTodaysTaken(new Set(todayLogs.map((log: MedicationLog) => log.medicationId)));
      }
    } catch (error) {
      console.error('Error loading medication logs:', error);
    }
  };

  const calculateAdherenceStats = () => {
    const last30Days = subDays(new Date(), 30);
    const recentLogs = medicationLogs.filter(log => 
      new Date(log.takenAt) >= last30Days
    );

    // Calculate expected doses (simplified: 1 dose per day per medication)
    const daysTracked = Math.min(30, medications.length > 0 ? 
      differenceInDays(new Date(), new Date(medications[0].startDate)) : 0
    );
    const totalExpectedDoses = medications.length * daysTracked;
    const takenDoses = recentLogs.length;
    const missedDoses = Math.max(0, totalExpectedDoses - takenDoses);
    const adherenceRate = totalExpectedDoses > 0 ? 
      Math.round((takenDoses / totalExpectedDoses) * 100) : 0;

    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    while (streak < 365) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const hasLog = recentLogs.some(log => log.takenAt.startsWith(dateStr));
      if (!hasLog) break;
      streak++;
      currentDate = subDays(currentDate, 1);
    }

    setAdherenceStats({
      streak,
      adherenceRate,
      totalDoses: totalExpectedDoses,
      takenDoses,
      missedDoses
    });
  };

  const markAsTaken = async (medId: string, withSideEffects: boolean = false) => {
    const newTaken = new Set(todaysTaken);
    newTaken.add(medId);
    setTodaysTaken(newTaken);

    // Create log entry
    const newLog: MedicationLog = {
      id: crypto.randomUUID(),
      medicationId: medId,
      takenAt: new Date().toISOString(),
      sideEffects: withSideEffects ? sideEffectNote : undefined
    };

    const updatedLogs = [...medicationLogs, newLog];
    setMedicationLogs(updatedLogs);
    localStorage.setItem('medicationLogs', JSON.stringify(updatedLogs));

    // Update pills remaining
    const med = medications.find(m => m.id === medId);
    if (med && med.pillsRemaining !== undefined) {
      const updatedMeds = medications.map(m => 
        m.id === medId ? { ...m, pillsRemaining: Math.max(0, (m.pillsRemaining || 0) - 1) } : m
      );
      setMedications(updatedMeds);
      localStorage.setItem('medications', JSON.stringify(updatedMeds));
    }

    // Award Vitality points (10 points per dose)
    const vitalityPoints = 10;
    
    toast({
      title: "✅ Medication Logged!",
      description: `Great job staying on track! +${vitalityPoints} Vitality points`,
    });

    if (withSideEffects) {
      setShowSideEffectForm(null);
      setSideEffectNote('');
    }

    // Check for weekly adherence bonus (75 points)
    const thisWeekLogs = updatedLogs.filter(log => {
      const logDate = new Date(log.takenAt);
      const weekAgo = subDays(new Date(), 7);
      return logDate >= weekAgo;
    });

    if (thisWeekLogs.length >= 7 * medications.length) {
      toast({
        title: "🏆 Weekly Adherence Bonus!",
        description: "+75 Vitality points for perfect weekly adherence!",
      });
    }
  };

  const saveMedication = async () => {
    if (!formData.name || !formData.dosage) {
      toast({
        title: "Missing Information",
        description: "Please fill in medication name and dosage",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique ID
      const newMed: Medication = {
        id: crypto.randomUUID(),
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: [formData.time],
        prescribedBy: formData.prescribedBy,
        startDate: formData.startDate,
        notes: formData.notes,
        refillDate: formData.refillDate,
        pillsRemaining: formData.pillsRemaining
      };

      // Save to local storage temporarily
      const updatedMeds = [newMed, ...medications];
      setMedications(updatedMeds);
      localStorage.setItem('medications', JSON.stringify(updatedMeds));

      // Try to save to database if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase
            .from('medications')
            .insert([
              {
                user_id: user.id,
                name: formData.name,
                dosage: formData.dosage,
                frequency: formData.frequency,
                times: [formData.time],
                prescribed_by: formData.prescribedBy,
                start_date: formData.startDate,
                notes: formData.notes
              }
            ]);

          // Schedule notification reminder
          await notificationService.scheduleMedicationReminder(
            formData.name,
            formData.time,
            parseInt(newMed.id.replace(/\D/g, '').slice(0, 8))
          );
        } catch (dbError) {
          console.log('Database save failed, using local storage:', dbError);
        }
      }

      // Reset form
      setFormData({
        name: '',
        dosage: '',
        frequency: 'once daily',
        time: '08:00',
        prescribedBy: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        refillDate: '',
        pillsRemaining: 30
      });

      setShowAddForm(false);

      toast({
        title: "✅ Medication Saved!",
        description: `${formData.name} has been added to your tracker`,
      });

    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: "Failed to save medication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedication = async (medId: string) => {
    try {
      // Remove from local state and storage
      const updatedMeds = medications.filter(m => m.id !== medId);
      setMedications(updatedMeds);
      localStorage.setItem('medications', JSON.stringify(updatedMeds));

      // Try to delete from database if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase
            .from('medications')
            .delete()
            .eq('id', medId);
        } catch (dbError) {
          console.log('Database delete failed, removed from local storage');
        }
      }

      toast({
        title: "Medication Removed",
        description: "Medication has been deleted from your tracker",
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive"
      });
    }
  };

  const getCurrentTime = () => {
    return format(new Date(), "HH:mm");
  };

  const isTimeForMedication = (times: string[]) => {
    const currentTime = getCurrentTime();
    const currentHour = parseInt(currentTime.split(":")[0]);
    
    return times.some(time => {
      const medHour = parseInt(time.split(":")[0]);
      return Math.abs(currentHour - medHour) <= 1; // Within 1 hour window
    });
  };

  const needsRefill = (med: Medication) => {
    if (!med.pillsRemaining) return false;
    return med.pillsRemaining <= 7; // Alert when 7 days or less remaining
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50";
    if (rate >= 75) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* Adherence Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adherenceStats.streak}</p>
              <p className="text-xs text-gray-600">Day Streak</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
        </Card>

        <Card className={`p-4 ${getAdherenceColor(adherenceStats.adherenceRate)}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/50 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adherenceStats.adherenceRate}%</p>
              <p className="text-xs">Adherence Rate</p>
            </div>
          </div>
          <Progress value={adherenceStats.adherenceRate} className="h-2" />
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adherenceStats.takenDoses}</p>
              <p className="text-xs text-gray-600">Doses Taken</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {adherenceStats.takenDoses * 10}
              </p>
              <p className="text-xs text-gray-600">Vitality Points</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">10 pts per dose</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Medication Tracker</h3>
            <p className="text-sm text-muted-foreground">
              Track your medications and never miss a dose
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Medication
          </Button>
        </div>

        {showAddForm && (
          <Card className="p-4 mb-6 bg-muted">
            <h4 className="font-semibold mb-4">Add New Medication</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medName">Medication Name</Label>
                <Input 
                  id="medName" 
                  placeholder="e.g., Concerta" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input 
                  id="dosage" 
                  placeholder="e.g., 54" 
                  value={formData.dosage}
                  onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <select 
                  id="frequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                >
                  <option value="once daily">Once daily</option>
                  <option value="twice daily">Twice daily</option>
                  <option value="three times daily">Three times daily</option>
                  <option value="as needed">As needed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="time">Time(s)</Label>
                <Input 
                  id="time" 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="prescriber">Prescribed By</Label>
                <Input 
                  id="prescriber" 
                  placeholder="Dr. Jan Van Zyl" 
                  value={formData.prescribedBy}
                  onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="refillDate">Refill Date (optional)</Label>
                <Input 
                  id="refillDate" 
                  type="date" 
                  value={formData.refillDate}
                  onChange={(e) => setFormData({...formData, refillDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="pillsRemaining">Pills Remaining</Label>
                <Input 
                  id="pillsRemaining" 
                  type="number" 
                  placeholder="30" 
                  value={formData.pillsRemaining}
                  onChange={(e) => setFormData({...formData, pillsRemaining: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="e.g., Take with food, avoid alcohol" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1" 
                onClick={saveMedication}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Medication"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {medications.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">No Medications Added</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add your medications to track adherence and set reminders
              </p>
            </div>
          ) : (
            medications.map((med) => {
              const isTaken = todaysTaken.has(med.id);
              const isTimeNow = isTimeForMedication(med.times);
              const lowOnPills = needsRefill(med);

              return (
                <Card
                  key={med.id}
                  className={`p-4 ${
                    isTimeNow && !isTaken
                      ? "border-2 border-primary bg-primary/5"
                      : lowOnPills
                      ? "border-2 border-orange-300 bg-orange-50/50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold">{med.name}</h4>
                        {isTaken ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Taken Today
                          </Badge>
                        ) : isTimeNow ? (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <Bell className="w-3 h-3 mr-1" />
                            Time to Take
                          </Badge>
                        ) : null}
                        {lowOnPills && (
                          <Badge className="bg-orange-100 text-orange-700">
                            <Package className="w-3 h-3 mr-1" />
                            Refill Soon
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Dosage:</strong> {med.dosage} • {med.frequency}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {med.times.join(", ")}
                        </p>
                        <p>
                          <strong>Prescribed by:</strong> {med.prescribedBy}
                        </p>
                        {med.pillsRemaining !== undefined && (
                          <p className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {med.pillsRemaining} pills remaining
                            {med.refillDate && ` • Refill: ${format(new Date(med.refillDate), 'MMM d')}`}
                          </p>
                        )}
                        {med.notes && (
                          <p className="text-xs italic">{med.notes}</p>
                        )}
                      </div>

                      {/* Side Effect Form */}
                      {showSideEffectForm === med.id && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Label className="text-xs font-semibold mb-2 block">
                            Report Side Effects (optional)
                          </Label>
                          <Textarea
                            placeholder="Describe any side effects..."
                            value={sideEffectNote}
                            onChange={(e) => setSideEffectNote(e.target.value)}
                            rows={2}
                            className="text-sm mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => markAsTaken(med.id, true)}
                              className="gap-2"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Log with Side Effects
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowSideEffectForm(null);
                                setSideEffectNote('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!isTaken && !showSideEffectForm && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => markAsTaken(med.id, false)}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Taken
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSideEffectForm(med.id)}
                            className="gap-2"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Side Effects
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-2"
                        onClick={() => deleteMedication(med.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Medication Reminders</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Enable push notifications to receive reminders when it's time to take your
              medication. Never miss a dose again.
            </p>
            <Button className="gap-2">
              <Bell className="w-4 h-4" />
              Enable Reminders
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
        <p className="text-sm text-muted-foreground">
          <strong>Discovery Health Benefit:</strong> Your medication adherence data can be
          shared with your healthcare provider and may qualify you for additional Vitality
          points. Consistent medication adherence shows commitment to your wellness journey.
        </p>
      </Card>
    </div>
  );
};
