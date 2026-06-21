import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOffers, respondToOffer } from "../api/lots";
import type { Offer } from "../api/lots";
import PageWrapper from "../components/PageWrapper";
import { Inbox, CheckCircle, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

function CounterModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const qc = useQueryClient();
  const [price, setPrice] = useState(offer.price_per_kg_usd);
  const [qty, setQty]     = useState(offer.quantity_kg);
  const [notes, setNotes] = useState("");
  const [done, setDone]   = useState(false);

  const mutation = useMutation({
    mutationFn: () => respondToOffer(offer.id, "counter", {
      counter_price: parseFloat(price),
      counter_qty: parseFloat(qty),
      exporter_notes: notes,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["offers"] }); setDone(true); },
  });

  const inp = CS.input;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,28,26,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={onClose}>
      <div style={{ ...CS.card, padding: "28px", width: "100%", maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <RefreshCw size={36} color={T.color.coffee} style={{ marginBottom: "14px", margin: "0 auto 14px" }} />
            <p style={{ fontFamily: T.font.display, fontSize: "1.4rem", color: T.color.ink, margin: "0 0 8px" }}>Counter Sent</p>
            <p style={{ fontFamily: T.font.sans, fontSize: "0.82rem", color: T.color.textMuted, margin: "0 0 20px" }}>The buyer will be notified of your counter offer.</p>
            <button onClick={onClose} style={CS.btnPrimary}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.gold, letterSpacing: "0.12em", margin: "0 0 4px", fontWeight: 600 }}>COUNTER OFFER</p>
            <p style={{ fontFamily: T.font.display, fontSize: "1.2rem", color: T.color.ink, margin: "0 0 20px", fontWeight: 500 }}>{offer.lot_name}</p>
            <div style={{ background: T.color.linen, borderRadius: T.radius.md, padding: "10px 14px", marginBottom: "18px" }}>
              <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textFaint, margin: "0 0 4px" }}>BUYER'S OFFER</p>
              <p style={{ fontFamily: T.font.display, fontSize: "1.2rem", color: T.color.gold, margin: 0, fontWeight: 500 }}>
                ${parseFloat(offer.price_per_kg_usd).toFixed(2)}/kg · {parseFloat(offer.quantity_kg).toLocaleString()} kg
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
              <div>
                <label style={CS.label}>YOUR COUNTER PRICE (USD/KG)</label>
                <input style={inp} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div>
                <label style={CS.label}>COUNTER QUANTITY (KG)</label>
                <input style={inp} type="number" value={qty} onChange={e => setQty(e.target.value)} />
              </div>
              <div>
                <label style={CS.label}>NOTE TO BUYER (OPTIONAL)</label>
                <textarea style={{ ...inp, minHeight: "64px", resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Explain your counter..." />
              </div>
            </div>
            {mutation.isError && <p style={{ fontFamily: T.font.sans, fontSize: "0.8rem", color: T.color.red, marginBottom: "12px" }}>Failed. Please try again.</p>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onClose} style={CS.btnGhost}>Cancel</button>
              <button onClick={() => mutation.mutate()} disabled={!price || !qty || mutation.isPending} style={{ ...CS.btnPrimary, flex: 2, background: T.color.forest, opacity: (!price || !qty) ? 0.5 : 1 }}>
                {mutation.isPending ? "Sending..." : "Send Counter"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OfferRow({ offer }: { offer: Offer }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCounter, setShowCounter] = useState(false);

  const respondMutation = useMutation({
    mutationFn: (action: "accept" | "reject") => respondToOffer(offer.id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });

  const isPending = offer.status === "pending";

  return (
    <>
      {showCounter && <CounterModal offer={offer} onClose={() => setShowCounter(false)} />}
      <div style={{
        ...CS.card,
        borderColor: isPending ? "rgba(184,134,11,0.2)" : T.color.border
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.gold, letterSpacing: "0.12em", margin: "0 0 2px", fontWeight: 600 }}>{offer.lot_id_display}</p>
            <p style={{ fontFamily: T.font.display, fontSize: "1.1rem", color: T.color.ink, margin: "0 0 6px", fontWeight: 500 }}>{offer.lot_name}</p>
            <p style={{ fontFamily: T.font.sans, fontSize: "0.75rem", color: T.color.textMuted, margin: 0 }}>
              From: <span style={{ color: T.color.ink, fontWeight: 500 }}>{offer.buyer_company || offer.buyer_email}</span>
              {offer.buyer_name && offer.buyer_company && ` · ${offer.buyer_name}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: T.font.mono, fontSize: "0.5rem", color: T.color.textFaint, margin: "0 0 2px" }}>OFFER</p>
              <p style={{ fontFamily: T.font.display, fontSize: "1.3rem", color: T.color.gold, margin: 0, lineHeight: 1, fontWeight: 500 }}>${parseFloat(offer.price_per_kg_usd).toFixed(2)}/kg</p>
              <p style={{ fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.textFaint, margin: "2px 0 0" }}>{parseFloat(offer.quantity_kg).toLocaleString()} kg</p>
            </div>
            {lot_fob_price(offer) && (
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.5rem", color: T.color.textFaint, margin: "0 0 2px" }}>YOUR FOB</p>
                <p style={{ fontFamily: T.font.display, fontSize: "1.3rem", color: T.color.textMuted, margin: 0, lineHeight: 1 }}>${parseFloat(lot_fob_price(offer)!).toFixed(2)}/kg</p>
              </div>
            )}
          </div>
        </div>

        {offer.notes && (
          <p style={{ fontFamily: T.font.sans, fontSize: "0.78rem", color: T.color.slate, margin: "12px 0 0", fontStyle: "italic" }}>"{offer.notes}"</p>
        )}

        {offer.delivery_window && (
          <p style={{ fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.textFaint, margin: "8px 0 0" }}>Delivery: {offer.delivery_window}</p>
        )}

        {isPending && (
          <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => respondMutation.mutate("accept")}
              disabled={respondMutation.isPending}
              style={{ ...CS.btnPrimary, background: T.color.forestLight, borderColor: "rgba(27,77,53,0.25)", color: T.color.forest }}
            >
              <CheckCircle size={12} /> Accept
            </button>
            <button
              onClick={() => setShowCounter(true)}
              style={{ ...CS.btnGhost, background: T.color.coffeeLight, borderColor: "rgba(123,75,42,0.25)", color: T.color.coffee }}
            >
              <RefreshCw size={12} /> Counter
            </button>
            <button
              onClick={() => respondMutation.mutate("reject")}
              disabled={respondMutation.isPending}
              style={{ ...CS.btnGhost, borderColor: "rgba(192,57,43,0.25)", color: T.color.red }}
            >
              <XCircle size={12} /> Reject
            </button>
            <button
              onClick={() => navigate(`/marketplace/${offer.lot}`)}
              style={CS.btnGhost}
            >
              <ArrowRight size={12} /> View Lot
            </button>
          </div>
        )}

        {!isPending && (
          <p style={{ fontFamily: T.font.mono, fontSize: "0.55rem", color: offer.status === "accepted" ? T.color.forest : T.color.red, margin: "12px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            {offer.status}
          </p>
        )}

        <p style={{ fontFamily: T.font.mono, fontSize: "0.5rem", color: T.color.textFaint, margin: "10px 0 0" }}>
          Received {new Date(offer.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </>
  );
}

function lot_fob_price(offer: Offer) { return offer.lot_fob_price; }

export default function ExporterOffers() {
  const [filter, setFilter] = useState<Offer["status"] | "all">("pending");
  const { data, isLoading } = useQuery({ queryKey: ["offers"], queryFn: getOffers });

  const offers: Offer[] = data ?? [];
  const filtered: Offer[] = filter === "all" ? offers : offers.filter((o: Offer) => o.status === filter);
  const pendingCount = offers.filter((o: Offer) => o.status === "pending").length;

  // Group by lot
  const grouped = filtered.reduce((acc: Record<string, { lot_name: string; lot_id: string; offers: Offer[] }>, o: Offer) => {
    const key = o.lot_id_display;
    if (!acc[key]) acc[key] = { lot_name: o.lot_name, lot_id: o.lot_id_display, offers: [] };
    acc[key].offers.push(o);
    return acc;
  }, {} as Record<string, { lot_name: string; lot_id: string; offers: Offer[] }>);

  return (
    <PageWrapper>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={CS.pageTitle}>Offer Inbox</h1>
        <p style={CS.pageSubtitle}>
          Review, accept, counter, or reject offers from buyers
        </p>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
        {(["pending", "all", "accepted", "countered", "rejected"] as const).map(s => {
          const isActive = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: "5px 14px", borderRadius: "20px",
                border: `1px solid ${isActive ? T.color.gold : T.color.border}`,
                background: isActive ? T.color.goldLight : "transparent",
                fontFamily: T.font.mono, fontSize: "0.58rem", letterSpacing: "0.08em",
                color: isActive ? T.color.gold : T.color.textMuted,
                cursor: "pointer", textTransform: "uppercase", fontWeight: isActive ? 600 : 400
              }}>
              {s}{s === "pending" && pendingCount ? ` (${pendingCount})` : ""}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <p style={{ fontFamily: T.font.mono, fontSize: "0.7rem", color: T.color.textFaint, textAlign: "center", padding: "60px" }}>Loading...</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Inbox size={32} color={T.color.textGhost} style={{ marginBottom: "16px", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: T.font.display, fontSize: "1.3rem", color: T.color.textMuted, margin: "0 0 8px" }}>
            {filter === "pending" ? "No pending offers" : "No offers here"}
          </p>
          <p style={{ fontFamily: T.font.sans, fontSize: "0.82rem", color: T.color.textFaint, margin: 0 }}>
            Offers from buyers will appear here once submitted.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {Object.values(grouped).map(group => (
          <div key={group.lot_id}>
            {Object.keys(grouped).length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.textFaint, letterSpacing: "0.12em", margin: 0 }}>{group.lot_id}</p>
                <p style={{ fontFamily: T.font.sans, fontSize: "0.82rem", color: T.color.textMuted, margin: 0 }}>{group.lot_name}</p>
                <div style={{ flex: 1, height: "1px", background: T.color.border }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {group.offers.map(offer => <div key={offer.id}><OfferRow offer={offer} /></div>)}
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
