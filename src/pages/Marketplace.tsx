import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLots } from "../api/lots";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../hooks/useWatchlist";
import PageWrapper from "../components/PageWrapper";
import {
  Search, ShieldCheck, Leaf, Mountain, Package,
  FlaskConical, TrendingUp, Award, Filter, X, Heart
} from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

const REGIONS    = ["yirgacheffe","sidama","guji","jimma","harrar","limu","nekemte"];
const GRADES     = ["G1","G2","G3"];
const PROCESSING = ["washed","natural","honey","anaerobic"];

const PROCESS_COLOR: Record<string, string> = {
  washed:    T.color.forest,
  natural:   T.color.coffee,
  honey:     T.color.gold,
  anaerobic: "#5B4B8A",
  other:     T.color.textMuted,
};

function ScaBadge({ score }: { score: number | null }) {
  if (!score) return null;
  const color = score >= 85 ? T.color.coffee  : score >= 80 ? T.color.forest : T.color.textFaint;
  const bg    = score >= 85 ? T.color.linen  : score >= 80 ? T.color.forestLight : T.color.stone;
  const label = score >= 90 ? "OUTSTANDING" : score >= 85 ? "EXCELLENT" : score >= 80 ? "VERY GOOD" : "GOOD";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", background: bg, borderRadius: T.radius.sm, padding: "6px 10px" }}>
      <span style={{ fontFamily: T.font.display, fontSize: "1.9rem", fontWeight: 300, color, lineHeight: 1 }}>
        {score.toFixed(1)}
      </span>
      <span style={{ fontFamily: T.font.mono, fontSize: "0.48rem", letterSpacing: "0.12em", color, opacity: 0.8 }}>
        {label}
      </span>
    </div>
  );
}

