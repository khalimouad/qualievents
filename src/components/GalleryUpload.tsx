"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export default function GalleryUpload({ value, onChange, label = "Galerie" }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "events");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error(res.statusText || "Server error");
        }
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push(data.url);
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {value.map((url, idx) => (
          <div key={idx} className="relative group aspect-square">
            <img src={url} alt="" className="w-full h-full rounded-lg border border-border object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.04] transition-colors"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
          ) : (
            <div className="text-center">
              <Upload className="w-4 h-4 text-text-secondary mx-auto mb-1" />
              <p className="text-[9px] text-muted">Ajouter</p>
            </div>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileSelect}
        className="hidden"
      />
      {error && <p className="text-[10px] text-danger mt-1">{error}</p>}
    </div>
  );
}
