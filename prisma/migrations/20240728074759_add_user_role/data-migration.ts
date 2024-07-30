import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany();
    for (const user of users) {
      await tx.user.update({
        data: {
          // @ts-expect-error: User.isAdmin was replaced
          role: user.isAdmin ? "ADMIN" : "USER",
        },
        where: { id: user.id },
      });
    }
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
