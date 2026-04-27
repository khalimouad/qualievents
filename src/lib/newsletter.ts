// Block-based newsletter model: stored as JSON in Newsletter.content
// (legacy raw HTML rows are still recognised by render() as a fallback).

export type Block =
  | { id: string; type: "heading"; text: string; level: 1 | 2 | 3; align?: "left" | "center" | "right" }
  | { id: string; type: "paragraph"; text: string; align?: "left" | "center" | "right" }
  | { id: string; type: "image"; url: string; alt?: string; align?: "left" | "center" | "right" }
  | { id: string; type: "button"; text: string; url: string; align?: "left" | "center" | "right" }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; height?: number };

export interface NewsletterDoc {
  blocks: Block[];
}

export const VARIABLES = [
  { token: "{firstName}", label: "Prénom" },
  { token: "{lastName}", label: "Nom" },
  { token: "{fullName}", label: "Nom complet" },
  { token: "{email}", label: "Email" },
  { token: "{company}", label: "Entreprise" },
  { token: "{jobTitle}", label: "Poste" },
  { token: "{eventTitle}", label: "Nom de l'événement" },
  { token: "{eventDate}", label: "Date de l'événement" },
  { token: "{eventVenue}", label: "Lieu" },
  { token: "{eventCity}", label: "Ville" },
  { token: "{registrationUrl}", label: "Lien d'inscription" },
  { token: "{badgeUrl}", label: "Lien du badge" },
  { token: "{eventUrl}", label: "Page de l'événement" },
] as const;

export interface SubstitutionContext {
  firstName: string;
  lastName: string;
  email: string;
  company?: string | null;
  jobTitle?: string | null;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  eventSlug: string;
  baseUrl: string;
  badgeCode?: string | null;
}

export function applyVariables(text: string, ctx: SubstitutionContext): string {
  const fullName = `${ctx.firstName} ${ctx.lastName}`.trim();
  const eventUrl = `${ctx.baseUrl}/events/${ctx.eventSlug}`;
  const map: Record<string, string> = {
    "{firstName}": ctx.firstName || "",
    "{lastName}": ctx.lastName || "",
    "{fullName}": fullName,
    "{email}": ctx.email || "",
    "{company}": ctx.company || "",
    "{jobTitle}": ctx.jobTitle || "",
    "{eventTitle}": ctx.eventTitle || "",
    "{eventDate}": ctx.eventDate || "",
    "{eventVenue}": ctx.eventVenue || "",
    "{eventCity}": ctx.eventCity || "",
    "{registrationUrl}": `${eventUrl}/register`,
    "{badgeUrl}": ctx.badgeCode ? `${eventUrl}/badge?code=${ctx.badgeCode}` : `${eventUrl}/badge`,
    "{eventUrl}": eventUrl,
  };
  return text.replace(/\{[a-zA-Z]+\}/g, (m) => (m in map ? map[m] : m));
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const safeUrl = (url: string) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return "#";
  if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return escape(trimmed);
  return "#";
};

function renderBlock(b: Block, themeColor: string): string {
  const align = "align" in b && b.align ? b.align : "left";
  switch (b.type) {
    case "heading": {
      const tag = `h${b.level}`;
      const size = b.level === 1 ? "28px" : b.level === 2 ? "22px" : "18px";
      return `<${tag} style="margin:0 0 12px;color:#1a120b;font-size:${size};font-weight:700;text-align:${align};line-height:1.25;">${escape(b.text)}</${tag}>`;
    }
    case "paragraph":
      return `<p style="margin:0 0 12px;color:#333;font-size:15px;line-height:1.6;text-align:${align};white-space:pre-wrap;">${escape(b.text)}</p>`;
    case "image": {
      const al = align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0";
      if (!b.url) return "";
      return `<div style="text-align:${align};margin:12px 0;"><img src="${escape(b.url)}" alt="${escape(b.alt || "")}" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:${al};" /></div>`;
    }
    case "button":
      return `<div style="text-align:${align};margin:16px 0;"><a href="${safeUrl(b.url)}" style="display:inline-block;padding:12px 28px;background:${themeColor};color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:14px;">${escape(b.text)}</a></div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />`;
    case "spacer":
      return `<div style="height:${b.height || 16}px;"></div>`;
  }
}

export function renderToHtml(doc: NewsletterDoc, opts: { eventTitle: string; themeColor?: string }): string {
  const themeColor = opts.themeColor || "#ff7a00";
  const body = doc.blocks.map((b) => renderBlock(b, themeColor)).join("\n");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f6f4f0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
    <div style="background:linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%);padding:24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;letter-spacing:.04em;">${escape(opts.eventTitle)}</h1>
    </div>
    <div style="padding:28px;">
      ${body}
    </div>
    <div style="padding:18px;background:#fafafa;text-align:center;color:#999;font-size:11px;">
      QualiEvents — Plateforme de gestion d'événements
    </div>
  </div>
</body></html>`;
}

export function applyVariablesToDoc(doc: NewsletterDoc, ctx: SubstitutionContext): NewsletterDoc {
  return {
    blocks: doc.blocks.map((b) => {
      if (b.type === "heading" || b.type === "paragraph") return { ...b, text: applyVariables(b.text, ctx) };
      if (b.type === "button") return { ...b, text: applyVariables(b.text, ctx), url: applyVariables(b.url, ctx) };
      if (b.type === "image") return { ...b, url: applyVariables(b.url, ctx), alt: b.alt ? applyVariables(b.alt, ctx) : b.alt };
      return b;
    }),
  };
}

export function parseContent(content: string): NewsletterDoc | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.blocks)) return parsed as NewsletterDoc;
  } catch {
    // legacy raw-HTML row
  }
  return null;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}
