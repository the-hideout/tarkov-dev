import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services';

interface TimeRange {
  start: string;
  end: string;
}

interface StatsSummary {
  totalCommands: number;
  activeUsers: number;
  messagesProcessed: number;
  averageResponseTime: number;
  commandsChange: number;
  usersChange: number;
  messagesChange: number;
  responseTimeChange: number;
}

interface CommandStats {
  command: string;
  uses: number;
  platform: 'twitch' | 'discord';
  success: number;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface PlatformDistribution {
  platform: 'twitch' | 'discord';
  count: number;
  percentage: number;
}

interface AnalyticsState {
  summary: StatsSummary | null;
  topCommands: CommandStats[];
  commandUsage: TimeSeriesData[];
  platformDistribution: PlatformDistribution[];
  userActivity: TimeSeriesData[];
  responseTimes: TimeSeriesData[];
  timeRange: TimeRange;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  summary: null,
  topCommands: [],
  commandUsage: [],
  platformDistribution: [],
  userActivity: [],
  responseTimes: [],
  timeRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    end: new Date().toISOString(),
  },
  loading: false,
  error: null,
};

// Async thunks
export const getStatsSummary = createAsyncThunk(
  'analytics/getStatsSummary',
  async (timeRange: TimeRange) => {
    const response = await analyticsService.getStatsSummary(timeRange);
    return response;
  }
);

export const getTopCommands = createAsyncThunk(
  'analytics/getTopCommands',
  async (timeRange: TimeRange) => {
    const response = await analyticsService.getTopCommands(timeRange);
    return response;
  }
);

export const getCommandUsage = createAsyncThunk(
  'analytics/getCommandUsage',
  async ({ command, timeRange }: { command: string; timeRange: TimeRange }) => {
    const response = await analyticsService.getCommandUsageOverTime(command, timeRange);
    return response;
  }
);

export const getPlatformDistribution = createAsyncThunk(
  'analytics/getPlatformDistribution',
  async (timeRange: TimeRange) => {
    const response = await analyticsService.getPlatformDistribution(timeRange);
    return response;
  }
);

export const getUserActivity = createAsyncThunk(
  'analytics/getUserActivity',
  async (timeRange: TimeRange) => {
    const response = await analyticsService.getUserActivity(timeRange);
    return response;
  }
);

export const getResponseTimes = createAsyncThunk(
  'analytics/getResponseTimes',
  async (timeRange: TimeRange) => {
    const response = await analyticsService.getResponseTimes(timeRange);
    return response;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Stats Summary
    builder
      .addCase(getStatsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStatsSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getStatsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics summary';
      });

    // Top Commands
    builder
      .addCase(getTopCommands.fulfilled, (state, action) => {
        state.topCommands = action.payload;
      });

    // Command Usage
    builder
      .addCase(getCommandUsage.fulfilled, (state, action) => {
        state.commandUsage = action.payload;
      });

    // Platform Distribution
    builder
      .addCase(getPlatformDistribution.fulfilled, (state, action) => {
        state.platformDistribution = action.payload;
      });

    // User Activity
    builder
      .addCase(getUserActivity.fulfilled, (state, action) => {
        state.userActivity = action.payload;
      });

    // Response Times
    builder
      .addCase(getResponseTimes.fulfilled, (state, action) => {
        state.responseTimes = action.payload;
      });
  },
});

export const { setTimeRange } = analyticsSlice.actions;

export default analyticsSlice.reducer; 