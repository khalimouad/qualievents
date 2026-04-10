"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Search, ArrowLeft, Download, Shield, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";

interface BadgeInfo {
  code: string;
  qrData: string;
  subscriberName: string;
  subscriberEmail: string;
  subscriberCompany: string | null;
  eventTitle: string;
  eventDate: string;
  isScanned: boolean;
}

export default function BadgePage() {
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
      if (!res.ok) throw new Error(data.error || "Badge not found");
      setBadge(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Badge not found"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-secondary mb-8 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-2">Get Your Badge</h1>
            <p className="text-muted">Retrieve your event badge using your code or email</p>
          </div>

          {!badge && (
            <div className="bg-white rounded-[24px] shadow-lg p-7 sm:p-8 border border-gray-100 animate-fade-in">
              {/* Tab switcher */}
              <div className="flex gap-1.5 p-1.5 bg-gray-100 rounded-xl mb-6">
                {(["code", "email"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSearchBy(tab)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      searchBy === tab
                        ? "bg-white text-secondary shadow-sm"
                        : "text-muted hover:text-secondary"
                    }`}
                  >
                    {tab === "code" ? "Badge Code" : "Email Address"}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {error}
                </div>
              )}

              {searchBy === "code" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Badge Code</label>
                  <input
                    type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-center text-2xl font-bold tracking-[0.3em] uppercase"
                    placeholder="A1B2C3D4" maxLength={8}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              )}

              <button
                onClick={searchBadge} disabled={loading || (searchBy === "code" ? !code : !email)}
                className="btn-primary w-full mt-5 py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching...</>
                ) : (
                  <><Search className="w-4 h-4" /> Find My Badge</>
                )}
              </button>
            </div>
          )}

          {badge && (
            <div className="animate-scale-in">
              {/* Badge Card */}
              <div className="bg-white rounded-[24px] shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-secondary via-secondary-light to-accent p-8 text-center noise-overlay grid-pattern">
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mb-3">
                      <Shield className="w-3 h-3 text-success" />
                      <span className="text-white/80 text-xs font-medium">Verified Badge</span>
                    </div>
                    <h3 className="text-white text-xl font-bold">{badge.eventTitle}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(badge.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* QR Code section */}
                <div className="p-8 text-center">
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-gray-100 mb-5">
                    <img src={badge.qrData} alt="Badge QR Code" className="w-44 h-44" />
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                    <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-semibold mb-1">Badge Code</p>
                    <p className="text-3xl font-bold text-gradient tracking-[0.2em]">{badge.code}</p>
                  </div>

                  <h3 className="text-xl font-bold text-secondary">{badge.subscriberName}</h3>
                  <p className="text-muted text-sm">{badge.subscriberEmail}</p>
                  {badge.subscriberCompany && <p className="text-gray-400 text-xs mt-0.5">{badge.subscriberCompany}</p>}

                  {badge.isScanned && (
                    <div className="mt-4 bg-success/5 text-success border border-success/20 px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" /> Badge has been scanned
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 space-y-3">
                  <button
                    onClick={() => { const link = document.createElement("a"); link.href = badge.qrData; link.download = `badge-${badge.code}.png`; link.click(); }}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Badge
                  </button>
                  <button
                    onClick={() => { setBadge(null); setCode(""); setEmail(""); }}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-muted hover:text-secondary py-3.5 rounded-[10px] text-sm font-medium transition-colors"
                  >
                    Search Another Badge
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
