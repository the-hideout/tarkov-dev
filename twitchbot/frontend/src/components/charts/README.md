# Chart Components

A collection of reusable chart components built with [Recharts](https://recharts.org/) and styled with Material-UI theme integration. These components provide consistent styling and behavior across the application.

## Available Charts

### BarChart
A component for comparing values across categories.

```tsx
import { BarChart } from '../components';

const data = [
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 500 },
];

<BarChart
  data={data}
  title="Sample Data"
  valueFormatter={(value) => `${value} units`}
  horizontal={false}
/>
```

### LineChart (TimeSeriesChart)
A component for visualizing trends over time.

```tsx
import { LineChart } from '../components';

const data = [
  { timestamp: '2024-01-01', value: 100 },
  { timestamp: '2024-01-02', value: 150 },
  { timestamp: '2024-01-03', value: 120 },
];

<LineChart
  data={data}
  title="Time Series Data"
  valueFormatter={(value) => `${value}%`}
  dateFormatter={(date) => new Date(date).toLocaleDateString()}
/>
```

### PieChart
A component for showing parts of a whole.

```tsx
import { PieChart } from '../components';

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
];

<PieChart
  data={data}
  title="Distribution"
  valueFormatter={(value) => `${value} users`}
/>
```

### RadarChart
A component for comparing multiple variables in a radial format.

```tsx
import { RadarChart } from '../components';

const data = [
  { subject: 'Math', value: 80 },
  { subject: 'English', value: 90 },
  { subject: 'Science', value: 85 },
];

<RadarChart
  data={data}
  title="Student Performance"
  valueFormatter={(value) => `${value}%`}
/>
```

### ScatterChart
A component for visualizing correlations between two variables.

```tsx
import { ScatterChart } from '../components';

const data = [
  { x: 10, y: 30 },
  { x: 20, y: 50 },
  { x: 30, y: 70 },
];

<ScatterChart
  data={data}
  xAxisLabel="Time Spent"
  yAxisLabel="Score"
  title="Performance Correlation"
  xValueFormatter={(value) => `${value}min`}
  yValueFormatter={(value) => `${value}%`}
/>
```

### StackedBarChart
A component for comparing parts of a whole across categories.

```tsx
import { StackedBarChart } from '../components';

const data = [
  { name: '2024 Q1', series1: 100, series2: 200, series3: 300 },
  { name: '2024 Q2', series1: 150, series2: 250, series3: 350 },
];

const series = [
  { dataKey: 'series1', title: 'Product A' },
  { dataKey: 'series2', title: 'Product B' },
  { dataKey: 'series3', title: 'Product C' },
];

<StackedBarChart
  data={data}
  series={series}
  valueFormatter={(value) => `$${value}`}
  horizontal={false}
/>
```

## Common Features

All charts include:
- Responsive containers that adapt to parent size
- Material-UI theme integration
- Customizable colors and value formatters
- Interactive tooltips
- Legends
- TypeScript support with proper type definitions
- Consistent styling across the application

## Theme Integration

Charts automatically use the application's Material-UI theme for:
- Text colors
- Background colors
- Grid colors
- Border styles
- Border radius
- Typography

## Best Practices

1. Always provide meaningful titles and labels
2. Use appropriate value formatters for better readability
3. Consider using horizontal layouts for long category names
4. Keep data series limited to maintain clarity
5. Use consistent colors for related data across different charts
6. Provide appropriate tooltips and legends for better user experience 