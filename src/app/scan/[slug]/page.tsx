"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Keyboard,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Scan,
  Users,
  X,
} from "lucide-react";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false }
);

interface ScanResult {
  valid: boolean;
  alreadyScanned: boolean;
  scannedAt?: string;
  eventId?: string;
  subscriber?: {
    name: string;
    email: string;
    company: string | null;
  };
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
  const [cameraActive, setCameraActive] = useState(true);
  const [manualMode, setManualMode] = useState(false);
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

  // Load event info
  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError("Event not found");
        } else {
          setEvent(data);
        }
      });
  }, [slug]);

  // Load stats
  const refreshStats = useCallback(() => {
    if (!event) return;
    fetch(`/api/scan/stats?eventId=${event.id}`)
      .then((r) => r.json())
      .then(setTotalStats);
  }, [event]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Process a scanned code
  const processScan = useCallback(
    async (code: string) => {
      if (!event || processing) return;
      if (code === lastScannedRef.current) return; // debounce same code
      lastScannedRef.current = code;

      setProcessing(true);
      setCameraActive(false);
      setResult(null);
      setWrongEvent(false);

      // Haptic feedback
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
        setResult({ valid: false, alreadyScanned: false, error: "Network error" });
      } finally {
        setProcessing(false);
      }

      // Auto-dismiss after 3.5s
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        dismissResult();
      }, 3500);
    },
    [event, processing, refreshStats]
  );

  // Global keyboard listener for hardware barcode scanners
  // Hardware scanners "type" characters rapidly (<50ms gap) then press Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if a text input is focused (manual mode handles its own input)
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

      // Only collect printable single characters
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBufferRef.current += e.key;
        // Reset buffer if no new character arrives within 100ms
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        barcodeTimerRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [processScan]);

  const dismissResult = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setResult(null);
    setWrongEvent(false);
    lastScannedRef.current = "";
    setCameraActive(true);
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

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    const code = manualCode.trim().toUpperCase();
    processScan(code);
    setManualCode("");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-white font-bold text-lg mb-2">Event Not Found</p>
          <Link href="/scan" className="text-primary text-sm font-medium">
            Back to Events
          </Link>
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

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="relative z-20 flex items-center gap-3 px-4 py-3 bg-secondary/95 backdrop-blur-sm border-b border-white/5">
        <Link
          href="/scan"
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white truncate">
            {event.title}
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Camera + Barcode Scanner Ready
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
          <button
            onClick={() => setManualMode(!manualMode)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              manualMode
                ? "bg-primary text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {manualMode ? <Camera className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Camera / Manual Input */}
      <div className="flex-1 relative bg-black">
        {!manualMode && cameraActive && !result && (
          <div className="absolute inset-0">
            <Scanner
              onScan={handleQrScan}
              allowMultiple={true}
              scanDelay={500}
              components={{ finder: false }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { objectFit: "cover" as const },
              }}
            />
            {/* Crosshair overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 relative">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: themeColor }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: themeColor }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: themeColor }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: themeColor }} />
                {/* Scan line */}
                <div
                  className="absolute left-2 right-2 h-0.5 animate-bounce opacity-50"
                  style={{
                    backgroundColor: themeColor,
                    top: "50%",
                    boxShadow: `0 0 10px ${themeColor}`,
                  }}
                />
              </div>
            </div>
            {/* Hint */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white/60 text-sm">Point camera at a badge QR code</p>
              <p className="text-white/30 text-xs mt-1">Hardware barcode scanner also supported</p>
            </div>
          </div>
        )}

        {!manualMode && !cameraActive && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {manualMode && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary p-6">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <Keyboard className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400 text-sm">Enter badge code manually</p>
              </div>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                className="w-full px-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-bold tracking-[0.3em] text-white uppercase outline-none focus:border-primary/50 transition-colors"
                placeholder="A1B2C3D4"
                maxLength={8}
                autoFocus
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || processing}
                className="w-full mt-4 py-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-30"
                style={{ backgroundColor: themeColor, color: "white" }}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Scan Badge
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Overlay */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-secondary/95 backdrop-blur-sm animate-fade-in z-10">
            <div className="w-full max-w-sm">
              <button
                onClick={dismissResult}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Invalid badge */}
              {!result.valid && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-2">
                    Invalid Badge
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {result.error || "This badge code was not recognized"}
                  </p>
                  <button
                    onClick={dismissResult}
                    className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Wrong event */}
              {result.valid && wrongEvent && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-orange-400 mb-2">
                    Wrong Event
                  </h2>
                  <p className="text-gray-400 text-sm mb-2">
                    This badge belongs to a different event
                  </p>
                  {result.subscriber && (
                    <p className="text-gray-500 text-xs">
                      {result.subscriber.name}
                    </p>
                  )}
                  <button
                    onClick={dismissResult}
                    className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Continue Scanning
                  </button>
                </div>
              )}

              {/* Already scanned */}
              {result.valid && !wrongEvent && result.alreadyScanned && (
                <div className="text-center animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-amber-400 mb-1">
                    Already Checked In
                  </h2>
                  {result.subscriber && (
                    <div className="mt-4 bg-white/5 rounded-2xl p-5 text-left border border-white/5">
                      <p className="font-bold text-white text-lg">
                        {result.subscriber.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {result.subscriber.email}
                      </p>
                      {result.subscriber.company && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {result.subscriber.company}
                        </p>
                      )}
                    </div>
                  )}
                  {result.scannedAt && (
                    <p className="text-gray-600 text-xs mt-3">
                      First scanned:{" "}
                      {new Date(result.scannedAt).toLocaleTimeString()}
                    </p>
                  )}
                  <button
                    onClick={dismissResult}
                    className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Continue Scanning
                  </button>
                </div>
              )}

              {/* Success */}
              {result.valid && !wrongEvent && !result.alreadyScanned && (
                <div className="text-center animate-scale-in">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <CheckCircle
                      className="w-12 h-12"
                      style={{ color: themeColor }}
                    />
                  </div>
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{ color: themeColor }}
                  >
                    Welcome!
                  </h2>
                  {result.subscriber && (
                    <div className="mt-4 bg-white/5 rounded-2xl p-5 text-left border border-white/5">
                      <p className="font-bold text-white text-xl">
                        {result.subscriber.name}
                      </p>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {result.subscriber.email}
                      </p>
                      {result.subscriber.company && (
                        <p className="text-gray-500 text-sm mt-0.5">
                          {result.subscriber.company}
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={dismissResult}
                    className="mt-6 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: themeColor }}
                  >
                    Scan Next
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
              <p className="text-lg font-bold text-white">{sessionCount}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                Session
              </p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">
                {totalStats.scanned}
              </p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                Checked In
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-400">
                {totalStats.total}
              </p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>
          <button
            onClick={refreshStats}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
