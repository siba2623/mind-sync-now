import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Shield, 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Brain,
  FileText,
  Settings,
  Lock,
  Unlock,
  Mail,
  ArrowLeft
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// Mock data for demonstration
const PLATFORM_STATS = {
  totalUsers: 12847,
  activeUsers: 8934,
  newUsersToday: 127,
  newUsersThisWeek: 892,
  totalMoodEntries: 156789,
  totalJournalEntries: 45632,
  totalMeditationMinutes: 234567,
  totalBreathingSessions: 89234,
  avgDailyActiveUsers: 4521,
  retentionRate: 78.5,
};

const USER_GROWTH = [
  { month: 'Aug', users: 8200, active: 5800 },
  { month: 'Sep', users: 9100, active: 6400 },
  { month: 'Oct', users: 10300, active: 7200 },
  { month: 'Nov', users: 11500, active: 8100 },
  { month: 'Dec', users: 12200, active: 8600 },
  { month: 'Jan', users: 12847, active: 8934 },
];

const ENGAGEMENT_DATA = [
  { day: 'Mon', checkins: 3200, moods: 4100, journals: 1800 },
  { day: 'Tue', checkins: 3400, moods: 4300, journals: 1900 },
  { day: 'Wed', checkins: 3100, moods: 4000, journals: 1700 },
  { day: 'Thu', checkins: 3500, moods: 4500, journals: 2000 },
  { day: 'Fri', checkins: 3300, moods: 4200, journals: 1850 },
  { day: 'Sat', checkins: 2800, moods: 3600, journals: 1500 },
  { day: 'Sun', checkins: 2600, moods: 3400, journals: 1400 },
];

const MOOD_DISTRIBUTION = [
  { name: 'Great', value: 28, color: '#10b981' },
  { name: 'Good', value: 35, color: '#22c55e' },
  { name: 'Okay', value: 22, color: '#eab308' },
  { name: 'Low', value: 11, color: '#f97316' },
  { name: 'Struggling', value: 4, color: '#ef4444' },
];

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastActive: string;
  moodEntries: number;
  journalEntries: number;
  vitalityPoints: number;
}

const MOCK_USERS: MockUser[] = [
  { id: '1', email: 'john.doe@example.com', name: 'John Doe', role: 'user', status: 'active', createdAt: '2025-08-15', lastActive: '2026-01-12', moodEntries: 145, journalEntries: 32, vitalityPoints: 2450 },
  { id: '2', email: 'sarah.smith@example.com', name: 'Sarah Smith', role: 'moderator', status: 'active', createdAt: '2025-06-20', lastActive: '2026-01-12', moodEntries: 234, journalEntries: 67, vitalityPoints: 4200 },
  { id: '3', email: 'mike.wilson@example.com', name: 'Mike Wilson', role: 'user', status: 'suspended', createdAt: '2025-09-10', lastActive: '2025-12-28', moodEntries: 45, journalEntries: 8, vitalityPoints: 650 },
  { id: '4', email: 'emma.brown@example.com', name: 'Emma Brown', role: 'user', status: 'active', createdAt: '2025-11-05', lastActive: '2026-01-11', moodEntries: 89, journalEntries: 21, vitalityPoints: 1800 },
  { id: '5', email: 'admin@mindsync.com', name: 'Admin User', role: 'admin', status: 'active', createdAt: '2025-01-01', lastActive: '2026-01-12', moodEntries: 0, journalEntries: 0, vitalityPoints: 0 },
  { id: '6', email: 'lisa.jones@example.com', name: 'Lisa Jones', role: 'user', status: 'pending', createdAt: '2026-01-10', lastActive: '2026-01-10', moodEntries: 2, journalEntries: 0, vitalityPoints: 50 },
  { id: '7', email: 'david.lee@example.com', name: 'David Lee', role: 'user', status: 'active', createdAt: '2025-07-22', lastActive: '2026-01-12', moodEntries: 312, journalEntries: 89, vitalityPoints: 5600 },
  { id: '8', email: 'anna.garcia@example.com', name: 'Anna Garcia', role: 'moderator', status: 'active', createdAt: '2025-05-15', lastActive: '2026-01-11', moodEntries: 178, journalEntries: 45, vitalityPoints: 3200 },
];

