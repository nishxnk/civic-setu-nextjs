"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/(app)/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Mail, Phone, Calendar, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { userDetails, role } = useUser();
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch profile based on role
    const endpoint = role === "admin" ? "/api/users/profile" : "/api/citizen/profile";
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setProfile((d.user || d) as Record<string, unknown>))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = role === "citizen" ? "/api/citizen/profile" : "/api/users/profile";
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        toast.success("Profile updated");
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const initials = ((profile.name as string) || userDetails?.displayName || "U")[0]?.toUpperCase();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-[#15227a]/20">
            <AvatarFallback className="bg-[#15227a] text-white text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{profile.name as string || userDetails?.displayName || "User"}</h2>
            <p className="text-sm text-muted-foreground">{profile.email as string || userDetails?.email}</p>
            <Badge className="mt-1 capitalize bg-[#15227a] text-white text-xs">
              {role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Edit Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <UserCircle className="w-4 h-4 text-gray-400" /> Name
            </label>
            <Input
              value={(profile.name as string) || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-400" /> Email
            </label>
            <Input value={(profile.email as string) || ""} disabled className="bg-gray-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-gray-400" /> Phone
            </label>
            <Input
              value={(profile.phone as string) || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Your phone number"
            />
          </div>
          <Separator />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            Joined: {new Date(profile.createdAt as string || Date.now()).toLocaleDateString()}
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
