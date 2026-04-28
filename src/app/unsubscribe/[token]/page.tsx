"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/unsubscribe/${token}`, { method: "POST" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.ok) throw new Error(data.error || "Échec");
        setEmail(data.email || null);
        setState("ok");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Échec");
        setState("error");
      });
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center card p-8">
        {state === "loading" && (
          <>
            <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Traitement de votre demande…</p>
          </>
        )}
        {state === "ok" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-success/15 text-success flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-medium text-foreground mb-2">Désinscription confirmée</h1>
            <p className="text-text-secondary text-sm">
              {email ? <>L&apos;adresse <strong className="text-foreground">{email}</strong> ne recevra plus nos newsletters.</> : "Vous ne recevrez plus nos newsletters pour cet événement."}
            </p>
            <p className="text-[11px] text-text-secondary mt-4">
              Vous pouvez fermer cette page. Si c&apos;est une erreur, contactez l&apos;organisateur de l&apos;événement.
            </p>
          </>
        )}
        {state === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-danger/15 text-danger flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-medium text-foreground mb-2">Lien invalide ou expiré</h1>
            <p className="text-text-secondary text-sm">{error || "Nous n'avons pas pu traiter votre demande."}</p>
            <p className="text-[11px] text-text-secondary mt-4">
              Si vous souhaitez vous désinscrire, répondez directement à l&apos;email reçu — nous traiterons la demande manuellement.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
