'use client';

import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LoyaltySettings {
  enabled: boolean;
  pointsName: string;
  pointsPerMessage: number;
  pointsPerMinute: number;
  subscriberMultiplier: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  enabled: boolean;
}

export function LoyaltySystem() {
  const [settings, setSettings] = useState<LoyaltySettings>({
    enabled: false,
    pointsName: 'Points',
    pointsPerMessage: 1,
    pointsPerMinute: 1,
    subscriberMultiplier: 2,
  });

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    cost: 100,
    enabled: true,
  });

  const { toast } = useToast();

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/twitch/loyalty/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: "Settings saved",
        description: "Loyalty system settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddReward = async () => {
    try {
      const response = await fetch('/api/twitch/loyalty/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReward),
      });

      if (!response.ok) throw new Error('Failed to add reward');

      const reward = await response.json();
      setRewards([...rewards, reward]);
      setNewReward({ name: '', description: '', cost: 100, enabled: true });

      toast({
        title: "Reward added",
        description: `Reward "${newReward.name}" has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reward. Please try again.",
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
              <CardTitle>Loyalty System</CardTitle>
              <CardDescription>Configure points and rewards</CardDescription>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Points Name</Label>
              <Input
                value={settings.pointsName}
                onChange={(e) => setSettings({
                  ...settings,
                  pointsName: e.target.value
                })}
                placeholder="e.g., Points, Coins, Stars"
              />
            </div>
            <div className="space-y-2">
              <Label>Points per Message</Label>
              <Input
                type="number"
                value={settings.pointsPerMessage}
                onChange={(e) => setSettings({
                  ...settings,
                  pointsPerMessage: parseInt(e.target.value)
                })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Points per Minute</Label>
              <Input
                type="number"
                value={settings.pointsPerMinute}
                onChange={(e) => setSettings({
                  ...settings,
                  pointsPerMinute: parseInt(e.target.value)
                })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Subscriber Multiplier</Label>
              <Input
                type="number"
                value={settings.subscriberMultiplier}
                onChange={(e) => setSettings({
                  ...settings,
                  subscriberMultiplier: parseFloat(e.target.value)
                })}
                min={1}
                step={0.1}
              />
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel Rewards</CardTitle>
          <CardDescription>Create and manage channel point rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Reward name"
              value={newReward.name}
              onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newReward.description}
              onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Cost"
              value={newReward.cost}
              onChange={(e) => setNewReward({ ...newReward, cost: parseInt(e.target.value) })}
              min={0}
            />
          </div>
          <Button onClick={handleAddReward} className="w-full">
            Add Reward
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.name}</TableCell>
                  <TableCell>{reward.description}</TableCell>
                  <TableCell>{reward.cost}</TableCell>
                  <TableCell>
                    <Switch checked={reward.enabled} />
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 