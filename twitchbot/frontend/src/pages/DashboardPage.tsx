import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Message as MessageIcon,
  Visibility as ViewsIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      bgcolor: 'background.paper',
    }}
  >
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        mr: 2,
        bgcolor: `${color}15`,
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {value}
      </Typography>
    </Box>
  </Paper>
);

interface BotCardProps {
  name: string;
  platform: 'twitch' | 'discord';
  status: 'online' | 'offline';
  uptime: string;
  commands: number;
  messages: number;
}

const BotCard: React.FC<BotCardProps> = ({
  name,
  platform,
  status,
  uptime,
  commands,
  messages,
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <BotIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          {name}
        </Typography>
        <Chip
          size="small"
          label={platform.toUpperCase()}
          sx={{ ml: 'auto' }}
          color={platform === 'twitch' ? 'secondary' : 'primary'}
        />
      </Box>
      <Chip
        size="small"
        label={status.toUpperCase()}
        color={status === 'online' ? 'success' : 'error'}
        sx={{ mb: 2 }}
      />
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Uptime: {uptime}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Performance
        </Typography>
        <LinearProgress
          variant="determinate"
          value={85}
          sx={{ mt: 1, mb: 1 }}
        />
        <Typography variant="body2">
          {commands} commands • {messages} messages
        </Typography>
      </Box>
    </CardContent>
    <CardActions>
      <Button size="small">View Details</Button>
      <Button size="small" color={status === 'online' ? 'error' : 'success'}>
        {status === 'online' ? 'Stop' : 'Start'}
      </Button>
    </CardActions>
  </Card>
);

const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '12,345',
      icon: <PeopleIcon />,
      color: '#4caf50',
    },
    {
      title: 'Messages Today',
      value: '45,678',
      icon: <MessageIcon />,
      color: '#2196f3',
    },
    {
      title: 'Total Views',
      value: '98,765',
      icon: <ViewsIcon />,
      color: '#9c27b0',
    },
    {
      title: 'Active Bots',
      value: '3/4',
      icon: <BotIcon />,
      color: '#f44336',
    },
  ];

  const bots = [
    {
      name: 'TwitchBot',
      platform: 'twitch' as const,
      status: 'online' as const,
      uptime: '5d 12h 34m',
      commands: 1234,
      messages: 56789,
    },
    {
      name: 'DiscordBot',
      platform: 'discord' as const,
      status: 'online' as const,
      uptime: '3d 8h 12m',
      commands: 987,
      messages: 34567,
    },
    {
      name: 'ModBot',
      platform: 'twitch' as const,
      status: 'offline' as const,
      uptime: '0d 0h 0m',
      commands: 0,
      messages: 0,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Bots Grid */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Your Bots
      </Typography>
      <Grid container spacing={3}>
        {bots.map((bot, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <BotCard {...bot} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage; 