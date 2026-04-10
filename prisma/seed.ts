import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- Organization ----------
  const orgName = process.env.ORG_NAME || "QualiEvents";
  const orgSlug = process.env.ORG_SLUG || "qualievents";
  const deployMode = process.env.DEPLOY_MODE || "onpremise";

  const org = await prisma.organization.create({
    data: { name: orgName, slug: orgSlug, plan: deployMode === "saas" ? "pro" : "free" },
  });

  // ---------- Admin User ----------
  const adminEmail = process.env.ADMIN_EMAIL || "admin@qualievents.com";
  const adminPassword = process.env.ADMIN_PASS || "admin123";
  const adminName = process.env.ADMIN_NAME || "Admin";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.create({
    data: { email: adminEmail, name: adminName, passwordHash: adminHash, role: "admin", orgId: org.id },
  });

  // ---------- Staff User (optional demo) ----------
  if (process.env.SEED_DEMO_DATA !== "false") {
    const staffHash = await bcrypt.hash("staff123", 12);
    await prisma.adminUser.create({
      data: { email: "staff@qualievents.com", name: "Staff Scanner", passwordHash: staffHash, role: "staff", orgId: org.id },
    });
  }

  // ---------- Demo Events (skip if SEED_DEMO_DATA=false) ----------
  if (process.env.SEED_DEMO_DATA === "false") {
    console.log(`\nOrganization: ${orgName} (${orgSlug})`);
    console.log(`Admin user: ${adminEmail}`);
    console.log("Demo data skipped.");
    return;
  }

  const summit = await prisma.event.create({
    data: {
      slug: "summit-2026", title: "QualiEvents Summit 2026", tagline: "Where Innovation Meets Opportunity",
      description: "Join us for the premier technology and innovation summit of the year. Connect with industry leaders, discover cutting-edge solutions, and shape the future of digital transformation.",
      date: new Date("2026-06-15T09:00:00Z"), endDate: new Date("2026-06-17T18:00:00Z"),
      venue: "Palais des Congres", address: "2 Place de la Porte Maillot", city: "Paris", country: "France",
      latitude: 48.8789, longitude: 2.283, themeColor: "#e94560", maxAttendees: 500, isPublished: true, orgId: org.id,
    },
  });

  const design = await prisma.event.create({
    data: {
      slug: "design-conf-2026", title: "Design Conference 2026", tagline: "Crafting Tomorrow's Experiences",
      description: "A two-day immersive conference for designers, product leaders, and creative technologists.",
      date: new Date("2026-09-20T09:00:00Z"), endDate: new Date("2026-09-21T18:00:00Z"),
      venue: "Centre Pompidou", address: "Place Georges-Pompidou", city: "Paris", country: "France",
      latitude: 48.8607, longitude: 2.3524, themeColor: "#6366f1", maxAttendees: 300, isPublished: true, orgId: org.id,
    },
  });

  await prisma.event.create({
    data: {
      slug: "startup-meetup-2026", title: "Startup Meetup Abidjan", tagline: "Africa's Next Unicorns",
      description: "Connect with the most promising startups in West Africa. Pitch competitions, investor panels, and networking.",
      date: new Date("2026-11-05T10:00:00Z"), endDate: new Date("2026-11-05T20:00:00Z"),
      venue: "Sofitel Abidjan Hotel Ivoire", address: "Boulevard Hassan II", city: "Abidjan", country: "Ivory Coast",
      latitude: 5.3544, longitude: -3.9654, themeColor: "#f59e0b", maxAttendees: 200, isPublished: false, orgId: org.id,
    },
  });

  // Panelists
  for (const p of [
    { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@example.com", bio: "CEO of TechForward Inc. 15+ years in AI/ML.", company: "TechForward Inc.", jobTitle: "CEO & Co-Founder", topic: "The Future of AI in Enterprise", sortOrder: 1 },
    { firstName: "Marc", lastName: "Dubois", email: "marc.dubois@example.com", bio: "Award-winning researcher on digital transformation.", company: "Innovation Labs", jobTitle: "Chief Innovation Officer", topic: "Digital Transformation Strategies", sortOrder: 2 },
    { firstName: "Amina", lastName: "Okafor", email: "amina.okafor@example.com", bio: "Cybersecurity expert. Top 50 women in tech.", company: "SecureNet Global", jobTitle: "VP of Security", topic: "Cybersecurity in the Age of AI", sortOrder: 3 },
    { firstName: "James", lastName: "Whitfield", email: "james.whitfield@example.com", bio: "Pioneer in sustainable technology solutions.", company: "GreenTech Solutions", jobTitle: "Founder & CTO", topic: "Sustainable Innovation", sortOrder: 4 },
  ]) await prisma.panelist.create({ data: { ...p, eventId: summit.id } });

  for (const p of [
    { firstName: "Lena", lastName: "Rodriguez", email: "lena@example.com", bio: "Head of Design at Figma.", company: "Figma", jobTitle: "Head of Design", topic: "Design Systems at Scale", sortOrder: 1 },
    { firstName: "Kai", lastName: "Nakamura", email: "kai@example.com", bio: "Award-winning UX researcher.", company: "DesignCraft Studio", jobTitle: "Principal UX Researcher", topic: "Inclusive Design Patterns", sortOrder: 2 },
    { firstName: "Fatou", lastName: "Diallo", email: "fatou@example.com", bio: "Creative director. Author of 'Design for Impact'.", company: "Studio Noire", jobTitle: "Creative Director", topic: "Motion Design for Products", sortOrder: 3 },
  ]) await prisma.panelist.create({ data: { ...p, eventId: design.id } });

  // Sponsors
  for (const s of [
    { name: "TechCorp Global", tier: "platinum", sortOrder: 1 }, { name: "InnovateTech", tier: "platinum", sortOrder: 2 },
    { name: "CloudScale", tier: "gold", sortOrder: 3 }, { name: "DataDriven", tier: "gold", sortOrder: 4 },
    { name: "SecureNet", tier: "silver", sortOrder: 5 }, { name: "DevTools Pro", tier: "silver", sortOrder: 6 },
    { name: "AI Partners", tier: "bronze", sortOrder: 7 },
  ]) await prisma.sponsor.create({ data: { ...s, eventId: summit.id } });

  for (const s of [
    { name: "Figma", tier: "platinum", sortOrder: 1 }, { name: "Adobe", tier: "gold", sortOrder: 2 },
    { name: "Framer", tier: "gold", sortOrder: 3 }, { name: "Webflow", tier: "silver", sortOrder: 4 },
  ]) await prisma.sponsor.create({ data: { ...s, eventId: design.id } });

  console.log(`\nOrganization: ${orgName} (${orgSlug})`);
  console.log(`Admin: ${adminEmail}`);
  console.log("Staff: staff@qualievents.com / staff123");
  console.log("3 events, 7 panelists, 11 sponsors seeded.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
