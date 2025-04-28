import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material';

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
  color?: string;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (timestamp: string) => string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title,
  color,
  valueFormatter = (value) => value.toString(),
  dateFormatter = (timestamp) => new Date(timestamp).toLocaleString(),
}) => {
  const theme = useTheme();

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: dateFormatter(item.timestamp),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.palette.divider}
        />
        <XAxis
          dataKey="formattedDate"
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
          labelStyle={{ color: theme.palette.text.primary }}
          formatter={(value: number) => [valueFormatter(value), title]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          name={title}
          stroke={color || theme.palette.primary.main}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimeSeriesChart; 