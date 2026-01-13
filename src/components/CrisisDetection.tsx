import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Phone, 
  Shield, 
  Heart, 
  Users, 
  Bell,
  CheckCircle,
  Clock,
  TrendingDown,
  MessageCircle,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnCrisis: boolean;
}

interface RiskIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
}

const CRISIS_RESOURCES: CrisisResource[] = [
  { name: 'SADAG (SA Depression & Anxiety)', phone: '0800 567 567', description: 'Free 24/7 mental health support', available: '24/7' },
  { name: 'Lifeline South Africa', phone: '0861 322 322', description: 'Crisis counseling and support', available: '24/7' },
  { name: 'Suicide Crisis Line', phone: '0800 567 567', description: 'Immediate suicide prevention support', available: '24/7' },
  { name: 'Childline South Africa', phone: '116', description: 'Support for children and teens', available: '24/7' },
  { name: 'FAMSA', phone: '011 975 7106', description: 'Family and marriage counseling', available: 'Mon-Fri 8am-4pm' },
  { name: 'Akeso Psychiatric Response', phone: '0861 435 787', description: 'Psychiatric emergency services', available: '24/7' },
];

const CrisisDetection = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Mom', phone: '+27 82 123 4567', relationship: 'Parent', notifyOnCrisis: true },
    { id: '2', name: 'Dr. Sarah', phone: '+27 11 234 5678', relationship: 'Therapist', notifyOnCrisis: true },
  ]);
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([
    { type: 'Mood Decline', severity: 'medium', description: 'Mood has declined 30% over the past week', detectedAt: new Date(Date.now() - 86400000), resolved: false },
    { type: 'Sleep Pattern', severity: 'low', description: 'Irregular sleep patterns detected', detectedAt: new Date(Date.now() - 172800000), resolved: true },
  ]);
  const [settings, setSettings] = useState({
    autoDetection: true,
    notifyContacts: true,
    shareLocation: false,
    dailyCheckIn: true,
    journalAnalysis: true,
  });
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [wellnessScore, setWellnessScore] = useState(72);
  const { toast } = useToast();

  const getRiskLevel = (): { level: string; color: string; description: string } => {
    const unresolvedHigh = riskIndicators.filter(r => !r.resolved && (r.severity === 'high' || r.severity === 'critical')).length;
    const unresolvedMedium = riskIndicators.filter(r => !r.resolved && r.severity === 'medium').length;
    
    if (unresolvedHigh > 0) {
      return { level: 'High Risk', color: 'text-red-600 bg-red-100', description: 'Immediate attention recommended' };
    }
    if (unresolvedMedium > 1) {
      return { level: 'Moderate Risk', color: 'text-orange-600 bg-orange-100', description: 'Monitor closely' };
    }
    if (unresolvedMedium === 1) {
      return { level: 'Low Risk', color: 'text-yellow-600 bg-yellow-100', description: 'Some concerns detected' };
    }
    return { level: 'Stable', color: 'text-green-600 bg-green-100', description: 'No immediate concerns' };
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({ title: "Error", description: "Please fill in name and phone number", variant: "destructive" });
      return;
    }
    
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
      notifyOnCrisis: true
    };
    
    setEmergencyContacts([...emergencyContacts, contact]);
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddContact(false);
    toast({ title: "Contact Added", description: `${contact.name} has been added as an emergency contact.` });
  };

  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
    toast({ title: "Contact Removed", description: "Emergency contact has been removed." });
  };

  const handleEmergencyCall = (resource: CrisisResource) => {
    toast({
      title: "Connecting...",
      description: `Calling ${resource.name} at ${resource.phone}`,
    });
    // In production, this would trigger actual phone call
    window.open(`tel:${resource.phone.replace(/\s/g, '')}`);
  };

  const handleNotifyContacts = () => {
    const contactsToNotify = emergencyContacts.filter(c => c.notifyOnCrisis);
    toast({
      title: "Contacts Notified",
      description: `${contactsToNotify.length} emergency contacts have been alerted.`,
    });
  };

  const riskStatus = getRiskLevel();

  return (
    <div className="space-y-6">
      {/* Risk Status Banner */}
      <Card className={`border-2 ${riskStatus.level === 'High Risk' ? 'border-red-300 bg-red-50' : riskStatus.level === 'Moderate Risk' ? 'border-orange-300 bg-orange-50' : 'border-green-300 bg-green-50'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${riskStatus.color}`}>
                {riskStatus.level === 'Stable' ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <AlertTriangle className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{riskStatus.level}</h2>
                <p className="text-muted-foreground">{riskStatus.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">Wellness Score:</span>
                  <Progress value={wellnessScore} className="w-24 h-2" />
                  <span className="text-sm font-medium">{wellnessScore}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleNotifyContacts}>
                <Bell className="w-4 h-4" />
                Alert Contacts
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => handleEmergencyCall(CRISIS_RESOURCES[0])}>
                <Phone className="w-4 h-4" />
                Crisis Line
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Crisis Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-500" />
              Crisis Resources
            </CardTitle>
            <CardDescription>24/7 support lines - help is always available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CRISIS_RESOURCES.map((resource, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{resource.name}</p>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{resource.available}</Badge>
                </div>
                <Button size="sm" onClick={() => handleEmergencyCall(resource)}>
                  <Phone className="w-4 h-4 mr-1" />
                  {resource.phone}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>People who will be notified in a crisis</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddContact(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showAddContact && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({...newContact, name: e.target.value})} />
                <Input placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({...newContact, phone: e.target.value})} />
                <Input placeholder="Relationship" value={newContact.relationship} onChange={(e) => setNewContact({...newContact, relationship: e.target.value})} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddContact}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
                </div>
              </div>
            )}
            
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relationship} • {contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={contact.notifyOnCrisis} onCheckedChange={(checked) => {
                    setEmergencyContacts(emergencyContacts.map(c => c.id === contact.id ? {...c, notifyOnCrisis: checked} : c));
                  }} />
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveContact(contact.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            Risk Indicators
          </CardTitle>
          <CardDescription>AI-detected patterns that may need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskIndicators.map((indicator, i) => (
              <div key={i} className={`flex items-center justify-between p-4 border rounded-lg ${indicator.resolved ? 'bg-muted/30' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    indicator.severity === 'critical' ? 'bg-red-500' :
                    indicator.severity === 'high' ? 'bg-orange-500' :
                    indicator.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{indicator.type}</p>
                      <Badge variant={indicator.resolved ? 'secondary' : 'outline'} className="text-xs">
                        {indicator.resolved ? 'Resolved' : indicator.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{indicator.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Detected {new Date(indicator.detectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!indicator.resolved && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setRiskIndicators(riskIndicators.map((r, idx) => idx === i ? {...r, resolved: true} : r));
                  }}>
                    Mark Resolved
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Safety Settings
          </CardTitle>
          <CardDescription>Configure how MindSync monitors your wellbeing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automatic Crisis Detection</p>
              <p className="text-sm text-muted-foreground">AI monitors mood patterns and journal entries</p>
            </div>
            <Switch checked={settings.autoDetection} onCheckedChange={(checked) => setSettings({...settings, autoDetection: checked})} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notify Emergency Contacts</p>
              <p className="text-sm text-muted-foreground">Alert contacts when crisis is detected</p>
            </div>
            <Switch checked={settings.notifyContacts} onCheckedChange={(checked) => setSettings({...settings, notifyContacts: checked})} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Share Location in Crisis</p>
              <p className="text-sm text-muted-foreground">Share your location with emergency contacts</p>
            </div>
            <Switch checked={settings.shareLocation} onCheckedChange={(checked) => setSettings({...settings, shareLocation: checked})} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Check-in Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded to log your mood daily</p>
            </div>
            <Switch checked={settings.dailyCheckIn} onCheckedChange={(checked) => setSettings({...settings, dailyCheckIn: checked})} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Journal Sentiment Analysis</p>
              <p className="text-sm text-muted-foreground">AI analyzes journal entries for concerning patterns</p>
            </div>
            <Switch checked={settings.journalAnalysis} onCheckedChange={(checked) => setSettings({...settings, journalAnalysis: checked})} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisDetection;
