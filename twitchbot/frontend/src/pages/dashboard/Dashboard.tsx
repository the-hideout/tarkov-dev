import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  PeopleOutline as ViewersIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const statsCards = [
  {
    title: 'Total Viewers',
    value: '1.2K',
    icon: <ViewersIcon />,
    color: '#7289da',
  },
  {
    title: 'Chat Messages',
    value: '8.5K',
    icon: <ChatIcon />,
    color: '#9b59b6',
  },
  {
    title: 'New Followers',
    value: '156',
    icon: <PersonIcon />,
    color: '#e91e63',
  },
  {
    title: 'Stream Uptime',
    value: '4h 23m',
    icon: <TimelineIcon />,
    color: '#2ecc71',
  },
];

const recentActivity = [
  {
    type: 'follow',
    user: 'StreamFan123',
    time: '2 minutes ago',
    icon: <PersonIcon />,
  },
  {
    type: 'subscription',
    user: 'SuperViewer',
    time: '5 minutes ago',
    icon: <StarIcon />,
  },
  {
    type: 'notification',
    user: 'BotCommand',
    time: '10 minutes ago',
    icon: <NotificationsIcon />,
  },
];

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, Streamer!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening in your community
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderTop: 3,
                borderColor: card.color,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: '50%',
                  bgcolor: `${card.color}20`,
                  color: card.color,
                  mb: 1,
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h4" component="div">
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Activity" />
            <Divider />
            <CardContent>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon
                        sx={{
                          color:
                            activity.type === 'subscription'
                              ? 'primary.main'
                              : 'secondary.main',
                        }}
                      >
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.user}
                        secondary={activity.time}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Stream Health" />
            <Divider />
            <CardContent>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  Excellent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your stream is performing well with no detected issues.
                  Current bitrate: 6000kbps
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 