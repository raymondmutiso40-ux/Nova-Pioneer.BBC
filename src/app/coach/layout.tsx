import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="COACH" userName={session.user.name || "Coach"} />
      <main className="flex-1 p-6 md:p-8 max-w-[1400px]">{children}</main>
    </div>
  );
}
