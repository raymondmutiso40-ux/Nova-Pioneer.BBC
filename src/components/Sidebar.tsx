"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = { label: string; href: string; icon: string };

const COACH_NAV: NavItem[] = [
  { label: "Overview", href: "/coach", icon: "🏠" },
  { label: "Players", href: "/coach/players", icon: "👥" },
  { label: "Sessions (Training Plan)", href: "/coach/sessions", icon: "📅" },
  { label: "Attendance", href: "/coach/attendance", icon: "✅" },
  { label: "Assessments", href: "/coach/assessments", icon: "📝" },
  { label: "Progress", href: "/coach/progress", icon: "📈" },
  { label: "Settings", href: "/coach/settings", icon: "⚙️" },
];

const MODERATOR_NAV: NavItem[] = [
  { label: "All Players", href: "/moderator", icon: "👥" },
];

export default function Sidebar({
  role,
  userName,
}: {
  role: "COACH" | "MODERATOR";
  userName: string;
}) {
  const pathname = usePathname();
  const items = role === "COACH" ? COACH_NAV : MODERATOR_NAV;

  return (
    <aside className="w-64 bg-navy text-white min-h-screen flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full border-2 border-gold flex items-center justify-center text-gold font-bold text-sm">
            NP
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">NOVA PIONEER</p>
            <p className="text-[11px] text-gold-light leading-tight">
              {role === "COACH" ? "Girls Basketball Portfolio" : "Moderator Portal"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active ? "bg-gold text-navy font-semibold" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy text-xs font-bold">
            {userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold">{userName}</p>
            <p className="text-[10px] text-white/50">{role === "COACH" ? "Head Coach" : "Moderator"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-white/60 hover:text-white underline"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
