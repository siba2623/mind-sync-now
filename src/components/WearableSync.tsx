import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { wearableSync, WearableData, WearableDevice } from '@/services/wearableSync';
import { 
  Watch, 
  Heart, 
  Activity, 
  Moon, 
  Zap, 
  RefreshCw, 
  Link2, 
  Unlink,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WearableSync = () => {
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [healthData, setHealthData] = useState<WearableData | null>(null);
  const [stressHistory, setStressHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const supportedDevices = wearableSync.getSupportedDevices();

  useEffect(() => {
    loadConnectedDevices();
  }, []);

  const loadConnectedDevices = () => {
    const connected = wearableSync.getConnectedDevices();
    setDevices(connected);
    if (connected.length > 0) {
      fetchHealthData(connected[0].id);
    }
  };

  const connectDevice = async (deviceType: string) => {
    setLoading(true);
    try {
      const device = await wearableSync.connectDevice(deviceType);
      setDevices([...devices, device]);
      await fetchHealthData(device.id);
      toast({
        title: "Device Connected!",
        description: `${device.name} is now syncing with MindSync.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    await wearableSync.disconnectDevice(deviceId);
    setDevices(devices.filter(d => d.id !== deviceId));
    setHealthData(null);
    toast({
      title: "Device Disconnected",
      description: "Your wearable has been unlinked.",
    });
  };

  const fetchHealthData = async (deviceId: string) => {
    setSyncing(true);
    try {
      const data = await wearableSync.fetchHealthData(deviceId);
      setHealthData(data);
      
      const history = await wearableSync.getStressHistory(deviceId, 7);
      const chartData = history.map(h => ({
        time: new Date(h.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
        stress: h.level,
        hrv: h.hrv,
      }));
      // Aggregate by day
      const aggregated = chartData.reduce((acc: any[], curr) => {
        const existing = acc.find(a => a.time === curr.time);
        if (existing) {
          existing.stress = Math.round((existing.stress + curr.stress) / 2);
          existing.hrv = Math.round((existing.hrv + curr.hrv) / 2);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
      setStressHistory(aggregated.slice(-7));
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: 'good' | 'moderate' | 'poor') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
    }
  };

  const wellnessScore = healthData ? wearableSync.calculateWellnessScore(healthData) : null;

  return (
    <div className="space-y-6">
      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="w-5 h-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Sync your wearable for stress and HRV insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-6">
              <Watch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No devices connected</p>
              <div className="flex flex-wrap justify-center gap-2">
                {supportedDevices.map((device) => (
                  <Button
                    key={device.type}
                    variant="outline"
                    size="sm"
                    onClick={() => connectDevice(device.type)}
                    disabled={loading}
                  >
                    <Link2 className="w-4 h-4 mr-1" />
                    {device.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Watch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {device.lastSync ? new Date(device.lastSync).toLocaleTimeString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => fetchHealthData(device.id)}
                      disabled={syncing}
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => disconnectDevice(device.id)}
                    >
                      <Unlink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Health Metrics */}
      {healthData && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Heart Rate</span>
                </div>
                <p className="text-2xl font-bold">{healthData.heartRate}</p>
                <p className="text-xs text-muted-foreground">BPM</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">HRV</span>
                </div>
                <p className="text-2xl font-bold">{healthData.hrv}</p>
                <p className="text-xs text-muted-foreground">ms</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Stress</span>
                </div>
                <p className="text-2xl font-bold">{healthData.stressLevel}</p>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Sleep</span>
                </div>
                <p className="text-2xl font-bold">{healthData.sleepScore}</p>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </CardContent>
            </Card>
          </div>

          {/* Wellness Score */}
          {wellnessScore && (
            <Card>
              <CardHeader>
                <CardTitle>Wellness Score</CardTitle>
                <CardDescription>Based on your wearable data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${wellnessScore.score * 2.51} 251`}
                        className={wellnessScore.score >= 70 ? 'text-green-500' : wellnessScore.score >= 50 ? 'text-yellow-500' : 'text-red-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{wellnessScore.score}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {wellnessScore.factors.map((factor, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm w-32">{factor.name}</span>
                        <Progress value={factor.value} className="flex-1 h-2" />
                        <Badge className={`text-xs ${getStatusColor(factor.status)}`}>
                          {factor.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stress Trend */}
          {stressHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Stress & HRV Trend</CardTitle>
                <CardDescription>Last 7 days from your wearable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stressHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#f97316" 
                        strokeWidth={2} 
                        name="Stress Level"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hrv" 
                        stroke="#8b5cf6" 
                        strokeWidth={2} 
                        name="HRV"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Stress Level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>HRV</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default WearableSync;
