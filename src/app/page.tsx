import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "COACH") redirect("/coach");
    redirect("/moderator");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/nova-pioneer-logo.svg"
        aria-hidden="true"
      >
        <source src="/Player_playing_basketball_on_court_202609032129.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-navy/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/65 to-navy/25" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 md:px-10 md:py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/nova-pioneer-logo.svg" alt="Nova Pioneer" className="h-12 w-auto rounded bg-white p-1" />
            <span className="hidden border-l border-white/30 pl-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light sm:block">
              Athletics
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-semibold transition hover:border-gold hover:bg-gold hover:text-navy"
          >
            Staff sign in
          </Link>
        </header>

        <section className="flex flex-1 items-center py-16 md:max-w-3xl md:py-24">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-gold-light">Basketball</p>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              Build the player.
              <span className="mt-2 block text-gold">Shape the leader.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 md:text-lg">
              A clear, thoughtful home for player development, performance insights, and the work that happens between every game.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-navy transition hover:bg-gold-light"
              >
                Enter the portfolio
              </Link>
              <span className="text-xs uppercase tracking-[0.18em] text-white/55">Nova Pioneer Schools for Innovators &amp; Leaders</span>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/20 pt-5 text-xs uppercase tracking-[0.16em] text-white/55">
          <span>Player development program</span>
          <span>Confidential staff platform</span>
        </footer>
      </div>
    </main>
  );
}
