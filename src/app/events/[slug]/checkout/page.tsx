"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ArrowLeft, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const tx = searchParams.get("tx");
  const [status, setStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [method, setMethod] = useState("");

  useEffect(() => {
    if (!tx) return;
    const check = async () => {
      const res = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx }),
      });
      const data = await res.json();
      setStatus(data.status);
      if (data.method) setMethod(data.method);
      if (data.status === "pending") {
        setTimeout(check, 3000); // Poll every 3s
      }
    };
    check();
  }, [tx]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-secondary noise-overlay relative flex items-center justify-center pt-16">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] shadow-xl p-8 text-center border border-black/5 dark:border-white/10">
            {status === "pending" && (
              <>
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-5">
                  <Clock className="w-10 h-10 text-warning animate-pulse" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Paiement en cours...</h1>
                <p className="text-muted text-sm mb-4">
                  Veuillez terminer le paiement sur votre téléphone.
                  {tx && <span className="block text-muted text-xs mt-2">Réf: {tx}</span>}
                </p>
                <div className="w-6 h-6 border-2 border-gray-600 border-t-primary rounded-full animate-spin mx-auto" />
              </>
            )}

            {status === "completed" && (
              <>
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Paiement confirmé !</h1>
                <p className="text-muted text-sm mb-1">
                  Votre inscription est confirmée.
                  {method && <span className="block text-muted text-xs mt-1">Payé via {method}</span>}
                </p>
                <div className="space-y-3 mt-5">
                  <Link href={`/events/${slug}/badge`} className="btn-primary w-full py-3 text-center block text-sm">
                    <Ticket className="w-4 h-4 inline mr-2" />Obtenir mon badge
                  </Link>
                  <Link href={`/events/${slug}`} className="block w-full bg-black/5 dark:bg-white/5 hover:bg-white/10 text-foreground/80 py-3 rounded-[10px] text-sm font-medium transition-colors border border-black/5 dark:border-white/10">
                    Retour à l&apos;événement
                  </Link>
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
                  <XCircle className="w-10 h-10 text-danger" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Paiement échoué</h1>
                <p className="text-muted text-sm mb-4">Le paiement n&apos;a pas pu être traité. Veuillez réessayer.</p>
                <div className="space-y-3">
                  <Link href={`/events/${slug}/register`} className="btn-primary w-full py-3 text-center block text-sm">Réessayer</Link>
                  <Link href={`/events/${slug}`} className="block w-full bg-black/5 dark:bg-white/5 hover:bg-white/10 text-foreground/80 py-3 rounded-[10px] text-sm font-medium transition-colors border border-black/5 dark:border-white/10">
                    Retour à l&apos;événement
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
