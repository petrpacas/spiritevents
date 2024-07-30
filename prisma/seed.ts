import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "test@test.test",
      password: "$2a$12$aXnqIR7GgUYf5l6teIABqu9xW2RkfRJbXYjnx64xrHM34v2z8rKUK", // testtest
      role: UserRole.ADMIN,
    },
  });

  await prisma.event.create({
    data: {
      country: "CZ",
      dateEnd: "2025-01-05",
      dateStart: "2025-01-01",
      description: "Description of Dummy Event 1",
      id: "clz4j8eg0000308la2zb6hkq9",
      linkMap: "https://map.dummy-event-1.example/",
      linkWebsite: "https://website.dummy-event-1.example/",
      slug: "dummy-event-1",
      title: "Dummy Event 1",
    },
  });
  await prisma.event.create({
    data: {
      country: "GR",
      dateEnd: "2025-02-05",
      dateStart: "2025-02-01",
      description: "Description of Dummy Event 2",
      id: "clz4j8ojh000408labjhiaxag",
      linkMap: "https://map.dummy-event-2.example/",
      linkWebsite: "https://website.dummy-event-2.example/",
      slug: "dummy-event-2",
      title: "Dummy Event 2",
    },
  });
  await prisma.event.create({
    data: {
      country: "DE",
      dateEnd: "2025-03-05",
      dateStart: "2025-03-01",
      description: "Description of Dummy Event 3",
      id: "clz4j8t5f000508la762o8ujp",
      linkMap: "https://map.dummy-event-3.example/",
      linkWebsite: "https://website.dummy-event-3.example/",
      slug: "dummy-event-3",
      title: "Dummy Event 3",
    },
  });
  await prisma.event.create({
    data: {
      country: "CZ",
      dateEnd: "2025-04-05",
      dateStart: "2025-04-01",
      description: "Description of Dummy Event 4",
      id: "clz4j8xdx000608laa5cr135t",
      linkMap: "https://map.dummy-event-4.example/",
      linkWebsite: "https://website.dummy-event-4.example/",
      slug: "dummy-event-4",
      title: "Dummy Event 4",
    },
  });
  await prisma.event.create({
    data: {
      country: "GR",
      dateEnd: "2025-05-05",
      dateStart: "2025-05-01",
      description: "Description of Dummy Event 5",
      id: "clz4j92yk000708lae32n70ff",
      linkMap: "https://map.dummy-event-5.example/",
      linkWebsite: "https://website.dummy-event-5.example/",
      slug: "dummy-event-5",
      title: "Dummy Event 5",
    },
  });
  await prisma.event.create({
    data: {
      country: "DE",
      dateEnd: "2025-06-05",
      dateStart: "2025-06-01",
      description: "Description of Dummy Event 6",
      id: "clz4j979f000808la29hcgby1",
      linkMap: "https://map.dummy-event-6.example/",
      linkWebsite: "https://website.dummy-event-6.example/",
      slug: "dummy-event-6",
      title: "Dummy Event 6",
    },
  });
  await prisma.event.create({
    data: {
      country: "CZ",
      dateEnd: "2025-07-05",
      dateStart: "2025-07-01",
      description: "Description of Dummy Event 7",
      id: "clz4j9b9p000908la0sf63jkq",
      linkMap: "https://map.dummy-event-7.example/",
      linkWebsite: "https://website.dummy-event-7.example/",
      slug: "dummy-event-7",
      title: "Dummy Event 7",
    },
  });
  await prisma.event.create({
    data: {
      country: "GR",
      dateEnd: "2025-08-05",
      dateStart: "2025-08-01",
      description: "Description of Dummy Event 8",
      id: "clz4j9euk000a08la7e99ex1y",
      linkMap: "https://map.dummy-event-8.example/",
      linkWebsite: "https://website.dummy-event-8.example/",
      slug: "dummy-event-8",
      title: "Dummy Event 8",
    },
  });
  await prisma.event.create({
    data: {
      country: "DE",
      dateEnd: "2025-09-05",
      dateStart: "2025-09-01",
      description: "Description of Dummy Event 9",
      id: "clz4j9jfp000b08lad50iejr8",
      linkMap: "https://map.dummy-event-9.example/",
      linkWebsite: "https://website.dummy-event-9.example/",
      slug: "dummy-event-9",
      title: "Dummy Event 9",
    },
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
