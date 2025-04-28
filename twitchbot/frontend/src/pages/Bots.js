import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import TwitchIcon from '../components/icons/TwitchIcon';
import DiscordIcon from '../components/icons/DiscordIcon';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`bot-tabpanel-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// Mock data - replace with real data from your API
const mockCommands = {
  twitch: [
    {
      name: '!uptime',
      response: 'Stream has been live for {uptime}',
      cooldown: 30,
      userLevel: 'everyone',
      enabled: true,
    },
    {
      name: '!followage',
      response: '{user} has been following for {followage}',
      cooldown: 60,
      userLevel: 'everyone',
      enabled: true,
    },
    {
      name: '!discord',
      response: 'Join our Discord server: {discord_link}',
      cooldown: 300,
      userLevel: 'moderator',
      enabled: true,
    },
  ],
  discord: [
    {
      name: '!roles',
      response: 'Available roles: {server_roles}',
      cooldown: 60,
      userLevel: 'everyone',
      enabled: true,
    },
    {
      name: '!rank',
      response: '{user}\'s current rank: {user_rank}',
      cooldown: 30,
      userLevel: 'everyone',
      enabled: true,
    },
  ],
};

const mockAutomations = {
  twitch: [
    {
      name: 'Stream Start Message',
      trigger: 'stream_start',
      action: 'Send message: "Stream is now live! {game} - {title}"',
      enabled: true,
    },
    {
      name: 'Follower Alert',
      trigger: 'new_follower',
      action: 'Send message: "Thanks for following, {user}!"',
      enabled: true,
    },
    {
      name: 'Sub Alert',
      trigger: 'new_subscriber',
      action: 'Send message: "{user} just subscribed! PogChamp"',
      enabled: true,
    },
  ],
  discord: [
    {
      name: 'Welcome Message',
      trigger: 'member_join',
      action: 'Send message: "Welcome {user} to the server!"',
      enabled: true,
    },
    {
      name: 'Stream Notification',
      trigger: 'stream_start',
      action: 'Send message in #announcements: "{streamer} is live!"',
      enabled: true,
    },
  ],
};

const CommandDialog = ({ open, onClose, command, platform, isNew }) => {
  const [editedCommand, setEditedCommand] = useState(command || {
    name: '',
    response: '',
    cooldown: 30,
    userLevel: 'everyone',
    enabled: true,
  });

  const handleSave = () => {
    // Here you would typically make an API call to save the command
    onClose(editedCommand);
  };

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="sm" fullWidth>
      <DialogTitle>{isNew ? 'Add New Command' : 'Edit Command'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Command Name"
          value={editedCommand.name}
          onChange={(e) => setEditedCommand({ ...editedCommand, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Response"
          value={editedCommand.response}
          onChange={(e) => setEditedCommand({ ...editedCommand, response: e.target.value })}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Cooldown (seconds)"
              type="number"
              value={editedCommand.cooldown}
              onChange={(e) => setEditedCommand({ ...editedCommand, cooldown: parseInt(e.target.value) })}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>User Level</InputLabel>
              <Select
                value={editedCommand.userLevel}
                onChange={(e) => setEditedCommand({ ...editedCommand, userLevel: e.target.value })}
                label="User Level"
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="subscriber">Subscribers</MenuItem>
                <MenuItem value="moderator">Moderators</MenuItem>
                <MenuItem value="broadcaster">Broadcaster</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <FormControlLabel
          control={
            <Switch
              checked={editedCommand.enabled}
              onChange={(e) => setEditedCommand({ ...editedCommand, enabled: e.target.checked })}
            />
          }
          label="Enabled"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AutomationDialog = ({ open, onClose, automation, platform, isNew }) => {
  const [editedAutomation, setEditedAutomation] = useState(automation || {
    name: '',
    trigger: '',
    action: '',
    enabled: true,
  });

  const handleSave = () => {
    // Here you would typically make an API call to save the automation
    onClose(editedAutomation);
  };

  const triggers = platform === 'twitch'
    ? ['stream_start', 'stream_end', 'new_follower', 'new_subscriber', 'raid']
    : ['member_join', 'member_leave', 'stream_start', 'message_reaction'];

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="sm" fullWidth>
      <DialogTitle>{isNew ? 'Add New Automation' : 'Edit Automation'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={editedAutomation.name}
          onChange={(e) => setEditedAutomation({ ...editedAutomation, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Trigger</InputLabel>
          <Select
            value={editedAutomation.trigger}
            onChange={(e) => setEditedAutomation({ ...editedAutomation, trigger: e.target.value })}
            label="Trigger"
          >
            {triggers.map((trigger) => (
              <MenuItem key={trigger} value={trigger}>
                {trigger.replace('_', ' ').toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Action"
          value={editedAutomation.action}
          onChange={(e) => setEditedAutomation({ ...editedAutomation, action: e.target.value })}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <FormControlLabel
          control={
            <Switch
              checked={editedAutomation.enabled}
              onChange={(e) => setEditedAutomation({ ...editedAutomation, enabled: e.target.checked })}
            />
          }
          label="Enabled"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Bots = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [commandDialog, setCommandDialog] = useState({ open: false, command: null, isNew: false });
  const [automationDialog, setAutomationDialog] = useState({ open: false, automation: null, isNew: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [commands, setCommands] = useState(mockCommands);
  const [automations, setAutomations] = useState(mockAutomations);

  const handleCommandSave = (savedCommand) => {
    if (savedCommand) {
      // Here you would typically make an API call to save the command
      setSnackbar({
        open: true,
        message: 'Command saved successfully!',
        severity: 'success',
      });
    }
    setCommandDialog({ open: false, command: null, isNew: false });
  };

  const handleAutomationSave = (savedAutomation) => {
    if (savedAutomation) {
      // Here you would typically make an API call to save the automation
      setSnackbar({
        open: true,
        message: 'Automation saved successfully!',
        severity: 'success',
      });
    }
    setAutomationDialog({ open: false, automation: null, isNew: false });
  };

  const platform = currentTab === 0 ? 'twitch' : 'discord';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bot Management
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="bot platform tabs"
          >
            <Tab icon={<TwitchIcon />} label="Twitch Bot" iconPosition="start" />
            <Tab icon={<DiscordIcon />} label="Discord Bot" iconPosition="start" />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <Box sx={{ p: 2 }}>
              {/* Bot Status Card */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TwitchIcon sx={{ fontSize: 40, mr: 2 }} />
                      <div>
                        <Typography variant="h6">Twitch Bot</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Connected as: YourTwitchBot
                        </Typography>
                      </div>
                    </Box>
                    <Box>
                      <Chip
                        label="Online"
                        color="success"
                        sx={{ mr: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                      >
                        Stop Bot
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Commands Section */}
              <Paper sx={{ mb: 4 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Commands
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCommandDialog({ open: true, command: null, isNew: true })}
                  >
                    Add Command
                  </Button>
                </Box>
                <Divider />
                <List>
                  {commands.twitch.map((command, index) => (
                    <React.Fragment key={command.name}>
                      <ListItem>
                        <ListItemText
                          primary={command.name}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {command.response}
                              </Typography>
                              <br />
                              <Chip
                                label={`${command.cooldown}s cooldown`}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={command.userLevel}
                                size="small"
                                color="primary"
                              />
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={command.enabled}
                            onChange={() => {/* Handle toggle */}}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => setCommandDialog({ open: true, command, isNew: false })}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < commands.twitch.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>

              {/* Automations Section */}
              <Paper>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Automations
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAutomationDialog({ open: true, automation: null, isNew: true })}
                  >
                    Add Automation
                  </Button>
                </Box>
                <Divider />
                <List>
                  {automations.twitch.map((automation, index) => (
                    <React.Fragment key={automation.name}>
                      <ListItem>
                        <ListItemText
                          primary={automation.name}
                          secondary={
                            <React.Fragment>
                              <Chip
                                label={`Trigger: ${automation.trigger}`}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Typography component="span" variant="body2" color="text.primary">
                                {automation.action}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={automation.enabled}
                            onChange={() => {/* Handle toggle */}}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => setAutomationDialog({ open: true, automation, isNew: false })}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < automations.twitch.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Box sx={{ p: 2 }}>
              {/* Discord Bot Status Card */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DiscordIcon sx={{ fontSize: 40, mr: 2 }} />
                      <div>
                        <Typography variant="h6">Discord Bot</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Connected as: YourDiscordBot
                        </Typography>
                      </div>
                    </Box>
                    <Box>
                      <Chip
                        label="Online"
                        color="success"
                        sx={{ mr: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                      >
                        Stop Bot
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Discord Commands Section */}
              <Paper sx={{ mb: 4 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Commands
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCommandDialog({ open: true, command: null, isNew: true })}
                  >
                    Add Command
                  </Button>
                </Box>
                <Divider />
                <List>
                  {commands.discord.map((command, index) => (
                    <React.Fragment key={command.name}>
                      <ListItem>
                        <ListItemText
                          primary={command.name}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {command.response}
                              </Typography>
                              <br />
                              <Chip
                                label={`${command.cooldown}s cooldown`}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={command.userLevel}
                                size="small"
                                color="primary"
                              />
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={command.enabled}
                            onChange={() => {/* Handle toggle */}}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => setCommandDialog({ open: true, command, isNew: false })}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < commands.discord.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>

              {/* Discord Automations Section */}
              <Paper>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Automations
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAutomationDialog({ open: true, automation: null, isNew: true })}
                  >
                    Add Automation
                  </Button>
                </Box>
                <Divider />
                <List>
                  {automations.discord.map((automation, index) => (
                    <React.Fragment key={automation.name}>
                      <ListItem>
                        <ListItemText
                          primary={automation.name}
                          secondary={
                            <React.Fragment>
                              <Chip
                                label={`Trigger: ${automation.trigger}`}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Typography component="span" variant="body2" color="text.primary">
                                {automation.action}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={automation.enabled}
                            onChange={() => {/* Handle toggle */}}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => setAutomationDialog({ open: true, automation, isNew: false })}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < automations.discord.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Dialogs */}
      <CommandDialog
        open={commandDialog.open}
        onClose={handleCommandSave}
        command={commandDialog.command}
        platform={platform}
        isNew={commandDialog.isNew}
      />
      <AutomationDialog
        open={automationDialog.open}
        onClose={handleAutomationSave}
        automation={automationDialog.automation}
        platform={platform}
        isNew={automationDialog.isNew}
      />

      {/* Snackbar for notifications */}
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

export default Bots; 