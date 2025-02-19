import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Timer {
  id: string;
  name: string;
  message: string;
  interval: number;
  enabled: boolean;
}

export function TimerManager() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimer, setNewTimer] = useState({
    name: '',
    message: '',
    interval: 300, // 5 minutes default
    enabled: true,
  });
  const { toast } = useToast();

  const handleAddTimer = async () => {
    try {
      const response = await fetch('/api/twitch/timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTimer),
      });

      if (!response.ok) throw new Error('Failed to add timer');

      const timer = await response.json();
      setTimers([...timers, timer]);
      setNewTimer({ name: '', message: '', interval: 300, enabled: true });

      toast({
        title: "Timer added",
        description: `Timer "${newTimer.name}" has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTimer = async (timerId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/twitch/timers/${timerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) throw new Error('Failed to update timer');

      setTimers(timers.map(timer =>
        timer.id === timerId ? { ...timer, enabled } : timer
      ));

      toast({
        title: "Timer updated",
        description: `Timer has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Timer</CardTitle>
          <CardDescription>Create a new automated message timer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timer Name</Label>
              <Input
                value={newTimer.name}
                onChange={(e) => setNewTimer({ ...newTimer, name: e.target.value })}
                placeholder="Enter timer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Interval (seconds)</Label>
              <Input
                type="number"
                value={newTimer.interval}
                onChange={(e) => setNewTimer({ ...newTimer, interval: parseInt(e.target.value) })}
                min={60}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Message</Label>
              <Input
                value={newTimer.message}
                onChange={(e) => setNewTimer({ ...newTimer, message: e.target.value })}
                placeholder="Enter timer message"
              />
            </div>
            <Button className="col-span-2" onClick={handleAddTimer}>
              Add Timer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {timers.map((timer) => (
          <Card key={timer.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{timer.name}</CardTitle>
                <Switch
                  checked={timer.enabled}
                  onCheckedChange={(checked) => handleToggleTimer(timer.id, checked)}
                />
              </div>
              <CardDescription>Every {timer.interval} seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{timer.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 