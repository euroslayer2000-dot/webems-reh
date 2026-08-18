"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Phone } from "lucide-react";
import { StationsMapLoader } from "./stations-map-loader";
import type { StationPoint } from "./stations-map";
import { stationTypeMeta } from "@/lib/format";

const GROUP_ORDER = ["ALS", "BLS"] as const;

export function StationsInteractive({ points }: { points: StationPoint[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ ALS: true, BLS: true });

  function selectStation(id: number) {
    setSelectedId(id);
    document.getElementById("stations-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggleGroup(type: string) {
    setOpenGroups((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  const groups = GROUP_ORDER.map((type) => ({
    type,
    meta: stationTypeMeta(type),
    items: points.filter((p) => p.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div id="stations-map" className="h-[420px] overflow-hidden rounded-2xl border border-border shadow-sm lg:h-[560px]">
        <StationsMapLoader points={points} selectedId={selectedId} />
      </div>

      <div className="flex flex-col gap-4 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
        {groups.length === 0 && <p className="py-10 text-center text-sm text-text-muted">ยังไม่มีข้อมูลหน่วย</p>}

        {groups.map((group) => {
          const isOpen = openGroups[group.type] ?? true;
          return (
            <div key={group.type} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <button
                type="button"
                onClick={() => toggleGroup(group.type)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: group.meta.color }}
                  >
                    {group.type}
                  </span>
                  <span className="text-xs text-text-muted">({group.items.length})</span>
                </span>
                <ChevronDown size={16} className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="flex flex-col divide-y divide-border border-t border-border">
                  {group.items.map((station) => {
                    const isSelected = station.id === selectedId;
                    return (
                      <button
                        key={station.id}
                        type="button"
                        onClick={() => selectStation(station.id)}
                        className={`px-4 py-3 text-left transition-colors ${isSelected ? "bg-primary-50" : "hover:bg-bg-soft"}`}
                      >
                        <h3 className="text-sm font-bold text-text">{station.name}</h3>
                        {station.address && (
                          <p className="mt-1 flex items-start gap-1.5 text-xs text-text-muted">
                            <MapPin size={13} className="mt-0.5 shrink-0" /> {station.address}
                          </p>
                        )}
                        {station.phone && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                            <Phone size={13} /> {station.phone}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
