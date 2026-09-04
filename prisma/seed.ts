import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Role } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

async function main() {
  const gymName = process.env.GYM_NAME ?? 'My Gym';
  await prisma.gymSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', name: gymName },
  });

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const pin = process.env.SUPER_ADMIN_PIN;

  if (!email || !password) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in backend/.env to seed');
  }
  if (pin && !/^\d{4}$/.test(pin)) {
    throw new Error('SUPER_ADMIN_PIN must be exactly 4 digits');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const pinHash = pin ? await bcrypt.hash(pin, 12) : undefined;

  await prisma.user.upsert({
    where: { email },
    update: { pinHash },
    create: {
      name: process.env.SUPER_ADMIN_NAME ?? 'Super Admin',
      email,
      passwordHash,
      pinHash,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Seeded gym settings and super admin (${email})${pin ? ' with a PIN' : ''}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
