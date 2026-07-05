import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listClients } from '@/services/clients';
import { listProjects } from '@/services/projects';
import { listTasks } from '@/services/tasks';
import { listTimeLogsForTask } from '@/services/timelogs';

export default function Invoice() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [clients, projects, tasks] = await Promise.all([
        listClients(),
        listProjects(),
        listTasks(),
      ]);

      const clientById = new Map(clients.map((c) => [c._id, c]));
      const projectById = new Map(projects.map((p) => [p._id, p]));

      const timeLogsPerTask = await Promise.all(
        tasks.map((task) => listTimeLogsForTask(task._id).catch(() => []))
      );

      const minutesByClient = new Map();
      tasks.forEach((task, i) => {
        const projectId = task.project?._id;
        const project = projectById.get(projectId);
        const clientId = project?.client?._id;
        if (!clientId) return;
        const totalMinutes = timeLogsPerTask[i].reduce((sum, log) => sum + log.time, 0);
        minutesByClient.set(clientId, (minutesByClient.get(clientId) || 0) + totalMinutes);
      });

      const computed = Array.from(minutesByClient.entries()).map(([clientId, minutes]) => {
        const client = clientById.get(clientId);
        const hours = minutes / 60;
        const rate = client?.ratePerHour || 0;
        return {
          clientId,
          name: client?.name || 'Unknown client',
          hours,
          rate,
          amount: hours * rate,
        };
      });

      setRows(computed.sort((a, b) => b.amount - a.amount));
    } catch (error) {
      toast({
        title: 'Failed to build invoice report',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalAmount = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            Billable hours per client, computed from logged time × client rate.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate / hour</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Calculating...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No billable time logged yet</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.clientId}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.hours.toFixed(2)}</TableCell>
                  <TableCell>${row.rate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${row.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {rows.length > 0 && (
            <tfoot>
              <TableRow>
                <TableCell colSpan={3} className="font-medium">Total</TableCell>
                <TableCell className="text-right font-medium">${totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            </tfoot>
          )}
        </Table>
      </div>
    </div>
  );
}
