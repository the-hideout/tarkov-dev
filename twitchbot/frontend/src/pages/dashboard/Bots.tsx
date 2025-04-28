import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Command {
  id: string;
  name: string;
  response: string;
  platform: 'twitch' | 'discord' | 'both';
  enabled: boolean;
  cooldown: number;
}

const initialCommands: Command[] = [
  {
    id: '1',
    name: '!uptime',
    response: 'Stream has been live for {uptime}',
    platform: 'both',
    enabled: true,
    cooldown: 30,
  },
  {
    id: '2',
    name: '!discord',
    response: 'Join our Discord server: https://discord.gg/example',
    platform: 'twitch',
    enabled: true,
    cooldown: 300,
  },
];

const Bots: React.FC = () => {
  const [commands, setCommands] = useState<Command[]>(initialCommands);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [newCommand, setNewCommand] = useState<Partial<Command>>({
    platform: 'both',
    enabled: true,
    cooldown: 30,
  });

  const handleOpenDialog = (command?: Command) => {
    if (command) {
      setEditingCommand(command);
      setNewCommand(command);
    } else {
      setEditingCommand(null);
      setNewCommand({
        platform: 'both',
        enabled: true,
        cooldown: 30,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCommand(null);
    setNewCommand({
      platform: 'both',
      enabled: true,
      cooldown: 30,
    });
  };

  const handleSaveCommand = () => {
    if (editingCommand) {
      setCommands(commands.map(cmd => 
        cmd.id === editingCommand.id ? { ...cmd, ...newCommand } : cmd
      ));
    } else {
      setCommands([
        ...commands,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: newCommand.name || '',
          response: newCommand.response || '',
          platform: newCommand.platform || 'both',
          enabled: newCommand.enabled || true,
          cooldown: newCommand.cooldown || 30,
        },
      ]);
    }
    handleCloseDialog();
  };

  const handleDeleteCommand = (id: string) => {
    setCommands(commands.filter(cmd => cmd.id !== id));
  };

  const handleToggleCommand = (id: string) => {
    setCommands(commands.map(cmd =>
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    ));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bot Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your Twitch and Discord bot commands
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Commands"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Command
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Command</TableCell>
                      <TableCell>Response</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Cooldown</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commands.map((command) => (
                      <TableRow key={command.id}>
                        <TableCell>{command.name}</TableCell>
                        <TableCell>{command.response}</TableCell>
                        <TableCell>{command.platform}</TableCell>
                        <TableCell>{command.cooldown}s</TableCell>
                        <TableCell>
                          <Switch
                            checked={command.enabled}
                            onChange={() => handleToggleCommand(command.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(command)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCommand(command.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCommand ? 'Edit Command' : 'Add Command'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Command"
              fullWidth
              value={newCommand.name || ''}
              onChange={(e) =>
                setNewCommand({ ...newCommand, name: e.target.value })
              }
            />
            <TextField
              label="Response"
              fullWidth
              multiline
              rows={3}
              value={newCommand.response || ''}
              onChange={(e) =>
                setNewCommand({ ...newCommand, response: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={newCommand.platform || 'both'}
                label="Platform"
                onChange={(e) =>
                  setNewCommand({
                    ...newCommand,
                    platform: e.target.value as 'twitch' | 'discord' | 'both',
                  })
                }
              >
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="twitch">Twitch</MenuItem>
                <MenuItem value="discord">Discord</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Cooldown (seconds)"
              type="number"
              fullWidth
              value={newCommand.cooldown || 30}
              onChange={(e) =>
                setNewCommand({
                  ...newCommand,
                  cooldown: parseInt(e.target.value, 10),
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCommand} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bots; 