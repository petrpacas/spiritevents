import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.event.upsert({
    where: { id: "dummy-id-1" },
    update: {},
    create: {
      id: "dummy-id-1",
      title: "Dummy Event 1",
      dateStart: "2025-01-01",
      dateEnd: "2025-01-05",
      country: "Czech Republic",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-1.example/",
      description: "Description of Dummy Event 1",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-2" },
    update: {},
    create: {
      id: "dummy-id-2",
      title: "Dummy Event 2",
      dateStart: "2025-02-01",
      dateEnd: "2025-02-05",
      country: "GR",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-2.example/",
      description: "Description of Dummy Event 2",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-3" },
    update: {},
    create: {
      id: "dummy-id-3",
      title: "Dummy Event 3",
      dateStart: "2025-03-01",
      dateEnd: "2025-03-05",
      country: "DE",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-3.example/",
      description: "Description of Dummy Event 3",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-4" },
    update: {},
    create: {
      id: "dummy-id-4",
      title: "Dummy Event 4",
      dateStart: "2025-04-01",
      dateEnd: "2025-04-05",
      country: "Czech Republic",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-4.example/",
      description: "Description of Dummy Event 4",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-5" },
    update: {},
    create: {
      id: "dummy-id-5",
      title: "Dummy Event 5",
      dateStart: "2025-05-01",
      dateEnd: "2025-05-05",
      country: "GR",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-5.example/",
      description: "Description of Dummy Event 5",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-6" },
    update: {},
    create: {
      id: "dummy-id-6",
      title: "Dummy Event 6",
      dateStart: "2025-06-01",
      dateEnd: "2025-06-05",
      country: "DE",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-6.example/",
      description: "Description of Dummy Event 6",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-7" },
    update: {},
    create: {
      id: "dummy-id-7",
      title: "Dummy Event 7",
      dateStart: "2025-07-01",
      dateEnd: "2025-07-05",
      country: "Czech Republic",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-7.example/",
      description: "Description of Dummy Event 7",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-8" },
    update: {},
    create: {
      id: "dummy-id-8",
      title: "Dummy Event 8",
      dateStart: "2025-08-01",
      dateEnd: "2025-08-05",
      country: "GR",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-8.example/",
      description: "Description of Dummy Event 8",
    },
  });
  await prisma.event.upsert({
    where: { id: "dummy-id-9" },
    update: {},
    create: {
      id: "dummy-id-9",
      title: "Dummy Event 9",
      dateStart: "2025-09-01",
      dateEnd: "2025-09-05",
      country: "DE",
      coords: "50.075395,14.436610",
      link: "https://link.dummy-event-9.example/",
      description: "Description of Dummy Event 9",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
