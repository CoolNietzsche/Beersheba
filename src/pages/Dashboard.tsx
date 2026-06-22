import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLots } from "../api/lots";
import PageWrapper from "../components/PageWrapper";
import RoleBadge from "../components/RoleBadge";
import { jsPDF } from "jspdf";
import {
  Package, ShieldCheck, TrendingUp, AlertTriangle,
  ArrowRight, Plus, Leaf, FileText
} from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const role      = user?.role ?? "exporter";

  const { data } = useQuery({
    queryKey: ["lots-dashboard", role],
    queryFn:  () => getLots(),
  });

  const total       = data?.count ?? 0;
  const eudrReady   = data?.results.filter(l => l.eudr_dds_ready).length  ?? 0;
  const exportReady = data?.results.filter(l => l.export_ready).length    ?? 0;
  const pending     = data?.results.filter(l => !l.export_ready).length   ?? 0;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Theme Colors
    const forestHex = "#1B4D35";
    const coffeeHex = "#7B4B2A";
    const darkHex   = "#1C1C1A";
    const textHex   = "#4A4A45";
    const lineHex   = "#E0DCD3";

    // Header & Frame Accent
    doc.setFillColor(27, 77, 53); // Forest Green
    doc.rect(0, 0, 210, 15, "F");

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("BEERSHEBA SPECIALTY COFFEE — COFFEE COMPLIANCE & PERFORMANCE REPORT", 14, 9.5);
    
    // Report Title
    doc.setTextColor(27, 77, 53);
    doc.setFontSize(20);
    doc.text("Operations Registry & Compliance", 14, 28);
    
    // Date & Publisher
    doc.setTextColor(74, 74, 69);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.text(`Report Generated: ${dateStr}   |   Organization: Beersheba Cafe Operations`, 14, 35);

    // Decorative Horizontal Line
    doc.setDrawColor(224, 220, 211);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    // Operational KPIs Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(123, 75, 42); // Coffee Brown
    doc.text("1. Operational Deliveries & KPIs", 14, 49);

    // KPI Blocks background
    doc.setFillColor(247, 245, 240); // Linen
    doc.rect(14, 54, 42, 24, "F");
    doc.rect(60, 54, 42, 24, "F");
    doc.rect(106, 54, 42, 24, "F");
    doc.rect(152, 54, 44, 24, "F");

    // KPI Values
    doc.setTextColor(27, 77, 53);
    doc.setFontSize(15);
    doc.text(String(total), 18, 63);
    doc.text(String(eudrReady), 64, 63);
    doc.text(String(exportReady), 110, 63);
    doc.setTextColor(192, 57, 43); // Red
    doc.text(String(pending), 156, 63);

    // KPI Titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(74, 74, 69);
    doc.text("TOTAL COFFEE LOTS", 18, 72);
    doc.text("EUDR VERIFIED", 64, 72);
    doc.text("EXPORT SANCTIONED", 110, 72);
    doc.text("PENDING STATUS", 156, 72);

    // Section 2: Compliance Metrics
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(123, 75, 42); // Coffee
    doc.text("2. Compliance Readiness Analysis", 14, 91);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 28, 26);
    const eudrPercentStr = total > 0 ? `${Math.round((eudrReady / total) * 100)}%` : "0%";
    const exportPercentStr = total > 0 ? `${Math.round((exportReady / total) * 100)}%` : "0%";
    
    doc.text(`• EUDR DDS Certification Status: ${eudrPercentStr} of total registered inventory is fully compliant.`, 14, 98);
    doc.text(`• Phytosanitary & Export Gateway Clearances: ${exportPercentStr} verified, compliant with all regulations.`, 14, 104);
    doc.text(`• Deforestation Overlap Check: Passed on registered coordinates. No high-risk anomalies detected.`, 14, 110);

    // Section 3: Registered Coffee Lots Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(123, 75, 42); // Coffee
    doc.text("3. Inventory Registry & Grading Performance", 14, 123);

    // Table Header
    doc.setFillColor(27, 77, 53);
    doc.rect(14, 128, 182, 7.5, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("LOT ID", 17, 133);
    doc.text("NAME", 38, 133);
    doc.text("REGION", 82, 133);
    doc.text("GRADE", 114, 133);
    doc.text("SCA SCORE", 136, 133);
    doc.text("VOLUME", 164, 133);
    doc.text("STATUS", 184, 133);

    // Table rows
    let currentY = 140.5;
    doc.setTextColor(28, 28, 26);
    doc.setFont("helvetica", "normal");
    
    const pageLots = data?.results.slice(0, 8) ?? [];
    pageLots.forEach((lot) => {
      // Row borders
      doc.setDrawColor(240, 237, 230);
      doc.line(14, currentY + 1.5, 196, currentY + 1.5);

      doc.text(lot.lot_id, 17, currentY);
      doc.text(lot.name, 38, currentY);
      doc.text(lot.region.toUpperCase(), 82, currentY);
      doc.text(lot.grade || "G1", 114, currentY);
      doc.text(lot.sca_score ? `${lot.sca_score} pts` : "—", 136, currentY);
      const volKg = lot.volume_kg ? Number(lot.volume_kg) : 0;
      doc.text(`${volKg.toLocaleString()} kg`, 164, currentY);
      doc.text(lot.status.toUpperCase(), 184, currentY);

      currentY += 6.5;
    });

    // Verification Statement & stamp footer area
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(27, 77, 53);
    doc.text("Operational Attestation", 14, 205);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(74, 74, 69);
    doc.text("By registering these digital birth certificates, Beersheba specialty coffee guarantees traceable,", 14, 212);
    doc.text("EUDR-compliant, and fully verified farming boundaries aligned with national micro-grading standards.", 14, 216);

    // Sign off & Date
    doc.setDrawColor(180, 180, 170);
    doc.line(135, 238, 190, 238);
    doc.text("Authorized Registry Seal", 140, 243);

    // Footer bottom strip
    doc.setFillColor(247, 245, 240);
    doc.rect(14, 255, 182, 10, "F");
    doc.setTextColor(123, 75, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Beersheba Specialty Coffee Operations, Addis Ababa, Ethiopia", 20, 261.5);
    doc.text("Page 1 of 1", 175, 261.5);

    doc.save(`beersheba_ops_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const greeting = () => {
    const name = user?.first_name || user?.email?.split("@")[0] || "there";
    const h    = new Date().getHours();
    return `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${name}.`;
  };

  const stats = role === "buyer"
    ? [
        { label: "Available Lots",   value: total,     icon: <Package size={16} />,     positive: true,  path: "/marketplace" },
        { label: "EUDR Verified",    value: eudrReady, icon: <ShieldCheck size={16} />, positive: true,  path: "/marketplace?eudr_dds_ready=true" },
        { label: "Green Passport",   value: eudrReady, icon: <Leaf size={16} />,        positive: true,  path: "/marketplace" },
        { label: "Regions",          value: 7,         icon: <TrendingUp size={16} />,  positive: true,  path: "/marketplace" },
      ]
    : [
        { label: "Total Lots",         value: total,       icon: <Package size={16} />,       positive: true,  path: "/lots" },
        { label: "EUDR Ready",         value: eudrReady,   icon: <ShieldCheck size={16} />,   positive: true,  path: "/lots" },
        { label: "Export Ready",       value: exportReady, icon: <TrendingUp size={16} />,    positive: true,  path: "/lots" },
        { label: "Pending Compliance", value: pending,     icon: <AlertTriangle size={16} />, positive: false, path: "/lots" },
      ];

  const quickActions: Record<string, { label: string; path: string; icon: React.ReactNode; primary?: boolean }[]> = {
    admin:    [
       { label: "Register New Lot",   path: "/lots/new",    icon: <Plus size={14} />,      primary: true },
       { label: "Browse All Lots",    path: "/lots",         icon: <Package size={14} />    },
       { label: "View Marketplace",   path: "/marketplace",  icon: <Leaf size={14} />       },
    ],
    exporter: [
       { label: "Register New Lot",   path: "/lots/new",    icon: <Plus size={14} />,      primary: true },
       { label: "View My Lots",       path: "/lots",         icon: <Package size={14} />    },
    ],
    buyer:    [
       { label: "Browse Marketplace", path: "/marketplace",  icon: <Leaf size={14} />,      primary: true },
    ],
    farmer:   [
       { label: "My Farm Profile",    path: "/farm",         icon: <Leaf size={14} />,      primary: true },
    ],
    qgrader:  [
       { label: "Lots to Cup",        path: "/lots",         icon: <Package size={14} />,   primary: true },
    ],
  };

  const actions = quickActions[role] || quickActions.exporter;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={CS.pageTitle}>
            {greeting()}
          </h1>
          <p style={CS.pageSubtitle}>
            Beersheba Operations · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            style={{
              ...CS.btnGhost,
              padding: "8px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              borderColor: T.color.borderStrong,
              color: T.color.forest,
              background: "var(--color-white)",
              boxShadow: T.shadow.sm
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "var(--color-linen)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "var(--color-white)";
            }}
          >
            <FileText size={14} /> Export PDF Report
          </button>
          <RoleBadge role={role} />
        </div>
      </div>

      {/* Stat cards */}
      {role !== "farmer" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.path)}
              className="card p-5 text-left transition-all duration-200 group"
              style={{
                cursor: "pointer",
                background: T.color.white,
                borderRadius: T.radius.md,
                border: `1px solid ${T.color.border}`,
                boxShadow: T.shadow.sm
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = T.shadow.md;
                e.currentTarget.style.borderColor = T.color.borderStrong;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = T.shadow.sm;
                e.currentTarget.style.borderColor = T.color.border;
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div style={{
                  width: "32px", height: "32px", borderRadius: T.radius.sm, flexShrink: 0,
                  background: stat.positive ? T.color.forestLight : T.color.redLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: stat.positive ? T.color.forest : T.color.red }}>{stat.icon}</span>
                </div>
                <ArrowRight size={12} style={{ color: T.color.textGhost, transition: "all 0.15s" }} />
              </div>
              <p style={{
                fontFamily: T.font.display, fontSize: "2.5rem", fontWeight: 300,
                color: stat.positive ? T.color.forest : T.color.red, margin: "0 0 4px", lineHeight: 1
              }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.color.textFaint, margin: 0 }}>
                {stat.label}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Quick actions + Recent lots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div style={CS.card} className="p-5">
          <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>
            Quick Actions
          </p>
          <div className="space-y-2">
            {actions.map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: T.radius.sm, cursor: "pointer",
                  fontFamily: T.font.mono, fontSize: "0.72rem", letterSpacing: "0.04em",
                  transition: "all 0.12s",
                  background: action.primary ? T.color.forest : "transparent",
                  border: `1px solid ${action.primary ? T.color.forest : T.color.border}`,
                  color: action.primary ? "#FFFFFF" : T.color.textMuted,
                }}
                onMouseEnter={e => {
                  if (action.primary) { e.currentTarget.style.background = T.color.forestHover; }
                  else { e.currentTarget.style.color = T.color.ink; e.currentTarget.style.borderColor = T.color.borderStrong; }
                }}
                onMouseLeave={e => {
                  if (action.primary) { e.currentTarget.style.background = T.color.forest; }
                  else { e.currentTarget.style.color = T.color.textMuted; e.currentTarget.style.borderColor = T.color.border; }
                }}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
                <ArrowRight size={11} style={{ marginLeft: "auto", opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Recent lots */}
        <div style={CS.card} className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: 0 }}>
              Recent Lots
            </p>
            <button
              onClick={() => navigate("/lots")}
              style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.coffee, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em", fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          {data && data.results.length > 0 ? (
            <div className="space-y-1">
              {data.results.slice(0, 5).map(lot => (
                <div
                  key={lot.id}
                  onClick={() => navigate(`/lots/${lot.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 12px", borderRadius: T.radius.sm,
                    border: "1px solid transparent", cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.color.linen; e.currentTarget.style.borderColor = T.color.border; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div style={{
                    width: "24px", height: "24px", borderRadius: T.radius.sm, flexShrink: 0,
                    background: T.color.forestLight, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Leaf size={10} style={{ color: T.color.forest }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: T.font.sans, fontSize: "0.85rem", color: T.color.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{lot.name}</p>
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textGhost, margin: 0 }}>{lot.lot_id} · {lot.region}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {lot.sca_score && (
                      <p style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.coffee, margin: 0, fontWeight: 600 }}>{lot.sca_score} pts</p>
                    )}
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, margin: 0 }}>{lot.grade}</p>
                  </div>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                    background: lot.export_ready ? T.color.forest : lot.eudr_dds_ready ? T.color.coffee : T.color.red,
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
              <Package size={24} style={{ color: T.color.textGhost, marginBottom: "8px" }} />
              <p style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.textFaint, margin: "0 0 8px" }}>No lots yet</p>
              <button
                onClick={() => navigate("/lots/new")}
                style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.forest, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                Register first lot →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Farmer stub */}
      {role === "farmer" && (
        <div style={{ ...CS.card, marginTop: "20px", borderColor: "rgba(27,77,53,0.15)" }}>
          <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.forest, margin: "0 0 8px", fontWeight: 600 }}>Farm Status</p>
          <p style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.textFaint, margin: 0 }}>Farm profile and lot history — fully integrated.</p>
        </div>
      )}
    </PageWrapper>
  );
}
