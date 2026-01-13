import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { 
  BarChart3, Brain, Video, AlertTriangle, ArrowLeft, Users, TrendingUp, 
  AlertCircle, Heart, Activity, Phone, MessageSquare, Calendar, Star,
  Shield, FileText, Zap, Clock, MapPin, DollarSign, CheckCircle
} from "lucide-react";

// Mock data for enterprise analytics
const wellbeingTrends = [
  { month: 'Jan', wellbeing: 72, productivity: 68, engagement: 75 },
  { month: 'Feb', wellbeing: 74, productivity: 71, engagement: 73 },
  { month: 'Mar', wellbeing: 71, productivity: 69, engagement: 72 },
  { month: 'Apr', wellbeing: 76, productivity: 74, engagement: 78 },
  { month: 'May', wellbeing: 79, productivity: 77, engagement: 80 },
  { month: 'Jun', wellbeing: 82, productivity: 80, engagement: 83 },
];

const departmentData = [
  { dept: 'Engineering', employees: 120, wellbeing: 7.8, engagement: 8.2, risk: 'Low' },
  { dept: 'Sales', employees: 80, wellbeing: 6.9, engagement: 7.5, risk: 'Medium' },
  { dept: 'Marketing', employees: 35, wellbeing: 7.5, engagement: 8.0, risk: 'Low' },
  { dept: 'HR', employees: 45, wellbeing: 8.1, engagement: 8.4, risk: 'Low' },
  { dept: 'Finance', employees: 18, wellbeing: 6.2, engagement: 6.8, risk: 'High' },
  { dept: 'Operations', employees: 142, wellbeing: 7.0, engagement: 7.3, risk: 'Medium' },
];

const moodPrediction = [
  { day: 'Jan 1', predicted: 7.2 }, { day: 'Jan 2', predicted: 7.0 },
  { day: 'Jan 3', predicted: 6.8 }, { day: 'Jan 4', predicted: 7.1 },
  { day: 'Jan 5', predicted: 7.4 }, { day: 'Jan 6', predicted: 7.6 },
  { day: 'Jan 7', predicted: 7.8 },
];

const therapists = [
  { name: 'Dr. Sarah Johnson', title: 'Licensed Clinical Psychologist', rating: 4.9, reviews: 127, experience: 8, location: 'New York, NY', price: 175, specialties: ['Anxiety', 'Depression', 'CBT'], insurance: ['Aetna', 'Blue Cross', '+3 more'], avatar: 'SJ' },
  { name: 'Dr. Michael Chen', title: 'Licensed Marriage & Family Therapist', rating: 4.8, reviews: 89, experience: 12, location: 'San Francisco, CA', price: 150, specialties: ['Relationships', 'Family Issues', 'Stress Management'], insurance: ['United Healthcare', '+2 more'], avatar: 'MC' },
  { name: 'Dr. Emily Rodriguez', title: 'Licensed Clinical Social Worker', rating: 4.7, reviews: 156, experience: 10, location: 'Austin, TX', price: 125, specialties: ['PTSD', 'Trauma', 'Grief Counseling', 'EMDR'], insurance: ['Cigna', 'Humana', '+1 more'], avatar: 'ER' },
];

