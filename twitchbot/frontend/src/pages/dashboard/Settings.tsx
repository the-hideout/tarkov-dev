import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    profile: {
      username: 'StreamerName',
      email: 'streamer@example.com',
      displayName: 'Awesome Streamer',
    },
    notifications: {
      emailNotifications: true,
      discordNotifications: true,
      streamStart: true,
      streamEnd: true,
      newFollowers: true,
      donations: true,
    },
    integrations: {
      twitchUsername: 'twitchuser',
      discordServerId: '123456789',
      webhookUrl: 'https://discord.com/api/webhooks/...',
      chatBot: 'enabled',
    },
    appearance: {
      theme: 'dark',
      accentColor: '#7289da',
      compactMode: false,
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = () => {
    // Handle saving settings
    console.log('Saving settings:', settings);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account and platform settings
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Profile" />
            <Tab label="Notifications" />
            <Tab label="Integrations" />
            <Tab label="Appearance" />
          </Tabs>

          {/* Profile Settings */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={settings.profile.username}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, username: e.target.value },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={settings.profile.displayName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, displayName: e.target.value },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value },
                    })
                  }
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notification Settings */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            emailNotifications: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.discordNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            discordNotifications: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label="Discord Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Notify me about:
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.streamStart}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            streamStart: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label="Stream Start"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.streamEnd}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            streamEnd: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label="Stream End"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Integration Settings */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Twitch Username"
                  value={settings.integrations.twitchUsername}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        twitchUsername: e.target.value,
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discord Server ID"
                  value={settings.integrations.discordServerId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        discordServerId: e.target.value,
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discord Webhook URL"
                  value={settings.integrations.webhookUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        webhookUrl: e.target.value,
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Chat Bot</InputLabel>
                  <Select
                    value={settings.integrations.chatBot}
                    label="Chat Bot"
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          chatBot: e.target.value as string,
                        },
                      })
                    }
                  >
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Appearance Settings */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    label="Theme"
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          theme: e.target.value as string,
                        },
                      })
                    }
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Accent Color"
                  type="color"
                  value={settings.appearance.accentColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        accentColor: e.target.value,
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.compactMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          appearance: {
                            ...settings.appearance,
                            compactMode: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label="Compact Mode"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Settings; 