"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { stationTypeMeta } from "@/lib/format";

export type StationPoint = {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  phone: string | null;
  address: string | null;
};

const ROI_ET_CENTER: [number, number] = [16.0538, 103.6520];

function FlyToSelected({
  selectedId,
  points,
  markerRefs,
}: {
  selectedId: number | null | undefined;
  points: StationPoint[];
  markerRefs: React.RefObject<Map<number, LeafletCircleMarker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedId == null) return;
    const point = points.find((p) => p.id === selectedId);
    if (!point) return;

    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 14), { duration: 0.75 });

    const marker = markerRefs.current.get(selectedId);
    if (!marker) return;
    const timer = setTimeout(() => marker.openPopup(), 400);
    return () => clearTimeout(timer);
  }, [selectedId, points, map, markerRefs]);

  return null;
}

export function StationsMap({ points, selectedId }: { points: StationPoint[]; selectedId?: number | null }) {
  const markerRefs = useRef<Map<number, LeafletCircleMarker>>(new Map());

  return (
    <MapContainer center={ROI_ET_CENTER} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => {
        const meta = stationTypeMeta(point.type);
        return (
          <CircleMarker
            key={point.id}
            ref={(instance) => {
              if (instance) markerRefs.current.set(point.id, instance);
              else markerRefs.current.delete(point.id);
            }}
            center={[point.lat, point.lng]}
            radius={9}
            pathOptions={{ color: meta.color, fillColor: meta.color, fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{point.name}</p>
                <p style={{ margin: "2px 0", fontSize: 12, color: meta.color }}>{meta.short}</p>
                {point.address && <p style={{ margin: "4px 0 0", fontSize: 12 }}>{point.address}</p>}
                {point.phone && <p style={{ margin: "2px 0 0", fontSize: 12 }}>โทร {point.phone}</p>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      <FlyToSelected selectedId={selectedId} points={points} markerRefs={markerRefs} />
    </MapContainer>
  );
}
