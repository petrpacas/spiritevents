import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "Czech Republic",
      dateEnd: "2025-01-05",
      dateStart: "2025-01-01",
      description: "Description of Dummy Event 1",
      id: "dummy-id-1",
      link: "https://link.dummy-event-1.example/",
      title: "Dummy Event 1",
    },
    update: {},
    where: { id: "dummy-id-1" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "GR",
      dateEnd: "2025-02-05",
      dateStart: "2025-02-01",
      description: "Description of Dummy Event 2",
      id: "dummy-id-2",
      link: "https://link.dummy-event-2.example/",
      title: "Dummy Event 2",
    },
    update: {},
    where: { id: "dummy-id-2" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "DE",
      dateEnd: "2025-03-05",
      dateStart: "2025-03-01",
      description: "Description of Dummy Event 3",
      id: "dummy-id-3",
      link: "https://link.dummy-event-3.example/",
      title: "Dummy Event 3",
    },
    update: {},
    where: { id: "dummy-id-3" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "Czech Republic",
      dateEnd: "2025-04-05",
      dateStart: "2025-04-01",
      description: "Description of Dummy Event 4",
      id: "dummy-id-4",
      link: "https://link.dummy-event-4.example/",
      title: "Dummy Event 4",
    },
    update: {},
    where: { id: "dummy-id-4" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "GR",
      dateEnd: "2025-05-05",
      dateStart: "2025-05-01",
      description: "Description of Dummy Event 5",
      id: "dummy-id-5",
      link: "https://link.dummy-event-5.example/",
      title: "Dummy Event 5",
    },
    update: {},
    where: { id: "dummy-id-5" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "DE",
      dateEnd: "2025-06-05",
      dateStart: "2025-06-01",
      description: "Description of Dummy Event 6",
      id: "dummy-id-6",
      link: "https://link.dummy-event-6.example/",
      title: "Dummy Event 6",
    },
    update: {},
    where: { id: "dummy-id-6" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "Czech Republic",
      dateEnd: "2025-07-05",
      dateStart: "2025-07-01",
      description: "Description of Dummy Event 7",
      id: "dummy-id-7",
      link: "https://link.dummy-event-7.example/",
      title: "Dummy Event 7",
    },
    update: {},
    where: { id: "dummy-id-7" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "GR",
      dateEnd: "2025-08-05",
      dateStart: "2025-08-01",
      description: "Description of Dummy Event 8",
      id: "dummy-id-8",
      link: "https://link.dummy-event-8.example/",
      title: "Dummy Event 8",
    },
    update: {},
    where: { id: "dummy-id-8" },
  });
  await prisma.event.upsert({
    create: {
      coords: "50.075395,14.436610",
      country: "DE",
      dateEnd: "2025-09-05",
      dateStart: "2025-09-01",
      description: "Description of Dummy Event 9",
      id: "dummy-id-9",
      link: "https://link.dummy-event-9.example/",
      title: "Dummy Event 9",
    },
    update: {},
    where: { id: "dummy-id-9" },
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
