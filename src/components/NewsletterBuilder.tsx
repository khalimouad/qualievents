"use client";

import { useMemo, useRef, useState } from "react";
import {
  Heading1, Pilcrow, Image as ImageIcon, MousePointer, Minus, MoveVertical,
  ArrowUp, ArrowDown, Trash2, Plus, Eye, Pencil, AlignLeft, AlignCenter, AlignRight, Tag,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import type { Block, NewsletterDoc } from "@/lib/newsletter";
import { newId, renderToHtml, applyVariables, applyVariablesToDoc, VARIABLES } from "@/lib/newsletter";

interface Props {
  value: NewsletterDoc;
  onChange: (doc: NewsletterDoc) => void;
  subject: string;
  onSubjectChange: (s: string) => void;
  eventTitle: string;
  themeColor?: string | null;
}

const BLOCK_TYPES: { type: Block["type"]; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "heading", label: "Titre", icon: Heading1 },
  { type: "paragraph", label: "Paragraphe", icon: Pilcrow },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Bouton", icon: MousePointer },
  { type: "divider", label: "Séparateur", icon: Minus },
  { type: "spacer", label: "Espace", icon: MoveVertical },
];

function makeBlock(type: Block["type"]): Block {
  switch (type) {
    case "heading": return { id: newId(), type, text: "Nouveau titre", level: 2, align: "left" };
    case "paragraph": return { id: newId(), type, text: "Votre texte ici…" };
    case "image": return { id: newId(), type, url: "", alt: "", align: "center" };
    case "button": return { id: newId(), type, text: "Cliquez ici", url: "{eventUrl}", align: "center" };
    case "divider": return { id: newId(), type };
    case "spacer": return { id: newId(), type, height: 16 };
  }
}

