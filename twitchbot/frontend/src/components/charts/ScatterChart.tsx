import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material';

interface ScatterDataPoint {
  x: number;
  y: number;
  name?: string;
}

interface ScatterChartProps {
  data: ScatterDataPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
  title: string;
  color?: string;
  xValueFormatter?: (value: number) => string;
  yValueFormatter?: (value: number) => string;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
  title,
  color,
  xValueFormatter = (value) => value.toString(),
  yValueFormatter = (value) => value.toString(),
}) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsScatterChart
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
          type="number"
          dataKey="x"
          name={xAxisLabel}
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
          label={{
            value: xAxisLabel,
            position: 'bottom',
            fill: theme.palette.text.primary,
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yAxisLabel}
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: 'left',
            fill: theme.palette.text.primary,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
          labelStyle={{ color: theme.palette.text.primary }}
          formatter={(value: number, name: string) => {
            if (name === 'x') return [xValueFormatter(value), xAxisLabel];
            if (name === 'y') return [yValueFormatter(value), yAxisLabel];
            return [value, name];
          }}
        />
        <Legend />
        <Scatter
          name={title}
          data={data}
          fill={color || theme.palette.primary.main}
        />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChart; 