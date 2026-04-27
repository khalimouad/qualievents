"use client";

import { useState, useRef } from "react";
import { Upload, X, RefreshCw } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  type: "events" | "panelists" | "sponsors";
  label?: string;
}

export default function ImageUpload({ value, onChange, type, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: fd });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(res.statusText || "Server error");
      }

      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so re-selecting the same file fires onChange
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div>
      <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">{label}</label>
      {value ? (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative h-24 min-w-[6rem] max-w-[14rem] inline-flex items-center justify-center rounded-lg border border-border bg-subtle p-2 overflow-hidden">
            <img
              src={value}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.opacity = "0.4"; }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-subtle border border-border text-text-secondary hover:text-foreground hover:border-primary text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" /> Remplacer
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-danger hover:bg-danger/10 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Retirer
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={openPicker}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.04] transition-colors"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
          ) : (
            <div className="text-center">
              <Upload className="w-5 h-5 text-text-secondary mx-auto mb-1" />
              <p className="text-[10px] text-text-secondary">Cliquer ou déposer</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />
      {error && <p className="text-[10px] text-danger mt-1">{error}</p>}
    </div>
  );
}
