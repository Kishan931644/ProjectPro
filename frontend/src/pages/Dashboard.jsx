import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, CheckSquare, FolderCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listProjects } from '@/services/projects';
import { listTasks } from '@/services/tasks';

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ projects: 0, activeProjects: 0, tasks: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, tasks] = await Promise.all([
          listProjects(),
          listTasks(),
        ]);
        setCounts({
          projects: projects.length,
          activeProjects: projects.filter((p) => p.status === 'active').length,
          tasks: tasks.length,
        });
      } catch (error) {
        toast({
          title: 'Failed to load dashboard',
          description: error.response?.data?.message || error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { title: 'Total Projects', value: counts.projects, icon: Folder },
    { title: 'Active Projects', value: counts.activeProjects, icon: FolderCheck },
    { title: 'Total Tasks', value: counts.tasks, icon: CheckSquare },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '—' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
