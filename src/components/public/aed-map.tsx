"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { ClickToZoom } from "./click-to-zoom";

export type AedPoint = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  detail: string | null;
  openHours: string | null;
  phone: string | null;
};

export type UserPosition = { lat: number; lng: number };

const ROI_ET_CENTER: [number, number] = [16.0538, 103.652];

function aedIcon(size: number) {
  return L.icon({
    iconUrl: "/assets/img/aed-icon.svg",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/** Re-frames the map whenever the user position or the selected point changes. */
function ViewController({
  points,
  user,
  selectedId,
}: {
  points: AedPoint[];
  user: UserPosition | null;
  selectedId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    const selected = selectedId != null ? points.find((p) => p.id === selectedId) : null;
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), { duration: 0.75 });
    } else if (user) {
      map.flyTo([user.lat, user.lng], 15, { duration: 0.75 });
    }
  }, [map, points, user, selectedId]);

  return null;
}

export function AedMap({
  points,
  user,
  selectedId,
  onSelect,
}: {
  points: AedPoint[];
  user: UserPosition | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <MapContainer center={ROI_ET_CENTER} zoom={12} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={aedIcon(p.id === selectedId ? 44 : 34)}
          eventHandlers={{ click: () => onSelect(p.id) }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{p.name}</p>
              {p.detail && <p style={{ margin: "2px 0 0", fontSize: 12 }}>{p.detail}</p>}
              {p.openHours && <p style={{ margin: "2px 0 0", fontSize: 12 }}>เปิด: {p.openHours}</p>}
              {p.phone && <p style={{ margin: "2px 0 0", fontSize: 12 }}>โทร {p.phone}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
      {user && (
        <CircleMarker
          center={[user.lat, user.lng]}
          radius={8}
          pathOptions={{ color: "#fff", fillColor: "#2563eb", fillOpacity: 1, weight: 3 }}
        >
          <Popup>ตำแหน่งของคุณ</Popup>
        </CircleMarker>
      )}
      <ClickToZoom />
      <ViewController points={points} user={user} selectedId={selectedId} />
    </MapContainer>
  );
}
