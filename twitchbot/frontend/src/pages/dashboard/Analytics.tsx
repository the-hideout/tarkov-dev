import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const viewerData = [
  { time: '12:00', viewers: 120 },
  { time: '13:00', viewers: 150 },
  { time: '14:00', viewers: 180 },
  { time: '15:00', viewers: 220 },
  { time: '16:00', viewers: 250 },
  { time: '17:00', viewers: 280 },
];

const chatData = [
  { hour: '12-13', messages: 450 },
  { hour: '13-14', messages: 520 },
  { hour: '14-15', messages: 630 },
  { hour: '15-16', messages: 780 },
  { hour: '16-17', messages: 890 },
  { hour: '17-18', messages: 950 },
];

const engagementData = [
  { name: 'Chat Messages', value: 4500 },
  { name: 'Commands Used', value: 1200 },
  { name: 'Emotes Used', value: 2800 },
  { name: 'Mentions', value: 800 },
];

const COLORS = ['#7289da', '#9b59b6', '#e91e63', '#2ecc71'];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('day');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            View statistics for:
          </Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Viewer Count Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Viewer Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="viewers"
                  stroke="#7289da"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Chat Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Chat Activity" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chatData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#9b59b6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Engagement Distribution" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {engagementData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics; 