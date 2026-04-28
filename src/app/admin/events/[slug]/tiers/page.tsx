"use client";

import { useEffect, useState, use } from "react";
import { Plus, X, Trash2, ArrowUp, ArrowDown, Tag, Pencil, Save, CheckCircle2 } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

interface Tier {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  inclusions: string[];
  capacity: number | null;
  remaining: number | null;
  available: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  sortOrder: number;
  purchasable: boolean;
  sold: number;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  currency: string;
  inclusionsText: string; // one per line
  capacity: string;
  available: boolean;
  availableFrom: string;
  availableUntil: string;
}

const empty: FormState = {
  name: "",
  description: "",
  price: "",
  currency: "EUR",
  inclusionsText: "",
  capacity: "",
  available: true,
  availableFrom: "",
  availableUntil: "",
};

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export default function TiersAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/tiers`);
      if (!res.ok) throw new Error("Échec du chargement");
      setTiers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [slug]);

  const startCreate = () => {
    setEditingId(null);
    setForm(empty);
    setShowForm(true);
  };

  const startEdit = (t: Tier) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description || "",
      price: String(t.price),
      currency: t.currency,
      inclusionsText: (t.inclusions || []).join("\n"),
      capacity: t.capacity != null ? String(t.capacity) : "",
      available: t.available,
      availableFrom: t.availableFrom ? t.availableFrom.slice(0, 16) : "",
      availableUntil: t.availableUntil ? t.availableUntil.slice(0, 16) : "",
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
      const priceNum = Number(form.price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        throw new Error("Prix invalide");
      }
      const inclusions = form.inclusionsText
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const capacityNum = form.capacity.trim() ? Math.max(1, Math.floor(Number(form.capacity))) : null;
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: priceNum,
        currency: form.currency.trim() || "EUR",
        inclusions,
        capacity: capacityNum,
        available: form.available,
        availableFrom: form.availableFrom || null,
        availableUntil: form.availableUntil || null,
      };
      const res = editingId
        ? await fetch(`/api/tiers/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/events/${slug}/tiers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
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

  const remove = async (t: Tier) => {
    if (t.sold > 0) {
      if (!confirm(`Ce tarif a déjà ${t.sold} inscription(s). Le supprimer dissociera ces inscriptions du tarif. Continuer ?`)) return;
    } else if (!confirm(`Supprimer le tarif « ${t.name} » ?`)) return;
    const res = await fetch(`/api/tiers/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec de la suppression");
      return;
    }
    load();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = tiers.findIndex((t) => t.id === id);
    const next = idx + dir;
    if (next < 0 || next >= tiers.length) return;
    const reordered = [...tiers];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    setTiers(reordered);
    await fetch(`/api/events/${slug}/tiers`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((t) => t.id) }),
    });
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Tarifs
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Définissez les tarifs proposés à l&apos;inscription. Chaque tarif peut lister ce qui est inclus (hébergement, transferts, mallette, certification…).
          </p>
        </div>
        <button
          onClick={() => (showForm ? closeForm() : startCreate())}
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
            {editingId ? "Modifier le tarif" : "Nouveau tarif"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nom *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Standard, Early bird, Groupe 3+…"
              />
            </div>
            <div>
              <label className={labelClass}>Capacité (facultatif)</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className={inputClass}
                placeholder="Illimitée"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Prix *</label>
              <input
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                placeholder="3500"
              />
            </div>
            <div>
              <label className={labelClass}>Devise</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={inputClass}
              >
                <option value="EUR">EUR (€)</option>
                <option value="XOF">XOF (FCFA)</option>
                <option value="USD">USD ($)</option>
                <option value="MAD">MAD (DH)</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-foreground">Tarif disponible</span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description (facultatif)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="Une phrase pour différencier ce tarif"
            />
          </div>

          <div>
            <label className={labelClass}>Ce qui est inclus (une ligne par item)</label>
            <textarea
              value={form.inclusionsText}
              onChange={(e) => setForm({ ...form, inclusionsText: e.target.value })}
              rows={6}
              className={`${inputClass} resize-none font-sans`}
              placeholder={"5 nuitées en B&B\nTransferts aéroport ↔ hôtel\nMallette pédagogique\nPauses-café et déjeuner\nAttestation de participation\nFrais d'examen de certification"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Disponible à partir du (facultatif)</label>
              <input
                type="datetime-local"
                value={form.availableFrom}
                onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jusqu&apos;au (facultatif)</label>
              <input
                type="datetime-local"
                value={form.availableUntil}
                onChange={(e) => setForm({ ...form, availableUntil: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3 h-3" /> {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter le tarif"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 text-xs text-text-secondary hover:text-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : tiers.length === 0 ? (
        <div className="card p-10 text-center">
          <Tag className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucun tarif configuré.</p>
          <p className="text-text-secondary text-xs mt-1">
            Sans tarif, l&apos;événement utilise le prix unique défini dans « Modifier ».
          </p>
          <button
            onClick={startCreate}
            className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 mt-3"
          >
            <Plus className="w-3 h-3" /> Ajouter un premier tarif
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {tiers.map((t, idx) => (
            <li
              key={t.id}
              className={`card p-4 transition-all ${editingId === t.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <button
                    onClick={() => move(t.id, -1)}
                    disabled={idx === 0}
                    className="p-0.5 rounded hover:bg-hover text-text-secondary disabled:opacity-30"
                    aria-label="Monter"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => move(t.id, 1)}
                    disabled={idx === tiers.length - 1}
                    className="p-0.5 rounded hover:bg-hover text-text-secondary disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground">{t.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${t.purchasable ? "bg-success/10 text-success" : "bg-subtle text-text-secondary"}`}>
                        {t.purchasable ? "En vente" : "Indisponible"}
                      </span>
                    </div>
                    <span className="text-base font-bold text-primary tabular-nums">
                      {formatPrice(t.price, t.currency)}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-xs text-text-secondary mt-1">{t.description}</p>
                  )}
                  {t.inclusions && t.inclusions.length > 0 && (
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {t.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                          <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
                    <span>{t.sold} inscription{t.sold > 1 ? "s" : ""}</span>
                    {t.capacity != null && (
                      <span>{t.remaining} place{(t.remaining ?? 0) > 1 ? "s" : ""} restante{(t.remaining ?? 0) > 1 ? "s" : ""}</span>
                    )}
                    {t.availableFrom && (
                      <span>Dès le {new Date(t.availableFrom).toLocaleDateString("fr-FR")}</span>
                    )}
                    {t.availableUntil && (
                      <span>Jusqu&apos;au {new Date(t.availableUntil).toLocaleDateString("fr-FR")}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <AdminGate>
                    <button
                      onClick={() => remove(t)}
                      className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </AdminGate>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
