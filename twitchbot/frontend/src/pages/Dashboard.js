import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  ButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Message,
  Notifications,
  Settings,
  ChevronRight,
  Circle,
  Timeline,
  Chat,
  EmojiEvents,
  Info,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import TwitchIcon from '../components/icons/TwitchIcon';
import DiscordIcon from '../components/icons/DiscordIcon';

// Mock data - replace with real data from your API
const mockChartData = [
  { name: 'Mon', viewers: 400, followers: 240 },
  { name: 'Tue', viewers: 300, followers: 139 },
  { name: 'Wed', viewers: 520, followers: 280 },
  { name: 'Thu', viewers: 480, followers: 390 },
  { name: 'Fri', viewers: 380, followers: 430 },
  { name: 'Sat', viewers: 600, followers: 529 },
  { name: 'Sun', viewers: 750, followers: 600 },
];

const mockActivities = [
  {
    platform: 'Twitch',
    event: 'New follower: UserXYZ',
    time: '2 minutes ago',
  },
  {
    platform: 'Discord',
    event: 'Server boost by Member123',
    time: '15 minutes ago',
  },
  {
    platform: 'Twitch',
    event: 'Channel reward redeemed',
    time: '1 hour ago',
  },
  {
    platform: 'Discord',
    event: 'New member joined',
    time: '2 hours ago',
  },
];

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Viewers',
      value: '2.4K',
      icon: <TrendingUp sx={{ fontSize: 24, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Active Users',
      value: '1.2K',
      icon: <People sx={{ fontSize: 24, color: '#2196f3' }} />,
      color: '#2196f3',
    },
    {
      title: 'Chat Messages',
      value: '8.5K',
      icon: <Message sx={{ fontSize: 24, color: '#ff9800' }} />,
      color: '#ff9800',
    },
    {
      title: 'Notifications',
      value: '42',
      icon: <Notifications sx={{ fontSize: 24, color: '#f44336' }} />,
      color: '#f44336',
    },
  ];

  const quickActions = [
    {
      title: 'Twitch Settings',
      icon: <TwitchIcon />,
      path: '/settings?platform=twitch',
    },
    {
      title: 'Discord Settings',
      icon: <DiscordIcon />,
      path: '/settings?platform=discord',
    },
    {
      title: 'Bot Configuration',
      icon: <Settings />,
      path: '/bots',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 360 }}>
            <Typography variant="h6" gutterBottom>
              Channel Growth
            </Typography>
            <ResponsiveContainer>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="viewers" stroke="#8884d8" />
                <Line type="monotone" dataKey="followers" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              {quickActions.map((action, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() => navigate(action.path)}
                    sx={{ py: 2 }}
                  >
                    <ListItemIcon>{action.icon}</ListItemIcon>
                    <ListItemText primary={action.title} />
                    <ChevronRight />
                  </ListItem>
                  {index < quickActions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Activity</Typography>
              <Button color="primary">View All</Button>
            </Box>
            <List>
              {mockActivities.map((activity, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    {activity.platform === 'Twitch' ? (
                      <TwitchIcon color="primary" />
                    ) : (
                      <DiscordIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.event}
                    secondary={activity.time}
                  />
                  <IconButton size="small">
                    <Circle sx={{ fontSize: 8, color: 'success.main' }} />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 