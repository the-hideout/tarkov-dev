import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  People,
  Chat,
  EmojiEvents,
  Info,
} from '@mui/icons-material';
import TwitchIcon from '../components/icons/TwitchIcon';
import DiscordIcon from '../components/icons/DiscordIcon';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Mock data - replace with real data from your API
const viewerData = [
  { date: '2024-01-01', viewers: 1200, followers: 150, subscribers: 45 },
  { date: '2024-01-02', viewers: 1500, followers: 180, subscribers: 52 },
  { date: '2024-01-03', viewers: 1800, followers: 220, subscribers: 58 },
  { date: '2024-01-04', viewers: 1600, followers: 250, subscribers: 63 },
  { date: '2024-01-05', viewers: 2000, followers: 280, subscribers: 70 },
  { date: '2024-01-06', viewers: 2200, followers: 310, subscribers: 75 },
  { date: '2024-01-07', viewers: 2500, followers: 350, subscribers: 82 },
];

const chatData = [
  { hour: '00:00', messages: 120, commands: 15, moderationActions: 5 },
  { hour: '04:00', messages: 80, commands: 10, moderationActions: 3 },
  { hour: '08:00', messages: 200, commands: 25, moderationActions: 8 },
  { hour: '12:00', messages: 350, commands: 40, moderationActions: 12 },
  { hour: '16:00', messages: 450, commands: 55, moderationActions: 15 },
  { hour: '20:00', messages: 380, commands: 45, moderationActions: 10 },
];

const rewardData = [
  { name: 'Custom Emote', value: 35 },
  { name: 'Song Request', value: 25 },
  { name: 'Highlight Message', value: 20 },
  { name: 'Shoutout', value: 15 },
  { name: 'Other', value: 5 },
];

const discordActivityData = [
  { date: '2024-01-01', messages: 800, reactions: 250, joins: 15 },
  { date: '2024-01-02', messages: 950, reactions: 280, joins: 18 },
  { date: '2024-01-03', messages: 1100, reactions: 320, joins: 22 },
  { date: '2024-01-04', messages: 1000, reactions: 290, joins: 20 },
  { date: '2024-01-05', messages: 1200, reactions: 350, joins: 25 },
  { date: '2024-01-06', messages: 1300, reactions: 380, joins: 28 },
  { date: '2024-01-07', messages: 1500, reactions: 420, joins: 32 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`analytics-tabpanel-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const StatCard = ({ title, value, description, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="div" color="text.secondary">
          {title}
        </Typography>
        <Tooltip title={description}>
          <IconButton size="small">
            <Info fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4">{value}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');

  const twitchStats = [
    {
      title: 'Peak Viewers',
      value: '2.5K',
      description: 'Highest concurrent viewers in selected period',
      icon: <TrendingUp sx={{ fontSize: 24, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'New Followers',
      value: '350',
      description: 'New followers gained in selected period',
      icon: <People sx={{ fontSize: 24, color: '#2196f3' }} />,
      color: '#2196f3',
    },
    {
      title: 'Chat Messages',
      value: '15.8K',
      description: 'Total chat messages in selected period',
      icon: <Chat sx={{ fontSize: 24, color: '#ff9800' }} />,
      color: '#ff9800',
    },
    {
      title: 'Rewards Redeemed',
      value: '425',
      description: 'Channel point rewards redeemed in selected period',
      icon: <EmojiEvents sx={{ fontSize: 24, color: '#f44336' }} />,
      color: '#f44336',
    },
  ];

  const discordStats = [
    {
      title: 'Total Members',
      value: '3.2K',
      description: 'Current total server members',
      icon: <People sx={{ fontSize: 24, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Active Users',
      value: '850',
      description: 'Users active in the last 24 hours',
      icon: <Timeline sx={{ fontSize: 24, color: '#2196f3' }} />,
      color: '#2196f3',
    },
    {
      title: 'Messages Today',
      value: '1.5K',
      description: 'Total messages sent today',
      icon: <Chat sx={{ fontSize: 24, color: '#ff9800' }} />,
      color: '#ff9800',
    },
    {
      title: 'New Members',
      value: '32',
      description: 'New members joined today',
      icon: <TrendingUp sx={{ fontSize: 24, color: '#f44336' }} />,
      color: '#f44336',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              size="small"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="platform analytics tabs"
          >
            <Tab icon={<TwitchIcon />} label="Twitch" iconPosition="start" />
            <Tab icon={<DiscordIcon />} label="Discord" iconPosition="start" />
          </Tabs>

          {/* Twitch Analytics */}
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ p: 2 }}>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {twitchStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                  </Grid>
                ))}
              </Grid>

              {/* Growth Chart */}
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Channel Growth
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="viewers" stroke="#8884d8" name="Viewers" />
                    <Line type="monotone" dataKey="followers" stroke="#82ca9d" name="Followers" />
                    <Line type="monotone" dataKey="subscribers" stroke="#ffc658" name="Subscribers" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chat Activity and Rewards */}
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Chat Activity
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chatData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="messages" stackId="1" stroke="#8884d8" fill="#8884d8" name="Messages" />
                        <Area type="monotone" dataKey="commands" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Commands" />
                        <Area type="monotone" dataKey="moderationActions" stackId="1" stroke="#ffc658" fill="#ffc658" name="Moderation" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Popular Rewards
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={rewardData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {rewardData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Discord Analytics */}
          <TabPanel value={currentTab} index={1}>
            <Box sx={{ p: 2 }}>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {discordStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                  </Grid>
                ))}
              </Grid>

              {/* Server Activity */}
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Server Activity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={discordActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="messages" fill="#8884d8" name="Messages" />
                    <Bar dataKey="reactions" fill="#82ca9d" name="Reactions" />
                    <Bar dataKey="joins" fill="#ffc658" name="New Joins" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Additional Discord Metrics */}
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Channel Activity Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'General', value: 40 },
                            { name: 'Gaming', value: 25 },
                            { name: 'Off-Topic', value: 20 },
                            { name: 'Announcements', value: 10 },
                            { name: 'Other', value: 5 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Role Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Members', value: 65 },
                            { name: 'Subscribers', value: 20 },
                            { name: 'Moderators', value: 10 },
                            { name: 'Admins', value: 5 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Analytics; 