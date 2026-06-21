import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLots } from "../api/lots";
import PageWrapper from "../components/PageWrapper";
import RoleBadge from "../components/RoleBadge";
import {
  Package, ShieldCheck, TrendingUp, AlertTriangle,
  ArrowRight, Plus, Leaf
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
        <RoleBadge role={role} />
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
