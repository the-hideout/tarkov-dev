import React from 'react';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material';

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title: string;
  color?: string;
  valueFormatter?: (value: number) => string;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  title,
  color,
  valueFormatter = (value) => value.toString(),
}) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
        <PolarGrid stroke={theme.palette.divider} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: theme.palette.text.secondary }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 'auto']}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <Radar
          name={title}
          dataKey="value"
          fill={color || theme.palette.primary.main}
          fillOpacity={0.6}
          stroke={color || theme.palette.primary.main}
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
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart; 