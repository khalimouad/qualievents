"use client";

import { useState, useEffect, use } from "react";
import { Mail, Plus, X, Send, FileText, ArrowLeft } from "lucide-react";
import NewsletterBuilder from "@/components/NewsletterBuilder";
import { TEMPLATES, findTemplate } from "@/lib/newsletterTemplates";
import { newId, parseContent, type NewsletterDoc } from "@/lib/newsletter";

interface Newsletter {
  id: string; subject: string; content: string; status: string;
  sentAt: string | null; createdAt: string;
  jobs?: NewsletterJob[];
}

interface NewsletterJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  cursor: number;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface EventLite {
  id: string;
  title: string;
  themeColor: string | null;
}

const blankDoc = (): NewsletterDoc => ({
  blocks: [{ id: newId(), type: "paragraph", text: "Bonjour {firstName},\n\n" }],
});

type Step = "list" | "templates" | "edit";

export default function EventNewslettersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [event, setEvent] = useState<EventLite | null>(null);
  const [step, setStep] = useState<Step>("list");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [doc, setDoc] = useState<NewsletterDoc>(blankDoc);

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEvent({ id: ev.id, title: ev.title, themeColor: ev.themeColor ?? null });
    const data = await fetch(`/api/newsletters?eventId=${ev.id}`).then((r) => r.json());
    setNewsletters(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const startNew = () => setStep("templates");

  const pickTemplate = (id: string) => {
    const tpl = findTemplate(id);
    if (!tpl) return;
    setSubject(tpl.subject);
    setDoc({ blocks: tpl.blocks() });
    setStep("edit");
  };

  const cancel = () => {
    setStep("list");
    setSubject("");
    setDoc(blankDoc());
  };

  const [activeJob, setActiveJob] = useState<NewsletterJob | null>(null);

  // Poll the active dispatch job until it completes / fails.
  useEffect(() => {
    if (!activeJob || activeJob.status === "completed" || activeJob.status === "failed") return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/newsletter-jobs/${activeJob.id}`);
        if (!r.ok) return;
        const next = (await r.json()) as NewsletterJob;
        setActiveJob(next);
        if (next.status === "completed" || next.status === "failed") {
          clearInterval(t);
          load();
        }
      } catch {
        // transient — keep polling
      }
    }, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.id, activeJob?.status]);

  const submit = async (sendNow: boolean) => {
    if (!subject.trim() || doc.blocks.length === 0 || !event) return;
    setSending(true);
    try {
      const res = await fetch("/api/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content: JSON.stringify(doc),
          eventId: event.id,
          send: sendNow,
        }),
      });
      const data = await res.json();
      if (sendNow && data.jobId) {
        // Drop the editor and surface the live progress.
        setActiveJob({
          id: data.jobId,
          status: data.totalRecipients === 0 ? "completed" : "pending",
          totalRecipients: data.totalRecipients ?? 0,
          sentCount: 0,
          failedCount: 0,
          cursor: 0,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
        });
      }
      cancel();
      load();
    } finally {
      setSending(false);
    }
  };

  // ---------- Header ----------
  const header = (
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-xs text-text-secondary">{newsletters.length} newsletter{newsletters.length > 1 ? "s" : ""}</p>
      {step === "list" ? (
        <button onClick={startNew} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> Rédiger
        </button>
      ) : (
        <button onClick={cancel} className="px-3 py-1.5 text-xs inline-flex items-center gap-1.5 rounded-lg bg-subtle border border-border text-text-secondary hover:text-foreground transition-colors">
          <X className="w-3 h-3" /> Annuler
        </button>
      )}
    </div>
  );

  // ---------- Templates picker ----------
  if (step === "templates") {
    return (
      <div>
        {header}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setStep("list")} className="p-1 rounded hover:bg-hover text-text-secondary" title="Retour">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Choisir un modèle</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => pickTemplate(tpl.id)}
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="text-3xl mb-2">{tpl.emoji}</div>
                <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{tpl.name}</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{tpl.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Editor ----------
  if (step === "edit" && event) {
    return (
      <div>
        {header}
        <div className="card p-4 sm:p-5">
          <NewsletterBuilder
            value={doc}
            onChange={setDoc}
            subject={subject}
            onSubjectChange={setSubject}
            eventTitle={event.title}
            themeColor={event.themeColor}
          />
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
            <button
              onClick={() => submit(false)}
              disabled={sending || !subject.trim() || doc.blocks.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-subtle border border-border text-foreground text-xs font-medium hover:border-primary transition-colors disabled:opacity-50"
            >
              <FileText className="w-3 h-3" /> Enregistrer comme brouillon
            </button>
            <button
              onClick={() => submit(true)}
              disabled={sending || !subject.trim() || doc.blocks.length === 0}
              className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3 h-3" /> {sending ? "Envoi en cours…" : "Envoyer maintenant"}
            </button>
            <p className="text-[11px] text-text-secondary ml-auto">
              Les variables comme <code className="font-mono bg-subtle px-1 rounded">{`{firstName}`}</code> sont remplacées par les infos de chaque inscrit lors de l&apos;envoi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- List ----------
  return (
    <div>
      {header}

      {/* Active dispatch progress */}
      {activeJob && (
        <div className="card p-4 mb-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <p className="text-sm font-semibold text-foreground">
              {activeJob.status === "completed"
                ? "✓ Envoi terminé"
                : activeJob.status === "failed"
                  ? "✗ Échec de l'envoi"
                  : "Envoi en cours…"}
            </p>
            <p className="text-xs text-text-secondary tabular-nums">
              {activeJob.sentCount + activeJob.failedCount} / {activeJob.totalRecipients}
            </p>
          </div>
          <div className="h-2 bg-subtle rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                activeJob.status === "completed"
                  ? "bg-success"
                  : activeJob.status === "failed"
                    ? "bg-danger"
                    : "bg-gradient-to-r from-primary to-accent"
              }`}
              style={{
                width: `${
                  activeJob.totalRecipients === 0
                    ? 100
                    : Math.min(
                        100,
                        ((activeJob.sentCount + activeJob.failedCount) /
                          activeJob.totalRecipients) *
                          100
                      )
                }%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-text-secondary">
            <span>{activeJob.sentCount} envoyés{activeJob.failedCount > 0 ? ` · ${activeJob.failedCount} échecs` : ""}</span>
            {activeJob.status === "completed" && (
              <button onClick={() => setActiveJob(null)} className="text-primary hover:underline">Fermer</button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : newsletters.length === 0 ? (
          <div className="card p-8 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
            <p className="text-text-secondary text-sm mb-3">Aucune newsletter pour le moment</p>
            <button onClick={startNew} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5">
              <Plus className="w-3 h-3" /> Composer la première
            </button>
          </div>
        ) : (
          newsletters.map((nl) => {
            const parsed = parseContent(nl.content);
            const preview = parsed
              ? parsed.blocks.find((b) => b.type === "paragraph" || b.type === "heading")
              : null;
            const previewText = preview && (preview.type === "paragraph" || preview.type === "heading")
              ? preview.text
              : nl.content.replace(/<[^>]*>/g, "");
            return (
              <div key={nl.id} className="card p-3.5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm truncate">{nl.subject}</h3>
                      <p className="text-text-secondary text-xs mt-0.5 line-clamp-1">{previewText}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${
                    nl.status === "sent" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>{nl.status === "sent" ? "envoyé" : "brouillon"}</span>
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 pl-[42px]">
                  {nl.sentAt ? `Envoyé le ${new Date(nl.sentAt).toLocaleString("fr-FR")}` : `Créé le ${new Date(nl.createdAt).toLocaleString("fr-FR")}`}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
