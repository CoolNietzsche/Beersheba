import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLot } from "../api/lots";
import PageWrapper from "../components/PageWrapper";
import {
  MapPin, Leaf, FileCheck, Upload, ShieldCheck,
  TrendingUp, Award, CheckCircle, XCircle, ArrowRight, ArrowLeft, Plus
} from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

const REGIONS    = ["yirgacheffe","sidama","guji","jimma","harrar","limu","nekemte","other"];
const GRADES     = ["G1","G2","G3"];
const PROCESSING = ["washed","natural","honey"];

type Step = "origin" | "quality" | "compliance" | "review";
const STEPS: Step[] = ["origin","quality","compliance","review"];
const STEP_LABELS: Record<Step, string> = {
  origin:     "Origin & Identity",
  quality:    "Quality",
  compliance: "Compliance",
  review:     "Review & Submit",
};

interface FormData {
  lot_id: string; name: string; region: string; kebele: string;
  washing_station: string; altitude_m: string; processing: string;
  grade: string; varietal: string; harvest_date: string;
  volume_kg: string; price_per_kg: string; sca_score: string;
  flavor_notes: string; q_grader_name: string; q_grader_cert_id: string;
  cupping_date: string; gps_lat: string; gps_lng: string;
  deforestation_free: boolean; gps_verified: boolean;
  phyto_cert_uploaded: boolean; ecta_license_active: boolean;
  nbe_fx_declared: boolean; cta_floor_met: boolean; eudr_dds_ready: boolean;
}

const EMPTY: FormData = {
  lot_id: "", name: "", region: "yirgacheffe", kebele: "",
  washing_station: "", altitude_m: "", processing: "washed",
  grade: "G1", varietal: "Ethiopian Heirloom", harvest_date: "",
  volume_kg: "", price_per_kg: "", sca_score: "", flavor_notes: "",
  q_grader_name: "", q_grader_cert_id: "", cupping_date: "",
  gps_lat: "", gps_lng: "",
  deforestation_free: false, gps_verified: false,
  phyto_cert_uploaded: false, ecta_license_active: false,
  nbe_fx_declared: false, cta_floor_met: false, eudr_dds_ready: false,
};

const GATES = [
  { k: "gps_verified",        label: "GPS Coordinates Verified",           icon: <MapPin size={13} /> },
  { k: "deforestation_free",  label: "Deforestation-Free (post Dec 2020)", icon: <Leaf size={13} /> },
  { k: "eudr_dds_ready",      label: "EUDR Due Diligence Statement Ready", icon: <FileCheck size={13} /> },
  { k: "phyto_cert_uploaded", label: "Phytosanitary Certificate Uploaded", icon: <Upload size={13} /> },
  { k: "ecta_license_active", label: "ECTA Export License Active",         icon: <ShieldCheck size={13} /> },
  { k: "nbe_fx_declared",     label: "NBE FX Declaration Filed (50/50)",   icon: <TrendingUp size={13} /> },
  { k: "cta_floor_met",       label: "CTA Floor Price Met",                icon: <Award size={13} /> },
];

