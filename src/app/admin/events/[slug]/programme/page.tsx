"use client";

import { useEffect, useState, use } from "react";
import { Plus, X, Trash2, ArrowUp, ArrowDown, CalendarDays, Pencil, Save } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { SESSION_KINDS, sessionKindEmoji, sessionKindLabel, type SessionKind } from "@/lib/eventTypes";

interface Session {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  day: number;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  speakerName: string | null;
  streamUrl: string | null;
  sortOrder: number;
}

interface FormState {
  title: string;
  description: string;
  kind: SessionKind;
  day: number;
  startTime: string;
  endTime: string;
  location: string;
  speakerName: string;
}

const empty: FormState = {
  title: "",
  description: "",
  kind: "SESSION",
  day: 1,
  startTime: "",
  endTime: "",
  location: "",
  speakerName: "",
};

export default function ProgrammeAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/sessions`);
      if (!res.ok) throw new Error("Échec du chargement");
      setSessions(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [slug]);

  // Group sessions by day, in order
  const days = Array.from(new Set(sessions.map((s) => s.day))).sort((a, b) => a - b);
  const sessionsByDay: Record<number, Session[]> = {};
  for (const d of days) sessionsByDay[d] = sessions.filter((s) => s.day === d);

  const startCreate = (day = 1) => {
    setEditingId(null);
    setForm({ ...empty, day });
    setShowForm(true);
  };

  const startEdit = (s: Session) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description || "",
      kind: (SESSION_KINDS.find((k) => k.id === s.kind)?.id || "SESSION") as SessionKind,
      day: s.day,
      startTime: s.startTime || "",
      endTime: s.endTime || "",
      location: s.location || "",
      speakerName: s.speakerName || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(empty);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = editingId
        ? await fetch(`/api/sessions/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch(`/api/events/${slug}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Échec");
      }
      closeForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Session) => {
    if (!confirm(`Supprimer « ${s.title} » ?`)) return;
    const res = await fetch(`/api/sessions/${s.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec de la suppression");
      return;
    }
    load();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const sessionsInDay = sessions.filter((s) => s.day === sessions.find((x) => x.id === id)!.day);
    const idx = sessionsInDay.findIndex((s) => s.id === id);
    const next = idx + dir;
    if (next < 0 || next >= sessionsInDay.length) return;
    const reordered = [...sessionsInDay];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    // Optimistic UI: rebuild full sessions list with the new order for that day
    const fullOrder = sessions
      .filter((s) => s.day !== sessionsInDay[0].day)
      .concat(reordered)
      .map((s) => s.id);
    setSessions((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      return fullOrder.map((sid, i) => ({ ...map.get(sid)!, sortOrder: (i + 1) * 10 }));
    });
    await fetch(`/api/events/${slug}/sessions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: fullOrder }),
    });
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Programme
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Ajoutez les modules, ateliers, pauses et activités jour par jour. L&apos;ordre est respecté sur la page publique.
          </p>
        </div>
        <button
          onClick={() => (showForm ? closeForm() : startCreate(days[0] || 1))}
          className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          {showForm ? <><X className="w-3 h-3" /> Annuler</> : <><Plus className="w-3 h-3" /> Ajouter</>}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {editingId ? "Modifier le bloc" : "Nouveau bloc"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Ex : Introduction à l'ISO 39001" />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as SessionKind })} className={inputClass}>
                {SESSION_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>{k.emoji} {k.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Jour</label>
              <input
                type="number"
                min={1}
                value={form.day}
                onChange={(e) => setForm({ ...form, day: parseInt(e.target.value) || 1 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Début</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fin</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Salle / lieu</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="Salle A" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Intervenant·e (facultatif)</label>
            <input value={form.speakerName} onChange={(e) => setForm({ ...form, speakerName: e.target.value })} className={inputClass} placeholder="Jean Dupont" />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Quelques lignes pour décrire le module."
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-3 h-3" /> {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter au programme"}
            </button>
            <button type="button" onClick={closeForm} className="px-4 py-2 text-xs text-text-secondary hover:text-foreground transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-10 text-center">
          <CalendarDays className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucun bloc dans le programme pour le moment.</p>
          <button onClick={() => startCreate(1)} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 mt-3">
            <Plus className="w-3 h-3" /> Ajouter le premier bloc
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const items = sessionsByDay[day];
            return (
              <section key={day} className="card overflow-hidden">
                <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-subtle/50">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">
                    Jour {day}
                  </h3>
                  <button
                    onClick={() => startCreate(day)}
                    className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary"
                  >
                    <Plus className="w-3 h-3" /> Ajouter à ce jour
                  </button>
                </header>
                <ul className="divide-y divide-border">
                  {items.map((s, idx) => (
                    <li key={s.id} className={`p-3 group transition-colors ${editingId === s.id ? "bg-primary/5" : "hover:bg-subtle/30"}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <button
                            onClick={() => move(s.id, -1)}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-hover text-text-secondary disabled:opacity-30"
                            aria-label="Monter"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => move(s.id, 1)}
                            disabled={idx === items.length - 1}
                            className="p-0.5 rounded hover:bg-hover text-text-secondary disabled:opacity-30"
                            aria-label="Descendre"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-base">{sessionKindEmoji(s.kind)}</span>
                            <span className="text-xs text-text-secondary uppercase tracking-wider">{sessionKindLabel(s.kind)}</span>
                            {(s.startTime || s.endTime) && (
                              <span className="text-xs text-text-secondary font-mono">
                                {s.startTime || "—"}{s.endTime ? ` – ${s.endTime}` : ""}
                              </span>
                            )}
                            {s.location && (
                              <span className="text-xs text-text-secondary">📍 {s.location}</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground">{s.title}</p>
                          {s.speakerName && (
                            <p className="text-xs text-primary mt-0.5">Avec {s.speakerName}</p>
                          )}
                          {s.description && (
                            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{s.description}</p>
                          )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Modifier">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <AdminGate>
                            <button onClick={() => remove(s)} className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger" title="Supprimer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AdminGate>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
