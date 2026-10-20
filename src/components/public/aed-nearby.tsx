"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, MapPin, Navigation } from "lucide-react";
import type { AedPoint, UserPosition } from "./aed-map";

const AedMap = dynamic(() => import("./aed-map").then((m) => m.AedMap), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">กำลังโหลดแผนที่...</div>,
});

function distanceKm(a: UserPosition, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} ม.` : `${km.toFixed(1)} กม.`;
}

export function AedNearby({ points }: { points: AedPoint[] }) {
  const [user, setUser] = useState<UserPosition | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => {
    const withDistance = points.map((p) => ({ ...p, distance: user ? distanceKm(user, p) : null }));
    if (user) withDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    return withDistance;
  }, [points, user]);

  function locate() {
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUser(here);
        const nearest = points
          .map((p) => ({ id: p.id, d: distanceKm(here, p) }))
          .sort((a, b) => a.d - b.d)[0];
        setSelectedId(nearest?.id ?? null);
        setLocating(false);
      },
      () => {
        setError("ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[image:var(--grad-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          <LocateFixed size={18} /> {locating ? "กำลังค้นหาตำแหน่ง..." : "ค้นหาเครื่อง AED ใกล้ฉัน"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="h-[420px] overflow-hidden rounded-[var(--radius)] border border-border lg:h-[520px]">
          <AedMap points={points} user={user} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto lg:max-h-[520px]">
          {items.length === 0 && <li className="py-8 text-center text-sm text-text-muted">ยังไม่มีข้อมูลจุดติดตั้งเครื่อง AED</li>}
          {items.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`w-full rounded-[var(--radius)] border p-3 text-left transition-colors hover:border-primary-500 ${
                  p.id === selectedId ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/img/aed-icon.svg" alt="AED" width={36} height={36} className="h-9 w-9 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <strong className="block text-text">{p.name}</strong>
                    {p.detail && <small className="block text-text-muted">{p.detail}</small>}
                    {p.openHours && <small className="block text-text-muted">เปิด: {p.openHours}</small>}
                    {p.distance != null && (
                      <small className="mt-1 inline-flex items-center gap-1 font-semibold text-primary-600">
                        <MapPin size={12} /> ห่างจากคุณ {formatDistance(p.distance)}
                        {i === 0 && " (ใกล้ที่สุด)"}
                      </small>
                    )}
                  </span>
                </div>
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 px-1 text-xs font-semibold text-primary-600 hover:underline"
              >
                <Navigation size={12} /> นำทาง
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
