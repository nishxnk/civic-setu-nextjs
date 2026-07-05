"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generateTrackingQR } from "@/lib/qr/brandedQr";
import { QrCode } from "lucide-react";

interface QrCodeDisplayProps {
  trackingNumber: string;
}

export default function QrCodeDisplay({ trackingNumber }: QrCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQr() {
      setLoading(true);
      setError("");
      try {
        const url = await generateTrackingQR(trackingNumber);
        if (!cancelled) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error("QR generation failed:", err);
        if (!cancelled) {
          setError("Failed to generate QR code");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQr();

    return () => {
      cancelled = true;
    };
  }, [trackingNumber]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <Skeleton className="w-40 h-40 rounded-md" />
          <Skeleton className="w-32 h-4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-2 text-muted-foreground">
          <QrCode className="w-10 h-10 opacity-30" />
          <p className="text-xs">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for tracking ${trackingNumber}`}
          className="w-40 h-40"
        />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Scan to track</p>
          <p className="font-mono text-sm font-bold text-orange-600">
            {trackingNumber}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
