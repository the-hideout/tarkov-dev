import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ModerationSettings {
  enabled: boolean;
  bannedWords: string[];
  capsLimit: number;
  spamThreshold: number;
  muteRole: string;
  logChannel: string;
}

export function ModerationSettings() {
  const [settings, setSettings] = useState<ModerationSettings>({
    enabled: false,
    bannedWords: [],
    capsLimit: 70,
    spamThreshold: 5,
    muteRole: '',
    logChannel: '',
  });
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/discord/moderation/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: "Settings saved",
        description: "Moderation settings have been updated successfully.",
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
              <CardTitle>Auto-Moderation</CardTitle>
              <CardDescription>Configure auto-moderation settings</CardDescription>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Banned Words</Label>
            <Textarea
              placeholder="Enter banned words (one per line)"
              value={settings.bannedWords.join('\n')}
              onChange={(e) => setSettings({
                ...settings,
                bannedWords: e.target.value.split('\n').filter(Boolean)
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAPS Limit (%)</Label>
              <Input
                type="number"
                value={settings.capsLimit}
                onChange={(e) => setSettings({
                  ...settings,
                  capsLimit: parseInt(e.target.value)
                })}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Spam Threshold</Label>
              <Input
                type="number"
                value={settings.spamThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  spamThreshold: parseInt(e.target.value)
                })}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mute Role ID</Label>
              <Input
                value={settings.muteRole}
                onChange={(e) => setSettings({
                  ...settings,
                  muteRole: e.target.value
                })}
                placeholder="Enter role ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Log Channel ID</Label>
              <Input
                value={settings.logChannel}
                onChange={(e) => setSettings({
                  ...settings,
                  logChannel: e.target.value
                })}
                placeholder="Enter channel ID"
              />
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