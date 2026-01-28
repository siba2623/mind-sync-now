import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pill, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
}

export const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [todaysTaken, setTodaysTaken] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once daily',
    time: '08:00',
    prescribedBy: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  useEffect(() => {
    loadMedications();
    loadTodaysTaken();
  }, []);

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

  const loadTodaysTaken = async () => {
    // Load from database which medications were taken today
    setTodaysTaken(new Set());
  };

  const markAsTaken = async (medId: string) => {
    const newTaken = new Set(todaysTaken);
    newTaken.add(medId);
    setTodaysTaken(newTaken);

    toast({
      title: "Medication Logged",
      description: "Great job staying on track!",
    });

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // In production, save to medication_logs table
      }
    } catch (error) {
      console.error("Error logging medication:", error);
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
        notes: formData.notes
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
        notes: ''
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

  return (
    <div className="space-y-6">
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
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input 
                id="notes" 
                placeholder="e.g., Take with food" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
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

              return (
                <Card
                  key={med.id}
                  className={`p-4 ${
                    isTimeNow && !isTaken
                      ? "border-2 border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                        {med.notes && (
                          <p className="text-xs italic">{med.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!isTaken && (
                        <Button
                          size="sm"
                          onClick={() => markAsTaken(med.id)}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Taken
                        </Button>
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
