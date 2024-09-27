import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "test@test.test",
      password: "$2a$12$aXnqIR7GgUYf5l6teIABqu9xW2RkfRJbXYjnx64xrHM34v2z8rKUK",
      // "testtest"
      role: UserRole.ADMIN,
    },
  });

  const category1 = await prisma.category.create({
    data: {
      name: "Category 1",
      slug: "category-1",
    },
  });
  const category2 = await prisma.category.create({
    data: {
      name: "Category 2",
      slug: "category-2",
    },
  });
  const category3 = await prisma.category.create({
    data: {
      name: "Category 3",
      slug: "category-3",
    },
  });

  await prisma.event.create({
    data: {
      dateEnd: "2025-01-05",
      dateStart: "2025-01-01",
      description: "Popisek Dummy Event 1",
      location: "Náplavka, Praha",
      linkFbEvent: "https://fbEvent.dummy-event-1.example/",
      linkLocation: "https://location.dummy-event-1.example/",
      linkTickets: "https://tickets.dummy-event-1.example/",
      linkWebsite: "https://website.dummy-event-1.example/",
      region: "PHA",
      slug: "dummy-event-1",
      timeEnd: "22:00",
      timeStart: "20:00",
      title: "Dummy Event 1",
      categories: {
        connect: [{ id: category1.id }, { id: category2.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-02-05",
      dateStart: "2025-02-01",
      description: "Popisek Dummy Event 2",
      location: "Špilberk, Brno",
      linkFbEvent: "https://fbEvent.dummy-event-2.example/",
      linkLocation: "https://location.dummy-event-2.example/",
      linkTickets: "https://tickets.dummy-event-2.example/",
      linkWebsite: "https://website.dummy-event-2.example/",
      region: "JHM",
      slug: "dummy-event-2",
      timeEnd: "",
      timeStart: "15:00",
      title: "Dummy Event 2",
      categories: {
        connect: [{ id: category2.id }, { id: category3.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-03-05",
      dateStart: "2025-03-01",
      description: "Popisek Dummy Event 3",
      location: "Uhelné doly, Ostrava",
      linkFbEvent: "https://fbEvent.dummy-event-3.example/",
      linkLocation: "https://location.dummy-event-3.example/",
      linkTickets: "https://tickets.dummy-event-3.example/",
      linkWebsite: "https://website.dummy-event-3.example/",
      region: "MSK",
      slug: "dummy-event-3",
      timeEnd: "",
      timeStart: "",
      title: "Dummy Event 3",
      categories: {
        connect: [{ id: category3.id }, { id: category1.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-04-05",
      dateStart: "2025-04-01",
      description: "Popisek Dummy Event 4",
      location: "Náplavka, Praha",
      linkFbEvent: "https://fbEvent.dummy-event-4.example/",
      linkLocation: "https://location.dummy-event-4.example/",
      linkTickets: "https://tickets.dummy-event-4.example/",
      linkWebsite: "https://website.dummy-event-4.example/",
      region: "PHA",
      slug: "dummy-event-4",
      timeEnd: "22:00",
      timeStart: "20:00",
      title: "Dummy Event 4",
      categories: {
        connect: [{ id: category1.id }, { id: category2.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-05-05",
      dateStart: "2025-05-01",
      description: "Popisek Dummy Event 5",
      location: "Špilberk, Brno",
      linkFbEvent: "https://fbEvent.dummy-event-5.example/",
      linkLocation: "https://location.dummy-event-5.example/",
      linkTickets: "https://tickets.dummy-event-5.example/",
      linkWebsite: "https://website.dummy-event-5.example/",
      region: "JHM",
      slug: "dummy-event-5",
      timeEnd: "",
      timeStart: "15:00",
      title: "Dummy Event 5",
      categories: {
        connect: [{ id: category2.id }, { id: category3.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-06-05",
      dateStart: "2025-06-01",
      description: "Popisek Dummy Event 6",
      location: "Uhelné doly, Ostrava",
      linkFbEvent: "https://fbEvent.dummy-event-6.example/",
      linkLocation: "https://location.dummy-event-6.example/",
      linkTickets: "https://tickets.dummy-event-6.example/",
      linkWebsite: "https://website.dummy-event-6.example/",
      region: "MSK",
      slug: "dummy-event-6",
      timeEnd: "",
      timeStart: "",
      title: "Dummy Event 6",
      categories: {
        connect: [{ id: category3.id }, { id: category1.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-07-05",
      dateStart: "2025-07-01",
      description: "Popisek Dummy Event 7",
      location: "Náplavka, Praha",
      linkFbEvent: "https://fbEvent.dummy-event-7.example/",
      linkLocation: "https://location.dummy-event-7.example/",
      linkTickets: "https://tickets.dummy-event-7.example/",
      linkWebsite: "https://website.dummy-event-7.example/",
      region: "PHA",
      slug: "dummy-event-7",
      timeEnd: "22:00",
      timeStart: "20:00",
      title: "Dummy Event 7",
      categories: {
        connect: [{ id: category1.id }, { id: category2.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-08-05",
      dateStart: "2025-08-01",
      description: "Popisek Dummy Event 8",
      location: "Špilberk, Brno",
      linkFbEvent: "https://fbEvent.dummy-event-8.example/",
      linkLocation: "https://location.dummy-event-8.example/",
      linkTickets: "https://tickets.dummy-event-8.example/",
      linkWebsite: "https://website.dummy-event-8.example/",
      region: "JHM",
      slug: "dummy-event-8",
      timeEnd: "",
      timeStart: "15:00",
      title: "Dummy Event 8",
      categories: {
        connect: [{ id: category2.id }, { id: category3.id }],
      },
    },
  });
  await prisma.event.create({
    data: {
      dateEnd: "2025-09-05",
      dateStart: "2025-09-01",
      description: "Popisek Dummy Event 9",
      location: "Uhelné doly, Ostrava",
      linkFbEvent: "https://fbEvent.dummy-event-9.example/",
      linkLocation: "https://location.dummy-event-9.example/",
      linkTickets: "https://tickets.dummy-event-9.example/",
      linkWebsite: "https://website.dummy-event-9.example/",
      region: "MSK",
      slug: "dummy-event-9",
      timeEnd: "",
      timeStart: "",
      title: "Dummy Event 9",
      categories: {
        connect: [{ id: category3.id }, { id: category1.id }],
      },
    },
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
