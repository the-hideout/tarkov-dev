import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Role {
  id: string;
  name: string;
  color: string;
  autoAssign: boolean;
}

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { toast } = useToast();

  const handleAutoAssignToggle = async (roleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/discord/roles/${roleId}/auto-assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      setRoles(roles.map(role => 
        role.id === roleId ? { ...role, autoAssign: enabled } : role
      ));

      toast({
        title: "Role updated",
        description: `Auto-assign has been ${enabled ? 'enabled' : 'disabled'} for ${
          roles.find(r => r.id === roleId)?.name
        }`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select server" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="server1">Server 1</SelectItem>
            <SelectItem value="server2">Server 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between p-4 bg-card rounded-lg">
            <div className="flex items-center space-x-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: role.color }}
              />
              <span>{role.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={role.autoAssign}
                  onCheckedChange={(checked) => handleAutoAssignToggle(role.id, checked)}
                />
                <Label>Auto-assign</Label>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 