import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLots } from "../api/lots";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/PageWrapper";
import StatusPill from "../components/StatusPill";
import { Plus, Search, SlidersHorizontal, ShieldCheck, TrendingUp, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

const REGIONS = ["","yirgacheffe","sidama","guji","jimma","harrar","limu","nekemte"];
const GRADES  = ["","G1","G2","G3"];
const STATUS  = ["","draft","listed","contracted","exported"];

export default function Lots() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isExporter = user?.role === "exporter" || user?.role === "admin";
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch]   = useState("");
  const params = { ...filters, ...(search ? { search } : {}) };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lots", params],
    queryFn:  () => getLots(params),
  });

  const setFilter = (key: string, val: string) =>
    setFilters(f => val
      ? { ...f, [key]: val }
      : Object.fromEntries(Object.entries(f).filter(([k]) => k !== key))
    );

  const selStyle = {
    ...CS.input,
    padding: "6px 12px",
    flex: "1 1 130px",
    width: "auto",
    fontSize: "0.8125rem",
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h1 style={CS.pageTitle}>Coffee Lots</h1>
          <p style={CS.pageSubtitle}>Digital Birth Certificate Registry</p>
        </div>
        {isExporter && (
          <button onClick={() => navigate("/lots/new")} style={CS.btnPrimary}>
            <Plus size={14} /> New Lot
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: T.color.white,
          border: `1px solid ${T.color.borderStrong}`,
          borderRadius: T.radius.md, padding: "6px 12px",
          flex: "2 1 200px",
        }}>
          <Search size={13} color={T.color.textMuted} />
          <input
            style={{ background: "transparent", border: "none", outline: "none", color: T.color.ink, fontFamily: T.font.sans, fontSize: "0.8125rem", width: "100%" }}
            placeholder="Search lot ID, name, region..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={selStyle} onChange={e => setFilter("region", e.target.value)}>
          <option value="">All Regions</option>
          {REGIONS.filter(Boolean).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select style={selStyle} onChange={e => setFilter("grade", e.target.value)}>
          <option value="">All Grades</option>
          {GRADES.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select style={selStyle} onChange={e => setFilter("status", e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS.filter(Boolean).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select style={selStyle} onChange={e => setFilter("eudr_dds_ready", e.target.value)}>
          <option value="">EUDR — All</option>
          <option value="true">EUDR Ready</option>
          <option value="false">Not Ready</option>
        </select>
      </div>

      {/* Count */}
      {data && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <SlidersHorizontal size={12} color={T.color.textFaint} />
          <span style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.textMuted, letterSpacing: "0.08em" }}>
            {data.count} lot{data.count !== 1 ? "s" : ""} found
          </span>
        </div>
      )}

      {/* States */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "64px", fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
          Loading lots...
        </div>
      )}
      {isError && (
        <div style={{ ...CS.errorBanner, justifyContent: "center", padding: "32px", margin: "24px 0" }}>
          Failed to load lots. Check API connection.
        </div>
      )}
      {data && data.results.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px", ...CS.card }}>
          <Package size={32} color={T.color.textGhost} style={{ marginBottom: "12px", margin: "0 auto 12px" }} />
          <p style={{ fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
            No lots found.
          </p>
          {isExporter && (
            <button onClick={() => navigate("/lots/new")} style={{
              marginTop: "12px", background: "none", border: "none",
              fontFamily: T.font.mono, fontSize: "0.65rem",
              color: T.color.coffee, cursor: "pointer", letterSpacing: "0.08em",
            }}>
              Register your first lot →
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {data && data.results.length > 0 && (
        <div style={CS.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.color.border}` }}>
                  {["Lot ID","Name","Region","Grade","SCA","Volume","Status","EUDR","Export"].map(h => (
                    <th key={h} style={{
                      fontFamily: T.font.mono, fontSize: "0.55rem",
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      color: T.color.textMuted, padding: "12px 16px",
                      textAlign: "left", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.results.map((lot, i) => (
                  <tr key={lot.id}
                    onClick={() => navigate(`/lots/${lot.id}`)}
                    style={{
                      borderBottom: i < data.results.length - 1 ? `1px solid ${T.color.border}` : "none",
                      cursor: "pointer", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.color.linen)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 16px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.coffee, whiteSpace: "nowrap", fontWeight: 500 }}>
                      {lot.lot_id}
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: T.font.sans, fontSize: "0.875rem", color: T.color.ink, whiteSpace: "nowrap" }}>
                      {lot.name}
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.slate, whiteSpace: "nowrap", textTransform: "capitalize" }}>
                      {lot.region}
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.slate, whiteSpace: "nowrap" }}>
                      {lot.grade}
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: T.font.mono, fontSize: "0.72rem", color: lot.sca_score && lot.sca_score >= 85 ? T.color.forest : T.color.slate, whiteSpace: "nowrap", fontWeight: lot.sca_score && lot.sca_score >= 85 ? 600 : 400 }}>
                      {lot.sca_score ? `${lot.sca_score}` : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.slate, whiteSpace: "nowrap" }}>
                      {lot.volume_kg.toLocaleString()} kg
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <StatusPill status={lot.status} />
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {lot.eudr_dds_ready
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", ...CS.badge.base, ...CS.badge.eudr }}><ShieldCheck size={11} /> Ready</span>
                        : <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textGhost }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {lot.export_ready
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", ...CS.badge.base, ...CS.badge.eudr }}><TrendingUp size={11} /> Ready</span>
                        : <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textGhost }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(data.next || data.previous) && (
            <div style={{
              padding: "12px 16px", borderTop: `1px solid ${T.color.border}`,
              display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center",
            }}>
              {data.previous && (
                <button onClick={() => setFilter("page", String((parseInt(filters.page || "1") - 1)))} style={CS.btnGhost}>
                  <ChevronLeft size={12} /> Previous
                </button>
              )}
              {data.next && (
                <button onClick={() => setFilter("page", String((parseInt(filters.page || "1") + 1)))} style={CS.btnPrimary}>
                  Next <ChevronRight size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
