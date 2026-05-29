"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, ArrowLeft, Ticket } from "lucide-react";
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

  const searchBadge = async () => {
    setLoading(true); setError(""); setBadge(null);
    const params = searchBy === "code" ? `code=${code}` : `email=${email}`;
    try {
      const res = await fetch(`/api/badges?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Badge introuvable");
      setBadge(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Badge introuvable"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-secondary noise-overlay relative pt-24 pb-16">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto px-4">
          <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-5 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t.register.backToEvent}
          </Link>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
              <Ticket className="w-7 h-7 text-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.badge.getYourBadge}</h1>
            <p className="text-muted">{t.badge.getYourBadgeSub}</p>
          </div>

          {!badge && (
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] shadow-2xl p-7 sm:p-8 border border-black/5 dark:border-white/10 animate-fade-in">
              <div className="flex gap-1.5 p-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl mb-6">
                {(["code", "email"] as const).map((tab) => (
                  <button key={tab} onClick={() => setSearchBy(tab)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${searchBy === tab ? "bg-primary text-foreground shadow-md" : "text-muted hover:text-foreground"}`}>
                    {tab === "code" ? t.badge.byCode : t.badge.byEmail}
                  </button>
                ))}
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}</div>}
              {searchBy === "code" ? (
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">{t.badge.byCode}</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full px-4 py-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl font-bold tracking-[0.3em] uppercase text-foreground placeholder:text-gray-600" placeholder="A1B2C3D4..." maxLength={32} />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">{t.badge.byEmail}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="jean@exemple.com" />
                </div>
              )}
              <button onClick={searchBadge} disabled={loading || (searchBy === "code" ? !code : !email)} className="btn-primary w-full mt-5 py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.badge.searching}</> : <><Search className="w-4 h-4" /> {t.badge.findBadge}</>}
              </button>
            </div>
          )}

          {badge && (
            <div className="animate-scale-in">
              <div className="rounded-[24px] shadow-2xl overflow-hidden border border-black/5 dark:border-white/10">
                {/* Header — dark gradient */}
                <div
                  className="p-6 text-center"
                  style={{ background: "linear-gradient(135deg, #0f172a 0%, #3b1f6e 100%)" }}
                >
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">QualiEvents</p>
                  <h3 className="text-white text-lg font-bold leading-tight">{badge.eventTitle}</h3>
                  <p className="text-white/60 text-xs mt-1">
                    {new Date(badge.eventDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>

                {/* Body */}
                <div className="bg-white p-8 text-center">
                  {/* Event logo or initials */}
                  <div className="flex justify-center mb-4">
                    {badge.eventLogoUrl ? (
                      <img
                        src={badge.eventLogoUrl}
                        alt={badge.eventTitle}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: "linear-gradient(135deg, #3b1f6e, #6d28d9)" }}
                      >
                        {badge.eventTitle.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Badge number */}
                  <p
                    className="text-sm font-bold tracking-widest mb-4"
                    style={{ color: "#E8C547" }}
                  >
                    #{String(badge.badgeNumber).padStart(3, "0")}
                  </p>

                  {/* QR Code */}
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-md mb-5 border border-gray-100">
                    <img src={badge.qrData} alt="QR Code" className="w-40 h-40" />
                  </div>

                  {/* Attendee info */}
                  <h3 className="text-xl font-bold text-gray-900">{badge.subscriberName}</h3>
                  {badge.subscriberCompany && (
                    <p className="text-gray-500 text-sm mt-0.5">{badge.subscriberCompany}</p>
                  )}
                  {badge.subscriberJobTitle && (
                    <p className="text-gray-400 text-xs mt-0.5">{badge.subscriberJobTitle}</p>
                  )}

                  {badge.isScanned && (
                    <div className="mt-4 bg-green-50 text-green-600 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> {t.badge.scanned}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-3 text-center text-[11px] font-medium"
                  style={{ background: "#0f172a", color: "rgba(255,255,255,0.45)" }}
                >
                  QualiEvents · Présentez ce badge à l&apos;entrée
                </div>

                {/* Actions */}
                <div className="bg-white px-8 pb-8 pt-4 space-y-3">
                  <a
                    href={`/api/badges/pdf?code=${badge.code}`}
                    download={`badge-${badge.code}.pdf`}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                  >
                    Télécharger PDF
                  </a>
                  <button
                    onClick={() => { setBadge(null); setCode(""); setEmail(""); }}
                    className="w-full bg-black/5 dark:bg-white/5 hover:bg-white/10 text-muted hover:text-foreground border border-black/5 dark:border-white/10 py-3.5 rounded-[10px] text-sm font-medium transition-colors"
                  >
                    {t.badge.searchAnother}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