const Enterprise = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">Advanced Mental Health Platform</h1>
            <p className="text-slate-600 mt-2">Enterprise-grade mental health solutions with AI-powered insights</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="w-4 h-4 hidden sm:block" />Enterprise Analytics</TabsTrigger>
            <TabsTrigger value="predictive" className="gap-2"><Brain className="w-4 h-4 hidden sm:block" />Predictive AI</TabsTrigger>
            <TabsTrigger value="telehealth" className="gap-2"><Video className="w-4 h-4 hidden sm:block" />Telehealth</TabsTrigger>
            <TabsTrigger value="crisis" className="gap-2"><AlertTriangle className="w-4 h-4 hidden sm:block" />Crisis Detection</TabsTrigger>
          </TabsList>


          {/* Enterprise Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Enterprise Mental Health Dashboard</h2>
                <p className="text-muted-foreground">Real-time insights into organizational wellbeing</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" />Export Report</Button>
                <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600"><Zap className="w-4 h-4" />View Upgrades</Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold text-blue-600">987</p>
                      <p className="text-xs text-muted-foreground">78% adoption rate</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Wellbeing Score</p>
                      <p className="text-3xl font-bold text-emerald-600">7.2/10</p>
                      <p className="text-xs text-emerald-600">↑ 5% from last month</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">At-Risk Employees</p>
                      <p className="text-3xl font-bold text-amber-600">23</p>
                      <p className="text-xs text-muted-foreground">Require immediate attention</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-3xl font-bold text-violet-600">340%</p>
                      <p className="text-xs text-muted-foreground">Return on investment</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-violet-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Productivity Increase</span>
                      <span className="text-emerald-600 font-medium">+18.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Absenteeism Reduction</span>
                      <span className="text-emerald-600 font-medium">-32.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Employee Engagement</span>
                      <span className="text-blue-600 font-medium">8.1/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wellbeing Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={wellbeingTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="wellbeing" stroke="#10b981" strokeWidth={2} name="Wellbeing Score" />
                        <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} name="Productivity Index" />
                        <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} name="Engagement Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Department Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium">Employees</th>
                        <th className="pb-3 font-medium">Wellbeing Score</th>
                        <th className="pb-3 font-medium">Engagement</th>
                        <th className="pb-3 font-medium">Risk Level</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 font-medium">{dept.dept}</td>
                          <td className="py-3">{dept.employees}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {dept.wellbeing}/10
                              <Progress value={dept.wellbeing * 10} className="w-16 h-2" />
                            </div>
                          </td>
                          <td className="py-3">{dept.engagement}/10</td>
                          <td className="py-3">
                            <Badge variant={dept.risk === 'Low' ? 'default' : dept.risk === 'Medium' ? 'secondary' : 'destructive'}>
                              {dept.risk}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button variant="link" size="sm">View Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Privacy & Compliance</h4>
                    <p className="text-sm text-muted-foreground">All data is anonymized and aggregated. Individual employee data is never accessible to employers. Fully compliant with HIPAA, GDPR, and workplace privacy regulations.</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">HIPAA Compliant</Badge>
                      <Badge variant="outline">GDPR Compliant</Badge>
                      <Badge variant="outline">SOC 2 Type II</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Predictive AI Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-violet-500" />
                  Predictive Mental Health Analytics
                </h2>
                <p className="text-muted-foreground">AI-powered early warning system for mental health episodes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Model Accuracy: 87%</Button>
                <Button className="bg-violet-500 hover:bg-violet-600">Update Predictions</Button>
              </div>
            </div>

            {/* Early Warning System */}
            <div className="space-y-4">
              <h3 className="font-semibold">Early Warning System</h3>
              
              <Card className="border-l-4 border-l-red-400 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-700">Mood Decline Predicted</h4>
                        <p className="text-sm text-red-600">Schedule a therapy session or reach out to your support network</p>
                        <p className="text-xs text-red-500 mt-1">Confidence: 84%</p>
                      </div>
                    </div>
                    <Badge variant="destructive">3 days ahead</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-400 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-700">Stress Level Alert</h4>
                        <p className="text-sm text-amber-600">Consider meditation or breathing exercises today</p>
                        <p className="text-xs text-amber-500 mt-1">Confidence: 76%</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500">1 day ahead</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-400 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700">Sleep Quality Concern</h4>
                        <p className="text-sm text-blue-600">Focus on sleep hygiene - avoid screens before bed</p>
                        <p className="text-xs text-blue-500 mt-1">Confidence: 82%</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500">5 days ahead</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Mood Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Mood Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodPrediction}>
                      <defs>
                        <linearGradient id="predictGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} fill="url(#predictGradient)" name="Predicted Mood" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-4">* Predictions based on historical patterns, current activities, and wearable device data</p>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <p className="text-2xl font-bold">78 BPM</p>
                  <p className="text-xs text-muted-foreground">Normal range</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sleep Quality</p>
                  <p className="text-2xl font-bold">6.2/10</p>
                  <p className="text-xs text-muted-foreground">Below average</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Steps Today</p>
                  <p className="text-2xl font-bold">8,420</p>
                  <p className="text-xs text-muted-foreground">84% of goal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Stress Level</p>
                  <p className="text-2xl font-bold">7.3/10</p>
                  <p className="text-xs text-muted-foreground">Elevated</p>
                </CardContent>
              </Card>
            </div>

            {/* Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <p className="text-4xl font-bold text-emerald-500">87%</p>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-blue-500">2.3 days</p>
                    <p className="text-sm text-muted-foreground">Avg Early Detection</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-violet-500">94%</p>
                    <p className="text-sm text-muted-foreground">User Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Telehealth Tab */}
          <TabsContent value="telehealth" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Video className="w-6 h-6 text-blue-500" />
                  Telehealth Integration
                </h2>
                <p className="text-muted-foreground">Connect with licensed mental health professionals</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">HIPAA Secure</Button>
                <Button>Licensed Providers</Button>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      SJ
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">Tomorrow at 2:00 PM</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video session</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 60 min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Join Call</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Find Your Therapist */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Find Your Therapist</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">All Specialties</Button>
                    <Button variant="outline" size="sm">AI Match</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {therapists.map((therapist, i) => (
                    <Card key={i} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center text-white font-semibold">
                            {therapist.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-blue-600 truncate">{therapist.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{therapist.title}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium">{therapist.rating}</span>
                              <span className="text-xs text-muted-foreground">({therapist.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {therapist.experience} years experience
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {therapist.location}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            ${therapist.price}/session
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {therapist.specialties.slice(0, 3).map((s, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                            {therapist.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{therapist.specialties.length - 3} more</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Insurance Accepted:</p>
                          <p className="text-xs text-muted-foreground">{therapist.insurance.join(', ')}</p>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Button className="w-full bg-emerald-500 hover:bg-emerald-600" size="sm">Book Session</Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 gap-1">
                              <MessageSquare className="w-3 h-3" /> Message
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 gap-1">
                              <Phone className="w-3 h-3" /> Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session History */}
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                      SJ
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">12/12/2024 • 50 min</p>
                      <p className="text-xs text-muted-foreground">Discussed coping strategies for work-related anxiety</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Notes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Crisis Detection Tab */}
          <TabsContent value="crisis" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Crisis Detection & Emergency Response</h2>
              <p className="text-muted-foreground">AI-powered system that monitors user patterns and provides immediate intervention when crisis indicators are detected.</p>
            </div>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-amber-800">
                      It looks like you might be having a tough time. Consider reaching out to someone you trust or a mental health professional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-red-500" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-700">National Suicide Prevention Lifeline</h4>
                    <p className="text-2xl font-bold text-red-600">988</p>
                    <p className="text-sm text-red-600">Available 24/7</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-700">Crisis Text Line</h4>
                    <p className="text-lg font-bold text-blue-600">Text HOME to 741741</p>
                    <p className="text-sm text-blue-600">Free, 24/7 support</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-700">Your Emergency Contact</h4>
                    <p className="text-sm text-muted-foreground">Add an emergency contact in your profile settings</p>
                    <Button variant="outline" size="sm" className="mt-2">Add Contact</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Safety Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Create a Safety Plan
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Brain className="w-4 h-4 text-violet-500" />
                    Grounding Exercises
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Breathing Techniques
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Chat with AI Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>How Crisis Detection Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-2">Pattern Analysis</h4>
                    <p className="text-sm text-muted-foreground">AI monitors mood patterns, journal entries, and activity levels for concerning changes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-medium mb-2">Early Warning</h4>
                    <p className="text-sm text-muted-foreground">Gentle alerts when patterns suggest you might need additional support</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-medium mb-2">Immediate Support</h4>
                    <p className="text-sm text-muted-foreground">Quick access to resources, contacts, and professional help when needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Enterprise;
