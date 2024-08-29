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

  await prisma.event.create({
    data: {
      country: "CZ",
      dateEnd: "2025-01-05",
      dateStart: "2025-01-01",
      description: "Description of Dummy Event 1",
      location: "Prague",
      linkFbEvent: "https://fbEvent.dummy-event-1.example/",
      linkLocation: "https://location.dummy-event-1.example/",
      linkTickets: "https://tickets.dummy-event-1.example/",
      linkWebsite: "https://website.dummy-event-1.example/",
      slug: "dummy-event-1",
      timeEnd: "22:00",
      timeStart: "20:00",
      title: "Dummy Event 1",
    },
  });
  await prisma.event.create({
    data: {
      country: "GR",
      dateEnd: "2025-02-05",
      dateStart: "2025-02-01",
      description: "Description of Dummy Event 2",
      location: "Arillas, Corfu",
      linkFbEvent: "https://fbEvent.dummy-event-2.example/",
      linkLocation: "https://location.dummy-event-2.example/",
      linkTickets: "https://tickets.dummy-event-2.example/",
      linkWebsite: "https://website.dummy-event-2.example/",
      slug: "dummy-event-2",
      timeEnd: "",
      timeStart: "15:00",
      title: "Dummy Event 2",
    },
  });
  await prisma.event.create({
    data: {
      country: "DE",
      dateEnd: "2025-03-05",
      dateStart: "2025-03-01",
      description: "Description of Dummy Event 3",
      location: "Berlin",
      linkFbEvent: "https://fbEvent.dummy-event-3.example/",
      linkLocation: "https://location.dummy-event-3.example/",
      linkTickets: "https://tickets.dummy-event-3.example/",
      linkWebsite: "https://website.dummy-event-3.example/",
      slug: "dummy-event-3",
      timeEnd: "",
      timeStart: "",
      title: "Dummy Event 3",
    },
  });
  await prisma.event.create({
    data: {
      country: "CZ",
      dateEnd: "2025-04-05",
      dateStart: "2025-04-01",
      description: "Description of Dummy Event 4",
      location: "Prague",
      linkFbEvent: "https://fbEvent.dummy-event-4.example/",
      linkLocation: "https://location.dummy-event-4.example/",
      linkTickets: "https://tickets.dummy-event-4.example/",
      linkWebsite: "https://website.dummy-event-4.example/",
      slug: "dummy-event-4",
      timeEnd: "22:00",
      timeStart: "20:00",
      title: "Dummy Event 4",
    },
  });
  await prisma.event.create({
    data: {
      country: "GR",
      dateEnd: "2025-05-05",
      dateStart: "2025-05-01",
      description: "Description of Dummy Event 5",
      location: "Arillas, Corfu",
      linkFbEvent: "https://fbEvent.dummy-event-5.example/",
      linkLocation: "https://location.dummy-event-5.example/",
      linkTickets: "https://tickets.dummy-event-5.example/",
      linkWebsite: "https://website.dummy-event-5.example/",
      slug: "dummy-event-5",
      timeEnd: "",
      timeStart: "15:00",
      title: "Dummy Event 5",
    },
  });
  await prisma.event.create({
    data: {
      country: "DE",
      dateEnd: "2025-06-05",
      dateStart: "2025-06-01",
      description: "Description of Dummy Event 6",
      location: "Berlin",
      linkFbEvent: "https://fbEvent.dummy-event-6.example/",
      linkLocation: "https://location.dummy-event-6.example/",
      linkTickets: "https://tickets.dummy-event-6.example/",
      linkWebsite: "https://website.dummy-event-6.example/",
      slug: "dummy-event-6",
      timeEnd: "",
      timeStart: "",
      title: "Dummy Event 6",
    },
  });
  await prisma.event.create({
    data: {
      country: "CZ",
      dateEnd: "2025-07-05",
      dateStart: "2025-07-01",
      description: "Description of Dummy Event 7",
      location: "Prague",
      linkFbEvent: "https://fbEvent.dummy-event-7.example/",
      linkLocation: "https://location.dummy-event-7.example/",
      linkTickets: "https://tickets.dummy-event-7.example/",
      linkWebsite: "https://website.dummy-event-7.example/",
      slug: "dummy-event-7",
      timeEnd: "22:00",
      timeStart: "20:00",
      title: "Dummy Event 7",
    },
  });
  await prisma.event.create({
    data: {
      country: "GR",
      dateEnd: "2025-08-05",
      dateStart: "2025-08-01",
      description: "Description of Dummy Event 8",
      location: "Arillas, Corfu",
      linkFbEvent: "https://fbEvent.dummy-event-8.example/",
      linkLocation: "https://location.dummy-event-8.example/",
      linkTickets: "https://tickets.dummy-event-8.example/",
      linkWebsite: "https://website.dummy-event-8.example/",
      slug: "dummy-event-8",
      timeEnd: "",
      timeStart: "15:00",
      title: "Dummy Event 8",
    },
  });
  await prisma.event.create({
    data: {
      country: "DE",
      dateEnd: "2025-09-05",
      dateStart: "2025-09-01",
      description: "Description of Dummy Event 9",
      location: "Berlin",
      linkFbEvent: "https://fbEvent.dummy-event-9.example/",
      linkLocation: "https://location.dummy-event-9.example/",
      linkTickets: "https://tickets.dummy-event-9.example/",
      linkWebsite: "https://website.dummy-event-9.example/",
      slug: "dummy-event-9",
      timeEnd: "",
      timeStart: "",
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
