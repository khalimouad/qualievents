"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

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
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
      {value ? (
        <div className="relative inline-block group">
          <img src={value} alt="" className="h-24 rounded-lg border border-gray-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-foreground rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          ) : (
            <div className="text-center">
              <Upload className="w-5 h-5 text-foreground/80 mx-auto mb-1" />
              <p className="text-[10px] text-muted">Click or drag</p>
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
