/**
 * Seed de DESARROLLO/PRUEBAS. Crea los roles base y dos usuarios de prueba
 * para poder hacer login (POST /api/auth/login) sin pasar por el endpoint
 * de creación de usuarios (que requiere ser ADMIN — problema del huevo y la
 * gallina en un ambiente nuevo).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: "SELLER" },
    update: {},
    create: { name: "SELLER" },
  });

  const passwordHash = await bcrypt.hash("changeme123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sistema-ventas.dev" },
    update: {},
    create: { email: "admin@sistema-ventas.dev", passwordHash, roleId: adminRole.id },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@sistema-ventas.dev" },
    update: {},
    create: { email: "seller@sistema-ventas.dev", passwordHash, roleId: sellerRole.id },
  });

  console.log("Seed listo. Haz login con estas credenciales (password para ambos: changeme123):");
  console.log(`  ADMIN  -> ${admin.email}`);
  console.log(`  SELLER -> ${seller.email}`);
  console.log("  POST /api/auth/login { email, password } devuelve accessToken/refreshToken.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
