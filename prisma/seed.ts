import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CURRICULUM } from "../src/lib/curriculum";

const prisma = new PrismaClient();

const PLAYERS = [
  { name: "Aisha M", grade: "7A", position: "Point Guard" },
  { name: "Zahra K", grade: "7B", position: "Shooting Guard" },
  { name: "Lena P", grade: "6A", position: "Forward" },
  { name: "Sofia T", grade: "7A", position: "Center" },
  { name: "Maria N", grade: "6B", position: "Guard" },
  { name: "Faith W", grade: "6A", position: "Forward" },
];

function courtFor(week: number) {
  return week % 3 === 0 ? "Main Court" : week % 2 === 0 ? "Court 2" : "Court 1";
}

function dayFor(idx: number) {
  return ["Tue", "Fri", "Sat"][idx % 3];
}

function randRating() {
  return Math.floor(Math.random() * 2) + 4; // 4 or 5, trending positive
}

async function main() {
  console.log("Seeding Nova Pioneer database...");

  await prisma.assessment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();

  const coachPassword = await bcrypt.hash("Coach@2026", 10);
  const modPassword = await bcrypt.hash("Moderator@2026", 10);

  await prisma.user.createMany({
    data: [
      { name: "Coach Maya", email: "coach@novapioneer.ke", password: coachPassword, role: "COACH" },
      { name: "Moderator", email: "moderator@novapioneer.ke", password: modPassword, role: "MODERATOR" },
    ],
  });

  const players = await Promise.all(
    PLAYERS.map((p) => prisma.player.create({ data: { ...p, status: "Active" } }))
  );

  const startDate = new Date("2026-08-26");
  let sessionCount = 0;

  for (const block of CURRICULUM) {
    for (let d = 0; d < 3; d++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + (block.week - 1) * 7 + d * 2);

      const session = await prisma.trainingSession.create({
        data: {
          date: sessionDate,
          day: dayFor(d),
          focusArea: block.theme,
          time: d === 2 ? "8:00 AM - 10:00 AM" : "3:30 PM - 5:30 PM",
          court: courtFor(block.week),
          coach: "Maya",
        },
      });
      sessionCount++;

      for (const player of players) {
        const present = Math.random() > 0.1;
        await prisma.attendance.create({
          data: { playerId: player.id, sessionId: session.id, status: present ? "Present" : "Absent" },
        });

        if (present) {
          const skillsObj: Record<string, number> = {};
          for (const s of block.skills) skillsObj[s] = randRating();
          const avg = Object.values(skillsObj).reduce((a, b) => a + b, 0) / Object.values(skillsObj).length;
          await prisma.assessment.create({
            data: {
              playerId: player.id,
              sessionId: session.id,
              week: block.week,
              focusArea: block.theme,
              skills: skillsObj,
              avgScore: Math.round((avg / 5) * 100 * (0.85 + block.week * 0.017)), // gentle upward trend
              notes: block.week === 1 ? "Strong communication." : undefined,
            },
          });
        }
      }
    }
  }

  console.log(`Seeded ${players.length} players and ${sessionCount} sessions.`);
  console.log("Login as Coach: coach@novapioneer.ke / Coach@2026");
  console.log("Login as Moderator: moderator@novapioneer.ke / Moderator@2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
