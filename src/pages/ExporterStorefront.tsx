import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import type { CoffeeLot } from "../api/lots";
import PageWrapper from "../components/PageWrapper";
import { useWatchlist } from "../hooks/useWatchlist";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, Award, MapPin, Calendar, Mountain,
  TrendingUp, FlaskConical, Heart, ArrowLeft, BadgeCheck
} from "lucide-react";
import { T } from "../styles/tokens";
import { CS } from "../styles/components";

interface ExporterProfile {
  id: number;
  full_name: string;
  company_name: string;
  country: string;
  bio: string;
  is_verified: boolean;
  date_joined: string;
  ecta_license_number: string;
  ecta_license_expiry: string;
  lots_count: number;
  exported_count: number;
  avg_sca_score: number | null;
}

const PROCESS_COLOR: Record<string, string> = {
  washed:  T.color.forest,
  natural: T.color.gold,
  honey:   T.color.coffee,
};

export default function ExporterStorefront() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggle, isWatched } = useWatchlist();
  const isBuyer = user?.role === "buyer" || user?.role === "admin";

  const { data: profile, isLoading: profileLoading } = useQuery<ExporterProfile>({
    queryKey: ["exporter", id],
    queryFn: async () => {
      const { data } = await api.get(`/v1/auth/exporters/${id}/`);
      return data;
    },
    enabled: !!id,
  });

  const { data: lotsData, isLoading: lotsLoading } = useQuery({
    queryKey: ["exporter-lots", id],
    queryFn: async () => {
      const { data } = await api.get(`/v1/auth/exporters/${id}/lots/`);
      return data;
    },
    enabled: !!id,
  });

  const lots: CoffeeLot[] = lotsData?.results ?? [];

  if (profileLoading) return (
    <PageWrapper>
      <div style={{ textAlign: "center", padding: "80px", fontFamily: T.font.mono, fontSize: "0.75rem", color: T.color.textFaint }}>
        Loading...
      </div>
    </PageWrapper>
  );

  if (!profile) return (
    <PageWrapper>
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ fontFamily: T.font.mono, color: T.color.textFaint }}>Exporter not found.</p>
      </div>
    </PageWrapper>
  );

  const memberSince = new Date(profile.date_joined).getFullYear();

  return (
    <PageWrapper>
      {/* Back */}
      <button onClick={() => navigate("/marketplace")}
        style={CS.btnGhost}>
        <ArrowLeft size={14} /> Back to Marketplace
      </button>

      {/* Profile hero */}
      <div style={CS.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: T.radius.md,
                background: T.color.forestLight, border: `1px solid rgba(27,77,53,0.15)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.font.display, fontSize: "1.6rem", color: T.color.forest, flexShrink: 0
              }}>
                {profile.company_name?.[0] || profile.full_name?.[0]}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <h1 style={{ fontFamily: T.font.display, fontSize: "1.6rem", fontWeight: 500, color: T.color.ink, margin: 0, lineHeight: 1 }}>
                    {profile.company_name || profile.full_name}
                  </h1>
                  {profile.is_verified && (
                    <BadgeCheck size={16} color={T.color.forest} />
                  )}
                </div>
                {profile.company_name && (
                  <p style={{ fontFamily: T.font.sans, fontSize: "0.82rem", color: T.color.textMuted, margin: 0 }}>
                    {profile.full_name}
                  </p>
                )}
                <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint }}>
                    <MapPin size={9} /> {profile.country}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint }}>
                    <Calendar size={9} /> Member since {memberSince}
                  </span>
                  {profile.ecta_license_number && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.forest, fontWeight: 600 }}>
                      <ShieldCheck size={9} /> ECTA {profile.ecta_license_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{ fontFamily: T.font.sans, fontSize: "0.875rem", color: T.color.slate, lineHeight: 1.7, margin: 0 }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats block */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: T.color.border, borderRadius: T.radius.lg, overflow: "hidden", alignSelf: "flex-start", minWidth: "280px" }}>
            {[
              ["Active Lots", profile.lots_count],
              ["Exported",    profile.exported_count],
              ["Avg SCA",     profile.avg_sca_score ? profile.avg_sca_score.toFixed(1) : "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ background: T.color.linen, padding: "16px", textAlign: "center" }}>
                <p style={{ fontFamily: T.font.display, fontSize: "1.8rem", fontWeight: 500, color: T.color.coffee, margin: "0 0 3px", lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.textMuted, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lots section */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: T.font.mono, fontSize: "0.6rem", letterSpacing: "0.2em", color: T.color.textMuted, textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
          Active Lots · {lots.length}
        </p>
      </div>

      {lotsLoading && (
        <p style={{ fontFamily: T.font.mono, fontSize: "0.7rem", color: T.color.textFaint, textAlign: "center", padding: "40px" }}>Loading lots...</p>
      )}

      {!lotsLoading && lots.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: T.color.white, borderRadius: T.radius.md, border: `1px solid ${T.color.border}` }}>
          <p style={{ fontFamily: T.font.display, fontSize: "1.2rem", color: T.color.textFaint, margin: 0 }}>No active lots at the moment.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {lots.map(lot => (
          <div key={lot.id}
            style={CS.card}
            onClick={() => navigate(`/marketplace/${lot.id}`)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.52rem", color: T.color.gold, letterSpacing: "0.15em", margin: "0 0 2px", fontWeight: 600 }}>
                  {lot.lot_id}
                </p>
                <p style={{ fontFamily: T.font.display, fontSize: "1.15rem", color: T.color.ink, margin: "0 0 6px", lineHeight: 1.2, fontWeight: 500 }}>
                  {lot.name}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: T.font.mono, fontSize: "0.58rem", color: T.color.textFaint, textTransform: "capitalize" }}>
                    <Mountain size={9} /> {lot.region} · {lot.altitude_m}m
                  </span>
                  <span style={{ fontFamily: T.font.mono, fontSize: "0.58rem", color: PROCESS_COLOR[lot.processing] || T.color.textMuted, textTransform: "capitalize", fontWeight: 600 }}>
                    {lot.processing} · {lot.grade}
                  </span>
                  {lot.is_eudr_ready && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.forest, fontWeight: 600 }}>
                      <ShieldCheck size={9} /> EUDR
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: T.font.mono, fontSize: "0.55rem", color: T.color.textFaint }}>
                    <Award size={9} /> {lot.compliance_score ?? 0}/7
                  </span>
                </div>
                {lot.flavor_tags?.length > 0 && (
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "10px" }}>
                    {lot.flavor_tags.slice(0, 4).map(tag => (
                      <span key={tag} style={{ padding: "3px 10px", background: T.color.goldLight, border: `1px solid rgba(184,134,11,0.15)`, borderRadius: "20px", fontFamily: T.font.sans, fontSize: "0.72rem", color: T.color.gold }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                <p style={{ fontFamily: T.font.display, fontSize: "1.6rem", fontWeight: 500, color: T.color.gold, margin: 0, lineHeight: 1 }}>
                  {lot.fob_price_usd ? `$${parseFloat(lot.fob_price_usd).toFixed(2)}` : "POA"}
                </p>
                <p style={{ fontFamily: T.font.mono, fontSize: "0.5rem", color: T.color.textFaint, margin: 0 }}>per kg FOB</p>
                {lot.latest_sca_score && (
                  <p style={{ fontFamily: T.font.display, fontSize: "1.1rem", color: T.color.gold, margin: "4px 0 0", opacity: 0.7, fontWeight: 500 }}>
                    {parseFloat(String(lot.latest_sca_score)).toFixed(1)} SCA
                  </p>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => navigate(`/marketplace/${lot.id}`)}
                style={CS.btnGhost}>
                View Lot
              </button>
              {isBuyer && (
                <button onClick={() => navigate(`/marketplace/${lot.id}?offer=1`)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", ...CS.btnPrimary }}>
                  <TrendingUp size={12} /> Make Offer
                </button>
              )}
              {isBuyer && (
                <button onClick={() => navigate(`/marketplace/${lot.id}?sample=1`)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", ...CS.btnGhost, color: T.color.forest, borderColor: "rgba(27,77,53,0.25)" }}>
                  <FlaskConical size={12} /> Ask Sample
                </button>
              )}
              {isBuyer && (
                <button onClick={() => toggle(lot.id)}
                  style={{ display: "flex", alignItems: "center", background: "transparent", border: `1px solid ${isWatched(lot.id) ? "rgba(27,77,53,0.3)" : T.color.border}`, borderRadius: T.radius.md, padding: "8px 10px", color: isWatched(lot.id) ? T.color.forest : T.color.textGhost, cursor: "pointer", marginLeft: "auto" }}>
                  <Heart size={12} fill={isWatched(lot.id) ? T.color.forest : "none"} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
