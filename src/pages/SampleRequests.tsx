import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getSampleRequests, respondToSample } from "../api/samples";
import PageWrapper from "../components/PageWrapper";
import { CheckCircle, XCircle, Truck, Clock, Package, MessageSquare } from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

export default function SampleRequests() {
  const { user }    = useAuth();
  const queryClient = useQueryClient();
  const role        = user?.role ?? "buyer";
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseForm, setResponseForm] = useState({ status: "approved", response: "", tracking_number: "" });
  const [error, setError] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["sample-requests"],
    queryFn:  getSampleRequests,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof responseForm }) =>
      respondToSample(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
      setRespondingId(null);
      setResponseForm({ status: "approved", response: "", tracking_number: "" });
      setError("");
    },
    onError: () => setError("Failed to respond. Please try again."),
  });

  const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    pending:   { color: T.color.gold,   bg: T.color.goldLight,   border: "rgba(184,134,11,0.2)",   icon: <Clock size={11} />       },
    approved:  { color: T.color.forest, bg: T.color.forestLight, border: "rgba(27,77,53,0.2)",    icon: <CheckCircle size={11} /> },
    rejected:  { color: T.color.red,    bg: T.color.redLight,    border: "rgba(192,57,43,0.2)",   icon: <XCircle size={11} />     },
    shipped:   { color: T.color.coffee, bg: T.color.coffeeLight, border: "rgba(123,75,42,0.2)",   icon: <Truck size={11} />       },
    received:  { color: T.color.forest, bg: T.color.forestLight, border: "rgba(27,77,53,0.25)",    icon: <Package size={11} />     },
  };

  const inp = CS.input;
  const sel = CS.input;

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={CS.pageTitle}>Sample Requests</h1>
        <p style={CS.pageSubtitle}>
          {role === "buyer" ? "Your sample requests" : "Incoming requests from buyers"}
        </p>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "64px", fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
          Loading...
        </div>
      )}

      {!isLoading && (!requests || requests.length === 0) && (
        <div style={{ textAlign: "center", padding: "64px", ...CS.card }}>
          <MessageSquare size={32} color={T.color.textGhost} style={{ marginBottom: "12px", margin: "0 auto 12px" }} />
          <p style={{ fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
            No sample requests yet.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {requests?.map(req => {
          const sc = STATUS_CONFIG[req.status];
          const isResponding = respondingId === req.id;
          return (
            <div key={req.id} style={CS.card}>

              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.62rem", color: T.color.coffee, margin: "0 0 2px", letterSpacing: "0.08em" }}>
                    {req.lot_ref}
                  </p>
                  <p style={{ fontFamily: T.font.sans, fontSize: "0.95rem", fontWeight: 500, color: T.color.ink, margin: "0 0 2px" }}>
                    {req.lot_name}
                  </p>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, margin: 0 }}>
                    {req.lot_region}
                  </p>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "4px 10px", borderRadius: "20px",
                  fontFamily: T.font.mono, fontSize: "0.58rem",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  background: sc?.bg, border: `1px solid ${sc?.border}`, color: sc?.color,
                }}>
                  {sc?.icon} {req.status}
                </span>
              </div>

              {/* Meta grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "14px" }}>
                {[
                  { label: role === "exporter" ? "Buyer" : "Sample Size", val: role === "exporter" ? (req.buyer_name || req.buyer_email) : `${req.quantity_g}g` },
                  { label: role === "exporter" ? "Company" : "Requested", val: role === "exporter" ? (req.buyer_company || "—") : new Date(req.created_at).toLocaleDateString() },
                  { label: "Quantity", val: `${req.quantity_g}g` },
                ].map(m => (
                  <div key={m.label} style={{ background: T.color.linen, borderRadius: T.radius.sm, padding: "8px 10px" }}>
                    <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 3px" }}>{m.label}</p>
                    <p style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.ink, margin: 0 }}>{m.val}</p>
                  </div>
                ))}
              </div>

              {/* Message */}
              {req.message && (
                <div style={{ background: T.color.linen, borderRadius: T.radius.sm, padding: "10px 12px", marginBottom: "8px" }}>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.color.textFaint, margin: "0 0 4px" }}>Message</p>
                  <p style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.slate, margin: 0, lineHeight: 1.5 }}>{req.message}</p>
                </div>
              )}

              {/* Response */}
              {req.response && (
                <div style={{ background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)`, borderRadius: T.radius.sm, padding: "10px 12px", marginBottom: "8px" }}>
                  <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.color.forest, margin: "0 0 4px", opacity: 0.7 }}>Response</p>
                  <p style={{ fontFamily: T.font.sans, fontSize: "0.825rem", color: T.color.forest, margin: 0, lineHeight: 1.5 }}>{req.response}</p>
                </div>
              )}

              {/* Tracking */}
              {req.tracking_number && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: T.color.coffeeLight, border: `1px solid rgba(123,75,42,0.15)`, borderRadius: T.radius.sm, padding: "8px 12px", marginBottom: "8px" }}>
                  <Truck size={12} color={T.color.coffee} />
                  <span style={{ fontFamily: T.font.mono, fontSize: "0.68rem", color: T.color.coffee }}>
                    Tracking: {req.tracking_number}
                  </span>
                </div>
              )}

              {/* Exporter actions */}
              {role === "exporter" && req.status === "pending" && !isResponding && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => setRespondingId(req.id)} style={CS.btnPrimary}>
                    Respond
                  </button>
                </div>
              )}

              {role === "exporter" && req.status === "approved" && !isResponding && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { setRespondingId(req.id); setResponseForm(f => ({ ...f, status: "shipped" })); }} style={CS.btnGhost}>
                    Mark Shipped
                  </button>
                </div>
              )}

              {/* Response form */}
              {isResponding && (
                <div style={{ background: T.color.linen, border: `1px solid ${T.color.border}`, borderRadius: T.radius.md, padding: "16px", marginTop: "12px" }}>
                  <label style={CS.label}>
                    Decision
                  </label>
                  <select style={{ ...sel, marginBottom: "12px" }} value={responseForm.status}
                    onChange={e => setResponseForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="shipped">Mark as Shipped</option>
                  </select>
                  <label style={CS.label}>
                    Message to buyer
                  </label>
                  <input style={{ ...inp, marginBottom: "12px" }} placeholder="Your response..."
                    value={responseForm.response}
                    onChange={e => setResponseForm(f => ({ ...f, response: e.target.value }))} />
                  {responseForm.status === "shipped" && (
                    <>
                      <label style={CS.label}>
                        Tracking Number
                      </label>
                      <input style={{ ...inp, marginBottom: "12px" }} placeholder="e.g. ET123456789"
                        value={responseForm.tracking_number}
                        onChange={e => setResponseForm(f => ({ ...f, tracking_number: e.target.value }))} />
                    </>
                  )}
                  {error && (
                    <div style={{ ...CS.errorBanner, marginBottom: "12px" }}>
                      {error}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => respondMutation.mutate({ id: req.id, payload: responseForm })}
                      disabled={respondMutation.isPending}
                      style={CS.btnPrimary}>
                      {respondMutation.isPending ? "Saving..." : "Confirm"}
                    </button>
                    <button onClick={() => { setRespondingId(null); setError(""); }} style={CS.btnGhost}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
