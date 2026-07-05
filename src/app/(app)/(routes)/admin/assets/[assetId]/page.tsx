"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import QrCodeDisplay from "@/components/qr-code-display";
import {
  ArrowLeft, MapPin, Calendar, Wrench, AlertTriangle, FileText, Clock,
} from "lucide-react";

const conditionColors: Record<string, string> = {
  excellent: "bg-emerald-100 text-emerald-700",
  good: "bg-blue-100 text-blue-700",
  fair: "bg-yellow-100 text-yellow-700",
  poor: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function AssetDetailPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assets/${assetId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assetId]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const asset = data.asset as Record<string, unknown> | undefined;
  const complaints = (data.complaints as Array<Record<string, unknown>>) || [];
  if (!asset) return <div className="text-center py-12 text-muted-foreground">Asset not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/assets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assets
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{asset.name as string}</CardTitle>
                <p className="text-xs font-mono text-muted-foreground mt-1">{asset.assetCode as string}</p>
              </div>
              <Badge variant="outline" className={conditionColors[asset.condition as string] || ""}>
                {(asset.condition as string)?.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2 font-medium capitalize">{(asset.category as string)?.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <span className="ml-2 font-medium capitalize">{asset.department as string}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium capitalize">{(asset.status as string)?.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ward:</span>
                <span className="ml-2 font-medium">{(asset.location as Record<string, unknown>)?.ward as string || "—"}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span>{(asset.location as Record<string, unknown>)?.address as string || "No address"}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Installed: {asset.installedDate ? new Date(asset.installedDate as string).toLocaleDateString() : "—"}
              </div>
              <div className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                Last Maintenance: {asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate as string).toLocaleDateString() : "—"}
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Last Inspected: {asset.lastInspectedDate ? new Date(asset.lastInspectedDate as string).toLocaleDateString() : "—"}
              </div>
            </div>

            {/* Maintenance History */}
            {(asset.maintenanceHistory as Array<Record<string, unknown>>)?.length > 0 && (
              <>
                <Separator />
                <h3 className="font-semibold text-sm">Maintenance History</h3>
                <div className="space-y-2">
                  {(asset.maintenanceHistory as Array<Record<string, unknown>>).map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm bg-gray-50 rounded p-2">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium capitalize">{h.type as string}</p>
                        <p className="text-xs text-muted-foreground">{h.description as string}</p>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(h.date as string).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* QR Code Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Asset QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <QrCodeDisplay trackingNumber={asset.assetCode as string} />
          </CardContent>
        </Card>
      </div>

      {/* Linked Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Linked Complaints ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                <TableRow key={c._id as string}>
                  <TableCell className="font-mono text-xs">{c.trackingNumber as string}</TableCell>
                  <TableCell>{c.title as string}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{c.status as string}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(c.createdAt as string).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
