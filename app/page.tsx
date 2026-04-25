import Link from "next/link";

const PERSONAS = [
  {
    name: "Ibrahim",
    age: 19,
    district: "Bijlmer-Oost",
    flag: "🇸🇾",
    looking: "Part-time, max 20 hrs",
    quote: "I don't know where to start. I just know I want to work.",
  },
  {
    name: "Fatima",
    age: 17,
    district: "Amsterdam-West",
    flag: "🇲🇦",
    looking: "Weekend shifts, hospitality",
    quote: "I'm still in school but I want to earn my own money.",
  },
  {
    name: "Darius",
    age: 18,
    district: "Zuidoost",
    flag: "🇬🇭",
    looking: "Full-time logistics",
    quote: "I finished VMBO. I'm ready. I just need the right door.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us about yourself",
    desc: "Skills, interests, availability. 5 questions, no account, no Dutch required.",
  },
  {
    n: "02",
    title: "We match you",
    desc: "Our AI reads every job listing in Amsterdam and finds your closest fits.",
  },
  {
    n: "03",
    title: "Apply directly",
    desc: "Real listings, real links. No middleman, no waiting list.",
  },
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
            Jobs Map
          </Link>
          <Link href="/match" className="hidden sm:block text-zinc-400 text-sm font-medium hover:text-white transition-colors px-3 py-2">
            Match me
          </Link>
          <Link
            href="/stap"
            className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-400 transition-colors"
          >
            Start quiz →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left — copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
            Amsterdam · Hackathon 2026
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Your first job<br />
            in Amsterdam.<br />
            <span className="text-orange-400">Found in 5 minutes.</span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-lg">
            Answer 5 questions. Get matched to real local jobs — by AI, not algorithms.
            Anonymous. Free. No Dutch required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/stap"
              className="bg-orange-500 hover:bg-orange-400 text-white px-7 py-3.5 rounded-full font-semibold text-base transition-colors text-center"
            >
              Start the quiz — 5 min
            </Link>
            <Link
              href="/jobs"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-7 py-3.5 rounded-full font-semibold text-base transition-colors text-center"
            >
              Browse jobs map
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <span><span className="text-white font-semibold">300+</span> live jobs</span>
            <span className="w-px h-4 bg-zinc-700" />
            <span><span className="text-white font-semibold">0</span> accounts needed</span>
            <span className="w-px h-4 bg-zinc-700" />
            <span><span className="text-white font-semibold">Amsterdam</span> only</span>
          </div>
        </div>

        {/* Right — quiz card mock */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
            {/* card header */}
            <div className="px-5 pt-5 pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🪈</span>
                <span className="text-sm font-semibold text-zinc-300">Vind je bijbaan</span>
              </div>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Stap 1 van 5</span>
            </div>
            {/* progress bar */}
            <div className="h-1 bg-zinc-800">
              <div className="h-1 bg-orange-500 w-[20%]" />
            </div>
            {/* question */}
            <div className="px-5 py-6">
              <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Jouw naam</p>
              <p className="text-lg font-bold text-white mb-5">Hoi! Hoe mogen we je noemen?</p>
              <div className="bg-zinc-800 rounded-xl px-4 py-3 text-zinc-400 text-sm border border-zinc-700 mb-4">
                Jouw voornaam...
              </div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {["💻 Tech", "🤝 Mensen", "🍕 Horeca", "🔧 Bouwen"].map(s => (
                  <div key={s} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 text-center cursor-pointer transition-colors">{s}</div>
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

      {/* ── The Problem ─────────────────────────────────────────── */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-6">The problem we&apos;re solving</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-6">
            Amsterdam has plenty of jobs.<br />
            <span className="text-zinc-400">Nobody showed them the door.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Youth unemployment in Bijlmer, Oost, and West runs twice the city average —
            not because young people don&apos;t want to work, but because the system
            wasn&apos;t built for them. Wrong language, wrong network, wrong starting point.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-800 rounded-2xl overflow-hidden">
            {[
              { stat: "2×", label: "higher unemployment in Bijlmer vs city average" },
              { stat: "40%", label: "of Amsterdam youth with migration background are NEET" },
              { stat: "5 min", label: "is all it takes to get matched with a real local job" },
            ].map((s) => (
              <div key={s.stat} className="bg-zinc-900 px-6 py-8 text-center">
                <p className="text-4xl font-black text-orange-400 mb-2">{s.stat}</p>
                <p className="text-sm text-zinc-400 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="py-24 px-6" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-4 text-center">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            Simple. Fast. Actually useful.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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

      {/* ── Personas ────────────────────────────────────────────── */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-4 text-center">Built for real people</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Their story. Not a statistic.
          </h2>
          <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto">
            These are the people we built this for. They have skills, ambitions, and a schedule.
            They just needed someone to point the way.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PERSONAS.map((p) => (
              <div key={p.name} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-zinc-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-lg">{p.name}, {p.age}</p>
                    <p className="text-zinc-500 text-sm">{p.district}</p>
                  </div>
                  <span className="text-2xl">{p.flag}</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic">
                  &ldquo;{p.quote}&rdquo;
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">Looking for</p>
                  <p className="text-sm text-orange-400 font-medium mt-0.5">{p.looking}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────── */}
      <section className="py-14 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🔒", label: "Anonymous", sub: "No account ever" },
            { icon: "🆓", label: "Free", sub: "Always, forever" },
            { icon: "📍", label: "Amsterdam", sub: "Real local listings" },
            { icon: "🌍", label: "Any language", sub: "Dutch not required" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{t.icon}</span>
              <p className="text-white font-semibold text-sm">{t.label}</p>
              <p className="text-zinc-500 text-xs">{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            A new city shouldn&apos;t<br />
            feel like a maze.
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            We built this because everyone deserves a neighbor who knows the way.
          </p>
          <Link
            href="/stap"
            className="inline-block bg-orange-500 hover:bg-orange-400 text-white px-10 py-4 rounded-full text-lg font-bold transition-colors"
          >
            Find my job in Amsterdam →
          </Link>
          <p className="text-zinc-600 text-sm mt-5">5 minutes · anonymous · free</p>
        </div>
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
