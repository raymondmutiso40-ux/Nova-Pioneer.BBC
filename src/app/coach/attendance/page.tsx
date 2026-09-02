import { prisma } from "@/lib/prisma";
import AttendanceForm from "./AttendanceForm";

export default async function AttendancePage() {
  const sessions = await prisma.trainingSession.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Attendance</h1>
      <p className="text-sm text-gray-500 mb-6">Select a session and mark each player present or absent.</p>
      <AttendanceForm sessions={JSON.parse(JSON.stringify(sessions))} />
    </div>
  );
}
