"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, UserPlus, Mail, Lock, UserCircle, Shield, Loader2,
} from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-[#15227a] text-white",
  worker: "bg-purple-100 text-purple-700",
  citizen: "bg-gray-100 text-gray-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", role: "worker",
  });

  const fetchUsers = () => {
    adminAPI.getUsers()
      .then((res: unknown) => setUsers((res as { users: Array<Record<string, unknown>> }).users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill all fields");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`User "${data.user.name}" created as ${data.user.role}`);
        setDialogOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "worker" });
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch {
      toast.error("Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Users
        </h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-1" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#15227a]" />
                Create New User
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <UserCircle className="w-4 h-4 text-gray-400" /> Full Name
                </label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" /> Email
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gray-400" /> Password
                </label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-gray-400" /> Role
                </label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v || "worker" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — Full Access</SelectItem>
                    <SelectItem value="worker">Worker — Field Tasks</SelectItem>
                    <SelectItem value="citizen">Citizen — Report Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Create User</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id as string}>
                  <TableCell className="font-medium">{u.name as string}</TableCell>
                  <TableCell className="text-sm">{u.email as string}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[u.role as string] || "" + " text-xs capitalize"}>
                      {u.role as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(u.createdAt as string).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No users yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