export default function CreateLot() {
  const navigate = useNavigate();
  const [step, setStep]       = useState<Step>("origin");
  const [form, setForm]       = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const stepIndex = STEPS.indexOf(step);

  const gatesPassing = GATES.filter(g => form[g.k as keyof FormData]).length;
  const allGatesPass = gatesPassing === GATES.length;

  const inp = CS.input;
  const sel = CS.input;
  const lbl = CS.label;
  const card = CS.card;

  const cardTitle = {
    fontFamily: T.font.mono, fontSize: "0.58rem",
    letterSpacing: "0.2em", textTransform: "uppercase" as const,
    color: T.color.textFaint, margin: "0 0 18px",
  };

  const Field = ({ label, k, type = "text", placeholder = "" }: {
    label: string; k: keyof FormData; type?: string; placeholder?: string;
  }) => (
    <div>
      <label style={lbl}>{label}</label>
      <input style={inp} type={type} placeholder={placeholder}
        value={form[k] as string}
        onChange={e => set(k, e.target.value)}
        onFocus={e => (e.target.style.borderColor = T.color.forest)}
        onBlur={e  => (e.target.style.borderColor = T.color.border)}
      />
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload: Record<string, unknown> = {
        lot_id: form.lot_id, name: form.name, region: form.region,
        kebele: form.kebele, washing_station: form.washing_station,
        altitude_m: parseInt(form.altitude_m), processing: form.processing,
        grade: form.grade, varietal: form.varietal || "Ethiopian Heirloom",
        harvest_date: form.harvest_date,
        volume_kg: parseFloat(form.volume_kg),
        price_per_kg: form.price_per_kg ? parseFloat(form.price_per_kg) : null,
        sca_score: form.sca_score ? parseFloat(form.sca_score) : null,
        flavor_notes: form.flavor_notes,
        q_grader_name: form.q_grader_name, q_grader_cert_id: form.q_grader_cert_id,
        cupping_date: form.cupping_date || null,
        deforestation_free: form.deforestation_free, gps_verified: form.gps_verified,
        phyto_cert_uploaded: form.phyto_cert_uploaded, ecta_license_active: form.ecta_license_active,
        nbe_fx_declared: form.nbe_fx_declared, cta_floor_met: form.cta_floor_met,
        eudr_dds_ready: form.eudr_dds_ready, status: "draft",
      };
      if (form.gps_lat && form.gps_lng) {
        payload.farm_location = { type: "Point", coordinates: [parseFloat(form.gps_lng), parseFloat(form.gps_lat)] };
      }
      const lot = await createLot(payload as never);
      navigate(`/lots/${lot.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, string[]> } };
      if (err.response?.data) {
        const msgs = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msgs);
      } else {
        setError("Failed to create lot. Please check all required fields.");
      }
    } finally { setLoading(false); }
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: "820px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={CS.pageTitle}>
            Register Coffee Lot
          </h1>
          <p style={CS.pageSubtitle}>
            Digital Birth Certificate Registry Entry
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", marginBottom: "28px", background: T.color.white, border: `1px solid ${T.color.border}`, borderRadius: T.radius.md, overflow: "hidden" }}>
          {STEPS.map((st, i) => {
            const active = st === step;
            const done   = i < stepIndex;
            return (
              <button key={st}
                onClick={() => done && setStep(st)}
                style={{
                  flex: 1, padding: "14px 8px", border: "none",
                  borderBottom: `2px solid ${active ? T.color.forest : done ? T.color.forest : "transparent"}`,
                  background: active ? T.color.linen : "transparent",
                  cursor: done ? "pointer" : "default",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                }}
              >
                <span style={{
                  fontFamily: T.font.mono, fontSize: "0.55rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: active ? T.color.forest : done ? T.color.forest : T.color.textGhost,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{
                  fontFamily: T.font.sans, fontSize: "0.75rem",
                  color: active ? T.color.forest : done ? T.color.forest : T.color.textMuted,
                  whiteSpace: "nowrap",
                }}>
                  {STEP_LABELS[st]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Step 1: Origin ── */}
        {step === "origin" && (
          <>
            <div style={card}>
              <p style={cardTitle}>Lot Identity</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "14px" }}>
                <Field label="Lot ID *"   k="lot_id" placeholder="e.g. YRG-2026-0001" />
                <Field label="Lot Name *" k="name"   placeholder="e.g. Kochere Washed G1" />
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Origin Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Region *</label>
                  <select style={sel} value={form.region} onChange={e => set("region", e.target.value)}>
                    {REGIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Grade *</label>
                  <select style={sel} value={form.grade} onChange={e => set("grade", e.target.value)}>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Processing *</label>
                  <select style={sel} value={form.processing} onChange={e => set("processing", e.target.value)}>
                    {PROCESSING.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "14px" }}>
                <Field label="Kebele"            k="kebele"          placeholder="e.g. Kochere" />
                <Field label="Washing Station"   k="washing_station" placeholder="e.g. Kochere WS" />
                <Field label="Altitude (masl) *" k="altitude_m"      type="number" placeholder="1950" />
                <Field label="Harvest Date *"    k="harvest_date"    type="date" />
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>GPS Coordinates</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Latitude"  k="gps_lat" type="number" placeholder="6.3241" />
                <Field label="Longitude" k="gps_lng" type="number" placeholder="38.2149" />
              </div>
              <p style={{ fontFamily: T.font.sans, fontSize: "0.775rem", color: T.color.textMuted, marginTop: "10px", lineHeight: 1.5 }}>
                For farms under 4 hectares, a single GPS point is sufficient for EUDR compliance. You can capture a full boundary polygon after creating the lot.
              </p>
            </div>

            <div style={card}>
              <p style={cardTitle}>Commercial</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Volume (kg) *"  k="volume_kg"    type="number" placeholder="3200" />
                <Field label="Price / kg ($)" k="price_per_kg" type="number" placeholder="6.42" />
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Quality ── */}
        {step === "quality" && (
          <>
            <div style={card}>
              <p style={cardTitle}>SCA Cupping Score</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "14px" }}>
                <Field label="SCA Score (80–100)" k="sca_score"    type="number" placeholder="87.5" />
                <Field label="Cupping Date"        k="cupping_date" type="date" />
                <Field label="Varietal"            k="varietal"     placeholder="Ethiopian Heirloom" />
              </div>
              {form.sca_score && (
                <div style={{ marginTop: "16px", background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.15)`, borderRadius: T.radius.md, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontFamily: T.font.display, fontSize: "2.5rem", fontWeight: 300, color: T.color.gold, lineHeight: 1 }}>
                      {form.sca_score}
                    </span>
                    <span style={{ fontFamily: T.font.mono, fontSize: "0.65rem", color: T.color.gold }}>pts</span>
                    <span style={{ fontFamily: T.font.sans, fontSize: "0.8rem", color: T.color.textMuted, marginLeft: "4px" }}>
                      {parseFloat(form.sca_score) >= 90 ? "Outstanding" :
                       parseFloat(form.sca_score) >= 85 ? "Excellent" :
                       parseFloat(form.sca_score) >= 80 ? "Specialty" : "Below Specialty"}
                    </span>
                  </div>
                  <div style={{ height: "3px", background: T.color.border, borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${((parseFloat(form.sca_score) - 80) / 20) * 100}%`, background: `linear-gradient(to right, ${T.color.coffee}, ${T.color.gold})`, borderRadius: "2px" }} />
                  </div>
                </div>
              )}
            </div>

            <div style={card}>
              <p style={cardTitle}>Q-Grader</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Q-Grader Name" k="q_grader_name"    placeholder="Full name" />
                <Field label="SCA Cert ID"   k="q_grader_cert_id" placeholder="SCA-3847" />
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Flavor Notes</p>
              <div>
                <label style={lbl}>Flavor notes (comma separated)</label>
                <input style={inp} placeholder="e.g. Jasmine, Bergamot, Lemon Zest"
                  value={form.flavor_notes}
                  onChange={e => set("flavor_notes", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = T.color.forest)}
                  onBlur={e  => (e.target.style.borderColor = T.color.border)}
                />
              </div>
              {form.flavor_notes && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                  {form.flavor_notes.split(",").map(f => f.trim()).filter(Boolean).map(f => (
                    <span key={f} style={{ padding: "3px 10px", background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.2)`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.gold }}>
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Compliance ── */}
        {step === "compliance" && (
          <>
            <div style={card}>
              <p style={cardTitle}>EUDR Compliance Gates</p>
              <p style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.textMuted, marginBottom: "18px", lineHeight: 1.6 }}>
                Toggle each gate as documentation is confirmed. All 7 gates must pass before the Export button unlocks.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {GATES.map(g => {
                  const on = form[g.k as keyof FormData] as boolean;
                  return (
                    <div key={g.k}
                      onClick={() => set(g.k as keyof FormData, !on)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", borderRadius: T.radius.md, cursor: "pointer",
                        background: on ? T.color.forestLight : T.color.linen,
                        border: `1px solid ${on ? T.color.forest : T.color.border}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: on ? T.color.forest : T.color.textGhost, flexShrink: 0 }}>
                          {g.icon}
                        </span>
                        <span style={{ fontFamily: T.font.sans, fontSize: "0.875rem", color: on ? T.color.ink : T.color.textMuted }}>
                          {g.label}
                        </span>
                      </div>
                      {on
                        ? <CheckCircle size={16} color={T.color.forest} />
                        : <XCircle size={16} color={T.color.borderStrong} />
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live gate preview */}
            <div style={{ ...card, background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <p style={{ ...cardTitle, margin: 0, color: T.color.forest }}>
                  Gate Status
                </p>
                <span style={{ fontFamily: T.font.display, fontSize: "1.4rem", fontWeight: 300, color: T.color.forest }}>
                  {gatesPassing} / {GATES.length}
                </span>
              </div>
              <div style={{ height: "4px", background: T.color.border, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(gatesPassing / GATES.length) * 100}%`, background: T.color.forest, borderRadius: "2px", transition: "width 0.3s ease" }} />
              </div>
              <p style={{ fontFamily: T.font.sans, fontSize: "0.8rem", color: T.color.forest, marginTop: "10px" }}>
                {allGatesPass ? "All gates pass — Export will be unlocked on creation." : `${GATES.length - gatesPassing} gate${GATES.length - gatesPassing > 1 ? "s" : ""} still pending.`}
              </p>
            </div>
          </>
        )}

        {/* ── Step 4: Review ── */}
        {step === "review" && (
          <>
            {[
              {
                title: "Lot Identity & Origin",
                rows: [
                  ["Lot ID",       form.lot_id],
                  ["Name",         form.name],
                  ["Region",       form.region],
                  ["Grade",        form.grade],
                  ["Processing",   form.processing],
                  ["Altitude",     form.altitude_m ? `${form.altitude_m} masl` : "—"],
                  ["Volume",       form.volume_kg ? `${form.volume_kg} kg` : "—"],
                  ["Price/kg",     form.price_per_kg ? `$${form.price_per_kg}` : "—"],
                  ["Harvest Date", form.harvest_date || "—"],
                  ["GPS",          form.gps_lat && form.gps_lng ? `${form.gps_lat}°N, ${form.gps_lng}°E` : "Not set"],
                ]
              },
              {
                title: "Quality",
                rows: [
                  ["SCA Score",    form.sca_score ? `${form.sca_score} pts` : "Not recorded"],
                  ["Q-Grader",     form.q_grader_name || "—"],
                  ["Cert ID",      form.q_grader_cert_id || "—"],
                  ["Flavor Notes", form.flavor_notes || "—"],
                ]
              },
            ].map(section => (
              <div key={section.title} style={card}>
                <p style={cardTitle}>{section.title}</p>
                {section.rows.map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.color.border}` }}>
                    <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.color.textFaint }}>{l}</span>
                    <span style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.ink }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={card}>
              <p style={cardTitle}>Compliance Gates</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {GATES.map(g => {
                  const pass = form[g.k as keyof FormData] as boolean;
                  return (
                    <div key={g.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: T.radius.sm, background: pass ? T.color.forestLight : T.color.redLight, border: `1px solid ${pass ? T.color.forest : T.color.errorBorder}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: pass ? T.color.forest : T.color.red }}>{g.icon}</span>
                        <span style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: pass ? T.color.forest : T.color.red }}>{g.label}</span>
                      </div>
                      {pass
                        ? <CheckCircle size={14} color={T.color.forest} />
                        : <XCircle size={14} color={T.color.red} />
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={CS.errorBanner}>
                {error}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <button
            onClick={() => stepIndex > 0 ? setStep(STEPS[stepIndex - 1]) : navigate("/lots")}
            style={CS.btnGhost}
          >
            <ArrowLeft size={14} /> {stepIndex === 0 ? "Cancel" : "Back"}
          </button>

          {step !== "review" ? (
            <button
              onClick={() => setStep(STEPS[stepIndex + 1])}
              style={CS.btnPrimary}
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...CS.btnPrimary, background: loading ? T.color.borderStrong : T.color.forest }}
            >
              <Plus size={14} /> {loading ? "Creating..." : "Create Lot"}
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
