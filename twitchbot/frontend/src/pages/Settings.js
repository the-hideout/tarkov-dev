import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore,
  Chat,
  EmojiEvents,
  Security,
  Campaign,
  Group,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import TwitchIcon from '../components/icons/TwitchIcon';
import DiscordIcon from '../components/icons/DiscordIcon';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Settings = () => {
  const location = useLocation();
  const defaultTab = location.search.includes('discord') ? 1 : 0;
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock settings data - replace with real data from your API
  const [twitchSettings, setTwitchSettings] = useState({
    chatSettings: {
      slowMode: false,
      slowModeDelay: 30,
      followerOnly: false,
      followerOnlyDelay: 10,
      subscriberOnly: false,
      emoteOnly: false,
      uniqueChat: false,
    },
    rewardSettings: {
      enabled: true,
      minimumPoints: 100,
      redeemTimeout: 300,
      maxRewardsPerStream: 50,
    },
    moderationSettings: {
      autoModEnabled: true,
      blockLinks: true,
      blockCaps: true,
      capsPercentageThreshold: 70,
      timeout: {
        first: 300,
        second: 600,
        third: 900,
      },
    },
    announcementSettings: {
      followAlert: true,
      subscriptionAlert: true,
      raidAlert: true,
      customMessage: 'Thanks for the {action}, {user}!',
    },
  });

  const [discordSettings, setDiscordSettings] = useState({
    serverSettings: {
      welcomeEnabled: true,
      welcomeChannel: 'welcome',
      welcomeMessage: 'Welcome {user} to the server!',
      defaultRole: 'Member',
    },
    roleSettings: {
      autoAssignRoles: true,
      moderatorRole: 'Moderator',
      subscriberRole: 'Subscriber',
      vipRole: 'VIP',
    },
    moderationSettings: {
      autoModEnabled: true,
      filterProfanity: true,
      filterSpam: true,
      filterInvites: true,
      logChannel: 'mod-logs',
    },
    notificationSettings: {
      streamLive: true,
      streamOffline: true,
      announceChannel: 'announcements',
      pingRole: 'Stream Notifications',
    },
  });

  const handleSave = (platform) => {
    // Here you would typically make an API call to save the settings
    setSnackbar({
      open: true,
      message: `${platform} settings saved successfully!`,
      severity: 'success',
    });
  };

  const handleChange = (platform, category, field, value) => {
    if (platform === 'twitch') {
      setTwitchSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    } else {
      setDiscordSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="platform settings tabs"
          >
            <Tab
              icon={<TwitchIcon />}
              label="Twitch"
              iconPosition="start"
            />
            <Tab
              icon={<DiscordIcon />}
              label="Discord"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Twitch Settings */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 2 }}>
            {/* Chat Settings */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chat sx={{ mr: 1 }} />
                  <Typography variant="h6">Chat Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twitchSettings.chatSettings.slowMode}
                          onChange={(e) => handleChange('twitch', 'chatSettings', 'slowMode', e.target.checked)}
                        />
                      }
                      label="Slow Mode"
                    />
                    {twitchSettings.chatSettings.slowMode && (
                      <TextField
                        label="Delay (seconds)"
                        type="number"
                        value={twitchSettings.chatSettings.slowModeDelay}
                        onChange={(e) => handleChange('twitch', 'chatSettings', 'slowModeDelay', e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twitchSettings.chatSettings.followerOnly}
                          onChange={(e) => handleChange('twitch', 'chatSettings', 'followerOnly', e.target.checked)}
                        />
                      }
                      label="Follower-Only Mode"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Reward Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEvents sx={{ mr: 1 }} />
                  <Typography variant="h6">Channel Point Rewards</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Minimum Points"
                      type="number"
                      value={twitchSettings.rewardSettings.minimumPoints}
                      onChange={(e) => handleChange('twitch', 'rewardSettings', 'minimumPoints', e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Max Rewards Per Stream"
                      type="number"
                      value={twitchSettings.rewardSettings.maxRewardsPerStream}
                      onChange={(e) => handleChange('twitch', 'rewardSettings', 'maxRewardsPerStream', e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Moderation Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 1 }} />
                  <Typography variant="h6">Moderation</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twitchSettings.moderationSettings.autoModEnabled}
                          onChange={(e) => handleChange('twitch', 'moderationSettings', 'autoModEnabled', e.target.checked)}
                        />
                      }
                      label="Enable AutoMod"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twitchSettings.moderationSettings.blockLinks}
                          onChange={(e) => handleChange('twitch', 'moderationSettings', 'blockLinks', e.target.checked)}
                        />
                      }
                      label="Block Links"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSave('Twitch')}
                startIcon={<SettingsIcon />}
              >
                Save Twitch Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Discord Settings */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 2 }}>
            {/* Server Settings */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Server Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={discordSettings.serverSettings.welcomeEnabled}
                          onChange={(e) => handleChange('discord', 'serverSettings', 'welcomeEnabled', e.target.checked)}
                        />
                      }
                      label="Enable Welcome Messages"
                    />
                    {discordSettings.serverSettings.welcomeEnabled && (
                      <TextField
                        label="Welcome Message"
                        value={discordSettings.serverSettings.welcomeMessage}
                        onChange={(e) => handleChange('discord', 'serverSettings', 'welcomeMessage', e.target.value)}
                        fullWidth
                        margin="normal"
                        multiline
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Default Role</InputLabel>
                      <Select
                        value={discordSettings.serverSettings.defaultRole}
                        onChange={(e) => handleChange('discord', 'serverSettings', 'defaultRole', e.target.value)}
                        label="Default Role"
                      >
                        <MenuItem value="Member">Member</MenuItem>
                        <MenuItem value="Subscriber">Subscriber</MenuItem>
                        <MenuItem value="VIP">VIP</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Role Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 1 }} />
                  <Typography variant="h6">Role Management</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={discordSettings.roleSettings.autoAssignRoles}
                          onChange={(e) => handleChange('discord', 'roleSettings', 'autoAssignRoles', e.target.checked)}
                        />
                      }
                      label="Auto-Assign Roles"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Moderator Role</InputLabel>
                      <Select
                        value={discordSettings.roleSettings.moderatorRole}
                        onChange={(e) => handleChange('discord', 'roleSettings', 'moderatorRole', e.target.value)}
                        label="Moderator Role"
                      >
                        <MenuItem value="Moderator">Moderator</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Staff">Staff</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Notification Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Campaign sx={{ mr: 1 }} />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={discordSettings.notificationSettings.streamLive}
                          onChange={(e) => handleChange('discord', 'notificationSettings', 'streamLive', e.target.checked)}
                        />
                      }
                      label="Stream Live Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Announcement Channel"
                      value={discordSettings.notificationSettings.announceChannel}
                      onChange={(e) => handleChange('discord', 'notificationSettings', 'announceChannel', e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSave('Discord')}
                startIcon={<SettingsIcon />}
              >
                Save Discord Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 