export default function NewsletterBuilder({ value, onChange, subject, onSubjectChange, eventTitle, themeColor }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(value.blocks[0]?.id ?? null);
  const [tab, setTab] = useState<"build" | "preview">("build");
  const subjectRef = useRef<HTMLInputElement>(null);
  const focusedFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const selected = value.blocks.find((b) => b.id === selectedId) ?? null;

  const update = (next: Block[]) => onChange({ blocks: next });

  const updateBlock = (id: string, patch: Partial<Block>) => {
    update(value.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = value.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= value.blocks.length) return;
    const arr = [...value.blocks];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    update(arr);
  };

  const remove = (id: string) => {
    const idx = value.blocks.findIndex((b) => b.id === id);
    update(value.blocks.filter((b) => b.id !== id));
    const fallback = value.blocks[idx + 1] || value.blocks[idx - 1];
    setSelectedId(fallback?.id ?? null);
  };

  const add = (type: Block["type"]) => {
    const block = makeBlock(type);
    update([...value.blocks, block]);
    setSelectedId(block.id);
  };

  const insertVariable = (token: string) => {
    const el = focusedFieldRef.current;
    if (!el) {
      // Fallback: append to subject
      onSubjectChange(subject + token);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + token + el.value.slice(end);

    if (el === subjectRef.current) {
      onSubjectChange(next);
    } else if (selected) {
      // Determine which field of which block
      const dataField = el.getAttribute("data-field");
      if (dataField) updateBlock(selected.id, { [dataField]: next } as Partial<Block>);
    }
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const previewHtml = useMemo(() => {
    const exampleCtx = {
      firstName: "Aïcha", lastName: "Koné", email: "aicha@exemple.com",
      company: "Acme", jobTitle: "Directrice",
      eventTitle, eventDate: "Vendredi 29 mai 2026", eventVenue: "Radisson Blu",
      eventCity: "Abidjan", eventSlug: "exemple", baseUrl: "https://qualievents.com", badgeCode: null,
    };
    const previewDoc = applyVariablesToDoc(value, exampleCtx);
    return renderToHtml(previewDoc, { eventTitle, themeColor: themeColor || undefined });
  }, [value, eventTitle, themeColor]);

  return (
    <div>
      {/* Subject */}
      <div className="mb-3">
        <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 block">Objet de l&apos;email *</label>
        <input
          ref={subjectRef}
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          onFocus={() => { focusedFieldRef.current = subjectRef.current; }}
          className="w-full px-3 py-2 bg-subtle border border-border rounded-lg focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
          placeholder="Ex : Bienvenue à QualiEvents Summit 2026"
        />
      </div>

      {/* Variables */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3 h-3" /> Variables (cliquer pour insérer)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES.map((v) => (
            <button
              key={v.token}
              type="button"
              onClick={() => insertVariable(v.token)}
              className="px-2 py-1 rounded-md bg-subtle border border-border text-[11px] text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors font-mono"
              title={v.label}
            >
              {v.token}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs build/preview */}
      <div className="inline-flex p-0.5 bg-subtle rounded-lg mb-3">
        <button
          type="button"
          onClick={() => setTab("build")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "build" ? "bg-card text-foreground shadow-sm" : "text-text-secondary"}`}
        >
          <Pencil className="w-3 h-3" /> Construire
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "preview" ? "bg-card text-foreground shadow-sm" : "text-text-secondary"}`}
        >
          <Eye className="w-3 h-3" /> Aperçu
        </button>
      </div>

      {tab === "preview" ? (
        <div className="rounded-xl border border-border overflow-hidden bg-white" style={{ minHeight: 400 }}>
          <iframe srcDoc={previewHtml} className="w-full" style={{ height: 600, border: 0, background: "#f6f4f0" }} title="Aperçu" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Block list */}
          <div className="space-y-2">
            {value.blocks.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-text-secondary">
                Ajoutez votre premier bloc ci-dessous.
              </div>
            )}
            {value.blocks.map((b, idx) => {
              const isSel = b.id === selectedId;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`rounded-lg border bg-card transition-all cursor-pointer ${isSel ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-subtle/50 rounded-t-lg">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary px-1.5">{b.type}</span>
                    <div className="flex-1" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); move(b.id, -1); }} disabled={idx === 0} className="p-1 rounded hover:bg-hover text-text-secondary disabled:opacity-30" title="Monter">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); move(b.id, 1); }} disabled={idx === value.blocks.length - 1} className="p-1 rounded hover:bg-hover text-text-secondary disabled:opacity-30" title="Descendre">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="p-1 rounded hover:bg-danger/10 text-text-secondary hover:text-danger" title="Supprimer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-3">
                    <BlockPreview block={b} themeColor={themeColor || undefined} />
                  </div>
                </div>
              );
            })}

            {/* Add block toolbar */}
            <div className="rounded-lg border border-dashed border-border p-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider self-center px-1">Ajouter un bloc :</span>
              {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => add(type)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-subtle border border-border text-xs text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Plus className="w-3 h-3" /> <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <aside className="rounded-lg border border-border bg-card p-3 self-start sticky top-2 lg:max-h-[80vh] overflow-auto">
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Propriétés</p>
            {selected ? (
              <BlockEditor
                block={selected}
                onChange={(patch) => updateBlock(selected.id, patch)}
                onFieldFocus={(el) => { focusedFieldRef.current = el; }}
              />
            ) : (
              <p className="text-xs text-text-secondary">Sélectionnez un bloc pour le modifier.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function BlockPreview({ block, themeColor }: { block: Block; themeColor?: string }) {
  switch (block.type) {
    case "heading": {
      const sizes: Record<number, string> = { 1: "text-2xl", 2: "text-xl", 3: "text-lg" };
      return <div className={`${sizes[block.level]} font-bold text-foreground`} style={{ textAlign: block.align }}>{block.text || <span className="text-text-secondary italic">Titre vide</span>}</div>;
    }
    case "paragraph":
      return <p className="text-sm text-foreground whitespace-pre-wrap" style={{ textAlign: block.align }}>{block.text || <span className="text-text-secondary italic">Paragraphe vide</span>}</p>;
    case "image":
      return block.url ? (
        <div style={{ textAlign: block.align }}>
          <img src={block.url} alt={block.alt || ""} className="inline-block max-h-40 rounded" />
        </div>
      ) : (
        <p className="text-xs text-text-secondary italic">Aucune image — modifiez le bloc à droite.</p>
      );
    case "button":
      return (
        <div style={{ textAlign: block.align }}>
          <span className="inline-block px-5 py-2.5 rounded-full text-white font-semibold text-sm" style={{ background: themeColor || "var(--primary)" }}>
            {block.text || "Bouton"}
          </span>
        </div>
      );
    case "divider":
      return <hr className="border-border" />;
    case "spacer":
      return <div className="bg-subtle rounded text-center text-[10px] text-text-secondary py-1">↕ {block.height || 16}px</div>;
  }
}

function BlockEditor({
  block,
  onChange,
  onFieldFocus,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  onFieldFocus: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
}) {
  const labelClass = "text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 block";
  const inputClass = "w-full px-2.5 py-1.5 bg-subtle border border-border rounded-md focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs";

  const AlignToggle = ({ value, onSelect }: { value: "left" | "center" | "right" | undefined; onSelect: (a: "left" | "center" | "right") => void }) => (
    <div className="inline-flex p-0.5 bg-subtle border border-border rounded-md">
      {[
        { v: "left" as const, Icon: AlignLeft },
        { v: "center" as const, Icon: AlignCenter },
        { v: "right" as const, Icon: AlignRight },
      ].map(({ v, Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onSelect(v)}
          className={`p-1.5 rounded ${value === v ? "bg-card text-primary shadow-sm" : "text-text-secondary hover:text-foreground"}`}
          title={v}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );

  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Texte</label>
            <input
              data-field="text"
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
              onFocus={(e) => onFieldFocus(e.currentTarget)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Niveau</label>
            <select
              value={block.level}
              onChange={(e) => onChange({ level: Number(e.target.value) as 1 | 2 | 3 } as Partial<Block>)}
              className={inputClass}
            >
              <option value={1}>H1 — Très grand</option>
              <option value={2}>H2 — Grand</option>
              <option value={3}>H3 — Moyen</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Alignement</label>
            <AlignToggle value={block.align} onSelect={(a) => onChange({ align: a } as Partial<Block>)} />
          </div>
        </div>
      );
    case "paragraph":
      return (
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Texte</label>
            <textarea
              data-field="text"
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
              onFocus={(e) => onFieldFocus(e.currentTarget)}
              className={`${inputClass} resize-none`}
              rows={6}
            />
          </div>
          <div>
            <label className={labelClass}>Alignement</label>
            <AlignToggle value={block.align} onSelect={(a) => onChange({ align: a } as Partial<Block>)} />
          </div>
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <ImageUpload value={block.url} onChange={(url) => onChange({ url } as Partial<Block>)} type="events" label="Image" />
          <div>
            <label className={labelClass}>Texte alternatif</label>
            <input
              data-field="alt"
              value={block.alt || ""}
              onChange={(e) => onChange({ alt: e.target.value } as Partial<Block>)}
              onFocus={(e) => onFieldFocus(e.currentTarget)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Alignement</label>
            <AlignToggle value={block.align} onSelect={(a) => onChange({ align: a } as Partial<Block>)} />
          </div>
        </div>
      );
    case "button":
      return (
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Texte du bouton</label>
            <input
              data-field="text"
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
              onFocus={(e) => onFieldFocus(e.currentTarget)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lien</label>
            <input
              data-field="url"
              value={block.url}
              onChange={(e) => onChange({ url: e.target.value } as Partial<Block>)}
              onFocus={(e) => onFieldFocus(e.currentTarget)}
              className={inputClass}
              placeholder="https://… ou {eventUrl}"
            />
          </div>
          <div>
            <label className={labelClass}>Alignement</label>
            <AlignToggle value={block.align} onSelect={(a) => onChange({ align: a } as Partial<Block>)} />
          </div>
        </div>
      );
    case "divider":
      return <p className="text-xs text-text-secondary">Aucune option pour ce bloc.</p>;
    case "spacer":
      return (
        <div>
          <label className={labelClass}>Hauteur (px)</label>
          <input
            type="number"
            min={4}
            max={120}
            value={block.height ?? 16}
            onChange={(e) => onChange({ height: Number(e.target.value) } as Partial<Block>)}
            className={inputClass}
          />
        </div>
      );
  }
}

// Re-exports kept for callers that import everything from this module
export { applyVariables };
