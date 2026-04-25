"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
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
          <div className="glass rounded-2xl p-4 sm:p-6 min-w-[72px] sm:min-w-[100px] text-center relative overflow-hidden">
            {/* Shimmer effect on seconds */}
            {i === 3 && <div className="absolute inset-0 animate-shimmer" />}

            <div className={`relative z-10 text-3xl sm:text-5xl font-bold text-foreground tabular-nums tracking-tight transition-all duration-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
              {String(block.value).padStart(2, "0")}
            </div>
            <div className="relative z-10 text-[10px] sm:text-xs text-muted mt-2 uppercase tracking-[0.15em] font-medium">
              {block.label}
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
          </div>

          {/* Separator dots */}
          {i < blocks.length - 1 && (
            <div className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
