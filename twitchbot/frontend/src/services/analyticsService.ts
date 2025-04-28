import api from './api';

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

const analyticsService = {
  async getStatsSummary(timeRange: TimeRange): Promise<StatsSummary> {
    const response = await api.get<StatsSummary>('/analytics/summary', {
      params: timeRange,
    });
    return response.data;
  },

  async getTopCommands(timeRange: TimeRange): Promise<CommandStats[]> {
    const response = await api.get<CommandStats[]>('/analytics/commands/top', {
      params: timeRange,
    });
    return response.data;
  },

  async getCommandUsageOverTime(
    command: string,
    timeRange: TimeRange
  ): Promise<TimeSeriesData[]> {
    const response = await api.get<TimeSeriesData[]>(`/analytics/commands/${command}/usage`, {
      params: timeRange,
    });
    return response.data;
  },

  async getPlatformDistribution(timeRange: TimeRange): Promise<PlatformDistribution[]> {
    const response = await api.get<PlatformDistribution[]>('/analytics/platform-distribution', {
      params: timeRange,
    });
    return response.data;
  },

  async getUserActivity(timeRange: TimeRange): Promise<TimeSeriesData[]> {
    const response = await api.get<TimeSeriesData[]>('/analytics/user-activity', {
      params: timeRange,
    });
    return response.data;
  },

  async getResponseTimes(timeRange: TimeRange): Promise<TimeSeriesData[]> {
    const response = await api.get<TimeSeriesData[]>('/analytics/response-times', {
      params: timeRange,
    });
    return response.data;
  },

  async exportData(timeRange: TimeRange, format: 'csv' | 'json'): Promise<Blob> {
    const response = await api.get('/analytics/export', {
      params: { ...timeRange, format },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService; 