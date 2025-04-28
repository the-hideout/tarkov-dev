import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  updateTheme,
  updateNotificationPreferences,
  updateLanguage,
} from '../store/slices/settingsSlice';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { user } = useAppSelector((state) => state.auth);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      updateTheme({
        ...settings.theme,
        mode: event.target.checked ? 'dark' : 'light',
      })
    );
  };

  const handleNotificationChange = (type: keyof typeof settings.notifications) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(
      updateNotificationPreferences({
        ...settings.notifications,
        [type]: event.target.checked,
      })
    );
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    dispatch(updateLanguage(event.target.value));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Profile Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={user?.username}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary">
              Change Password
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Appearance Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.theme.mode === 'dark'}
              onChange={handleThemeChange}
            />
          }
          label="Dark Mode"
        />
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={settings.language}
              label="Language"
              onChange={handleLanguageChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Notification Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.email}
              onChange={handleNotificationChange('email')}
            />
          }
          label="Email Notifications"
        />
        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.push}
              onChange={handleNotificationChange('push')}
            />
          }
          label="Push Notifications"
        />
        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.discord}
              onChange={handleNotificationChange('discord')}
            />
          }
          label="Discord Notifications"
        />
        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.twitch}
              onChange={handleNotificationChange('twitch')}
            />
          }
          label="Twitch Notifications"
        />
      </Paper>

      {/* Connected Accounts */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Connected Accounts
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect your Twitch and Discord accounts to enable all features.
        </Alert>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              color="secondary"
              sx={{ textTransform: 'none' }}
            >
              Connect Twitch Account
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Connect Discord Account
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SettingsPage; 