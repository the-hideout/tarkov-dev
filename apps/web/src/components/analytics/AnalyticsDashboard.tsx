import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart } from "@/components/ui/charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsData {
  chatActivity: {
    date: string;
    messages: number;
    users: number;
  }[];
  commandUsage: {
    command: string;
    uses: number;
  }[];
  userGrowth: {
    date: string;
    followers: number;
    subscribers: number;
  }[];
  topChatters: {
    username: string;
    messages: number;
  }[];
}

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchData();
  }, [timeframe]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chat Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.chatActivity}
              xKey="date"
              yKeys={['messages', 'users']}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={data.commandUsage}
              xKey="command"
              yKey="uses"
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.userGrowth}
              xKey="date"
              yKeys={['followers', 'subscribers']}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Chatters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topChatters.map((user, index) => (
                <div key={user.username} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span>{user.username}</span>
                  </div>
                  <span className="text-muted-foreground">{user.messages} messages</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 