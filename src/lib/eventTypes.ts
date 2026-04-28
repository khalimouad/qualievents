// Event archetypes — drive sensible defaults in the admin form. The string
// stored in DB stays free for forward-compat; the union type below is just a
// hint for TypeScript call sites.

export type EventType =
  | "TRAINING_SEMINAR"
  | "CONFERENCE"
  | "WEBINAR"
  | "FORUM"
  | "WORKSHOP"
  | "NETWORKING"
  | "OTHER";

export type EventFormat = "IN_PERSON" | "ONLINE" | "HYBRID";

export interface EventTypePreset {
  id: EventType;
  label: string;
  emoji: string;
  description: string;
  defaults: {
    format: EventFormat;
    isPaid: boolean;
    showProgramme: boolean;
    showObjectives: boolean;
    showTargetAudience: boolean;
    showContext: boolean;
  };
}

export const EVENT_TYPES: EventTypePreset[] = [
  {
    id: "CONFERENCE",
    label: "Conférence",
    emoji: "🎤",
    description: "Événement présentiel ou hybride avec un programme et des intervenants.",
    defaults: {
      format: "IN_PERSON",
      isPaid: false,
      showProgramme: true,
      showObjectives: false,
      showTargetAudience: false,
      showContext: false,
    },
  },
  {
    id: "TRAINING_SEMINAR",
    label: "Séminaire / formation",
    emoji: "🎓",
    description: "Formation multi-journée avec objectifs, public cible, programme et attestation.",
    defaults: {
      format: "IN_PERSON",
      isPaid: true,
      showProgramme: true,
      showObjectives: true,
      showTargetAudience: true,
      showContext: true,
    },
  },
  {
    id: "WEBINAR",
    label: "Webinaire",
    emoji: "💻",
    description: "Événement en ligne court : un lien de visioconférence diffusé aux inscrits.",
    defaults: {
      format: "ONLINE",
      isPaid: false,
      showProgramme: false,
      showObjectives: true,
      showTargetAudience: true,
      showContext: false,
    },
  },
  {
    id: "FORUM",
    label: "Forum / salon",
    emoji: "🏛️",
    description: "Grand format : conférences, ateliers, exposants, networking, B-to-B.",
    defaults: {
      format: "IN_PERSON",
      isPaid: false,
      showProgramme: true,
      showObjectives: false,
      showTargetAudience: true,
      showContext: false,
    },
  },
  {
    id: "WORKSHOP",
    label: "Atelier",
    emoji: "🛠️",
    description: "Petit groupe, format pratique. Peut être présentiel ou en ligne.",
    defaults: {
      format: "IN_PERSON",
      isPaid: false,
      showProgramme: true,
      showObjectives: true,
      showTargetAudience: true,
      showContext: false,
    },
  },
  {
    id: "NETWORKING",
    label: "Networking",
    emoji: "🤝",
    description: "Événement informel : afterwork, dîner, rencontre B-to-B.",
    defaults: {
      format: "IN_PERSON",
      isPaid: false,
      showProgramme: false,
      showObjectives: false,
      showTargetAudience: false,
      showContext: false,
    },
  },
  {
    id: "OTHER",
    label: "Autre",
    emoji: "📅",
    description: "Format libre — tous les champs sont disponibles.",
    defaults: {
      format: "IN_PERSON",
      isPaid: false,
      showProgramme: true,
      showObjectives: true,
      showTargetAudience: true,
      showContext: true,
    },
  },
];

export function findEventType(id: string | null | undefined): EventTypePreset {
  return EVENT_TYPES.find((t) => t.id === id) || EVENT_TYPES[0];
}

export const SESSION_KINDS = [
  { id: "SESSION", label: "Session / module", emoji: "📘" },
  { id: "WORKSHOP", label: "Atelier", emoji: "🛠️" },
  { id: "BREAK", label: "Pause", emoji: "☕" },
  { id: "VISIT", label: "Visite", emoji: "🏛️" },
  { id: "DINNER", label: "Dîner / repas", emoji: "🍽️" },
  { id: "NETWORKING", label: "Networking", emoji: "🤝" },
  { id: "EXAM", label: "Examen", emoji: "📝" },
] as const;

export type SessionKind = (typeof SESSION_KINDS)[number]["id"];

export function sessionKindLabel(id: string): string {
  return SESSION_KINDS.find((k) => k.id === id)?.label || id;
}
export function sessionKindEmoji(id: string): string {
  return SESSION_KINDS.find((k) => k.id === id)?.emoji || "📅";
}
