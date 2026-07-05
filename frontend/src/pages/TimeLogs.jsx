import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { listProjects } from '@/services/projects';
import { listTasks } from '@/services/tasks';
import { listTimeLogsForTask, createTimeLog, deleteTimeLog } from '@/services/timelogs';

export default function TimeLogs() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [timeLogs, setTimeLogs] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ time: '', date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    listProjects().then(setProjects).catch((error) => {
      toast({
        title: 'Failed to load projects',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    });
  }, []);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setTaskId('');
      return;
    }
    setLoadingTasks(true);
    listTasks(projectId)
      .then((data) => {
        setTasks(data);
        setTaskId('');
      })
      .catch((error) => {
        toast({
          title: 'Failed to load tasks',
          description: error.response?.data?.message || error.message,
          variant: 'destructive',
        });
      })
      .finally(() => setLoadingTasks(false));
  }, [projectId]);

  const loadTimeLogs = async () => {
    if (!taskId) return;
    setLoadingLogs(true);
    try {
      const data = await listTimeLogsForTask(taskId);
      setTimeLogs(data);
    } catch (error) {
      toast({
        title: 'Failed to load time logs',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (taskId) loadTimeLogs();
    else setTimeLogs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskId) return;
    setSubmitting(true);
    try {
      await createTimeLog({ task: taskId, time: Number(form.time), date: form.date });
      toast({ title: 'Time log added' });
      setForm({ time: '', date: new Date().toISOString().slice(0, 10) });
      loadTimeLogs();
    } catch (error) {
      toast({
        title: 'Failed to add time log',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (log) => {
    if (!confirm('Delete this time log?')) return;
    try {
      await deleteTimeLog(log._id);
      toast({ title: 'Time log deleted' });
      loadTimeLogs();
    } catch (error) {
      toast({
        title: 'Failed to delete time log',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    }
  };

  const canManage = (log) => user?.role !== 'user' || log.loggedBy?._id === user?._id;
  const totalMinutes = timeLogs.reduce((sum, l) => sum + l.time, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Time Logs</h2>

      <div className="flex gap-4">
        <div className="w-64 space-y-2">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-64 space-y-2">
          <Label>Task</Label>
          <Select value={taskId} onValueChange={setTaskId} disabled={!projectId || loadingTasks}>
            <SelectTrigger>
              <SelectValue placeholder={loadingTasks ? 'Loading...' : 'Select a task'} />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((t) => (
                <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {taskId && (
        <>
          <form onSubmit={handleSubmit} className="flex items-end gap-4 rounded-md border bg-card p-4">
            <div className="space-y-2">
              <Label htmlFor="time">Minutes logged</Label>
              <Input
                id="time"
                type="number"
                min="1"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Logging...' : 'Log time'}
            </Button>
          </form>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Minutes</TableHead>
                  <TableHead>Logged by</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : timeLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No time logged yet</TableCell>
                  </TableRow>
                ) : (
                  timeLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>{log.loggedBy?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        {canManage(log) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(log)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {timeLogs.length > 0 && (
                <tfoot>
                  <TableRow>
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="font-medium">{totalMinutes} min</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </tfoot>
              )}
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
