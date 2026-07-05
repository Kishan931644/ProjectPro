import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import RequireRole from './components/RequireRole';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import TimeLogs from './pages/TimeLogs';
import Invoice from './pages/Invoice';
import Team from './pages/Team';
import AcceptInvite from './pages/AcceptInvite';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Standalone: works regardless of current session, since accepting
              an invite may switch the active account */}
          <Route path="/accept-invite" element={<AcceptInvite />} />

          {/* Public Routes (redirect to dashboard if already logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/timelogs" element={<TimeLogs />} />
              <Route path="/invoice" element={<Invoice />} />

              <Route element={<RequireRole roles={['admin', 'manager']} />}>
                <Route path="/clients" element={<Clients />} />
                <Route path="/team" element={<Team />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
