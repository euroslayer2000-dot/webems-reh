"use client";

import dynamic from "next/dynamic";
import type { StationPoint } from "./stations-map";

const StationsMap = dynamic(() => import("./stations-map").then((m) => m.StationsMap), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">กำลังโหลดแผนที่...</div>,
});

export function StationsMapLoader({ points, selectedId }: { points: StationPoint[]; selectedId?: number | null }) {
  return <StationsMap points={points} selectedId={selectedId} />;
}
