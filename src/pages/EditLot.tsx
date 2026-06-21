import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLot } from "../api/lots";
import apiClient from "../api/client";
import PageWrapper from "../components/PageWrapper";
import {
  MapPin, Leaf, FileCheck, Upload, ShieldCheck,
  TrendingUp, Award, CheckCircle, XCircle, ArrowLeft, ArrowRight, Save
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
  review:     "Review & Save",
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
  phyto_cert_file: File | null;
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
  phyto_cert_file: null,
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

export default function EditLot() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep]       = useState<Step>("origin");
  const [form, setForm]       = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [ready, setReady]     = useState(false);

  const { data: lot, isLoading: lotLoading } = useQuery({
    queryKey: ["lot", id],
    queryFn:  () => getLot(id!),
    enabled:  !!id,
  });

  useEffect(() => {
    if (!lot) return;
    setForm({
      lot_id:           lot.lot_id,
      name:             lot.name,
      region:           lot.region,
      kebele:           lot.kebele || "",
      washing_station:  lot.washing_station || "",
      altitude_m:       String(lot.altitude_m || ""),
      processing:       lot.processing,
      grade:            lot.grade,
      varietal:         lot.varietal || "Ethiopian Heirloom",
      harvest_date:     lot.harvest_date || "",
      volume_kg:        String(lot.volume_kg || ""),
      price_per_kg:     lot.price_per_kg ? String(lot.price_per_kg) : "",
      sca_score:        lot.sca_score ? String(lot.sca_score) : "",
      flavor_notes:     lot.flavor_notes || "",
      q_grader_name:    lot.q_grader_name || "",
      q_grader_cert_id: lot.q_grader_cert_id || "",
      cupping_date:     lot.cupping_date || "",
      gps_lat:          lot.gps_lat ? String(lot.gps_lat) : "",
      gps_lng:          lot.gps_lng ? String(lot.gps_lng) : "",
      deforestation_free:  lot.deforestation_free,
      gps_verified:        lot.gps_verified,
      phyto_cert_uploaded: lot.phyto_cert_uploaded,
      ecta_license_active: lot.ecta_license_active,
      nbe_fx_declared:     lot.nbe_fx_declared,
      cta_floor_met:       lot.cta_floor_met,
      eudr_dds_ready:      lot.eudr_dds_ready,
      phyto_cert_file:     null,
    });
    setReady(true);
  }, [lot]);

  const set = (k: keyof FormData, v: string | boolean | File | null) =>
    setForm(f => ({ ...f, [k]: v }));

  const stepIndex = STEPS.indexOf(step);

  const inp = CS.input;
  const inpReadonly = {
    ...inp,
    background: T.color.stone,
    color: T.color.textFaint,
    cursor: "not-allowed",
  };

  const sel = CS.input;
  const lbl = CS.label;
  const card = CS.card;

  const cardTitle = {
    fontFamily: T.font.mono, fontSize: "0.58rem",
    letterSpacing: "0.2em", textTransform: "uppercase" as const,
    color: T.color.textFaint, margin: "0 0 18px",
  };

  const Field = ({ label, k, type = "text", placeholder = "", readonly = false }: {
    label: string; k: keyof FormData; type?: string; placeholder?: string; readonly?: boolean;
  }) => (
    <div>
      <label style={lbl}>{label}</label>
      <input
        style={readonly ? inpReadonly : inp}
        type={type} placeholder={placeholder}
        value={form[k] as string}
        readOnly={readonly}
        onChange={e => !readonly && set(k, e.target.value)}
        onFocus={e => !readonly && (e.target.style.borderColor = T.color.forest)}
        onBlur={e  => !readonly && (e.target.style.borderColor = T.color.border)}
      />
      {readonly && (
        <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textGhost, margin: "4px 0 0" }}>
          Lot ID cannot be changed after creation
        </p>
      )}
    </div>
  );

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      const fields: Record<string, string> = {
        name:             form.name,
        region:           form.region,
        kebele:           form.kebele,
        washing_station:  form.washing_station,
        altitude_m:       form.altitude_m,
        processing:       form.processing,
        grade:            form.grade,
        varietal:         form.varietal || "Ethiopian Heirloom",
        harvest_date:     form.harvest_date,
        volume_kg:        form.volume_kg,
        flavor_notes:     form.flavor_notes,
        q_grader_name:    form.q_grader_name,
        q_grader_cert_id: form.q_grader_cert_id,
      };

      if (form.price_per_kg) fields.price_per_kg = form.price_per_kg;
      if (form.sca_score)    fields.sca_score    = form.sca_score;
      if (form.cupping_date) fields.cupping_date  = form.cupping_date;

      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));

      fd.append("deforestation_free",  String(form.deforestation_free));
      fd.append("gps_verified",        String(form.gps_verified));
      fd.append("phyto_cert_uploaded", String(form.phyto_cert_uploaded));
      fd.append("ecta_license_active", String(form.ecta_license_active));
      fd.append("nbe_fx_declared",     String(form.nbe_fx_declared));
      fd.append("cta_floor_met",       String(form.cta_floor_met));
      fd.append("eudr_dds_ready",      String(form.eudr_dds_ready));

      if (form.gps_lat && form.gps_lng) {
        fd.append("farm_location", JSON.stringify({
          type: "Point",
          coordinates: [parseFloat(form.gps_lng), parseFloat(form.gps_lat)],
        }));
      }

      if (form.phyto_cert_file) {
        fd.append("phyto_cert_file", form.phyto_cert_file);
      }

      await apiClient.patch(`/v1/lots/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/lots/${id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, string[]> } };
      if (err.response?.data) {
        const msgs = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msgs);
      } else {
        setError("Failed to save changes. Please check all required fields.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (lotLoading || !ready) return (
    <PageWrapper>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint, letterSpacing: "0.2em" }}>
          LOADING LOT...
        </p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <div style={{ maxWidth: "820px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={CS.pageTitle}>
            Edit Lot — {lot?.lot_id}
          </h1>
          <p style={CS.pageSubtitle}>
            Update Digitized Birth Certificate Info
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", marginBottom: "28px", background: T.color.white, border: `1px solid ${T.color.border}`, borderRadius: T.radius.md, overflow: "hidden" }}>
          {STEPS.map((st, i) => {
            const active = st === step;
            const done   = i < stepIndex;
            return (
              <button key={st} onClick={() => done && setStep(st)}
                style={{
                  flex: 1, padding: "14px 8px", border: "none",
                  borderBottom: `2px solid ${active ? T.color.forest : done ? T.color.forest : "transparent"}`,
                  background: active ? T.color.linen : "transparent",
                  cursor: done ? "pointer" : "default",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                }}
              >
                <span style={{ fontFamily: T.font.mono, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: active ? T.color.forest : done ? T.color.forest : T.color.textGhost }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: T.font.sans, fontSize: "0.75rem", color: active ? T.color.forest : done ? T.color.forest : T.color.textMuted, whiteSpace: "nowrap" }}>
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
                <Field label="Lot ID" k="lot_id" readonly={true} />
                <Field label="Lot Name *" k="name" placeholder="e.g. Kochere Washed G1" />
              </div>
            </div>
            <div style={card}>
              <p style={cardTitle}>Origin Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "14px", marginBottom: "14px" }}>
                <div><label style={lbl}>Region *</label><select style={sel} value={form.region} onChange={e => set("region", e.target.value)}>{REGIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select></div>
                <div><label style={lbl}>Grade *</label><select style={sel} value={form.grade} onChange={e => set("grade", e.target.value)}>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label style={lbl}>Processing *</label><select style={sel} value={form.processing} onChange={e => set("processing", e.target.value)}>{PROCESSING.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "14px" }}>
                <Field label="Kebele"            k="kebele"          placeholder="e.g. Kochere" />
                <Field label="Washing Station"   k="washing_station" placeholder="e.g. Kochere WS" />
                <Field label="Altitude (masl) *" k="altitude_m"      type="number" />
                <Field label="Harvest Date *"    k="harvest_date"    type="date" />
              </div>
            </div>
            <div style={card}>
              <p style={cardTitle}>GPS Coordinates</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Latitude"  k="gps_lat" type="number" placeholder="6.3241" />
                <Field label="Longitude" k="gps_lng" type="number" placeholder="38.2149" />
              </div>
            </div>
            <div style={card}>
              <p style={cardTitle}>Commercial</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Volume (kg) *"  k="volume_kg"    type="number" />
                <Field label="Price / kg ($)" k="price_per_kg" type="number" />
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
                <Field label="Varietal"            k="varietal" />
              </div>
            </div>
            <div style={card}>
              <p style={cardTitle}>Q-Grader</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Q-Grader Name" k="q_grader_name" />
                <Field label="SCA Cert ID"   k="q_grader_cert_id" />
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
                    <span key={f} style={{ padding: "3px 10px", background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.2)`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.gold }}>{f}</span>
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
                        <span style={{ color: on ? T.color.forest : T.color.textGhost, flexShrink: 0 }}>{g.icon}</span>
                        <span style={{ fontFamily: T.font.sans, fontSize: "0.875rem", color: on ? T.color.ink : T.color.textMuted }}>{g.label}</span>
                      </div>
                      {on ? <CheckCircle size={16} color={T.color.forest} /> : <XCircle size={16} color={T.color.borderStrong} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phytosanitary Certificate Upload */}
            <div style={card}>
              <p style={cardTitle}>Phytosanitary Certificate</p>
              <p style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.textMuted, marginBottom: "16px", lineHeight: 1.5 }}>
                Upload the phytosanitary certificate PDF. Uploading will automatically mark the Phytosanitary Certificate gate as passed.
              </p>
              <div style={{
                background: T.color.stone,
                border: `2px dashed ${T.color.borderStrong}`,
                borderRadius: T.radius.md, padding: "20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
              }}>
                <Upload size={20} color={T.color.textGhost} />
                <label style={{ ...lbl, color: T.color.ink, marginBottom: 0, cursor: "pointer", textAlign: "center" }}>
                  {form.phyto_cert_file
                    ? form.phyto_cert_file.name
                    : "Click to select PDF or drag and drop"
                  }
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null;
                    set("phyto_cert_file", file);
                    if (file) set("phyto_cert_uploaded", true);
                  }}
                  style={{
                    color: T.color.textMuted,
                    fontFamily: T.font.sans,
                    fontSize: "0.825rem",
                    cursor: "pointer",
                  }}
                />
                {form.phyto_cert_file && (
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.forest, margin: 0 }}>
                    {(form.phyto_cert_file.size / 1024).toFixed(1)} KB · PDF ready to upload
                  </p>
                )}
              </div>
              {lot?.phyto_cert_uploaded && !form.phyto_cert_file && (
                <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.forest, marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={11} /> Certificate already on file — upload a new one to replace it
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Step 4: Review ── */}
        {step === "review" && (
          <>
            <div style={card}>
              <p style={cardTitle}>Identity & Origin</p>
              {[
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
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.color.border}` }}>
                  <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.color.textFaint }}>{l}</span>
                  <span style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.ink }}>{v}</span>
                </div>
              ))}
            </div>

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
                      {pass ? <CheckCircle size={14} color={T.color.forest} /> : <XCircle size={14} color={T.color.red} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phyto cert upload summary */}
            {form.phyto_cert_file && (
              <div style={{ ...card, background: T.color.forestLight, border: `1px solid ${T.color.forest}` }}>
                <p style={{ ...cardTitle, color: T.color.forest }}>Phytosanitary Certificate</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Upload size={14} color={T.color.forest} />
                  <span style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.forest }}>
                    {form.phyto_cert_file.name}
                  </span>
                  <span style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.forest, marginLeft: "auto" }}>
                    {(form.phyto_cert_file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}

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
            onClick={() => stepIndex > 0 ? setStep(STEPS[stepIndex - 1]) : navigate(`/lots/${id}`)}
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
              onClick={handleSave}
              disabled={loading}
              style={{ ...CS.btnPrimary, background: loading ? T.color.borderStrong : T.color.forest }}
            >
              <Save size={14} /> {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
