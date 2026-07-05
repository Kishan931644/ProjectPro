import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { inviteUser } from '@/services/auth';

export default function Team() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await inviteUser(form);
      const link = `${window.location.origin}/accept-invite?token=${data.inviteToken}`;
      setInviteLink(link);
      toast({ title: data.message || 'Invitation created' });
      setForm({ name: '', email: '', role: 'user' });
    } catch (error) {
      toast({
        title: 'Failed to invite user',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast({ title: 'Invite link copied' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Team</h2>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Invite a teammate</CardTitle>
          <CardDescription>
            There's no email service configured yet, so you'll get a one-time link below to share with them directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Create invite'}
            </Button>
          </form>

          {inviteLink && (
            <div className="mt-6 space-y-2 rounded-md border bg-muted/40 p-4">
              <Label>Invite link (expires in 7 days)</Label>
              <div className="flex gap-2">
                <Input readOnly value={inviteLink} className="text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
