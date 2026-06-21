import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getLots } from "../api/lots";
import PageWrapper from "../components/PageWrapper";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function FarmerLotsMap() {
  const navigate  = useNavigate();
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["lots-map"],
    queryFn:  () => getLots({}),
  });

  useEffect(() => {
    if (!mapRef.current || leafletMap.current || isLoading) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    }).setView([8.5, 39.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
    setTimeout(() => map.invalidateSize(), 150);

    const bounds: L.LatLngBounds[] = [];

    data?.results.forEach(lot => {
      // Map marker colors based on status using Tokens
      const color = lot.export_ready ? T.color.forest :
                    lot.eudr_dds_ready ? T.color.gold : T.color.red;

      if (lot.boundary) {
        const coords = lot.boundary.coordinates[0];
        const latlngs = coords.map(([lng, lat]) => [lat, lng] as [number, number]);
        const poly = L.polygon(latlngs, {
          color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(map);

        poly.bindPopup(`
          <div style="font-family: 'DM Mono', monospace; font-size: 11px; min-width: 180px; color: ${T.color.ink};">
            <strong style="color: ${T.color.coffee}">${lot.lot_id}</strong><br/>
            <strong>${lot.name}</strong><br/>
            <span style="color: ${T.color.slate}">${lot.region} · ${lot.grade}</span><br/>
            ${lot.sca_score ? `SCA: ${lot.sca_score} pts<br/>` : ""}
            <span style="color: ${color}; font-weight: 600;">${lot.export_ready ? "✅ Export Ready" : lot.eudr_dds_ready ? "⏳ EUDR Ready" : "⚠️ Gates Pending"}</span>
          </div>
        `);

        poly.on("click", () => navigate(`/lots/${lot.id}`));
        bounds.push(poly.getBounds());

      } else if (lot.gps_lat && lot.gps_lng) {
        const marker = L.circleMarker([lot.gps_lat, lot.gps_lng], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'DM Mono', monospace; font-size: 11px; min-width: 180px; color: ${T.color.ink};">
            <strong style="color: ${T.color.coffee}">${lot.lot_id}</strong><br/>
            <strong>${lot.name}</strong><br/>
            <span style="color: ${T.color.slate}">${lot.region} · ${lot.grade}</span><br/>
            <span style="color: ${T.color.slate}; font-size: 10px">GPS point only — no boundary</span>
          </div>
        `);

        marker.on("click", () => navigate(`/lots/${lot.id}`));
      }
    });

    if (bounds.length > 0) {
      const combined = bounds.reduce((acc, b) => acc.extend(b), bounds[0]);
      map.fitBounds(combined, { padding: [40, 40] });
    }

    return () => { map.remove(); leafletMap.current = null; };
  }, [data, isLoading]);

  const total     = data?.results.length ?? 0;
  const withBound = data?.results.filter(l => l.boundary).length ?? 0;
  const withGps   = data?.results.filter(l => !l.boundary && l.gps_lat).length ?? 0;
  const noBound   = total - withBound - withGps;

  return (
    <PageWrapper>
      <div style={{ padding: "clamp(16px, 4vw, 24px)" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={CS.pageTitle}>
            Lot Boundary Map
          </h1>
          <p style={CS.pageSubtitle}>
            GPS & boundary overview · All lots
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Total Lots",       val: total,     color: T.color.ink },
            { label: "With Boundary",    val: withBound, color: T.color.forest },
            { label: "GPS Point Only",   val: withGps,   color: T.color.gold },
            { label: "No Location",      val: noBound,   color: T.color.red },
          ].map(s => (
            <div key={s.label} style={{
              ...CS.card,
              padding: "10px 16px",
              flex: "1 1 120px",
            }}>
              <div style={{ fontFamily: T.font.mono, fontSize: "1.2rem", color: s.color, fontWeight: 600 }}>{s.val}</div>
              <div style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { color: T.color.forest, label: "Export Ready" },
            { color: T.color.gold, label: "EUDR Ready" },
            { color: T.color.red, label: "Gates Pending" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: l.color }} />
              <span style={{ fontFamily: T.font.mono, fontSize: "0.62rem", color: T.color.textMuted }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: T.color.gold, opacity: 0.7 }} />
            <span style={{ fontFamily: T.font.mono, fontSize: "0.62rem", color: T.color.textMuted }}>GPS Point Only</span>
          </div>
        </div>

        {isLoading && (
          <div style={{ fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint, padding: "48px", textAlign: "center" }}>
            Loading lot data...
          </div>
        )}

        {/* Map */}
        <div ref={mapRef} style={{
          height: "calc(100vh - 320px)", minHeight: "400px",
          borderRadius: T.radius.lg, border: `1px solid ${T.color.borderStrong}`,
          background: T.color.stone,
        }} />

        <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.textFaint, marginTop: "8px" }}>
          Click any lot to view details · Polygons shown where boundary captured · Circles where GPS point only
        </p>
      </div>
    </PageWrapper>
  );
}
