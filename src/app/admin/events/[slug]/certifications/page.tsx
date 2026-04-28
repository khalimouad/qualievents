"use client";

import { useEffect, useState, use } from "react";
import { ShieldCheck, Download, RefreshCw, ExternalLink, Trash2, Send, Award, Sparkles } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

interface Cert {
  id: string;
  type: "PARTICIPATION" | "CERTIFIED";
  examPassed: boolean | null;
  pdfUrl: string | null;
  verificationCode: string;
  issuedAt: string | null;
  revoked: boolean;
  subscriber: { id: string; firstName: string; lastName: string; email: string };
}

export default function CertificationsAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ issued: number; skipped: number; failed: number } | null>(null);
  const [type, setType] = useState<"PARTICIPATION" | "CERTIFIED">("PARTICIPATION");
  const [sendEmails, setSendEmails] = useState(true);
  const [regenerate, setRegenerate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/certifications`);
      if (!res.ok) throw new Error("Échec du chargement");
      setCerts(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [slug]);

  const issue = async () => {
    setIssuing(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/events/${slug}/certifications/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, sendEmails, regenerate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec");
      setResult({ issued: data.issued, skipped: data.skipped, failed: data.failed });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setIssuing(false);
    }
  };

  const reissue = async (subscriberId: string) => {
    setError(null);
    const res = await fetch(`/api/events/${slug}/certifications/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriberIds: [subscriberId], regenerate: true, sendEmails: false, type }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    await load();
  };

  const togglePassed = async (cert: Cert, value: boolean | null) => {
    setError(null);
    const res = await fetch(`/api/certifications/${cert.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examPassed: value }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    await load();
  };

  const toggleRevoked = async (cert: Cert) => {
    if (!confirm(cert.revoked ? "Réactiver ce certificat ?" : "Révoquer ce certificat ?")) return;
    const res = await fetch(`/api/certifications/${cert.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoked: !cert.revoked }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    await load();
  };

  const remove = async (cert: Cert) => {
    if (!confirm(`Supprimer définitivement l'attestation de ${cert.subscriber.firstName} ${cert.subscriber.lastName} ?`)) return;
    const res = await fetch(`/api/certifications/${cert.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Attestations & certifications
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Générez les PDF post-événement et envoyez-les aux participants. Chaque PDF embarque un QR de vérification public.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Issue panel */}
      <section className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Émettre les attestations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as "PARTICIPATION" | "CERTIFIED")} className="input-base">
              <option value="PARTICIPATION">📜 Attestation de participation</option>
              <option value="CERTIFIED">🏆 Certification (examen)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
            <input type="checkbox" checked={sendEmails} onChange={(e) => setSendEmails(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs text-foreground">Envoyer un email avec le PDF</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
            <input type="checkbox" checked={regenerate} onChange={(e) => setRegenerate(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs text-foreground">Régénérer les PDF existants</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
          <button
            onClick={issue}
            disabled={issuing}
            className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {issuing ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Émettre pour tous les inscrits confirmés</>
            )}
          </button>
          {result && (
            <p className="text-xs text-text-secondary">
              <strong className="text-success">{result.issued} émis</strong>
              {result.skipped > 0 && <> · {result.skipped} ignorés (déjà existants)</>}
              {result.failed > 0 && <> · <span className="text-danger">{result.failed} échec(s)</span></>}
            </p>
          )}
        </div>
      </section>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : certs.length === 0 ? (
        <div className="card p-10 text-center">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucune attestation émise pour le moment.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-subtle/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Titulaire</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Code</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Émis</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {certs.map((c) => (
                <tr key={c.id} className="group hover:bg-subtle/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">
                      {c.subscriber.firstName} {c.subscriber.lastName}
                    </p>
                    <p className="text-[11px] text-text-secondary">{c.subscriber.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider w-fit ${c.type === "CERTIFIED" ? "bg-primary/10 text-primary" : "bg-subtle text-text-secondary"}`}>
                        {c.type === "CERTIFIED" ? <Award className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        {c.type === "CERTIFIED" ? "Certifié" : "Participation"}
                      </span>
                      {c.revoked && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-danger/10 text-danger w-fit">
                          Révoqué
                        </span>
                      )}
                      {c.type === "CERTIFIED" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => togglePassed(c, c.examPassed === true ? null : true)}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${c.examPassed === true ? "bg-success/15 text-success" : "bg-subtle text-text-secondary hover:bg-success/10 hover:text-success"}`}
                          >
                            ✓ Réussi
                          </button>
                          <button
                            onClick={() => togglePassed(c, c.examPassed === false ? null : false)}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${c.examPassed === false ? "bg-danger/15 text-danger" : "bg-subtle text-text-secondary hover:bg-danger/10 hover:text-danger"}`}
                          >
                            ✗ Échoué
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <code className="text-[11px] font-mono bg-subtle px-2 py-0.5 rounded select-all">{c.verificationCode}</code>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-text-secondary hidden md:table-cell">
                    {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.pdfUrl && (
                        <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Télécharger le PDF">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a href={`/verify/${c.verificationCode}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Page de vérification">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => reissue(c.subscriber.id)} className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Régénérer le PDF">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleRevoked(c)} className="p-1.5 rounded hover:bg-warning/10 text-text-secondary hover:text-warning" title={c.revoked ? "Réactiver" : "Révoquer"}>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <AdminGate>
                        <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </AdminGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
