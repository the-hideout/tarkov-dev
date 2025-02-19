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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoggingSettings {
  enabled: boolean;
  logChannel: string;
  events: {
    memberJoin: boolean;
    memberLeave: boolean;
    messageDelete: boolean;
    messageEdit: boolean;
    memberTimeout: boolean;
    memberBan: boolean;
    roleChanges: boolean;
    channelChanges: boolean;
  };
  webhookUrl: string;
}

export function LoggingSettings() {
  const [settings, setSettings] = useState<LoggingSettings>({
    enabled: false,
    logChannel: '',
    events: {
      memberJoin: true,
      memberLeave: true,
      messageDelete: true,
      messageEdit: true,
      memberTimeout: true,
      memberBan: true,
      roleChanges: true,
      channelChanges: true,
    },
    webhookUrl: '',
  });

  const { toast } = useToast();

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/discord/logging/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: "Settings saved",
        description: "Logging settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Logging</CardTitle>
              <CardDescription>Configure server event logging</CardDescription>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Log Channel</Label>
              <Input
                value={settings.logChannel}
                onChange={(e) => setSettings({
                  ...settings,
                  logChannel: e.target.value
                })}
                placeholder="Enter channel ID"
              />
            </div>

            <div className="space-y-2">
              <Label>Webhook URL (Optional)</Label>
              <Input
                value={settings.webhookUrl}
                onChange={(e) => setSettings({
                  ...settings,
                  webhookUrl: e.target.value
                })}
                placeholder="Enter Discord webhook URL"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Events to Log</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.events).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between space-x-2">
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      events: {
                        ...settings.events,
                        [key]: checked,
                      },
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 