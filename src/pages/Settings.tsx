import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMe } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import EctaDocuments from "../components/EctaDocuments";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const [showLogout, setShowLogout] = useState(false);

  const cardStyle = CS.card;
  const labelStyle = CS.label;
  const valueStyle = {
    fontFamily: T.font.sans,
    fontSize: "0.88rem",
    color: T.color.ink,
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <p style={{
        fontFamily: T.font.display,
        fontSize: "1.7rem", fontWeight: 500,
        color: T.color.ink, margin: "0 0 6px",
      }}>
        Account Settings
      </p>
      <p style={{
        fontFamily: T.font.mono, fontSize: "0.62rem",
        letterSpacing: "0.1em", color: T.color.textFaint,
        textTransform: "uppercase", margin: "0 0 28px",
      }}>
        {me?.role?.toUpperCase()} · {me?.company_name || me?.email}
      </p>

      {/* Profile info */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <p style={{
          fontFamily: T.font.mono, fontSize: "0.58rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: T.color.textFaint, margin: "0 0 16px",
        }}>
          Profile
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <span style={labelStyle}>Name</span>
            <span style={valueStyle}>
              {me?.first_name ? `${me.first_name} ${me.last_name || ""}`.trim() : "—"}
            </span>
          </div>
          <div>
            <span style={labelStyle}>Email</span>
            <span style={valueStyle}>{me?.email}</span>
          </div>
          <div>
            <span style={labelStyle}>Role</span>
            <span style={valueStyle}>{me?.role}</span>
          </div>
          <div>
            <span style={labelStyle}>Company</span>
            <span style={valueStyle}>{me?.company_name || "—"}</span>
          </div>
          <div>
            <span style={labelStyle}>Verified</span>
            <span style={{
              ...valueStyle,
              color: me?.is_verified ? T.color.forest : T.color.red,
              fontWeight: 500,
            }}>
              {me?.is_verified ? "Verified" : "Not verified"}
            </span>
          </div>
        </div>
      </div>

      {/* ECTA license — exporters only */}
      {(user?.role === "exporter" || user?.role === "admin") && (
        <EctaDocuments />
      )}

      {/* Danger zone */}
      <div style={{
        ...cardStyle,
        borderColor: "rgba(192,57,43,0.25)",
        marginTop: "16px",
      }}>
        <p style={{
          fontFamily: T.font.mono, fontSize: "0.58rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: T.color.red, margin: "0 0 14px",
        }}>
          Session
        </p>
        {!showLogout ? (
          <button onClick={() => setShowLogout(true)} style={CS.btnDanger}>
            SIGN OUT
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: T.font.sans,
              fontSize: "0.82rem", color: T.color.textMuted,
            }}>
              Sign out of Beersheba?
            </span>
            <button onClick={logout} style={CS.btnPrimary}>
              CONFIRM
            </button>
            <button onClick={() => setShowLogout(false)} style={CS.btnGhost}>
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
