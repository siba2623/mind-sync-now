import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Brain,
  Smile,
  Heart,
  BarChart3,
  TrendingUp,
  MessageCircle,
  X,
  ArrowLeft
} from "lucide-react";
import Chatbot from "../components/Chatbot";

// Move data to separate constants
const MOOD_DATA = [
  { name: "Mon", mood: 7, stress: 4 },
  { name: "Tue", mood: 6, stress: 5 },
  { name: "Wed", mood: 8, stress: 3 },
  { name: "Thu", mood: 5, stress: 6 },
  { name: "Fri", mood: 9, stress: 2 },
  { name: "Sat", mood: 7, stress: 4 },
  { name: "Sun", mood: 8, stress: 3 },
];

const ACTIVITY_DATA = [
  { name: "Meditation", value: 35, color: "#4FC3F7" },
  { name: "Exercise", value: 25, color: "#4CAF50" },
  { name: "Social", value: 20, color: "#FF9800" },
  { name: "Work", value: 20, color: "#9C27B0" },
];

const WEEKLY_STATS = [
  { label: "Best Day", value: "Friday", score: 9 },
  { label: "Need Support", value: "Thursday", score: 5 },
  { label: "Average Mood", value: "7.1", trend: "+0.3" },
  { label: "Consistency", value: "75%", trend: "+5%" },
];

// Memoize the MoodCard component
const MoodCard = memo(({ icon, title, value, subtitle }) => (
  <Card className="h-full">
    <CardContent className="text-center p-6">
      <Avatar className="mx-auto mb-4 w-12 h-12">
        <AvatarFallback className="bg-primary/10 text-primary">
          {icon}
        </AvatarFallback>
      </Avatar>
      <div className="text-2xl font-bold text-primary mb-1">
        {value}
      </div>
      <div className="text-sm font-medium text-foreground mb-1">
        {title}
      </div>
      <div className="text-xs text-muted-foreground">
        {subtitle}
      </div>
    </CardContent>
  </Card>
));

// Memoize the WeeklyStatCard component
const WeeklyStatCard = memo(({ stat }) => (
  <Card className="p-4 text-center">
    <div className="text-sm text-muted-foreground mb-2">
      {stat.label}
    </div>
    <div className="text-lg font-bold text-primary mb-2">
      {stat.value}
    </div>
    {stat.trend && (
      <Badge variant="outline" className="text-green-600 border-green-600">
        {stat.trend}
      </Badge>
    )}
    {stat.score && (
      <div className="mt-2 flex justify-center gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i < stat.score ? 'bg-primary' : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
    )}
  </Card>
));

function Insights() {
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-primary">
            Mental Health Insights
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Track your emotional well-being and discover patterns in your mental health journey
        </p>
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MoodCard
            icon={<Smile />}
            title="Current Mood"
            value="7.5"
            subtitle="Stable"
          />
          <MoodCard
            icon={<TrendingUp />}
            title="Weekly Trend"
            value="+12%"
            subtitle="Improving"
          />
          <MoodCard
            icon={<Brain />}
            title="Stress Level"
            value="Moderate"
            subtitle="Manageable"
          />
          <MoodCard
            icon={<Heart />}
            title="Sleep Quality"
            value="8.2"
            subtitle="Good"
          />
        </div>

        {/* Main Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-primary">
                    Weekly Mood & Stress Tracking
                  </CardTitle>
                  <Badge variant="outline">Last 7 Days</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer>
                    <LineChart data={MOOD_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        name="Mood Level"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="stress"
                        name="Stress Level"
                        stroke="#FF6B6B"
                        strokeWidth={3}
                        dot={{ fill: "#FF6B6B", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Activity Distribution */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Wellness Activities
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Time distribution across wellness activities
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex justify-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={ACTIVITY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {ACTIVITY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">
              Weekly Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WEEKLY_STATS.map((stat, index) => (
                <WeeklyStatCard key={index} stat={stat} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Section */}
        {!showChatbot ? (
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center text-center p-8">
              <Avatar className="w-16 h-16 mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <MessageCircle className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Need someone to talk to?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our AI assistant is here to listen and provide support
              </p>
              <Button
                onClick={() => setShowChatbot(true)}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Chat with MindSync
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  MindSync Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatbot(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Chatbot />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Insights;