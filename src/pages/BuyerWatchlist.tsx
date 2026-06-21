import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLots } from "../api/lots";
import { useWatchlist } from "../hooks/useWatchlist";
import PageWrapper from "../components/PageWrapper";
import {
  Heart, ShieldCheck, Mountain, TrendingUp, FlaskConical, Leaf, X
} from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

export default function BuyerWatchlist() {
  const navigate = useNavigate();
  const { ids, toggle } = useWatchlist();

  const { data, isLoading } = useQuery({
    queryKey: ["marketplace"],
    queryFn: () => getLots({ status: "listed" }),
    enabled: ids.length > 0,
  });

  const watched = (data?.results ?? []).filter(lot => ids.includes(lot.id));

  return (
    <PageWrapper>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={CS.pageTitle}>Watchlist</h1>
        <p style={CS.pageSubtitle}>
          Lots you've saved for quick access.
        </p>
      </div>

      {ids.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Heart size={32} color={T.color.textGhost} style={{ marginBottom: "16px", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: T.font.display, fontSize: "1.3rem", color: T.color.textMuted, margin: "0 0 8px" }}>No saved lots</p>
          <p style={{ fontFamily: T.font.sans, fontSize: "0.82rem", color: T.color.textGhost, margin: "0 0 20px" }}>
            Tap the heart icon on any lot card in the marketplace.
          </p>
          <button onClick={() => navigate("/marketplace")}
            style={CS.btnPrimary}>
            Browse Marketplace
          </button>
        </div>
      )}

      {isLoading && ids.length > 0 && (
        <p style={{ fontFamily: T.font.mono, fontSize: "0.7rem", color: T.color.textFaint, textAlign: "center", padding: "60px" }}>Loading...</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {watched.map(lot => (
          <div key={lot.id}
            style={CS.card}
            onClick={() => navigate(`/marketplace/${lot.id}`)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.gold, letterSpacing: "0.15em", margin: "0 0 2px", fontWeight: 600 }}>
                  {lot.lot_id} · {lot.region?.toUpperCase()}
                </p>
                <p style={{ fontFamily: T.font.display, fontSize: "1.2rem", color: T.color.ink, margin: "0 0 6px", lineHeight: 1.2, fontWeight: 500 }}>
                  {lot.name}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint }}>
                    <Mountain size={9} /> {lot.altitude_m}m
                  </span>
                  <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, textTransform: "capitalize" }}>
                    {lot.processing} · {lot.grade}
                  </span>
                  {lot.is_eudr_ready && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.forest, fontWeight: 600 }}>
                      <ShieldCheck size={9} /> EUDR
                    </span>
                  )}
                  {lot.is_organic && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.forest, fontWeight: 600 }}>
                      <Leaf size={9} /> Organic
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                <p style={{ fontFamily: T.font.display, fontSize: "1.5rem", fontWeight: 500, color: T.color.gold, margin: 0, lineHeight: 1 }}>
                  {lot.fob_price_usd ? `$${parseFloat(lot.fob_price_usd).toFixed(2)}` : "POA"}
                </p>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textFaint, margin: 0 }}>per kg FOB</p>
              </div>
            </div>

            {lot.flavor_tags?.length > 0 && (
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "12px" }}>
                {lot.flavor_tags.slice(0, 4).map(tag => (
                  <span key={tag} style={{ padding: "3px 10px", background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.15)`, borderRadius: "20px", fontFamily: T.font.sans, fontSize: "0.72rem", color: T.color.gold }}>{tag}</span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => navigate(`/marketplace/${lot.id}?offer=1`)}
                style={{ display: "flex", alignItems: "center", gap: "6px", ...CS.btnPrimary }}>
                <TrendingUp size={12} /> Make Offer
              </button>
              <button onClick={() => navigate(`/marketplace/${lot.id}?sample=1`)}
                style={{ display: "flex", alignItems: "center", gap: "6px", ...CS.btnGhost, color: T.color.forest, borderColor: "rgba(27,77,53,0.25)" }}>
                <FlaskConical size={12} /> Ask Sample
              </button>
              <button onClick={() => toggle(lot.id)}
                title="Remove from watchlist"
                style={{ display: "flex", alignItems: "center", gap: "6px", ...CS.btnGhost, marginLeft: "auto", color: T.color.red, borderColor: "rgba(192,57,43,0.15)" }}>
                <X size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
