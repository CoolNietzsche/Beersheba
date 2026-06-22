import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLots, updateLot } from "../api/lots";
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

  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lots", params],
    queryFn:  () => getLots(params),
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.results.map(lot => lot.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.length === 0) return;
    setUpdating(true);
    try {
      await Promise.all(
        selectedIds.map(id => updateLot(id, { status }))
      );
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      showFeedback(`Successfully updated ${selectedIds.length} lots to status: ${status.toUpperCase()}.`);
      setSelectedIds([]);
    } catch (err: any) {
      showFeedback("Error performing bulk status update: " + (err.message || err));
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0 || !data) return;
    const selectedLots = data.results.filter(lot => selectedIds.includes(lot.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedLots, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `beersheba_lots_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showFeedback(`Exported ${selectedLots.length} records successfully.`);
  };

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

      {/* Feedback banner */}
      {feedback && (
        <div style={{
          background: "var(--color-forest-light)",
          border: `1px solid var(--color-forest)`,
          borderRadius: T.radius.md,
          padding: "10px 16px",
          marginBottom: "16px",
          color: "var(--color-forest)",
          fontFamily: T.font.sans,
          fontSize: "0.8125rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: T.shadow.sm
        }}>
          <span>{feedback}</span>
          <button 
            onClick={() => setFeedback(null)} 
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1.25rem", fontWeight: "bold", padding: "0 4px" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Bulk actions bar */}
      {data && data.results.length > 0 && selectedIds.length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--color-stone)",
          border: `1px solid var(--color-forest)`,
          borderRadius: T.radius.md,
          padding: "12px 16px",
          marginBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
          boxShadow: T.shadow.md
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: T.font.mono, fontSize: "0.75rem", color: "var(--color-forest)", fontWeight: 600 }}>
              {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.font.sans, fontSize: "0.75rem", color: T.color.textMuted }}>Bulk Actions:</span>
            
            <button
              onClick={handleBulkExport}
              style={{
                ...CS.btnGhost,
                padding: "6px 12px",
                fontSize: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Export Selected
            </button>

            {isExporter && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <select
                  disabled={updating}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  style={{
                    ...CS.input,
                    width: "auto",
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    height: "32px",
                    background: "var(--color-white)",
                    color: "var(--color-ink)",
                    borderColor: "var(--color-border-strong)"
                  }}
                >
                  <option value="">Update Status...</option>
                  <option value="draft">Mark as Draft</option>
                  <option value="listed">Mark as Listed</option>
                  <option value="contracted">Mark as Contracted</option>
                  <option value="exported">Mark as Exported</option>
                </select>
              </div>
            )}

            <button
              onClick={() => setSelectedIds([])}
              style={{
                ...CS.btnGhost,
                padding: "6px 12px",
                fontSize: "0.75rem",
                color: "var(--color-red)",
                borderColor: "transparent"
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {data && data.results.length > 0 && (
        <div style={CS.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.color.border}` }}>
                  <th style={{ padding: "12px 16px", width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={data.results.length > 0 && selectedIds.length === data.results.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                      style={{ cursor: "pointer", width: "14px", height: "14px", accentColor: "var(--color-forest)" }}
                    />
                  </th>
                  {["Lot ID","Name","Region","Grade","SCA","Volume","Status","EUDR","Export"].map(h => (
                    <th key={h} style={{
                      fontFamily: T.font.mono, fontSize: "0.55rem",
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      color: T.color.textMuted, padding: "12px 14px",
                      textAlign: "left", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.results.map((lot, i) => {
                  const isSelected = selectedIds.includes(lot.id);
                  return (
                    <tr key={lot.id}
                      style={{
                        borderBottom: i < data.results.length - 1 ? `1px solid ${T.color.border}` : "none",
                        cursor: "pointer", transition: "background 0.12s",
                        background: isSelected ? "var(--color-forest-light)" : "transparent"
                      }}
                      onMouseEnter={e => {
                        if (!selectedIds.includes(lot.id)) {
                          e.currentTarget.style.background = T.color.linen;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!selectedIds.includes(lot.id)) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <td 
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: "13px 16px", width: "40px", textAlign: "center" }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(lot.id, e.target.checked)}
                          style={{ cursor: "pointer", width: "14px", height: "14px", accentColor: "var(--color-forest)" }}
                        />
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.coffee, whiteSpace: "nowrap", fontWeight: 500 }}>
                        {lot.lot_id}
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", fontFamily: T.font.sans, fontSize: "0.875rem", color: T.color.ink, whiteSpace: "nowrap" }}>
                        {lot.name}
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.slate, whiteSpace: "nowrap", textTransform: "capitalize" }}>
                        {lot.region}
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.slate, whiteSpace: "nowrap" }}>
                        {lot.grade}
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", fontFamily: T.font.mono, fontSize: "0.72rem", color: lot.sca_score && lot.sca_score >= 85 ? T.color.forest : T.color.slate, whiteSpace: "nowrap", fontWeight: lot.sca_score && lot.sca_score >= 85 ? 600 : 400 }}>
                        {lot.sca_score ? `${lot.sca_score}` : "—"}
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.slate, whiteSpace: "nowrap" }}>
                        {lot.volume_kg.toLocaleString()} kg
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <StatusPill status={lot.status} />
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {lot.eudr_dds_ready
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", ...CS.badge.base, ...CS.badge.eudr }}><ShieldCheck size={11} /> Ready</span>
                          : <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textGhost }}>—</span>
                        }
                      </td>
                      <td onClick={() => navigate(`/lots/${lot.id}`)} style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {lot.export_ready
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", ...CS.badge.base, ...CS.badge.eudr }}><TrendingUp size={11} /> Ready</span>
                          : <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textGhost }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
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
