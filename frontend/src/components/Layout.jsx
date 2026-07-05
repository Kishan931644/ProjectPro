import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { LogOut, LayoutDashboard, Users, Folder, CheckSquare, Clock, FileText, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
    : '?';

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ...(isManager ? [{ to: "/clients", icon: Users, label: "Clients" }] : []),
    { to: "/projects", icon: Folder, label: "Projects" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/timelogs", icon: Clock, label: "Time Logs" },
    { to: "/invoice", icon: FileText, label: "Invoices" },
  ];

  if (isManager) {
    navItems.push({ to: "/team", icon: UserPlus, label: "Team" });
  }

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold tracking-tight bg-brand-gradient bg-clip-text text-transparent">ProjectPro</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors",
                location.pathname === item.to && "bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-background border-b flex items-center justify-end px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name || 'User'}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{initials}</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
