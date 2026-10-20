"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Scroll-wheel zoom stays off until the map is clicked, and turns off again
 * when the pointer leaves — so the page can still scroll past the map. */
export function ClickToZoom() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    map.on("click", enable);
    map.on("mouseout", disable);
    return () => {
      map.off("click", enable);
      map.off("mouseout", disable);
    };
  }, [map]);

  return null;
}
