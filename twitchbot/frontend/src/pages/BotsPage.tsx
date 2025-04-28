import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`bot-tabpanel-${index}`}
    aria-labelledby={`bot-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

interface Command {
  name: string;
  description: string;
  enabled: boolean;
  cooldown: number;
  userLevel: string;
}

const BotsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (command?: Command) => {
    setSelectedCommand(command || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommand(null);
  };

  const commands: Command[] = [
    {
      name: '!help',
      description: 'Display available commands',
      enabled: true,
      cooldown: 5,
      userLevel: 'everyone',
    },
    {
      name: '!points',
      description: 'Check user points',
      enabled: true,
      cooldown: 30,
      userLevel: 'subscriber',
    },
    {
      name: '!giveaway',
      description: 'Start a giveaway',
      enabled: false,
      cooldown: 300,
      userLevel: 'moderator',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Bot Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Command
        </Button>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="bot configuration tabs"
        >
          <Tab label="Twitch Bot" />
          <Tab label="Discord Bot" />
        </Tabs>

        <TabPanel value={selectedTab} index={0}>
          {/* Twitch Bot Configuration */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Bot Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Bot Username"
                  defaultValue="NexusCoreBot"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Channel"
                  defaultValue="#yourchannel"
                  margin="normal"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Auto-moderation"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chat Settings
                </Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Slow Mode"
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Slow Mode Delay (seconds)"
                  defaultValue={30}
                  margin="normal"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Subscriber-only Mode"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Emote-only Mode"
                />
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Commands
            </Typography>
            <List>
              {commands.map((command) => (
                <React.Fragment key={command.name}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {command.name}
                          <Chip
                            size="small"
                            label={command.enabled ? 'Enabled' : 'Disabled'}
                            color={command.enabled ? 'success' : 'default'}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {command.description}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Cooldown: {command.cooldown}s • User Level:{' '}
                            {command.userLevel}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog(command)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {/* Discord Bot Configuration */}
          <Alert severity="info" sx={{ mb: 3 }}>
            Connect your Discord server to enable bot functionality.
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Server Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Server ID"
                  placeholder="Enter your Discord server ID"
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  sx={{ mt: 2 }}
                >
                  Save Settings
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Permissions
                </Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Manage Messages"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Manage Roles"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Kick Members"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Ban Members"
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Command Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCommand ? 'Edit Command' : 'Add New Command'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Command Name"
            defaultValue={selectedCommand?.name}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            defaultValue={selectedCommand?.description}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            type="number"
            label="Cooldown (seconds)"
            defaultValue={selectedCommand?.cooldown}
            margin="normal"
          />
          <TextField
            fullWidth
            label="User Level"
            defaultValue={selectedCommand?.userLevel}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch defaultChecked={selectedCommand?.enabled ?? true} />
            }
            label="Enabled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedCommand ? 'Save Changes' : 'Add Command'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotsPage; 