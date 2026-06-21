import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFarmerProfile, getFarmerLots, updateFarmerProfile } from "../api/farmer";
import type { FarmerProfile } from "../api/farmer";
import PageWrapper from "../components/PageWrapper";
import PolygonCaptureWidget from '../components/PolygonCaptureWidget';
import FarmMapDisplay from '../components/FarmMapDisplay';
import StatusPill from "../components/StatusPill";
import {
  Sprout, MapPin, Mountain, Ruler, Users,
  Edit2, Check, X, Coffee, ExternalLink
} from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

export default function MyFarm() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<Partial<FarmerProfile>>({});
  const [saved, setSaved]     = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["farmer-profile"],
    queryFn:  getFarmerProfile,
  });

  const { data: lots, isLoading: lotsLoading } = useQuery({
    queryKey: ["farmer-lots"],
    queryFn:  getFarmerLots,
  });

  const updateMutation = useMutation({
    mutationFn: updateFarmerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-profile"] });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const startEdit = () => {
    setForm({
      farm_name:       profile?.farm_name       || "",
      farm_region:     profile?.farm_region      || "",
      farm_kebele:     profile?.farm_kebele      || "",
      farm_altitude_m: profile?.farm_altitude_m  || undefined,
      farm_size_ha:    profile?.farm_size_ha     || "",
      cooperative:     profile?.cooperative      || "",
      gps_lat:         profile?.gps_lat          || "",
      gps_lng:         profile?.gps_lng          || "",
      phone:           profile?.phone    || "",
      country:         profile?.country  || "",
    });
    setEditing(true);
  };

  const handleSave = () => updateMutation.mutate(form);
  const set = (k: keyof FarmerProfile, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  if (profileLoading) return (
    <PageWrapper>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: T.font.mono, color: T.color.textFaint, letterSpacing: "0.2em", fontSize: "0.75rem" }}>
          LOADING FARM PROFILE...
        </p>
      </div>
    </PageWrapper>
  );

  const p = profile;
  const displayName = p?.farm_name || user?.company_name || "My Farm";

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={CS.pageTitle}>{displayName}</h1>
          <p style={CS.pageSubtitle}>
            {p?.cooperative || "Farm Profile"} · {p?.farm_region || "Ethiopia"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {saved && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: T.font.mono, fontSize: "0.65rem", color: T.color.forest, fontWeight: 600 }}>
              <Check size={13} /> Saved
            </span>
          )}
          {editing ? (
            <>
              <button style={{ ...CS.btnGhost, borderColor: "rgba(192,57,43,0.3)", color: T.color.red }} onClick={() => setEditing(false)}>
                <X size={13} /> Cancel
              </button>
              <button style={{ ...CS.btnPrimary, background: T.color.forest }}
                onClick={handleSave}
                disabled={updateMutation.isPending}>
                <Check size={13} />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button style={CS.btnGhost} onClick={startEdit}>
              <Edit2 size={13} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { icon: <Mountain size={14} />, val: p?.farm_altitude_m ? `${p.farm_altitude_m}m` : "—", lbl: "Altitude" },
          { icon: <Ruler size={14} />,    val: p?.farm_size_ha    ? `${p.farm_size_ha} ha` : "—", lbl: "Farm Size" },
          { icon: <Coffee size={14} />,   val: lots?.length ?? "—",                                lbl: "Linked Lots" },
          { icon: <Users size={14} />,    val: p?.cooperative     ? "Yes" : "No",                  lbl: "Cooperative" },
        ].map(s => (
          <div key={s.lbl} style={{
            background: T.color.linen, border: `1px solid ${T.color.border}`, borderRadius: T.radius.md, padding: "16px"
          }}>
            <div style={{ color: T.color.coffee, marginBottom: "8px" }}>{s.icon}</div>
            <p style={{ fontFamily: T.font.display, fontSize: "1.8rem", fontWeight: 500, color: T.color.coffee, margin: "0 0 4px", lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>{s.lbl}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "16px", marginBottom: "20px" }}>
        {/* Left — Farm details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Farm Identity */}
          <div style={CS.card}>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>Farm Identity</p>
            {editing ? (
              <>
                {[
                  { label: "Farm Name",    key: "farm_name",   placeholder: "Kochere Highland Farm" },
                  { label: "Cooperative",  key: "cooperative", placeholder: "Kochere Cooperative" },
                  { label: "Region",       key: "farm_region", placeholder: "yirgacheffe" },
                  { label: "Kebele",       key: "farm_kebele", placeholder: "Kochere" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: "14px" }}>
                    <label style={CS.label}>{f.label}</label>
                    <input style={CS.input} placeholder={f.placeholder}
                      value={(form as Record<string, string>)[f.key] || ""}
                      onChange={e => set(f.key as keyof FarmerProfile, e.target.value)} />
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { icon: <Sprout size={12} />,  label: "Farm Name",   val: p?.farm_name   || "—" },
                  { icon: <Users size={12} />,   label: "Cooperative", val: p?.cooperative || "—" },
                  { icon: <MapPin size={12} />,  label: "Region",      val: p?.farm_region || "—" },
                  { icon: <MapPin size={12} />,  label: "Kebele",      val: p?.farm_kebele || "—" },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: "14px" }}>
                    <p style={{ ...CS.label, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>{f.icon} {f.label}</p>
                    <p style={{ fontSize: "0.9rem", color: T.color.ink, margin: 0, textTransform: f.label === "Region" ? "capitalize" : "none" }}>
                      {f.val}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Technical Details */}
          <div style={CS.card}>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>Technical Details</p>
            {editing ? (
              <>
                {[
                  { label: "Altitude (masl)", key: "farm_altitude_m", type: "number", placeholder: "1950" },
                  { label: "Farm Size (ha)",  key: "farm_size_ha",    type: "number", placeholder: "0.4"  },
                  { label: "GPS Latitude",    key: "gps_lat",         type: "number", placeholder: "6.3241" },
                  { label: "GPS Longitude",   key: "gps_lng",         type: "number", placeholder: "38.2149" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: "14px" }}>
                    <label style={CS.label}>{f.label}</label>
                    <input style={CS.input} type={f.type} placeholder={f.placeholder}
                      value={(form as Record<string, string>)[f.key] || ""}
                      onChange={e => set(f.key as keyof FarmerProfile, e.target.value)} />
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { icon: <Mountain size={12} />, label: "Altitude",  val: p?.farm_altitude_m ? `${p.farm_altitude_m} masl` : "—" },
                  { icon: <Ruler size={12} />,    label: "Farm Size", val: p?.farm_size_ha    ? `${p.farm_size_ha} hectares` : "—" },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: "14px" }}>
                    <p style={{ ...CS.label, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>{f.icon} {f.label}</p>
                    <p style={{ fontSize: "0.9rem", color: T.color.ink, margin: 0 }}>{f.val}</p>
                  </div>
                ))}

                {/* GPS Box */}
                {(p?.gps_lat || p?.gps_lng) && (
                  <div style={{ background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)`, borderRadius: T.radius.md, padding: "12px", marginTop: "8px" }}>
                    <p style={{ ...CS.label, color: T.color.forest, margin: "0 0 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={12} color={T.color.forest} /> GPS Coordinates
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, letterSpacing: "0.08em" }}>Latitude</span>
                      <span style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.forest, fontWeight: 600 }}>{p?.gps_lat}°N</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, letterSpacing: "0.08em" }}>Longitude</span>
                      <span style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.forest, fontWeight: 600 }}>{p?.gps_lng}°E</span>
                    </div>
                    <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid rgba(27,77,53,0.12)` }}>
                      <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.forest, fontWeight: 600 }}>
                        ✓ EUDR-compliant GPS point recorded
                      </span>
                    </div>
                  </div>
                )}

                {!p?.gps_lat && (
                  <div style={{ background: T.color.redLight, border: `1px solid ${T.color.errorBorder}`, borderRadius: T.radius.md, padding: "12px", marginTop: "8px" }}>
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.65rem", color: T.color.red, margin: 0, fontWeight: 600 }}>
                      ⚠ GPS coordinates not set — required for EUDR compliance
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right — Contact + Lots */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Contact */}
          <div style={CS.card}>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>Contact & Account</p>
            {editing ? (
              <>
                {[
                  { label: "Phone",   key: "phone",   placeholder: "+251..." },
                  { label: "Country", key: "country", placeholder: "Ethiopia" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: "14px" }}>
                    <label style={CS.label}>{f.label}</label>
                    <input style={CS.input} placeholder={f.placeholder}
                      value={(form as Record<string, string>)[f.key] || ""}
                      onChange={e => set(f.key as keyof FarmerProfile, e.target.value)} />
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: "Full Name", val: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "—" },
                  { label: "Email",     val: user?.email    || "—" },
                  { label: "Phone",     val: p?.phone       || "—" },
                  { label: "Country",   val: p?.country     || "Ethiopia" },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: "14px" }}>
                    <p style={{ ...CS.label, margin: "0 0 4px" }}>{f.label}</p>
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.8rem", color: T.color.ink, margin: 0 }}>{f.val}</p>
                  </div>
                ))}

                {/* EUDR status */}
                <div style={{ marginTop: "12px", padding: "10px", background: p?.gps_lat ? T.color.forestLight : T.color.redLight, border: `1px solid ${p?.gps_lat ? T.color.forest : T.color.errorBorder}`, borderRadius: T.radius.sm }}>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.62rem", color: p?.gps_lat ? T.color.forest : T.color.red, margin: 0, letterSpacing: "0.05em", fontWeight: 600 }}>
                    {p?.gps_lat
                      ? "🌿 EUDR GPS Profile Complete"
                      : "⚠ EUDR GPS Profile Incomplete — Edit profile to add coordinates"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Linked Lots */}
          <div style={CS.card}>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>
              Linked Lots ({lotsLoading ? "..." : lots?.length ?? 0})
            </p>
            {lotsLoading && (
              <p style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.textFaint, textAlign: "center", padding: "24px 0" }}>Loading lots...</p>
            )}
            {!lotsLoading && (!lots || lots.length === 0) && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Coffee size={20} style={{ color: T.color.textGhost, marginBottom: "8px", margin: "0 auto 8px" }} />
                <p style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.textFaint, textAlign: "center", margin: 0 }}>No lots linked to your farm yet.</p>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.62rem", color: T.color.textGhost, textAlign: "center", marginTop: "4px" }}>
                  Lots from your kebele ({p?.farm_kebele || "—"}) will appear here.
                </p>
              </div>
            )}
            {lots && lots.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {lots.map(lot => (
                  <div key={lot.id} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: T.radius.sm,
                    border: `1px solid ${T.color.border}`, cursor: "pointer", background: T.color.white, transition: "all 0.15s"
                  }}
                    onClick={() => navigate(`/lots/${lot.id}`)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = T.color.linen;
                      e.currentTarget.style.borderColor = T.color.borderStrong;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = T.color.white;
                      e.currentTarget.style.borderColor = T.color.border;
                    }}>
                    <span style={{ fontFamily: T.font.mono, fontSize: "0.65rem", color: T.color.gold, minWidth: "120px", fontWeight: 600 }}>{lot.lot_id}</span>
                    <span style={{ fontSize: "0.88rem", color: T.color.ink, flex: 1, fontWeight: 500 }}>{lot.name}</span>
                    {lot.sca_score && (
                      <span style={{ fontFamily: T.font.mono, fontSize: "0.72rem", color: T.color.gold, fontWeight: 600 }}>{lot.sca_score} pts</span>
                    )}
                    <StatusPill status={lot.status} />
                    <ExternalLink size={12} color={T.color.textGhost} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farm Boundary */}
      <div style={{ marginTop: "24px" }}>
        {p?.boundary && (
          <div style={{ marginBottom: "16px" }}>
            <FarmMapDisplay
              polygon={p.boundary}
              label="Farm Boundary"
              height={240}
            />
          </div>
        )}
        <PolygonCaptureWidget
          mode="farm"
          existingPolygon={p?.boundary ?? null}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['farmer-profile'] })}
        />
      </div>
    </PageWrapper>
  );
}
