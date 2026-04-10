"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Search, ArrowLeft, Download } from "lucide-react";
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
    setLoading(true);
    setError("");
    setBadge(null);

    const params = searchBy === "code" ? `code=${code}` : `email=${email}`;
    try {
      const res = await fetch(`/api/badges?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Badge not found");
      setBadge(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Badge not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-2">Get Your Badge</h1>
            <p className="text-gray-600">Enter your badge code or email to retrieve your badge</p>
          </div>

          {!badge && (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSearchBy("code")}
                  className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition ${
                    searchBy === "code"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  By Badge Code
                </button>
                <button
                  onClick={() => setSearchBy("email")}
                  className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition ${
                    searchBy === "email"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  By Email
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              {searchBy === "code" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition text-center text-2xl font-bold tracking-widest uppercase"
                    placeholder="A1B2C3D4"
                    maxLength={8}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>
              )}

              <button
                onClick={searchBadge}
                disabled={loading || (searchBy === "code" ? !code : !email)}
                className="w-full mt-4 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Searching..." : <><Search className="w-5 h-5" /> Find My Badge</>}
              </button>
            </div>
          )}

          {badge && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Badge Header */}
              <div className="bg-gradient-to-r from-secondary to-accent p-6 text-center">
                <h2 className="text-white text-sm uppercase tracking-widest mb-1">Event Badge</h2>
                <h3 className="text-white text-xl font-bold">{badge.eventTitle}</h3>
                <p className="text-gray-300 text-sm mt-1">
                  {new Date(badge.eventDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* QR Code */}
              <div className="p-8 text-center">
                <img
                  src={badge.qrData}
                  alt="Badge QR Code"
                  className="w-48 h-48 mx-auto mb-4"
                />
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Badge Code</p>
                  <p className="text-3xl font-bold text-primary tracking-widest">{badge.code}</p>
                </div>
                <h3 className="text-xl font-bold text-secondary">{badge.subscriberName}</h3>
                <p className="text-gray-500">{badge.subscriberEmail}</p>
                {badge.subscriberCompany && (
                  <p className="text-gray-400 text-sm">{badge.subscriberCompany}</p>
                )}

                {badge.isScanned && (
                  <div className="mt-4 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                    Badge has been scanned
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 space-y-3">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = badge.qrData;
                    link.download = `badge-${badge.code}.png`;
                    link.click();
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Badge
                </button>
                <button
                  onClick={() => { setBadge(null); setCode(""); setEmail(""); }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
                >
                  Search Another Badge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
