import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (await prisma.adminUser.findFirst({ where: { role: "admin" } })) {
    console.log("Bootstrap: admin already exists, skipping.");
    return;
  }

  const orgName = process.env.ORG_NAME || "QualiEvents";
  const orgSlug = process.env.ORG_SLUG || "qualievents";
  const deployMode = process.env.DEPLOY_MODE || "saas";

  const org = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: {},
    create: { name: orgName, slug: orgSlug, plan: deployMode === "saas" ? "pro" : "free" },
  });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@qualievents.com";
  const adminPassword = process.env.ADMIN_PASS || "admin123";
  const adminName = process.env.ADMIN_NAME || "Admin";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.create({
    data: { email: adminEmail, name: adminName, passwordHash, role: "admin", orgId: org.id },
  });

  console.log(`Bootstrap: admin created (${adminEmail})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
