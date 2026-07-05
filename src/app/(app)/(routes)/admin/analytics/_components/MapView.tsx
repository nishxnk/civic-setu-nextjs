"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { IComplaint } from "@/types/complaint";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MapViewProps {
  complaints: IComplaint[];
}

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  "in-progress": "#3b82f6",
  resolved: "#22c55e",
  rejected: "#ef4444",
};

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 16px; height: 16px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

function MapBoundsUpdater({ complaints }: { complaints: IComplaint[] }) {
  const map = useMap();
  const coords = useMemo(() => {
    return complaints
      .filter((c) => c.location?.latitude && c.location?.longitude)
      .map((c) => [c.location.latitude!, c.location.longitude!] as [number, number]);
  }, [complaints]);

  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [coords, map]);

  return null;
}

export default function MapView({ complaints }: MapViewProps) {
  const validComplaints = useMemo(
    () =>
      complaints.filter(
        (c) => c.location?.latitude && c.location?.longitude
      ),
    [complaints]
  );

  if (validComplaints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Complaint Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No complaints with location data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Complaint Map ({validComplaints.length} locations)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border" style={{ height: 500 }}>
          <MapContainer
            center={[28.6139, 77.209]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBoundsUpdater complaints={validComplaints} />
            {validComplaints.map((c) => (
              <Marker
                key={c._id}
                position={[c.location.latitude!, c.location.longitude!]}
                icon={createColoredIcon(statusColors[c.status] || "#6b7280")}
              >
                <Popup>
                  <div className="space-y-1 min-w-[180px]">
                    <p className="font-semibold text-sm">{c.title}</p>
                    <p className="font-mono text-xs text-gray-500">{c.trackingNumber}</p>
                    <Badge variant="outline" className="text-xs">
                      {c.status}
                    </Badge>
                    <p className="text-xs text-gray-500 capitalize">{c.category}</p>
                    {c.location?.address && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">
                        {c.location.address}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
