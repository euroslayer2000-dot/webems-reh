"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Scroll-wheel zoom stays off until the map is pressed, and turns off again
 * when the pointer leaves — so the page can still scroll past the map. */
export function ClickToZoom() {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    map.scrollWheelZoom.disable();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    el.addEventListener("pointerdown", enable);
    el.addEventListener("mouseleave", disable);
    return () => {
      el.removeEventListener("pointerdown", enable);
      el.removeEventListener("mouseleave", disable);
    };
  }, [map]);

  return null;
}
