"use client";

import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("./location-picker-map").then((m) => m.LocationPickerMap), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">กำลังโหลดแผนที่...</div>,
});

export function LocationPickerMapLoader({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return <LocationPickerMap lat={lat} lng={lng} onPick={onPick} />;
}