function FlavorTag({ tag }: { tag: string }) {
  return (
    <span style={{
      padding: "2px 8px",
      background: T.color.linen,
      border: `1px solid ${T.color.border}`,
      borderRadius: "20px",
      fontFamily: T.font.sans,
      fontSize: "0.62rem",
      color: T.color.textMuted,
      whiteSpace: "nowrap",
    }}>
      {tag}
    </span>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({ status: "listed" });
  const [search, setSearch]   = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const params = { ...filters, ...(search ? { search } : {}) };
  const { data, isLoading } = useQuery({
    queryKey: ["marketplace", params],
    queryFn:  () => getLots(params),
  });

  const setFilter = (k: string, v: string) =>
    setFilters(f => v
      ? { ...f, [k]: v }
      : Object.fromEntries(Object.entries(f).filter(([key]) => key !== k))
    );

  const isBuyer = user?.role === "buyer" || user?.role === "admin";
  const { toggle, isWatched } = useWatchlist();

  const activeFilterCount = Object.keys(filters).filter(k => k !== "status").length;

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={CS.pageTitle}>Specialty Lot Marketplace</h1>
          <p style={CS.pageSubtitle}>
            EUDR-Verified Ethiopian Coffee · Direct from Origin
          </p>
        </div>
        {data && (
          <div style={{ fontFamily: T.font.mono, fontSize: "0.65rem", color: T.color.textFaint, paddingTop: "6px" }}>
            {data.count} lot{data.count !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: T.color.white,
          border: `1px solid ${T.color.border}`,
          borderRadius: T.radius.sm, padding: "8px 12px",
          flex: "2 1 220px",
        }}>
          <Search size={13} color={T.color.textGhost} />
          <input
            style={{ background: "transparent", border: "none", outline: "none", color: T.color.ink, fontFamily: T.font.sans, fontSize: "0.8125rem", width: "100%" }}
            placeholder="Search lot name, origin, lot ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <X size={12} color={T.color.textGhost} style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: showFilters ? T.color.forestLight : T.color.white,
            border: showFilters ? `1px solid ${T.color.forest}` : `1px solid ${T.color.border}`,
            borderRadius: T.radius.sm, padding: "8px 14px",
            color: showFilters ? T.color.forest : T.color.textMuted,
            fontFamily: T.font.sans, fontSize: "0.8125rem",
            cursor: "pointer",
          }}
        >
          <Filter size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ background: T.color.forest, color: "white", borderRadius: "10px", padding: "1px 6px", fontSize: "0.6rem", fontFamily: T.font.mono }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap",
          marginBottom: "16px", padding: "14px",
          background: T.color.white,
          border: `1px solid ${T.color.border}`,
          borderRadius: T.radius.md,
          boxShadow: T.shadow.sm,
        }}>
          <select style={CS.input} onChange={e => setFilter("region", e.target.value)}>
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select style={CS.input} onChange={e => setFilter("grade", e.target.value)}>
            <option value="">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select style={CS.input} onChange={e => setFilter("processing", e.target.value)}>
            <option value="">All Processing</option>
            {PROCESSING.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select style={CS.input} onChange={e => setFilter("lot_type", e.target.value)}>
            <option value="">Spot + Forward</option>
            <option value="spot">Spot Only</option>
            <option value="forward">Forward Only</option>
            <option value="reserve">Reserve</option>
          </select>
          <select style={CS.input} onChange={e => setFilter("eudr_dds_ready", e.target.value)}>
            <option value="">All Compliance</option>
            <option value="true">EUDR Ready Only</option>
          </select>
          <select style={CS.input} onChange={e => setFilter("is_organic", e.target.value)}>
            <option value="">All Certifications</option>
            <option value="true">Organic Only</option>
          </select>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", padding: "64px", fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
          Loading marketplace...
        </div>
      )}

      {data && data.results.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px" }}>
          <Package size={32} color={T.color.textGhost} style={{ marginBottom: "12px", margin: "0 auto 12px" }} />
          <p style={{ fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
            No lots available matching your filters.
          </p>
        </div>
      )}

      {/* Card grid */}
      {data && data.results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: "16px" }}>
          {data.results.map(lot => (
            <div
              key={lot.id}
              style={{
                background: T.color.white,
                border: `1px solid ${T.color.border}`,
                borderRadius: T.radius.md,
                boxShadow: T.shadow.sm,
                display: "flex", flexDirection: "column",
                transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = T.color.borderStrong;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = T.shadow.md;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = T.color.border;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = T.shadow.sm;
              }}
              onClick={() => navigate(`/marketplace/${lot.id}`)}
            >
              {/* Card header strip */}
              <div style={{
                padding: "16px 18px 14px",
                borderBottom: `1px solid ${T.color.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.55rem", letterSpacing: "0.15em", color: T.color.gold, textTransform: "uppercase", margin: "0 0 3px", fontWeight: 650 }}>
                      {lot.lot_id}
                    </p>
                    <p style={{ fontFamily: T.font.display, fontSize: "1.15rem", fontWeight: 500, color: T.color.ink, margin: 0, lineHeight: 1.2 }}>
                      {lot.name}
                    </p>
                  </div>
                  <ScaBadge score={lot.latest_sca_score ?? (lot.sca_score ? parseFloat(lot.sca_score as unknown as string) : null)} />
                </div>

                {/* Origin meta */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, textTransform: "capitalize" }}>
                    <Mountain size={9} /> {lot.region} · {lot.altitude_m}m
                  </span>
                  <span style={{
                    fontFamily: T.font.mono, fontSize: "0.55rem",
                    color: PROCESS_COLOR[lot.processing] || T.color.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}>
                    {lot.processing}
                  </span>
                  <span style={{ fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.textFaint, fontWeight: 500 }}>
                    {lot.grade}
                  </span>
                  {lot.lot_type === "forward" && (
                    <span style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.coffee, letterSpacing: "0.08em", fontWeight: 600 }}>
                      FORWARD
                    </span>
                  )}
                </div>
              </div>

              {/* Flavor tags */}
              {lot.flavor_tags && lot.flavor_tags.length > 0 && (
                <div style={{ padding: "10px 18px", display: "flex", gap: "5px", flexWrap: "wrap", borderBottom: `1px solid ${T.color.border}` }}>
                  {lot.flavor_tags.slice(0, 4).map(tag => <span key={tag}><FlavorTag tag={tag} /></span>)}
                </div>
              )}

              {/* Tasting notes */}
              {lot.tasting_notes && (
                <div style={{ padding: "10px 18px 0", borderBottom: `1px solid ${T.color.border}` }}>
                  <p style={{
                    fontFamily: T.font.sans, fontSize: "0.73rem",
                    color: T.color.textMuted, lineHeight: 1.55,
                    margin: "0 0 10px", fontStyle: "italic",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {lot.tasting_notes}
                  </p>
                </div>
              )}

              {/* Pricing + availability */}
              <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.color.border}` }}>
                <div>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textGhost, margin: "0 0 2px", letterSpacing: "0.08em" }}>
                    FOB PRICE / KG
                  </p>
                  <p style={{ fontFamily: T.font.display, fontSize: "1.4rem", fontWeight: 500, color: T.color.gold, margin: 0, lineHeight: 1 }}>
                    {lot.fob_price_usd ? `$${parseFloat(lot.fob_price_usd).toFixed(2)}` : "Price on Request"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textGhost, margin: "0 0 2px", letterSpacing: "0.08em" }}>
                    AVAILABLE
                  </p>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.78rem", color: T.color.ink, margin: 0, fontWeight: 600 }}>
                    {lot.available_qty_kg ? `${parseFloat(lot.available_qty_kg).toLocaleString()} kg` : `${lot.volume_kg} kg`}
                  </p>
                  {lot.delivery_window && (
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textGhost, margin: "2px 0 0" }}>
                      {lot.delivery_window}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges + exporter */}
              <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {lot.is_eudr_ready && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", padding: "3px 7px", background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.forest, fontWeight: 700 }}>
                      <ShieldCheck size={8} /> EUDR
                    </span>
                  )}
                  {lot.green_passport_ready && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", padding: "3px 7px", background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.forest, fontWeight: 700 }}>
                      <Leaf size={8} /> Passport
                    </span>
                  )}
                  {lot.is_organic && (
                    <span style={{ padding: "3px 7px", background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.forest, fontWeight: 700 }}>
                      Organic
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", padding: "3px 7px", background: T.color.linen, border: `1px solid ${T.color.border}`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textMuted, fontWeight: 600 }}>
                    <Award size={8} /> {lot.compliance_score ?? 0}/7 Gates
                  </span>
                </div>
                <span style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textGhost, maxWidth: "80px", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span
                    onClick={e => { e.stopPropagation(); if(lot.exporter) navigate(`/exporters/${lot.exporter}`); }}
                    style={{ cursor: lot.exporter ? "pointer" : "default" }}
                  >{lot.exporter_company || lot.exporter_name}</span>
                </span>
              </div>

              {/* CTA buttons */}
              <div style={{ padding: "0 18px 16px", display: "flex", gap: "8px" }} onClick={e => e.stopPropagation()}>
                {isBuyer && (
                  <button
                    onClick={() => toggle(lot.id)}
                    title={isWatched(lot.id) ? "Remove from watchlist" : "Add to watchlist"}
                    style={{ background: "transparent", border: `1px solid ${isWatched(lot.id) ? T.color.errorBorder : T.color.border}`, borderRadius: T.radius.sm, padding: "9px 10px", color: isWatched(lot.id) ? T.color.red : T.color.textGhost, cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <Heart size={13} fill={isWatched(lot.id) ? T.color.red : "none"} />
                  </button>
                )}
                <button
                  onClick={() => navigate(`/marketplace/${lot.id}`)}
                  style={{ flex: 1, ...CS.btnGhost, padding: "9px" }}
                >
                  View Lot
                </button>
                {isBuyer && (
                  <button
                    onClick={() => navigate(`/marketplace/${lot.id}?offer=1`)}
                    style={{ flex: 1, ...CS.btnPrimary, background: T.color.forest, padding: "9px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.color.forestHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.color.forest; }}
                  >
                    <TrendingUp size={13} /> Make Offer
                  </button>
                )}
                {isBuyer && (
                  <button
                    onClick={() => navigate(`/marketplace/${lot.id}?sample=1`)}
                    style={{ background: "transparent", border: `1px solid ${T.color.forest}`, borderRadius: T.radius.sm, padding: "9px 12px", color: T.color.forest, fontFamily: T.font.sans, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.12s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.color.forestLight; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <FlaskConical size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