const ADMIN_EMAILS = ['admin@mindsync.com', 'sibabalwe.dyantyi@example.com', 'athenkosim2@gmail.com'];


const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setCurrentUser(session.user);
      
      // Check if user is admin (in production, this would check a database role)
      const userEmail = session.user.email || '';
      const hasAdminAccess = ADMIN_EMAILS.includes(userEmail) || 
        userEmail.includes('admin') || 
        session.user.user_metadata?.role === 'admin';
      
      setIsAdmin(hasAdminAccess);
      
      if (!hasAdminAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({
      title: "Role Updated",
      description: `User role has been changed to ${newRole}.`,
    });
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast({
      title: "Status Updated",
      description: `User status has been changed to ${newStatus}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been removed from the system.",
    });
  };

  const exportData = (type: string) => {
    const data = type === 'users' ? users : PLATFORM_STATS;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindsync-${type}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({
      title: "Export Complete",
      description: `${type} data has been exported.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700"><UserX className="w-3 h-3 mr-1" />Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-700"><UserCheck className="w-3 h-3 mr-1" />Moderator</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {currentUser?.email}
              </Badge>
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
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <Badge className="bg-green-100 text-green-700 text-xs">+{PLATFORM_STATS.newUsersToday} today</Badge>
                  </div>
                  <p className="text-2xl font-bold">{PLATFORM_STATS.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <Badge variant="secondary" className="text-xs">{Math.round((PLATFORM_STATS.activeUsers / PLATFORM_STATS.totalUsers) * 100)}%</Badge>
                  </div>
                  <p className="text-2xl font-bold">{PLATFORM_STATS.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">{PLATFORM_STATS.totalMoodEntries.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Mood Entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold">{Math.round(PLATFORM_STATS.totalMeditationMinutes / 60).toLocaleString()}h</p>
                  <p className="text-sm text-muted-foreground">Meditation Time</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Total vs Active users over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={USER_GROWTH}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Total Users" />
                        <Area type="monotone" dataKey="active" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Active Users" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>Platform-wide mood breakdown</CardDescription>
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

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Weekly Engagement</CardTitle>
                  <CardDescription>User activity by day</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportData('stats')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ENGAGEMENT_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="checkins" fill="#3b82f6" name="Check-ins" />
                      <Bar dataKey="moods" fill="#ef4444" name="Mood Logs" />
                      <Bar dataKey="journals" fill="#10b981" name="Journals" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => exportData('users')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>{filteredUsers.length} users found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Vitality Points</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{user.moodEntries} moods</p>
                              <p className="text-muted-foreground">{user.journalEntries} journals</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              {user.vitalityPoints.toLocaleString()} pts
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Select
                                value={user.role}
                                onValueChange={(value: 'user' | 'admin' | 'moderator') => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-[100px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant={user.status === 'suspended' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(user.id, user.status === 'suspended' ? 'active' : 'suspended')}
                              >
                                {user.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Journal Entries</span>
                  </div>
                  <p className="text-3xl font-bold">{PLATFORM_STATS.totalJournalEntries.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Breathing Sessions</span>
                  </div>
                  <p className="text-3xl font-bold">{PLATFORM_STATS.totalBreathingSessions.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Retention Rate</span>
                  </div>
                  <p className="text-3xl font-bold">{PLATFORM_STATS.retentionRate}%</p>
                  <p className="text-sm text-green-600">+2.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Avg Daily Active Users</p>
                    <p className="text-2xl font-bold">{PLATFORM_STATS.avgDailyActiveUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">New Users This Week</p>
                    <p className="text-2xl font-bold">{PLATFORM_STATS.newUsersThisWeek}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Avg Mood Score</p>
                    <p className="text-2xl font-bold">3.8 / 5</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Support Tickets</p>
                    <p className="text-2xl font-bold">23 open</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Verification Required</p>
                    <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vitality Integration</p>
                    <p className="text-sm text-muted-foreground">Enable Discovery Vitality features</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Community Events</p>
                    <p className="text-sm text-muted-foreground">Allow users to join community events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
