"use client";

import { useState, useRef, useEffect } from "react";
import { QrCode, Search, CheckCircle, XCircle, AlertTriangle, Scan } from "lucide-react";

interface ScanResult {
  valid: boolean;
  alreadyScanned: boolean;
  scannedAt?: string;
  subscriber?: { name: string; email: string; company: string | null; jobTitle?: string | null };
  message?: string;
  event?: { title: string };
}

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const scanBadge = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.toUpperCase() }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid badge"); setResult({ valid: false, alreadyScanned: false }); }
      else { setResult(data); }
    } catch { setError("Scan failed"); }
    finally { setLoading(false); }
  };

  const reset = () => { setCode(""); setResult(null); setError(""); setTimeout(() => inputRef.current?.focus(), 100); };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Badge Scanner</h1>
        <p className="text-muted text-sm mt-0.5">Scan attendee badges at the event entrance</p>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Scanner */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <Scan className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-lg font-bold text-secondary mb-1">Enter Badge Code</h2>
          <p className="text-muted text-sm mb-6">Type the code or scan the QR code with a barcode reader</p>

          <input
            ref={inputRef}
            type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && scanBadge()}
            className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-center text-3xl font-bold tracking-[0.3em] uppercase transition-all"
            placeholder="A1B2C3D4" maxLength={8} autoFocus
          />

          <button onClick={scanBadge} disabled={loading || !code.trim()} className="btn-primary w-full mt-5 py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</> : <><Search className="w-4 h-4" /> Scan Badge</>}
          </button>
        </div>

        {/* Results */}
        {(result || error) && (
          <div className="mt-6 animate-scale-in">
            {error && !result?.valid && (
              <div className="bg-white rounded-[24px] border-2 border-danger/20 p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
                  <XCircle className="w-10 h-10 text-danger" />
                </div>
                <h3 className="text-xl font-bold text-danger mb-2">Invalid Badge</h3>
                <p className="text-muted text-sm">{error}</p>
                <button onClick={reset} className="mt-6 bg-danger/10 hover:bg-danger/15 text-danger px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">Try Again</button>
              </div>
            )}
            {result?.valid && result.alreadyScanned && (
              <div className="bg-white rounded-[24px] border-2 border-warning/20 p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-5">
                  <AlertTriangle className="w-10 h-10 text-warning" />
                </div>
                <h3 className="text-xl font-bold text-warning mb-2">Already Scanned</h3>
                <p className="text-muted text-sm mb-5">{result.message}</p>
                {result.subscriber && (
                  <div className="bg-gray-50 rounded-2xl p-5 text-left">
                    <p className="font-bold text-secondary">{result.subscriber.name}</p>
                    <p className="text-sm text-muted">{result.subscriber.email}</p>
                    {result.subscriber.company && <p className="text-xs text-gray-400">{result.subscriber.company}</p>}
                  </div>
                )}
                <button onClick={reset} className="mt-6 bg-warning/10 hover:bg-warning/15 text-warning px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">Scan Next</button>
              </div>
            )}
            {result?.valid && !result.alreadyScanned && (
              <div className="bg-white rounded-[24px] border-2 border-success/20 p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-xl font-bold text-success mb-2">Welcome!</h3>
                <p className="text-muted text-sm mb-5">{result.message}</p>
                {result.subscriber && (
                  <div className="bg-gray-50 rounded-2xl p-5 text-left">
                    <p className="font-bold text-lg text-secondary">{result.subscriber.name}</p>
                    <p className="text-sm text-muted">{result.subscriber.email}</p>
                    {result.subscriber.company && <p className="text-xs text-gray-400 mt-0.5">{result.subscriber.company}</p>}
                    {result.subscriber.jobTitle && <p className="text-xs text-gray-400">{result.subscriber.jobTitle}</p>}
                  </div>
                )}
                <button onClick={reset} className="mt-6 bg-success/10 hover:bg-success/15 text-success px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">Scan Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
