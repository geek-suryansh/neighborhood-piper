import Link from "next/link";

// Junta identity: International Orange #E85520 · Navy #1D3B6B · Oatmeal #F2EDE4

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
    <div
      className="min-h-screen"
      style={{
        background: "#F2EDE4",
        color: "#1D3B6B",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <img src="/junta-logo.png" alt="Junta" className="h-11 rounded-lg" />
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="hidden sm:block text-sm font-semibold px-3 py-2 transition-colors"
            style={{ color: "#1D3B6B" }}
          >
            Jobs map
          </Link>
          <Link
            href="/app"
            className="px-5 py-2 rounded-full text-sm font-bold transition-colors text-white"
            style={{ background: "#E85520" }}
          >
            Find my job →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}
        <div>
          <h1
            className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-6"
            style={{ color: "#1D3B6B" }}
          >
            Amsterdam<br />
            has your job.<br />
            <span style={{ color: "#E85520" }}>Let&apos;s find it.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-4 max-w-md" style={{ color: "#5A6E8A" }}>
            Answer 5 questions. Get matched to real local jobs near you.
          </p>

          <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "#7A8FA8" }}>
            No account. No documents. We never ask where you&apos;re from
            or what your status is — just what you&apos;re good at.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/app"
              className="px-7 py-3.5 rounded-full font-bold text-base transition-colors text-center text-white"
              style={{ background: "#E85520" }}
            >
              Start — it&apos;s free
            </Link>
            <Link
              href="/jobs"
              className="px-7 py-3.5 rounded-full font-bold text-base transition-colors text-center"
              style={{ border: "2px solid #1D3B6B", color: "#1D3B6B" }}
            >
              Browse the map
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm" style={{ color: "#7A8FA8" }}>
            <span className="flex items-center gap-1.5">🔒 Fully anonymous</span>
            <span className="flex items-center gap-1.5">🌍 No Dutch required</span>
            <span className="flex items-center gap-1.5">📍 Amsterdam only</span>
          </div>
        </div>

        {/* Right — quiz card mock */}
        <div className="flex justify-center lg:justify-end">
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: "#FAFAF5", border: "1.5px solid #D4C9BA" }}
          >
            <div
              className="px-5 pt-5 pb-4 flex items-center justify-between"
              style={{ borderBottom: "1.5px solid #D4C9BA" }}
            >
              <div className="flex items-center gap-2">
                <img src="/junta-logo.png" alt="Junta" className="h-6 rounded" />
                <span className="text-sm font-bold" style={{ color: "#1D3B6B" }}>Vind je bijbaan</span>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#EDE8DC", color: "#7A6E63" }}
              >
                Stap 2 van 5
              </span>
            </div>
            <div style={{ height: 4, background: "#EDE8DC" }}>
              <div style={{ height: 4, background: "#E85520", width: "40%" }} />
            </div>
            <div className="px-5 py-6">
              <p
                className="text-xs mb-1 font-bold uppercase tracking-widest"
                style={{ color: "#7A6E63" }}
              >
                Interesses
              </p>
              <p className="text-lg font-black mb-5" style={{ color: "#1D3B6B" }}>
                Wat vind je leuk om te doen?
              </p>
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
                    className="rounded-xl px-3 py-2 text-xs text-center font-semibold cursor-pointer"
                    style={
                      s.l === "Eten & Horeca"
                        ? { background: "#E85520", border: "1.5px solid #E85520", color: "#fff" }
                        : { background: "#EDE8DC", border: "1.5px solid #D4C9BA", color: "#1D3B6B" }
                    }
                  >
                    {s.e} {s.l}
                  </div>
                ))}
              </div>
              <div
                className="rounded-xl py-3 text-center text-sm font-bold text-white"
                style={{ background: "#E85520" }}
              >
                Volgende →
              </div>
            </div>
            <div className="px-5 pb-4 text-center">
              <p className="text-xs" style={{ color: "#B0A89A" }}>Anoniem · Gratis · 5 minuten</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        id="how-it-works"
        style={{ background: "#EDE8DC", borderTop: "1.5px solid #D4C9BA", borderBottom: "1.5px solid #D4C9BA" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16" style={{ color: "#1D3B6B" }}>
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-4">
                <span
                  className="text-6xl font-black leading-none"
                  style={{ color: "#E85520", opacity: 0.25 }}
                >
                  {s.n}
                </span>
                <h3 className="text-lg font-black" style={{ color: "#1D3B6B" }}>{s.title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: "#5A6E8A" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job categories ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#F2EDE4" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-3" style={{ color: "#1D3B6B" }}>
            What kind of jobs?
          </h2>
          <p className="text-center mb-10 max-w-md mx-auto text-sm" style={{ color: "#5A6E8A" }}>
            Real listings from Amsterdam employers — updated every week.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.label}
                className="rounded-xl px-4 py-4 flex items-center gap-3 transition-colors"
                style={{ background: "#FAFAF5", border: "1.5px solid #D4C9BA" }}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm font-semibold leading-snug" style={{ color: "#1D3B6B" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Anonymous promise ───────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: "#EDE8DC", borderTop: "1.5px solid #D4C9BA" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl mb-6 block">🔒</span>
          <h2 className="text-3xl sm:text-4xl font-black mb-5" style={{ color: "#1D3B6B" }}>
            We never ask who you are.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#5A6E8A" }}>
            No name. No address. No documents. No questions about your residency, visa, or background.
            Just tell us what you&apos;re good at and what you&apos;re looking for.
            That&apos;s all we need.
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: "#E85520" }}>
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          Your job is out there.
        </h2>
        <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
          Let&apos;s go find it.
        </p>
        <Link
          href="/app"
          className="inline-block px-10 py-4 rounded-full text-lg font-black transition-colors"
          style={{ background: "#1D3B6B", color: "#fff" }}
        >
          Start the 5-minute quiz →
        </Link>
        <p className="text-sm mt-5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Free · Anonymous · Amsterdam
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
        style={{ borderTop: "1.5px solid #D4C9BA", color: "#7A8FA8" }}
      >
        <img src="/junta-logo.png" alt="Junta" className="h-8 rounded-md" />
        <p>
          Built with ❤️ in Amsterdam by{" "}
          <span className="font-bold" style={{ color: "#1D3B6B" }}>Erwin, Jeroen &amp; Suryansh</span>
        </p>
        <p>Hackathon 2026</p>
      </footer>
    </div>
  );
}
