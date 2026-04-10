import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a sample event
  const event = await prisma.event.create({
    data: {
      title: "QualiEvents Summit 2026",
      description:
        "Join us for the premier technology and innovation summit of the year. Connect with industry leaders, discover cutting-edge solutions, and shape the future of digital transformation.",
      date: new Date("2026-06-15T09:00:00Z"),
      endDate: new Date("2026-06-17T18:00:00Z"),
      venue: "Palais des Congres",
      address: "2 Place de la Porte Maillot",
      city: "Paris",
      country: "France",
      latitude: 48.8789,
      longitude: 2.2830,
      maxAttendees: 500,
      isPublished: true,
    },
  });

  // Create panelists
  const panelists = [
    {
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@example.com",
      bio: "CEO of TechForward Inc. With over 15 years of experience in AI and machine learning, Sarah leads one of the fastest-growing tech companies in Europe.",
      company: "TechForward Inc.",
      jobTitle: "CEO & Co-Founder",
      topic: "The Future of AI in Enterprise",
      linkedin: "https://linkedin.com/in/sarahchen",
      sortOrder: 1,
    },
    {
      firstName: "Marc",
      lastName: "Dubois",
      email: "marc.dubois@example.com",
      bio: "Award-winning researcher and author on digital transformation. Marc has advised Fortune 500 companies on their innovation strategies.",
      company: "Innovation Labs",
      jobTitle: "Chief Innovation Officer",
      topic: "Digital Transformation Strategies",
      linkedin: "https://linkedin.com/in/marcdubois",
      sortOrder: 2,
    },
    {
      firstName: "Amina",
      lastName: "Okafor",
      email: "amina.okafor@example.com",
      bio: "Cybersecurity expert and keynote speaker. Amina has been recognized as one of the top 50 women in tech globally.",
      company: "SecureNet Global",
      jobTitle: "VP of Security",
      topic: "Cybersecurity in the Age of AI",
      linkedin: "https://linkedin.com/in/aminaokafor",
      sortOrder: 3,
    },
    {
      firstName: "James",
      lastName: "Whitfield",
      email: "james.whitfield@example.com",
      bio: "Pioneer in sustainable technology solutions. James leads initiatives that bridge the gap between innovation and environmental responsibility.",
      company: "GreenTech Solutions",
      jobTitle: "Founder & CTO",
      topic: "Sustainable Innovation",
      linkedin: "https://linkedin.com/in/jameswhitfield",
      sortOrder: 4,
    },
  ];

  for (const p of panelists) {
    await prisma.panelist.create({
      data: { ...p, eventId: event.id },
    });
  }

  // Create sponsors
  const sponsors = [
    { name: "TechCorp Global", tier: "platinum", website: "https://techcorp.example.com", sortOrder: 1 },
    { name: "InnovateTech", tier: "platinum", website: "https://innovatetech.example.com", sortOrder: 2 },
    { name: "CloudScale", tier: "gold", website: "https://cloudscale.example.com", sortOrder: 3 },
    { name: "DataDriven", tier: "gold", website: "https://datadriven.example.com", sortOrder: 4 },
    { name: "SecureNet", tier: "silver", website: "https://securenet.example.com", sortOrder: 5 },
    { name: "DevTools Pro", tier: "silver", website: "https://devtools.example.com", sortOrder: 6 },
    { name: "AI Partners", tier: "bronze", website: "https://aipartners.example.com", sortOrder: 7 },
  ];

  for (const s of sponsors) {
    await prisma.sponsor.create({
      data: { ...s, eventId: event.id },
    });
  }

  console.log(`Seeded event: ${event.title} (${event.id})`);
  console.log(`Seeded ${panelists.length} panelists`);
  console.log(`Seeded ${sponsors.length} sponsors`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
