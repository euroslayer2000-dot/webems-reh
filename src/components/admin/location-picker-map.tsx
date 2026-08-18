"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

/** Center of Roi Et province — the default view when no coordinates are set yet. */
const ROI_ET_CENTER: [number, number] = [16.0538, 103.652];

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPickerMap({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const initialCenter: [number, number] = lat != null && lng != null ? [lat, lng] : ROI_ET_CENTER;

  return (
    <MapContainer center={initialCenter} zoom={13} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lat != null && lng != null && (
        <CircleMarker
          center={[lat, lng]}
          radius={9}
          pathOptions={{ color: "#1f8a70", fillColor: "#1f8a70", fillOpacity: 0.85, weight: 2 }}
        />
      )}
      <ClickToPlace onPick={onPick} />
    </MapContainer>
  );
}
