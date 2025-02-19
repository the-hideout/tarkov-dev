import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Command {
  name: string;
  response: string;
  cooldown: number;
}

export function CommandsManager() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [newCommand, setNewCommand] = useState({ name: '', response: '', cooldown: 0 });
  const { toast } = useToast();

  const handleAddCommand = async () => {
    try {
      const response = await fetch('/api/twitch/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommand),
      });

      if (!response.ok) throw new Error('Failed to add command');

      setCommands([...commands, newCommand]);
      setNewCommand({ name: '', response: '', cooldown: 0 });
      
      toast({
        title: "Command added",
        description: `Command !${newCommand.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add command. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Twitch Commands</h2>
        <Button onClick={handleAddCommand}>Add Command</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="Command name"
          value={newCommand.name}
          onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
        />
        <Input
          placeholder="Response"
          value={newCommand.response}
          onChange={(e) => setNewCommand({ ...newCommand, response: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Cooldown (seconds)"
          value={newCommand.cooldown}
          onChange={(e) => setNewCommand({ ...newCommand, cooldown: parseInt(e.target.value) })}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Command</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Cooldown</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commands.map((command) => (
            <TableRow key={command.name}>
              <TableCell>!{command.name}</TableCell>
              <TableCell>{command.response}</TableCell>
              <TableCell>{command.cooldown}s</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 