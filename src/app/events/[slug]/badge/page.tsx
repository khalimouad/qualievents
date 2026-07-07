"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, ArrowLeft, Download, Ticket, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";

interface BadgeInfo {
  code: string;
  badgeNumber: number;
  qrData: string;
  subscriberName: string;
  subscriberEmail: string;
  subscriberCompany: string | null;
  subscriberJobTitle: string | null;
  eventTitle: string;
  eventDate: string;
  eventLogoUrl: string | null;
  eventThemeColor: string | null;
  isScanned: boolean;
}

export default function EventBadgePage() {
  const { slug } = useParams<{ slug: string }>();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [badge, setBadge] = useState<BadgeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchBy, setSearchBy] = useState<"code" | "email">("code");
  const [emailSent, setEmailSent] = useState(false);

  const searchBadge = async () => {
    setLoading(true); setError(""); setBadge(null);

    if (searchBy === "email") {
      try {
        const res = await fetch("/api/badges/resend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, eventSlug: slug }),
        });
        if (!res.ok) throw new Error("Erreur, veuillez réessayer");
        setEmailSent(true);
      } catch (e) { setError(e instanceof Error ? e.message : "Erreur, veuillez réessayer"); }
      finally { setLoading(false); }
      return;
    }

    try {
      const res = await fetch(`/api/badges?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Badge introuvable");
      setBadge(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Badge introuvable"); }
    finally { setLoading(false); }
  };

  const accent = badge?.eventThemeColor || "#E8C547";
  const formattedDate = badge
    ? new Date(badge.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16" style={{ background: "var(--background)" }}>
        <div className="max-w-sm mx-auto px-4 py-10">
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft className="w-4 h-4" /> {t.register.backToEvent}
          </Link>

          {emailSent ? (
            <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 8px 24px rgba(255,122,0,0.3)" }}
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black mb-2" style={{ color: "var(--foreground)" }}>{t.badge.checkInbox}</h1>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{t.badge.checkInboxSub}</p>
              <button
                onClick={() => { setEmailSent(false); setEmail(""); }}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-colors border hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                {t.badge.searchAgain}
              </button>
            </div>
          ) : !badge ? (
            <>
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 8px 24px rgba(255,122,0,0.3)" }}
                >
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black mb-1" style={{ color: "var(--foreground)" }}>
                  {t.badge.getYourBadge}
                </h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{t.badge.getYourBadgeSub}</p>
              </div>

              <div className="rounded-2xl p-6 border" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "var(--border)" }}>
                  {(["code", "email"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setSearchBy(tab); setError(""); }}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all"
                      style={searchBy === tab
                        ? { background: "var(--gold)", color: "#0C0B09" }
                        : { color: "var(--muted)" }
                      }
                    >
                      {tab === "code" ? t.badge.byCode : t.badge.byEmail}
                    </button>
                  ))}
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {error}
                  </div>
                )}

                {searchBy === "code" ? (
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-4 rounded-xl outline-none text-center text-xl font-black tracking-[0.25em] uppercase transition-all"
                    style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                    placeholder="XXXXXXXX"
                    maxLength={32}
                  />
                ) : (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl outline-none text-sm transition-all"
                      style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                      placeholder="jean@exemple.com"
                    />
                    <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>{t.badge.emailBadgeHint}</p>
                  </>
                )}

                <button
                  onClick={searchBadge}
                  disabled={loading || (searchBy === "code" ? !code : !email)}
                  className="w-full mt-4 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: "var(--gold)", color: "#0C0B09" }}
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" /> {searchBy === "code" ? t.badge.searching : t.badge.sending}</>
                    : searchBy === "code"
                      ? <><Search className="w-4 h-4" /> {t.badge.findBadge}</>
                      : <><Search className="w-4 h-4" /> {t.badge.emailBadge}</>
                  }
                </button>
              </div>
            </>
          ) : (
            <div className="animate-fade-in">
              {/* ── Badge Card ─────────────────────── */}
              <div className="rounded-[22px] overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

                {/* Lanyard hole */}
                <div className="flex justify-center items-center gap-5 h-8" style={{ background: "#e8edf2" }}>
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: "#c8d0da" }} />
                  <div className="w-5 h-5 rounded-full border-2 shadow-inner" style={{ borderColor: "#b0bbc8", background: "#f8fafc" }} />
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: "#c8d0da" }} />
                </div>

                {/* Header */}
                <div
                  className="px-7 pt-6 pb-14 text-center relative"
                  style={{ background: "linear-gradient(160deg, #0d1827 0%, #162236 50%, #0d1827 100%)" }}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Qualivoire Connect
                  </p>
                  <h3 className="text-white font-black text-lg leading-snug">{badge.eventTitle}</h3>
                  <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>{formattedDate}</p>
                </div>

                {/* Logo (overlaps header/body boundary) */}
                <div className="bg-white flex flex-col items-center pt-0 pb-1">
                  <div className="relative z-10 -mt-9 mb-2.5">
                    <div
                      className="w-[72px] h-[72px] rounded-2xl overflow-hidden"
                      style={{ border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                    >
                      {badge.eventLogoUrl ? (
                        <img src={badge.eventLogoUrl} alt={badge.eventTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-black text-xl text-white"
                          style={{ background: "linear-gradient(135deg, #0d1827, #1e3a5f)" }}
                        >
                          {badge.eventTitle.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: accent }}>
                    #{String(badge.badgeNumber).padStart(3, "0")}
                  </p>
                </div>

                {/* QR Code */}
                <div className="bg-white flex flex-col items-center px-8 pb-6 pt-3">
                  <div
                    className="p-4 rounded-2xl mb-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    <img src={badge.qrData} alt="QR Code" className="w-44 h-44 block" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "#94a3b8" }}>
                    Scannez à l&apos;entrée
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#f1f5f9" }} />

                {/* Attendee info */}
                <div className="bg-white px-7 py-5 text-center">
                  <h2 className="text-xl font-black" style={{ color: "#0f172a" }}>{badge.subscriberName}</h2>
                  {badge.subscriberJobTitle && (
                    <p className="text-sm font-bold mt-1" style={{ color: accent }}>{badge.subscriberJobTitle}</p>
                  )}
                  {badge.subscriberCompany && (
                    <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{badge.subscriberCompany}</p>
                  )}
                  {badge.isScanned && (
                    <div
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.badge.scanned}
                    </div>
                  )}
                </div>

                {/* Footer strip */}
                <div className="px-7 py-3 text-center" style={{ background: "#0d1827" }}>
                  <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.28)" }}>
                    Qualivoire Connect · Présentez ce badge à l&apos;entrée
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-3">
                <a
                  href={`/api/badges/pdf?code=${badge.code}`}
                  download={`badge-${badge.code}.pdf`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
                  style={{ background: "var(--gold)", color: "#0C0B09" }}
                >
                  <Download className="w-4 h-4" /> Télécharger PDF
                </a>
                <button
                  onClick={() => { setBadge(null); setCode(""); setEmail(""); }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition-colors border hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  {t.badge.searchAnother}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
