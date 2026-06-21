import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLot } from "../api/lots";
import { submitCuppingScore, confirmCuppingScore } from "../api/cupping";
import PageWrapper from "../components/PageWrapper";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

const ATTRIBUTES = [
  { key: "fragrance_aroma", label: "Fragrance / Aroma",  desc: "Dry fragrance + wet aroma" },
  { key: "flavor",          label: "Flavor",              desc: "Overall taste impression"  },
  { key: "aftertaste",      label: "Aftertaste",          desc: "Residual taste length"     },
  { key: "acidity",         label: "Acidity",             desc: "Brightness and intensity"  },
  { key: "body",            label: "Body",                desc: "Tactile mouthfeel"         },
  { key: "balance",         label: "Balance",             desc: "Harmony of all attributes" },
  { key: "uniformity",      label: "Uniformity",          desc: "Consistency across cups"   },
  { key: "clean_cup",       label: "Clean Cup",           desc: "Absence of defects"        },
  { key: "sweetness",       label: "Sweetness",           desc: "Perceived sweetness"       },
  { key: "overall",         label: "Overall",             desc: "Holistic impression"       },
];

const EMPTY_SCORES = Object.fromEntries(ATTRIBUTES.map(a => [a.key, "8.00"]));

export default function CuppingForm() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [scores, setScores]       = useState<Record<string, string>>(EMPTY_SCORES);
  const [defects, setDefects]     = useState("0");
  const [flavorNotes, setFlavor]  = useState("");
  const [notes, setNotes]         = useState("");
  const [cuppingDate, setDate]    = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation]   = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError]         = useState("");

  const { data: lot } = useQuery({
    queryKey: ["lot", id],
    queryFn:  () => getLot(id!),
    enabled:  !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (data: Record<string, string>) =>
      submitCuppingScore(id!, data as never),
    onSuccess: (data) => {
      setSubmitted(data.id);
      setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } };
      if (e.response?.data) {
        const msgs = Object.entries(e.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msgs);
      } else {
        setError("Failed to submit score. Check all values are between 6 and 10.");
      }
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmCuppingScore(id!, submitted!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lot", id] });
      navigate(`/lots/${id}`);
    },
    onError: () => setError("Failed to confirm score."),
  });

  const totalScore = () => {
    const sum = ATTRIBUTES.reduce((acc, a) => acc + parseFloat(scores[a.key] || "0"), 0);
    return Math.max(0, sum - parseFloat(defects || "0")).toFixed(2);
  };

  const setScore = (key: string, val: string) =>
    setScores(s => ({ ...s, [key]: val }));

  const handleSubmit = () => {
    setError("");
    submitMutation.mutate({
      ...scores,
      defects,
      flavor_notes:     flavorNotes,
      notes,
      cupping_date:     cuppingDate,
      cupping_location: location,
    });
  };

  const score = parseFloat(totalScore());

  return (
    <PageWrapper>
      <div style={{ padding: "clamp(16px, 4vw, 2.5rem)", maxWidth: "900px", margin: "0 auto" }}>
        <button style={CS.btnGhost} onClick={() => navigate(`/lots/${id}`)}>
          ← Back to Lot
        </button>

        <div style={{ marginTop: "16px", marginBottom: "24px" }}>
          <h1 style={CS.pageTitle}>SCA Cupping Score</h1>
          <p style={CS.pageSubtitle}>
            {lot ? `${lot.lot_id} · ${lot.name}` : "Loading lot details..."}
          </p>
        </div>

        {/* Submitted confirmation */}
        {submitted && (
          <div style={{ ...CS.card, borderColor: T.color.forest, background: T.color.forestLight, padding: "24px" }}>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.65rem", letterSpacing: "0.15em", color: T.color.forest, textTransform: "uppercase", margin: "0 0 8px", fontWeight: 600 }}>
              ✓ Score Submitted — Pending Confirmation
            </p>
            <p style={{ fontFamily: T.font.sans, fontSize: "1.1rem", color: T.color.ink, margin: "0 0 12px" }}>
              Total Score: <strong>{totalScore()} pts</strong>
            </p>
            <p style={{ fontFamily: T.font.sans, fontSize: "0.85rem", color: T.color.slate, margin: "0 0 16px", lineHeight: 1.5 }}>
              Review your score below, then confirm to lock it permanently and update the lot quality record.
              Confirmed scores cannot be edited.
            </p>
            <button style={CS.btnPrimary}
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? "Confirming..." : "✓ Confirm & Lock Score"}
            </button>
          </div>
        )}

        {!submitted && (
          <>
            {/* Live total */}
            <div style={{
              background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.2)`, borderRadius: T.radius.md,
              padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px"
            }}>
              <div>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.color.gold, fontWeight: 600, margin: 0 }}>Live Total Score</p>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.65rem", color: T.color.textMuted, margin: "4px 0 0" }}>
                  {score >= 90 ? "Outstanding" :
                   score >= 85 ? "Excellent" :
                   score >= 80 ? "Specialty" :
                   score >= 75 ? "Very Good" : "Below Specialty"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: T.font.display, fontSize: "3rem", fontWeight: 300, color: T.color.gold, lineHeight: 1 }}>{totalScore()}</span>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.62rem", color: T.color.textFaint, margin: "4px 0 0" }}>/ 100 SCA</p>
              </div>
            </div>

            {/* SCA attribute sliders */}
            <div style={CS.card}>
              <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>SCA Protocol Attributes</p>
              {ATTRIBUTES.map(attr => {
                const valStr = scores[attr.key];
                const val = parseFloat(valStr);
                const valColor = val >= 9 ? T.color.forest : val >= 8 ? T.color.gold : val >= 7 ? T.color.coffee : T.color.red;
                return (
                  <div key={attr.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.color.border}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.9rem", color: T.color.ink, fontWeight: 500, margin: 0 }}>{attr.label}</p>
                      <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, margin: 0 }}>{attr.desc}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="range"
                        min="6" max="10" step="0.25"
                        value={scores[attr.key]}
                        onChange={e => setScore(attr.key, e.target.value)}
                        style={{ width: "140px", accentColor: T.color.forest, cursor: "pointer" }}
                      />
                      <span style={{ fontFamily: T.font.mono, fontSize: "1rem", fontWeight: 600, minWidth: "3rem", textAlign: "right", color: valColor }}>
                        {val.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Defects */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.9rem", color: T.color.red, fontWeight: 500, margin: 0 }}>Defects (penalty)</p>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, margin: 0 }}>Subtract from total</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="range"
                    min="0" max="8" step="2"
                    value={defects}
                    onChange={e => setDefects(e.target.value)}
                    style={{ width: "140px", accentColor: T.color.red, cursor: "pointer" }}
                  />
                  <span style={{ fontFamily: T.font.mono, fontSize: "1rem", fontWeight: 600, minWidth: "3rem", textAlign: "right", color: T.color.red }}>
                    -{parseFloat(defects).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={CS.card}>
              <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 16px" }}>Cupping Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "16px" }}>
                <div>
                  <label style={CS.label}>Cupping Date *</label>
                  <input style={CS.input} type="date"
                    value={cuppingDate}
                    onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label style={CS.label}>Cupping Location</label>
                  <input style={CS.input} type="text"
                    placeholder="e.g. SCA Ethiopia Lab, Addis Ababa"
                    value={location}
                    onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={CS.label}>Flavor Notes (comma separated)</label>
                <input style={CS.input} type="text"
                  placeholder="e.g. Jasmine, Bergamot, Lemon Zest, Stone Fruit"
                  value={flavorNotes}
                  onChange={e => setFlavor(e.target.value)} />
                {flavorNotes && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {flavorNotes.split(",").map(f => f.trim()).filter(Boolean).map(f => (
                      <span key={f} style={{ padding: "3px 10px", background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.2)`, borderRadius: "20px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.gold }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={CS.label}>Private Notes (not shown to buyers)</label>
                <textarea style={CS.textarea}
                  placeholder="Internal grading notes, sample preparation details..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            {error && <div style={CS.errorBanner}>{error}</div>}

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "16px" }}>
              <button style={CS.btnPrimary}
                onClick={handleSubmit}
                disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting..." : "Submit Score →"}
              </button>
              <span style={{ fontFamily: T.font.mono, fontSize: "0.6rem", color: T.color.textFaint }}>
                You will confirm before the score is locked
              </span>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
