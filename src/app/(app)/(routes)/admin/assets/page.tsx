"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Search, QrCode, MapPin, Wrench, Building2,
  ArrowUpDown,
} from "lucide-react";

interface AssetDoc {
  _id: string;
  name: string;
  assetCode: string;
  category: string;
  status: string;
  condition: string;
  department: string;
  location: { address: string; ward?: string };
  lastInspectedDate?: string;
}

const conditionColors: Record<string, string> = {
  excellent: "bg-emerald-100 text-emerald-700",
  good: "bg-blue-100 text-blue-700",
  fair: "bg-yellow-100 text-yellow-700",
  poor: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const categoryIcons: Record<string, string> = {
  road: "🛣️",
  streetlight: "💡",
  water_pipe: "🚰",
  manhole: "🕳️",
  park: "🌳",
  building: "🏛️",
  drain: "🌊",
  other: "📦",
};

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<AssetDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchAssets = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (search) params.set("search", search);
    fetch(`/api/assets?${params}`)
      .then((r) => r.json())
      .then((d) => setAssets(d.assets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssets(); }, [categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Infrastructure Assets
        </h1>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Asset
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name, code, or address..." className="pl-9"
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAssets()} />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v || "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="road">Roads</SelectItem>
            <SelectItem value="streetlight">Streetlights</SelectItem>
            <SelectItem value="water_pipe">Water Pipes</SelectItem>
            <SelectItem value="manhole">Manholes</SelectItem>
            <SelectItem value="drain">Drains</SelectItem>
            <SelectItem value="park">Parks</SelectItem>
            <SelectItem value="building">Buildings</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchAssets}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", val: assets.length, color: "bg-[#15227a]" },
            { label: "Good+", val: assets.filter(a => a.condition === "good" || a.condition === "excellent").length, color: "bg-emerald-600" },
            { label: "Fair", val: assets.filter(a => a.condition === "fair").length, color: "bg-yellow-600" },
            { label: "Poor", val: assets.filter(a => a.condition === "poor" || a.condition === "critical").length, color: "bg-red-600" },
            { label: "Active", val: assets.filter(a => a.status === "active").length, color: "bg-blue-600" },
          ].map((s) => (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className={`p-3 ${s.color} text-white`}>
                <p className="text-xs opacity-80">{s.label}</p>
                <p className="text-2xl font-bold">{s.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">
                      {categoryIcons[a.category] || "📦"} {a.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.assetCode}</TableCell>
                    <TableCell className="text-xs capitalize">{a.category.replace("_", " ")}</TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={a.location?.address || ""}>
                      <MapPin className="w-3 h-3 inline mr-1 text-gray-400" />
                      {a.location?.address || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={conditionColors[a.condition] || ""}>
                        {a.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{a.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/assets/${a._id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="QR Code">
                          <QrCode className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {assets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No assets found. Add your first infrastructure asset to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
