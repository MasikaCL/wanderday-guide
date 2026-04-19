import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import L, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop, StopCategory } from "@/data/types";

const CATEGORY_BG: Record<StopCategory, string> = {
  food: "#FFE8E8",
  transport: "#E8F4FF",
  sight: "#EDE8FF",
  break: "#E8FFF4",
  gelato: "#FFF3E8",
};

const CATEGORY_LABEL: Record<StopCategory, string> = {
  food: "Food",
  transport: "Transport",
  sight: "Sights",
  break: "Rest",
  gelato: "Gelato",
};

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 16);
      return;
    }
    const bounds: LatLngBoundsExpression = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

interface RouteMapProps {
  stops: Stop[];
  currentIndex: number;
}

export function RouteMap({ stops, currentIndex }: RouteMapProps) {
  const located = stops.filter((s) => typeof s.lat === "number" && typeof s.lng === "number");
  const points: [number, number][] = located.map((s) => [s.lat as number, s.lng as number]);
  const fallbackCenter: [number, number] = points[0] ?? [45.4408, 12.3155];
  const containerRef = useRef<HTMLDivElement>(null);

  if (located.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-muted-foreground">
        No coordinates yet. Add latitude & longitude to your stops to see them on the map.
      </div>
    );
  }

  return (
    <>
      <style>{`
        .route-pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #E8706A;
          opacity: 0.5;
          animation: routePulse 1.5s infinite ease-out;
          pointer-events: none;
        }
        @keyframes routePulse {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .route-popup .leaflet-popup-content-wrapper {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.12);
          padding: 0;
          border: none;
        }
        .route-popup .leaflet-popup-content { margin: 12px 14px; font-family: 'Inter', sans-serif; }
        .route-popup .leaflet-popup-tip { background: #fff; box-shadow: none; }
        .route-popup a.leaflet-popup-close-button { display: none; }
        .leaflet-container { font-family: 'Inter', sans-serif; background: #EAE6DC; }
      `}</style>
      <div
        ref={containerRef}
        style={{
          height: "calc(100vh - 220px)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          margin: "0 16px",
        }}
      >
        <MapContainer center={fallbackCenter} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {points.length > 1 && (
            <Polyline positions={points} pathOptions={{ color: "#B8A9D9", weight: 3, dashArray: "8, 8" }} />
          )}
          {located.map((stop, idx) => {
            const stopIndexInAll = stops.findIndex((s) => s.id === stop.id);
            const isCurrent = stopIndexInAll === currentIndex;
            const isCompleted = stopIndexInAll < currentIndex;
            const isFirst = stopIndexInAll === 0;
            const isLast = stopIndexInAll === stops.length - 1;
            const size = isCurrent ? 40 : 32;
            const fill = isCurrent ? "#E8706A" : CATEGORY_BG[stop.category];
            const textColor = isCurrent ? "#fff" : "#2E2A35";

            const html = `
              <div style="position:relative;width:${size}px;height:${size}px;${isCompleted ? "filter:grayscale(1);opacity:0.4;" : ""}">
                ${isCurrent ? '<div class="route-pulse-ring"></div>' : ""}
                <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:${fill};display:flex;align-items:center;justify-content:center;color:${textColor};font-family:'Nunito',sans-serif;font-weight:700;font-size:${isCurrent ? 15 : 13}px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                  ${stopIndexInAll + 1}
                </div>
              </div>`;
            const icon = L.divIcon({
              html,
              className: "route-stop-icon",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });

            return (
              <CircleMarker
                key={stop.id}
                center={[stop.lat as number, stop.lng as number]}
                radius={0}
                pathOptions={{ opacity: 0, fillOpacity: 0 }}
                eventHandlers={{
                  add: (e) => {
                    const marker = L.marker([stop.lat as number, stop.lng as number], { icon });
                    marker.addTo(e.target._map);
                    if (isFirst) marker.bindTooltip("🏁 Start", { direction: "bottom", offset: [0, size / 2 + 4], permanent: true, className: "route-edge-tooltip" });
                    if (isLast) marker.bindTooltip("🎯 Finish", { direction: "bottom", offset: [0, size / 2 + 4], permanent: true, className: "route-edge-tooltip" });
                    marker.bindPopup(
                      `<div>
                        <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#2E2A35;font-size:15px;margin-bottom:6px;">${stop.name.replace(/</g, "&lt;")}</div>
                        <div style="display:inline-block;background:${CATEGORY_BG[stop.category]};color:#2E2A35;font-size:11px;font-weight:600;padding:3px 10px;border-radius:9999px;margin-bottom:6px;">${CATEGORY_LABEL[stop.category]}</div>
                        ${stop.duration ? `<div style="color:#9B95A3;font-size:12px;margin-top:4px;">~${stop.duration} min here</div>` : ""}
                      </div>`,
                      { className: "route-popup", closeButton: false }
                    );
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </>
  );
}
