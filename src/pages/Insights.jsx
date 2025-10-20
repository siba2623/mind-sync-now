import React, { useState, memo } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  useTheme,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  IconButton
} from "@mui/material";
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
  Psychology, 
  SentimentSatisfied, 
  Mood, 
  Insights as InsightsIcon,
  TrendingUp,
  Chat,
  Close
} from "@mui/icons-material";
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
const MoodCard = memo(({ icon, title, value, subtitle, color }) => (
  <Card sx={{ 
    background: `linear-gradient(135deg, ${color}20, ${color}40)`,
    border: `1px solid ${color}30`,
    borderRadius: 3,
    p: 2,
    height: '100%'
  }}>
    <CardContent sx={{ textAlign: 'center' }}>
      <Avatar sx={{ bgcolor: `${color}20`, color: color, mb: 2, mx: 'auto' }}>
        {icon}
      </Avatar>
      <Typography variant="h5" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
));

// Memoize the WeeklyStatCard component
const WeeklyStatCard = memo(({ stat, theme }) => (
  <Card variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {stat.label}
    </Typography>
    <Typography variant="h6" fontWeight="bold" color="primary.main">
      {stat.value}
    </Typography>
    {stat.trend && (
      <Chip 
        label={stat.trend} 
        size="small" 
        color="success"
        variant="outlined"
        sx={{ mt: 1 }}
      />
    )}
    {stat.score && (
      <Box sx={{ mt: 1 }}>
        {[...Array(10)].map((_, i) => (
          <Box
            key={i}
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: i < stat.score ? theme.palette.primary.main : 'grey.200',
              display: 'inline-block',
              mx: 0.2
            }}
          />
        ))}
      </Box>
    )}
  </Card>
));

function Insights() {
  const [showChatbot, setShowChatbot] = useState(false);
  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <InsightsIcon sx={{ fontSize: 40 }} />
          Mental Health Insights
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Track your emotional well-being and discover patterns in your mental health journey
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MoodCard
                icon={<SentimentSatisfied />}
                title="Current Mood"
                value="7.5"
                subtitle="Stable"
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MoodCard
                icon={<TrendingUp />}
                title="Weekly Trend"
                value="+12%"
                subtitle="Improving"
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MoodCard
                icon={<Psychology />}
                title="Stress Level"
                value="Moderate"
                subtitle="Manageable"
                color="#FF9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MoodCard
                icon={<Mood />}
                title="Sleep Quality"
                value="8.2"
                subtitle="Good"
                color="#9C27B0"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Main Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.palette.primary.light}20`,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="600" color="primary.main">
                Weekly Mood & Stress Tracking
              </Typography>
              <Chip 
                label="Last 7 Days" 
                variant="outlined" 
                color="primary"
                size="small"
              />
            </Box>
            
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer>
                <LineChart data={MOOD_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: `1px solid ${theme.palette.primary.light}30`,
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood Level"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
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
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar - Activity Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.palette.primary.light}20`,
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight="600" color="primary.main" gutterBottom>
              Wellness Activities
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Time distribution across wellness activities
            </Typography>
            
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
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
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Insights */}
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.palette.primary.light}20`,
            }}
          >
            <Typography variant="h6" fontWeight="600" color="primary.main" gutterBottom>
              Weekly Insights
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {WEEKLY_STATS.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <WeeklyStatCard stat={stat} theme={theme} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Chatbot Section */}
        <Grid item xs={12}>
          {!showChatbot ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.main}20)`,
              borderRadius: 3,
              p: 4,
              border: `2px dashed ${theme.palette.primary.main}30`
            }}>
              <Stack alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 60, height: 60 }}>
                  <Chat sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" color="primary.main" fontWeight="600">
                  Need someone to talk to?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Our AI assistant is here to listen and provide support
                </Typography>
                <button
                  onClick={() => setShowChatbot(true)}
                  style={{
                    padding: "14px 40px",
                    fontSize: "1.1rem",
                    background: theme.palette.primary.main,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    fontWeight: 600,
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                  }}
                >
                  Chat with MindSync
                </button>
              </Stack>
            </Box>
          ) : (
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${theme.palette.primary.light}20`,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" fontWeight="600">
                  MindSync Assistant
                </Typography>
                <IconButton 
                  onClick={() => setShowChatbot(false)} 
                  sx={{ color: 'white' }}
                >
                  <Close />
                </IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <Chatbot />
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Insights;