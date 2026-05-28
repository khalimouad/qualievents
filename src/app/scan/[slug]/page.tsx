"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Camera,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Scan,
  X,
  Zap,
  SwitchCamera,
} from "lucide-react";
import { t } from "@/lib/i18n";

const QrScanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false }
);

interface ScanResult {
  valid: boolean;
  alreadyScanned: boolean;
  scannedAt?: string;
  eventId?: string;
  subscriber?: { name: string; email: string; company: string | null };
  message?: string;
  error?: string;
}

interface EventInfo {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  themeColor: string | null;
}

type ScanMode = null | "camera" | "external";

function extractBadgeCode(scannedText: string): string | null {
  try {
    const url = new URL(scannedText);
    return url.searchParams.get("code");
  } catch {
    if (/^[A-F0-9]{8}$/i.test(scannedText.trim())) {
      return scannedText.trim().toUpperCase();
    }
    return null;
  }
}

export default function ScannerPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [mode, setMode] = useState<ScanMode>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [wrongEvent, setWrongEvent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalStats, setTotalStats] = useState({ total: 0, scanned: 0 });
  const [error, setError] = useState("");

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string>("");
  const barcodeBufferRef = useRef<string>("");
  const barcodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const externalInputRef = useRef<HTMLInputElement>(null);

  // Load event
  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(t.eventNotFound);
        else setEvent(data);
      });
  }, [slug]);

  // Load stats
  const refreshStats = useCallback(() => {
    if (!event) return;
    fetch(`/api/scan/stats?eventId=${event.id}`)
      .then((r) => r.json())
      .then(setTotalStats);
  }, [event]);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  // Process a scanned code
  const processScan = useCallback(
    async (code: string) => {
      if (!event || processing) return;
      if (code === lastScannedRef.current) return;
      lastScannedRef.current = code;

      setProcessing(true);
      setCameraActive(false);
      setResult(null);
      setWrongEvent(false);

      if (navigator.vibrate) navigator.vibrate(100);

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data: ScanResult = await res.json();

        if (!res.ok) {
          setResult({ valid: false, alreadyScanned: false, error: data.error });
        } else if (data.eventId && data.eventId !== event.id) {
          setWrongEvent(true);
          setResult(data);
        } else {
          setResult(data);
          if (data.valid && !data.alreadyScanned) {
            setSessionCount((c) => c + 1);
            refreshStats();
          }
        }
      } catch {
        setResult({ valid: false, alreadyScanned: false, error: "Erreur réseau" });
      } finally {
        setProcessing(false);
      }

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => dismissResult(), 3500);
    },
    [event, processing, refreshStats]
  );

  // Global keyboard listener for external barcode scanners
  useEffect(() => {
    if (mode !== "external") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Enter") {
        const raw = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = "";
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        if (raw.length >= 6) {
          const code = extractBadgeCode(raw);
          if (code) processScan(code);
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBufferRef.current += e.key;
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        barcodeTimerRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, processScan]);

  const dismissResult = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setResult(null);
    setWrongEvent(false);
    lastScannedRef.current = "";
    setCameraActive(true);
    // Re-focus the external input after dismissal
    if (mode === "external") {
      setTimeout(() => externalInputRef.current?.focus(), 100);
    }
  };

  const handleQrScan = useCallback(
    (detectedCodes: { rawValue: string }[]) => {
      if (processing || result) return;
      const raw = detectedCodes[0]?.rawValue;
      if (!raw) return;
      const code = extractBadgeCode(raw);
      if (code) processScan(code);
    },
    [processing, result, processScan]
  );

  const handleExternalInputSubmit = () => {
    if (!manualCode.trim()) return;
    const raw = manualCode.trim();
    const code = extractBadgeCode(raw) || raw.toUpperCase();
    processScan(code);
    setManualCode("");
  };

  const switchMode = () => {
    setMode(null);
    setResult(null);
    setWrongEvent(false);
    lastScannedRef.current = "";
    setCameraActive(true);
    setManualCode("");
  };

  // Error / loading states
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-foreground font-bold text-lg mb-2">{t.eventNotFound}</p>
          <Link href="/scan" className="text-primary text-sm font-medium">{t.backToEvents}</Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const themeColor = event.themeColor || "#e94560";

  // ─── MODE SELECTION SCREEN ───
  if (mode === null) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-5 pt-8 pb-2">
          <Link href="/scan" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> {t.scanner.back}
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
              <Scan className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{event.title}</h1>
              <p className="text-muted text-xs">{t.scanner.chooseMethod}</p>
            </div>
          </div>
        </header>

        {/* Mode buttons */}
        <main className="flex-1 flex items-center justify-center px-5 pb-10">
          <div className="w-full max-w-md space-y-4">
            {/* External Scanner */}
            <button
              onClick={() => setMode("external")}
              className="w-full group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <div className="relative bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 text-left">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground mb-1">{t.scanner.externalScanner}</h2>
                    <p className="text-muted text-sm leading-relaxed">
                      {t.scanner.externalScannerDesc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <div className="w-1 h-1 rounded-full bg-amber-500" />
                  {t.scanner.externalFastest}
                </div>
              </div>
            </button>

            {/* Camera */}
            <button
              onClick={() => setMode("camera")}
              className="w-full group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <div className="relative bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 text-left">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground mb-1">{t.scanner.camera}</h2>
                    <p className="text-muted text-sm leading-relaxed">
                      {t.scanner.cameraDesc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  {t.scanner.cameraBest}
                </div>
              </div>
            </button>
          </div>
        </main>

        {/* Stats preview */}
        <footer className="px-5 py-4 border-t border-white/5">
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-400">{totalStats.scanned}</p>
              <p className="text-[9px] text-muted uppercase tracking-wider">{t.scanner.checkedInCount}</p>
            </div>
            <div className="w-px h-8 bg-black/5 dark:bg-white/5" />
            <div>
              <p className="text-lg font-bold text-muted">{totalStats.total}</p>
              <p className="text-[9px] text-muted uppercase tracking-wider">{t.scanner.totalCount}</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ─── ACTIVE SCANNER (camera or external) ───
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="relative z-20 flex items-center gap-3 px-4 py-3 bg-secondary/95 backdrop-blur-sm border-b border-white/5">
        <button
          onClick={switchMode}
          className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <SwitchCamera className="w-4 h-4 text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">{event.title}</h1>
          <p className="text-[10px] text-muted uppercase tracking-wider">
            {mode === "camera" ? t.scanner.cameraMode : t.scanner.externalMode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            <Scan className="w-3 h-3" />
            {sessionCount}
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 relative bg-black">
        {/* ── CAMERA MODE ── */}
        {mode === "camera" && cameraActive && !result && (
          <div className="absolute inset-0">
            <QrScanner
              onScan={handleQrScan}
              allowMultiple={true}
              scanDelay={500}
              components={{ finder: false }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { objectFit: "cover" as const },
              }}
            />
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: themeColor }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: themeColor }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: themeColor }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: themeColor }} />
                <div
                  className="absolute left-2 right-2 h-0.5 animate-bounce opacity-50"
                  style={{ backgroundColor: themeColor, top: "50%", boxShadow: `0 0 10px ${themeColor}` }}
                />
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-foreground/60 text-sm">{t.scanner.pointCamera}</p>
            </div>
          </div>
        )}

        {mode === "camera" && !cameraActive && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* ── EXTERNAL SCANNER MODE ── */}
        {mode === "external" && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary p-6">
            <div className="w-full max-w-md text-center">
              {/* Animated scanner icon */}
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 rounded-3xl bg-amber-500/5 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-amber-400" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">{t.scanner.readyToScan}</h2>
              <p className="text-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                {t.scanner.readyToScanSub}
              </p>

              {/* Pulsing status indicator */}
              <div className="inline-flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2.5 mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="text-amber-400 text-sm font-medium">{t.scanner.listening}</span>
              </div>

              {/* Manual fallback input */}
              <div className="border-t border-white/5 pt-6">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-3 font-medium">{t.scanner.orEnterManually}</p>
                <div className="flex gap-2">
                  <input
                    ref={externalInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleExternalInputSubmit()}
                    className="flex-1 px-4 py-3.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-center text-lg font-bold tracking-[0.2em] text-foreground uppercase outline-none focus:border-amber-500/30 transition-colors"
                    placeholder="A1B2C3D4..."
                    maxLength={32}
                  />
                  <button
                    onClick={handleExternalInputSubmit}
                    disabled={!manualCode.trim() || processing}
                    className="px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-foreground rounded-xl font-semibold text-sm transition-colors disabled:opacity-30 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT OVERLAY ── */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-secondary/95 backdrop-blur-sm animate-fade-in z-10">
            <div className="w-full max-w-sm">
              <button
                onClick={dismissResult}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Invalid */}
              {!result.valid && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-2">{t.scanner.invalidBadge}</h2>
                  <p className="text-muted text-sm">{result.error || t.scanner.invalidBadgeSub}</p>
                  <button onClick={dismissResult} className="mt-8 px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm font-medium text-foreground hover:bg-white/10 transition-colors">
                    {t.scanner.tryAgain}
                  </button>
                </div>
              )}

              {/* Wrong event */}
              {result.valid && wrongEvent && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-orange-400 mb-2">{t.scanner.wrongEvent}</h2>
                  <p className="text-muted text-sm mb-2">{t.scanner.wrongEventSub}</p>
                  {result.subscriber && <p className="text-muted text-xs">{result.subscriber.name}</p>}
                  <button onClick={dismissResult} className="mt-8 px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm font-medium text-foreground hover:bg-white/10 transition-colors">
                    {t.scanner.continueScanning}
                  </button>
                </div>
              )}

              {/* Already scanned */}
              {result.valid && !wrongEvent && result.alreadyScanned && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-amber-400 mb-1">{t.scanner.alreadyCheckedIn}</h2>
                  {result.subscriber && (
                    <div className="mt-4 bg-black/5 dark:bg-white/5 rounded-2xl p-5 text-left border border-white/5">
                      <p className="font-bold text-foreground text-lg">{result.subscriber.name}</p>
                      <p className="text-muted text-sm">{result.subscriber.email}</p>
                      {result.subscriber.company && <p className="text-muted text-xs mt-0.5">{result.subscriber.company}</p>}
                    </div>
                  )}
                  {result.scannedAt && (
                    <p className="text-gray-600 text-xs mt-3">{t.scanner.firstScanned}: {new Date(result.scannedAt).toLocaleTimeString()}</p>
                  )}
                  <button onClick={dismissResult} className="mt-6 px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm font-medium text-foreground hover:bg-white/10 transition-colors">
                    {t.scanner.continueScanning}
                  </button>
                </div>
              )}

              {/* Success */}
              {result.valid && !wrongEvent && !result.alreadyScanned && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${themeColor}15` }}>
                    <CheckCircle className="w-12 h-12" style={{ color: themeColor }} />
                  </div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: themeColor }}>{t.scanner.welcome}</h2>
                  {result.subscriber && (
                    <div className="mt-4 bg-black/5 dark:bg-white/5 rounded-2xl p-5 text-left border border-white/5">
                      <p className="font-bold text-foreground text-xl">{result.subscriber.name}</p>
                      <p className="text-muted text-sm mt-0.5">{result.subscriber.email}</p>
                      {result.subscriber.company && <p className="text-muted text-sm mt-0.5">{result.subscriber.company}</p>}
                    </div>
                  )}
                  <button onClick={dismissResult} className="mt-6 px-8 py-3 rounded-xl text-sm font-semibold text-foreground transition-all" style={{ backgroundColor: themeColor }}>
                    {t.scanner.scanNext}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <footer className="relative z-20 px-4 py-3 bg-secondary/95 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{sessionCount}</p>
              <p className="text-[9px] text-muted uppercase tracking-wider">{t.scanner.sessionCount}</p>
            </div>
            <div className="w-px h-8 bg-black/5 dark:bg-white/5" />
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{totalStats.scanned}</p>
              <p className="text-[9px] text-muted uppercase tracking-wider">{t.scanner.checkedInCount}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-muted">{totalStats.total}</p>
              <p className="text-[9px] text-muted uppercase tracking-wider">{t.scanner.totalCount}</p>
            </div>
          </div>
          <button onClick={refreshStats} className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted hover:text-foreground hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
