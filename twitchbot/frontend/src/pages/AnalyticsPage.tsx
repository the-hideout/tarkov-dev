import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  period: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, period }) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" component="div" gutterBottom>
      {value}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: change >= 0 ? 'success.main' : 'error.main',
          mr: 1,
        }}
      >
        {change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
        <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
          {Math.abs(change)}%
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        vs {period}
      </Typography>
    </Box>
  </Paper>
);

interface TopCommandRow {
  command: string;
  uses: number;
  platform: 'twitch' | 'discord';
  success: number;
}

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const stats = [
    {
      title: 'Total Commands',
      value: '45,678',
      change: 12.3,
      period: 'last week',
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: -5.2,
      period: 'last week',
    },
    {
      title: 'Messages Processed',
      value: '89,012',
      change: 8.7,
      period: 'last week',
    },
    {
      title: 'Average Response Time',
      value: '0.8s',
      change: 15.4,
      period: 'last week',
    },
  ];

  const topCommands: TopCommandRow[] = [
    {
      command: '!help',
      uses: 1234,
      platform: 'discord',
      success: 99.8,
    },
    {
      command: '!points',
      uses: 987,
      platform: 'twitch',
      success: 98.5,
    },
    {
      command: '!rank',
      uses: 876,
      platform: 'discord',
      success: 97.2,
    },
    {
      command: '!play',
      uses: 765,
      platform: 'twitch',
      success: 95.9,
    },
    {
      command: '!stats',
      uses: 654,
      platform: 'discord',
      success: 99.1,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Analytics</Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="24h">24h</ToggleButton>
          <ToggleButton value="7d">7d</ToggleButton>
          <ToggleButton value="30d">30d</ToggleButton>
          <ToggleButton value="90d">90d</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts would go here */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Command Usage Over Time
            </Typography>
            {/* Chart component would go here */}
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">
                Chart visualization coming soon
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Platform Distribution
            </Typography>
            {/* Pie chart component would go here */}
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">
                Chart visualization coming soon
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Commands Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Commands
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Command</TableCell>
                <TableCell align="right">Uses</TableCell>
                <TableCell>Platform</TableCell>
                <TableCell align="right">Success Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topCommands.map((row) => (
                <TableRow key={row.command}>
                  <TableCell component="th" scope="row">
                    {row.command}
                  </TableCell>
                  <TableCell align="right">{row.uses}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.platform.toUpperCase()}
                      size="small"
                      color={row.platform === 'twitch' ? 'secondary' : 'primary'}
                    />
                  </TableCell>
                  <TableCell align="right">{row.success}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage; 