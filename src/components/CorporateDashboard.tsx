import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Heart, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
  Target,
  Shield
} from 'lucide-react';

// Mock company data - anonymized
const COMPANY_METRICS = {
  totalEmployees: 1247,
  activeUsers: 892,
  engagementRate: 71.5,
  avgWellnessScore: 68,
  checkinsThisMonth: 4521,
  assessmentsCompleted: 234,
  highRiskAlerts: 12,
};

const DEPARTMENT_DATA = [
  { name: 'Engineering', employees: 320, engagement: 78, wellness: 72 },
  { name: 'Sales', employees: 180, engagement: 65, wellness: 58 },
  { name: 'Marketing', employees: 95, engagement: 82, wellness: 75 },
  { name: 'HR', employees: 45, engagement: 91, wellness: 82 },
  { name: 'Finance', employees: 120, engagement: 68, wellness: 65 },
  { name: 'Operations', employees: 200, engagement: 62, wellness: 60 },
];

const WELLNESS_TREND = [
  { month: 'Jul', score: 62, engagement: 58 },
  { month: 'Aug', score: 64, engagement: 62 },
  { month: 'Sep', score: 65, engagement: 68 },
  { month: 'Oct', score: 68, engagement: 72 },
  { month: 'Nov', score: 67, engagement: 70 },
  { month: 'Dec', score: 68, engagement: 71 },
];

const MOOD_DISTRIBUTION = [
  { name: 'Great', value: 28, color: '#10b981' },
  { name: 'Good', value: 35, color: '#22c55e' },
  { name: 'Okay', value: 22, color: '#eab308' },
  { name: 'Low', value: 11, color: '#f97316' },
  { name: 'Struggling', value: 4, color: '#ef4444' },
];

const RISK_INDICATORS = [
  { category: 'High Stress', count: 45, trend: 'down', change: -12 },
  { category: 'Sleep Issues', count: 78, trend: 'up', change: 8 },
  { category: 'Anxiety Symptoms', count: 34, trend: 'down', change: -5 },
  { category: 'Low Engagement', count: 156, trend: 'down', change: -23 },
];

const CorporateDashboard = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedDept, setSelectedDept] = useState('all');

  const exportReport = () => {
    // Mock export functionality
    const report = {
      generatedAt: new Date().toISOString(),
      metrics: COMPANY_METRICS,
      departments: DEPARTMENT_DATA,
      trends: WELLNESS_TREND,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Corporate Wellness Dashboard
          </h2>
          <p className="text-muted-foreground">Anonymized mental health metrics for your organization</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Privacy Protected:</strong> All data is anonymized and aggregated. 
            Individual employee information is never visible. Minimum group size of 10 for any metric.
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <Badge variant="secondary">{Math.round((COMPANY_METRICS.activeUsers / COMPANY_METRICS.totalEmployees) * 100)}%</Badge>
            </div>
            <p className="text-2xl font-bold">{COMPANY_METRICS.activeUsers}</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-xs text-muted-foreground">of {COMPANY_METRICS.totalEmployees} employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-green-500" />
              <Badge className="bg-green-100 text-green-700">+3.2%</Badge>
            </div>
            <p className="text-2xl font-bold">{COMPANY_METRICS.avgWellnessScore}</p>
            <p className="text-sm text-muted-foreground">Avg Wellness Score</p>
            <Progress value={COMPANY_METRICS.avgWellnessScore} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <Badge variant="secondary">This month</Badge>
            </div>
            <p className="text-2xl font-bold">{COMPANY_METRICS.checkinsThisMonth.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <Badge className="bg-amber-100 text-amber-700">{COMPANY_METRICS.highRiskAlerts}</Badge>
            </div>
            <p className="text-2xl font-bold">{COMPANY_METRICS.assessmentsCompleted}</p>
            <p className="text-sm text-muted-foreground">Assessments Done</p>
            <p className="text-xs text-amber-600">{COMPANY_METRICS.highRiskAlerts} need follow-up</p>
          </CardContent>
        </Card>
      </div>


      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="risks">Risk Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Wellness Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Wellness & Engagement Trend</CardTitle>
                <CardDescription>6-month company-wide metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={WELLNESS_TREND}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} name="Wellness Score" />
                      <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mood Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>Aggregated from daily check-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOOD_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {MOOD_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Comparison</CardTitle>
              <CardDescription>Wellness metrics by department (min. 10 employees)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPARTMENT_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wellness" fill="#8b5cf6" name="Wellness Score" />
                    <Bar dataKey="engagement" fill="#10b981" name="Engagement %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPARTMENT_DATA.map((dept) => (
              <Card key={dept.name}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{dept.name}</h4>
                    <Badge variant="outline">{dept.employees} employees</Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Wellness</span>
                        <span className={dept.wellness >= 70 ? 'text-green-600' : dept.wellness >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                          {dept.wellness}%
                        </span>
                      </div>
                      <Progress value={dept.wellness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Engagement</span>
                        <span>{dept.engagement}%</span>
                      </div>
                      <Progress value={dept.engagement} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Risk Indicators
              </CardTitle>
              <CardDescription className="text-amber-700">
                Anonymized patterns that may need organizational attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {RISK_INDICATORS.map((risk) => (
                  <div key={risk.category} className="p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{risk.category}</h4>
                      <div className={`flex items-center gap-1 text-sm ${risk.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                        {risk.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        {Math.abs(risk.change)}%
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{risk.count}</p>
                    <p className="text-sm text-muted-foreground">employees affected</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Launch Sleep Wellness Challenge</p>
                    <p className="text-sm text-muted-foreground">
                      78 employees showing sleep issues. A company-wide sleep challenge could help.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Sales Team Intervention</p>
                    <p className="text-sm text-muted-foreground">
                      Sales department shows lowest wellness score. Consider targeted support.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Promote Mental Health Assessments</p>
                    <p className="text-sm text-muted-foreground">
                      Only 19% completed assessments. Incentivize with extra Vitality points.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CorporateDashboard;
