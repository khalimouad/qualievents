"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

interface CountdownTimerProps {
  targetDate: string;
  onImage?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate, onImage = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: t.countdown.days },
    { value: timeLeft.hours, label: t.countdown.hours },
    { value: timeLeft.minutes, label: t.countdown.min },
    { value: timeLeft.seconds, label: t.countdown.sec },
  ];

  return (
    <div className="flex gap-3 sm:gap-5 justify-center">
      {blocks.map((block, i) => (
        <div key={block.label} className="relative group">
          <div
            className={`rounded-2xl p-4 sm:p-6 min-w-[72px] sm:min-w-[100px] text-center relative overflow-hidden ${
              onImage
                ? "bg-white/15 backdrop-blur-xl border border-white/25 shadow-xl"
                : "glass"
            }`}
          >
            {/* Shimmer effect on seconds */}
            {i === 3 && <div className="absolute inset-0 animate-shimmer" />}

            <div
              className={`relative z-10 text-3xl sm:text-5xl font-bold tabular-nums tracking-tight transition-all duration-300 ${mounted ? "opacity-100" : "opacity-0"} ${onImage ? "text-white" : "text-foreground"}`}
              style={onImage ? { textShadow: "0 2px 12px rgba(0,0,0,0.5)" } : undefined}
            >
              {String(block.value).padStart(2, "0")}
            </div>
            <div className={`relative z-10 text-[10px] sm:text-xs mt-2 uppercase tracking-[0.15em] font-medium ${onImage ? "text-white/85" : "text-muted"}`}>
              {block.label}
            </div>

            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent rounded-full ${onImage ? "via-white/70 to-transparent" : "via-primary/50 to-transparent"}`} />
          </div>

          {/* Separator dots */}
          {i < blocks.length - 1 && (
            <div className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
              <div className={`w-1 h-1 rounded-full animate-pulse ${onImage ? "bg-white/80" : "bg-primary/60"}`} />
              <div className={`w-1 h-1 rounded-full animate-pulse ${onImage ? "bg-white/80" : "bg-primary/60"}`} style={{ animationDelay: "0.5s" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
