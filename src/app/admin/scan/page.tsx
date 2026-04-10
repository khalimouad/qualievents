"use client";

import { useState } from "react";
import { QrCode, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ScanResult {
  valid: boolean;
  alreadyScanned: boolean;
  scannedAt?: string;
  subscriber?: {
    name: string;
    email: string;
    company: string | null;
    jobTitle?: string | null;
  };
  message?: string;
  event?: { title: string };
}

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scanBadge = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid badge");
        setResult({ valid: false, alreadyScanned: false });
      } else {
        setResult(data);
      }
    } catch {
      setError("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setResult(null);
    setError("");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Badge Scanner</h1>
        <p className="text-gray-500">Scan attendee badges at the event entrance</p>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Scanner Input */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-xl font-bold text-secondary mb-2">Enter Badge Code</h2>
          <p className="text-gray-500 text-sm mb-6">
            Type the badge code or scan the QR code
          </p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && scanBadge()}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-center text-3xl font-bold tracking-widest uppercase"
            placeholder="A1B2C3D4"
            maxLength={8}
            autoFocus
          />

          <button
            onClick={scanBadge}
            disabled={loading || !code.trim()}
            className="w-full mt-4 bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Scanning..." : <><Search className="w-5 h-5" /> Scan Badge</>}
          </button>
        </div>

        {/* Result */}
        {(result || error) && (
          <div className="mt-6">
            {error && !result?.valid && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-700 mb-2">Invalid Badge</h3>
                <p className="text-red-600">{error}</p>
                <button onClick={reset} className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-xl font-medium transition">
                  Try Again
                </button>
              </div>
            )}

            {result?.valid && result.alreadyScanned && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-700 mb-2">Already Scanned</h3>
                <p className="text-yellow-600 mb-4">{result.message}</p>
                {result.subscriber && (
                  <div className="bg-white rounded-xl p-4 text-left">
                    <p className="font-bold text-secondary">{result.subscriber.name}</p>
                    <p className="text-sm text-gray-500">{result.subscriber.email}</p>
                    {result.subscriber.company && <p className="text-sm text-gray-400">{result.subscriber.company}</p>}
                  </div>
                )}
                <button onClick={reset} className="mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-6 py-2 rounded-xl font-medium transition">
                  Scan Next
                </button>
              </div>
            )}

            {result?.valid && !result.alreadyScanned && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700 mb-2">Welcome!</h3>
                <p className="text-green-600 mb-4">{result.message}</p>
                {result.subscriber && (
                  <div className="bg-white rounded-xl p-4 text-left">
                    <p className="font-bold text-lg text-secondary">{result.subscriber.name}</p>
                    <p className="text-sm text-gray-500">{result.subscriber.email}</p>
                    {result.subscriber.company && <p className="text-sm text-gray-400">{result.subscriber.company}</p>}
                    {result.subscriber.jobTitle && <p className="text-sm text-gray-400">{result.subscriber.jobTitle}</p>}
                  </div>
                )}
                <button onClick={reset} className="mt-4 bg-green-100 hover:bg-green-200 text-green-700 px-6 py-2 rounded-xl font-medium transition">
                  Scan Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
