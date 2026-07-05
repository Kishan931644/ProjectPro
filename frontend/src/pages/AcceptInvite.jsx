import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getInviteDetails } from '@/services/auth';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { acceptInvite } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadError('This invite link is missing a token.');
      return;
    }
    getInviteDetails(token)
      .then(setInvite)
      .catch((error) => {
        setLoadError(error.response?.data?.message || 'This invite link is invalid or has expired.');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await acceptInvite(token, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast({
        title: 'Failed to accept invite',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple/10 via-background to-brand-cyan/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        {loadError ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Invite link invalid</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link to="/login" className="text-sm text-primary font-medium hover:underline">
                Back to sign in
              </Link>
            </CardFooter>
          </>
        ) : !invite ? (
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading invite...</CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome, {invite.name}</CardTitle>
              <CardDescription>
                Set a password for <span className="font-medium">{invite.email}</span> to finish joining the team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Setting password...' : 'Set password & sign in'}
              </Button>
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
}
