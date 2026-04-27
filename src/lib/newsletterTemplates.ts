import type { Block } from "./newsletter";
import { newId } from "./newsletter";

export interface Template {
  id: string;
  name: string;
  description: string;
  emoji: string;
  subject: string;
  blocks: () => Block[];
}

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Vierge",
    description: "Commencez à partir d'une page blanche.",
    emoji: "📝",
    subject: "",
    blocks: () => [{ id: newId(), type: "paragraph", text: "Bonjour {firstName},\n\n" }],
  },
  {
    id: "welcome",
    name: "Bienvenue",
    description: "Accueillez les inscrits avec un message chaleureux.",
    emoji: "👋",
    subject: "Bienvenue à {eventTitle} !",
    blocks: () => [
      { id: newId(), type: "heading", text: "Bienvenue {firstName} !", level: 1, align: "center" },
      { id: newId(), type: "paragraph", text: "Nous sommes ravis de vous compter parmi les participants de {eventTitle}. Vous trouverez ci-dessous les informations essentielles pour préparer votre venue." },
      { id: newId(), type: "divider" },
      { id: newId(), type: "paragraph", text: "📅 Date : {eventDate}\n📍 Lieu : {eventVenue}, {eventCity}" },
      { id: newId(), type: "button", text: "Voir la page de l'événement", url: "{eventUrl}", align: "center" },
    ],
  },
  {
    id: "reminder",
    name: "Rappel",
    description: "Rappel à J-X avant l'événement.",
    emoji: "⏰",
    subject: "Rappel — {eventTitle}",
    blocks: () => [
      { id: newId(), type: "heading", text: "L'événement approche !", level: 1, align: "center" },
      { id: newId(), type: "paragraph", text: "Bonjour {firstName},\n\nNous vous attendons bientôt à {eventTitle}. N'oubliez pas votre badge — vous pouvez le télécharger en un clic ci-dessous." },
      { id: newId(), type: "button", text: "Télécharger mon badge", url: "{badgeUrl}", align: "center" },
      { id: newId(), type: "spacer", height: 8 },
      { id: newId(), type: "paragraph", text: "📅 {eventDate}\n📍 {eventVenue}, {eventCity}" },
    ],
  },
  {
    id: "speaker",
    name: "Annonce intervenant",
    description: "Présentez un nouveau panéliste ou speaker.",
    emoji: "🎤",
    subject: "Nouveau speaker à {eventTitle}",
    blocks: () => [
      { id: newId(), type: "heading", text: "Un nouveau speaker rejoint la programmation", level: 1, align: "center" },
      { id: newId(), type: "image", url: "", alt: "Photo du speaker", align: "center" },
      { id: newId(), type: "heading", text: "Nom du speaker", level: 2, align: "center" },
      { id: newId(), type: "paragraph", text: "Présentation, parcours, sujet d'intervention…" },
      { id: newId(), type: "button", text: "Découvrir le programme", url: "{eventUrl}", align: "center" },
    ],
  },
  {
    id: "schedule",
    name: "Mise à jour programme",
    description: "Communiquez un changement d'horaire ou de programme.",
    emoji: "🗓️",
    subject: "Mise à jour du programme — {eventTitle}",
    blocks: () => [
      { id: newId(), type: "heading", text: "Mise à jour du programme", level: 1 },
      { id: newId(), type: "paragraph", text: "Bonjour {firstName},\n\nVoici les dernières mises à jour pour {eventTitle} :" },
      { id: newId(), type: "paragraph", text: "• Horaire 1 — Description\n• Horaire 2 — Description\n• Horaire 3 — Description" },
      { id: newId(), type: "divider" },
      { id: newId(), type: "button", text: "Voir le programme complet", url: "{eventUrl}", align: "center" },
    ],
  },
  {
    id: "thanks",
    name: "Remerciements",
    description: "Email post-événement.",
    emoji: "🙏",
    subject: "Merci d'avoir participé à {eventTitle}",
    blocks: () => [
      { id: newId(), type: "heading", text: "Merci {firstName} !", level: 1, align: "center" },
      { id: newId(), type: "paragraph", text: "Votre présence à {eventTitle} a fait toute la différence. Nous espérons que cette journée a été riche en échanges et en inspiration." },
      { id: newId(), type: "paragraph", text: "Nous reviendrons bientôt vers vous avec les contenus, photos et prochains événements. À très vite !" },
      { id: newId(), type: "spacer", height: 12 },
      { id: newId(), type: "paragraph", text: "L'équipe QualiEvents", align: "center" },
    ],
  },
];

export function findTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
