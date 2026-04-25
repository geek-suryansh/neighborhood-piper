import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you like",
    desc: "Skills, interests, how many hours you want. Takes 5 minutes. No documents. No Dutch required.",
  },
  {
    n: "02",
    title: "We find your matches",
    desc: "Our AI reads every job in Amsterdam and finds the ones that fit you — by neighborhood, by hours, by what you're good at.",
  },
  {
    n: "03",
    title: "Apply directly",
    desc: "Real listings, real links. Go straight to the employer. No waiting list, no middleman.",
  },
];

const CATEGORIES = [
  { emoji: "📦", label: "Warehouse & Logistics" },
  { emoji: "🍽️", label: "Horeca & Kitchen" },
  { emoji: "🏪", label: "Retail & Shop" },
  { emoji: "🧹", label: "Cleaning & Facility" },
  { emoji: "💻", label: "Admin & Office" },
  { emoji: "🏗️", label: "Building & Handwerk" },
  { emoji: "🤝", label: "Care & Community" },
  { emoji: "🚲", label: "Delivery & Transport" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪈</span>
          <span className="font-bold text-lg text-white tracking-tight">neighborhood-piper</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/jobs" className="hidden sm:block text-zinc-400 text-sm font-medium hover:text-white transition-colors px-3 py-2">
            Jobs map
          </Link>
          <Link
            href="/stap"
            className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-400 transition-colors"
          >
            Find my job →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}
        <div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Amsterdam<br />
            has your job.<br />
            <span className="text-orange-400">Let&apos;s find it.</span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-4 max-w-md">
            Answer 5 questions. Get matched to real local jobs near you.
          </p>

          <p className="text-zinc-500 text-base leading-relaxed mb-8 max-w-md">
            No account. No documents. We never ask where you&apos;re from
            or what your status is — just what you&apos;re good at.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/stap"
              className="bg-orange-500 hover:bg-orange-400 text-white px-7 py-3.5 rounded-full font-semibold text-base transition-colors text-center"
            >
              Start — it&apos;s free
            </Link>
            <Link
              href="/jobs"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-7 py-3.5 rounded-full font-semibold text-base transition-colors text-center"
            >
              Browse the map
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="text-zinc-300">🔒</span> Fully anonymous</span>
            <span className="flex items-center gap-1.5"><span className="text-zinc-300">🌍</span> No Dutch required</span>
            <span className="flex items-center gap-1.5"><span className="text-zinc-300">📍</span> Amsterdam only</span>
          </div>
        </div>

        {/* Right — quiz card mock */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🪈</span>
                <span className="text-sm font-semibold text-zinc-300">Vind je bijbaan</span>
              </div>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Stap 2 van 5</span>
            </div>
            <div className="h-1 bg-zinc-800">
              <div className="h-1 bg-orange-500 w-[40%]" />
            </div>
            <div className="px-5 py-6">
              <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Interesses</p>
              <p className="text-lg font-bold text-white mb-5">Wat vind je leuk om te doen?</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { e: "💻", l: "Tech" },
                  { e: "🤝", l: "Mensen helpen" },
                  { e: "🍕", l: "Eten & Horeca" },
                  { e: "🔧", l: "Bouwen" },
                  { e: "⚽", l: "Sport" },
                  { e: "🎨", l: "Creatief" },
                ].map(s => (
                  <div
                    key={s.l}
                    className={`border rounded-xl px-3 py-2 text-xs text-center transition-colors cursor-pointer ${
                      s.l === "Eten & Horeca"
                        ? "bg-orange-500 border-orange-500 text-white font-semibold"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {s.e} {s.l}
                  </div>
                ))}
              </div>
              <div className="bg-orange-500 rounded-xl py-3 text-center text-sm font-semibold text-white">
                Volgende →
              </div>
            </div>
            <div className="px-5 pb-4 text-center">
              <p className="text-xs text-zinc-600">Anoniem · Gratis · 5 minuten</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 py-24 px-6" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-4">
                <span className="text-6xl font-black text-zinc-800 leading-none">{s.n}</span>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job categories ──────────────────────────────────────── */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            What kind of jobs?
          </h2>
          <p className="text-zinc-400 text-center mb-10 max-w-md mx-auto text-sm">
            Real listings from Amsterdam employers — updated every week.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <div key={c.label} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-zinc-600 transition-colors">
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm text-zinc-300 font-medium leading-snug">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Anonymous promise ───────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl mb-6 block">🔒</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
            We never ask who you are.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            No name. No address. No documents. No questions about your residency, visa, or background.
            Just tell us what you&apos;re good at and what you&apos;re looking for.
            That&apos;s all we need.
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="bg-orange-500 py-24 px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          Your job is out there.
        </h2>
        <p className="text-orange-100 text-lg mb-10 max-w-md mx-auto">
          Let&apos;s go find it.
        </p>
        <Link
          href="/stap"
          className="inline-block bg-white hover:bg-orange-50 text-orange-500 px-10 py-4 rounded-full text-lg font-bold transition-colors"
        >
          Start the 5-minute quiz →
        </Link>
        <p className="text-orange-200 text-sm mt-5">Free · Anonymous · Amsterdam</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 py-10 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <span>🪈</span>
          <span className="text-zinc-400 font-medium">neighborhood-piper</span>
        </div>
        <p>Built with ❤️ in Amsterdam by <span className="text-zinc-300 font-medium">Erwin, Jeroen &amp; Suryansh</span></p>
        <p>Hackathon 2026</p>
      </footer>
    </div>
  );
}
