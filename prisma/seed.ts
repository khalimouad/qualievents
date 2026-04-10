import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---------- Event 1: Tech Summit ----------
  const summit = await prisma.event.create({
    data: {
      slug: "summit-2026",
      title: "QualiEvents Summit 2026",
      tagline: "Where Innovation Meets Opportunity",
      description:
        "Join us for the premier technology and innovation summit of the year. Connect with industry leaders, discover cutting-edge solutions, and shape the future of digital transformation.",
      date: new Date("2026-06-15T09:00:00Z"),
      endDate: new Date("2026-06-17T18:00:00Z"),
      venue: "Palais des Congres",
      address: "2 Place de la Porte Maillot",
      city: "Paris",
      country: "France",
      latitude: 48.8789,
      longitude: 2.283,
      themeColor: "#e94560",
      maxAttendees: 500,
      isPublished: true,
    },
  });

  const summitPanelists = [
    { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@example.com", bio: "CEO of TechForward Inc. With over 15 years of experience in AI and machine learning, Sarah leads one of the fastest-growing tech companies in Europe.", company: "TechForward Inc.", jobTitle: "CEO & Co-Founder", topic: "The Future of AI in Enterprise", linkedin: "https://linkedin.com/in/sarahchen", sortOrder: 1 },
    { firstName: "Marc", lastName: "Dubois", email: "marc.dubois@example.com", bio: "Award-winning researcher and author on digital transformation. Marc has advised Fortune 500 companies on their innovation strategies.", company: "Innovation Labs", jobTitle: "Chief Innovation Officer", topic: "Digital Transformation Strategies", linkedin: "https://linkedin.com/in/marcdubois", sortOrder: 2 },
    { firstName: "Amina", lastName: "Okafor", email: "amina.okafor@example.com", bio: "Cybersecurity expert and keynote speaker. Amina has been recognized as one of the top 50 women in tech globally.", company: "SecureNet Global", jobTitle: "VP of Security", topic: "Cybersecurity in the Age of AI", linkedin: "https://linkedin.com/in/aminaokafor", sortOrder: 3 },
    { firstName: "James", lastName: "Whitfield", email: "james.whitfield@example.com", bio: "Pioneer in sustainable technology solutions. James leads initiatives that bridge the gap between innovation and environmental responsibility.", company: "GreenTech Solutions", jobTitle: "Founder & CTO", topic: "Sustainable Innovation", linkedin: "https://linkedin.com/in/jameswhitfield", sortOrder: 4 },
  ];

  for (const p of summitPanelists) {
    await prisma.panelist.create({ data: { ...p, eventId: summit.id } });
  }

  const summitSponsors = [
    { name: "TechCorp Global", tier: "platinum", website: "https://techcorp.example.com", sortOrder: 1 },
    { name: "InnovateTech", tier: "platinum", website: "https://innovatetech.example.com", sortOrder: 2 },
    { name: "CloudScale", tier: "gold", website: "https://cloudscale.example.com", sortOrder: 3 },
    { name: "DataDriven", tier: "gold", website: "https://datadriven.example.com", sortOrder: 4 },
    { name: "SecureNet", tier: "silver", website: "https://securenet.example.com", sortOrder: 5 },
    { name: "DevTools Pro", tier: "silver", website: "https://devtools.example.com", sortOrder: 6 },
    { name: "AI Partners", tier: "bronze", website: "https://aipartners.example.com", sortOrder: 7 },
  ];

  for (const s of summitSponsors) {
    await prisma.sponsor.create({ data: { ...s, eventId: summit.id } });
  }

  // ---------- Event 2: Design Conference ----------
  const design = await prisma.event.create({
    data: {
      slug: "design-conf-2026",
      title: "Design Conference 2026",
      tagline: "Crafting Tomorrow's Experiences",
      description:
        "A two-day immersive conference for designers, product leaders, and creative technologists. Explore the intersection of design thinking, AI-powered tools, and human-centered innovation.",
      date: new Date("2026-09-20T09:00:00Z"),
      endDate: new Date("2026-09-21T18:00:00Z"),
      venue: "Centre Pompidou",
      address: "Place Georges-Pompidou",
      city: "Paris",
      country: "France",
      latitude: 48.8607,
      longitude: 2.3524,
      themeColor: "#6366f1",
      maxAttendees: 300,
      isPublished: true,
    },
  });

  const designPanelists = [
    { firstName: "Lena", lastName: "Rodriguez", email: "lena@example.com", bio: "Head of Design at Figma, leading design systems and accessibility initiatives for millions of designers worldwide.", company: "Figma", jobTitle: "Head of Design", topic: "Design Systems at Scale", linkedin: "https://linkedin.com/in/lenarodriguez", sortOrder: 1 },
    { firstName: "Kai", lastName: "Nakamura", email: "kai@example.com", bio: "Award-winning UX researcher with a focus on inclusive design. Previously at Google and Apple, now consulting for top startups.", company: "DesignCraft Studio", jobTitle: "Principal UX Researcher", topic: "Inclusive Design Patterns", linkedin: "https://linkedin.com/in/kainakamura", sortOrder: 2 },
    { firstName: "Fatou", lastName: "Diallo", email: "fatou@example.com", bio: "Creative director and author of 'Design for Impact'. Expert in brand identity and motion design for digital products.", company: "Studio Noire", jobTitle: "Creative Director", topic: "Motion Design for Products", linkedin: "https://linkedin.com/in/fatoudiallo", sortOrder: 3 },
  ];

  for (const p of designPanelists) {
    await prisma.panelist.create({ data: { ...p, eventId: design.id } });
  }

  const designSponsors = [
    { name: "Figma", tier: "platinum", website: "https://figma.com", sortOrder: 1 },
    { name: "Adobe", tier: "gold", website: "https://adobe.com", sortOrder: 2 },
    { name: "Framer", tier: "gold", website: "https://framer.com", sortOrder: 3 },
    { name: "Webflow", tier: "silver", website: "https://webflow.com", sortOrder: 4 },
  ];

  for (const s of designSponsors) {
    await prisma.sponsor.create({ data: { ...s, eventId: design.id } });
  }

  // ---------- Event 3: Startup Meetup (draft) ----------
  const startup = await prisma.event.create({
    data: {
      slug: "startup-meetup-2026",
      title: "Startup Meetup Abidjan",
      tagline: "Africa's Next Unicorns",
      description:
        "Connect with the most promising startups in West Africa. Pitch competitions, investor panels, and networking with the ecosystem's key players.",
      date: new Date("2026-11-05T10:00:00Z"),
      endDate: new Date("2026-11-05T20:00:00Z"),
      venue: "Sofitel Abidjan Hotel Ivoire",
      address: "Boulevard Hassan II",
      city: "Abidjan",
      country: "Ivory Coast",
      latitude: 5.3544,
      longitude: -3.9654,
      themeColor: "#f59e0b",
      maxAttendees: 200,
      isPublished: false,
    },
  });

  console.log(`Seeded: ${summit.title} (${summit.slug}) - published`);
  console.log(`Seeded: ${design.title} (${design.slug}) - published`);
  console.log(`Seeded: ${startup.title} (${startup.slug}) - draft`);
  console.log(`Seeded ${summitPanelists.length + designPanelists.length} panelists`);
  console.log(`Seeded ${summitSponsors.length + designSponsors.length} sponsors`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
