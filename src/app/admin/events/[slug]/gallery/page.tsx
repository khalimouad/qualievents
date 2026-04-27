"use client";

import { useState, useEffect, use } from "react";
import { Image as ImageIcon, Save, CheckCircle2 } from "lucide-react";
import GalleryUpload from "@/components/GalleryUpload";

export default function EventGalleryAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setGallery(Array.isArray(data.gallery) ? data.gallery : []);
        setLoading(false);
      });
  }, [slug]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gallery }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de la sauvegarde");
      }
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Galerie photos
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Ajoutez les photos de l&apos;événement (passé ou en cours) pour la galerie publique.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sauvegarde...
            </>
          ) : savedAt && Date.now() - savedAt < 3000 ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Enregistré
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              Enregistrer
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-lg mb-3 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="card p-4">
        <GalleryUpload value={gallery} onChange={setGallery} label={`${gallery.length} photo${gallery.length > 1 ? "s" : ""}`} />
        <p className="text-[10px] text-text-secondary mt-3">
          Les photos sont affichées sur la page publique de l&apos;événement, dans une section galerie avec lightbox.
        </p>
      </div>
    </div>
  );
}
