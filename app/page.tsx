import Link from "next/link";
import { getLocale, getTranslations } from 'next-intl/server';

const STEPS_EN = [
  {
    n: "01",
    title: "Tell us what you like",
    desc: "Skills, interests, how many hours you want. Takes 5 minutes. No documents. No Dutch required.",
  },
  {
    n: "02",
    title: "We find your matches",
    desc: "Our AI reads every job in Amsterdam and finds the ones that fit you — by neighbourhood, by hours, by what you're good at.",
  },
  {
    n: "03",
    title: "Apply directly",
    desc: "Real listings, real links. Go straight to the employer. No waiting list, no middleman.",
  },
];

const STEPS_NL = [
  {
    n: "01",
    title: "Vertel ons wat je leuk vindt",
    desc: "Skills, interesses, hoeveel uur je wilt. Duurt 5 minuten. Geen documenten. Geen Nederlands nodig.",
  },
  {
    n: "02",
    title: "Wij vinden jouw matches",
    desc: "Onze AI leest elke vacature in Amsterdam en vindt die welke bij jou passen — op buurt, op uren, op wat je goed kunt.",
  },
  {
    n: "03",
    title: "Solliciteer direct",
    desc: "Echte vacatures, echte links. Ga direct naar de werkgever. Geen wachtlijst, geen tussenpersoon.",
  },
];

const CATEGORIES_EN = [
  { emoji: "📦", label: "Warehouse & Logistics" },
  { emoji: "🍽️", label: "Hospitality & Kitchen" },
  { emoji: "🏪", label: "Retail & Shop" },
  { emoji: "🧹", label: "Cleaning & Facility" },
  { emoji: "💻", label: "Admin & Office" },
  { emoji: "🏗️", label: "Building & Crafts" },
  { emoji: "🤝", label: "Care & Community" },
  { emoji: "🚲", label: "Delivery & Transport" },
];

const CATEGORIES_NL = [
  { emoji: "📦", label: "Warehouse & Logistiek" },
  { emoji: "🍽️", label: "Horeca & Keuken" },
  { emoji: "🏪", label: "Retail & Winkel" },
  { emoji: "🧹", label: "Schoonmaak & Facilitair" },
  { emoji: "💻", label: "Admin & Kantoor" },
  { emoji: "🏗️", label: "Bouwen & Handwerk" },
  { emoji: "🤝", label: "Zorg & Community" },
  { emoji: "🚲", label: "Bezorgen & Transport" },
];

// Design system: BG #FFFFFF · Card #FFFFFF · Accent #eb4d02 · Blue #4A9FE5 · Pink #F4A0A4 · Dim #666666 · Border #E8E8E8

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('landing');
  const isNL = locale === 'nl';

  const STEPS = isNL ? STEPS_NL : STEPS_EN;
  const CATEGORIES = isNL ? CATEGORIES_NL : CATEGORIES_EN;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#FFFFFF",
        color: "#0D0D0D",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto"
        style={{ borderBottom: "1.5px solid #E8E8E8" }}
      >
        <img src="/junta-logo.png" alt="Junta" className="h-11 rounded-lg" />
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="hidden sm:block text-sm font-semibold px-3 py-2 transition-colors"
            style={{ color: "#0D0D0D" }}
          >
            {t('nav.jobsMap')}
          </Link>
          <Link
            href="/employer"
            className="hidden sm:block text-sm font-semibold px-3 py-2 transition-colors"
            style={{ color: "#666666" }}
          >
            {t('nav.postJob')}
          </Link>
          <Link
            href="/app"
            className="px-5 py-2 rounded-full text-sm font-bold transition-colors text-white"
            style={{ background: "#0D0D0D" }}
          >
            {t('nav.findMyJob')}
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-14 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center overflow-hidden">

        {/* Decorative accents */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 48,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#eb4d02",
            opacity: 0.18,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 16,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#4A9FE5",
            opacity: 0.15,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "38%",
            width: 60,
            height: 80,
            borderRadius: 12,
            background: "#F4A0A4",
            opacity: 0.14,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Left */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-6"
            style={{ color: "#0D0D0D" }}
          >
            {t('hero.line1')}<br />
            {t('hero.line2')}<br />
            <span style={{ color: "#eb4d02" }}>{t('hero.accent')}</span>
          </h1>

          <p className="text-lg leading-relaxed mb-4 max-w-md" style={{ color: "#666666" }}>
            {t('hero.desc1')}
          </p>

          <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "#666666" }}>
            {t('hero.desc2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/app"
              className="px-7 py-3.5 rounded-full font-bold text-base transition-colors text-center text-white"
              style={{ background: "#0D0D0D" }}
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="/jobs"
              className="px-7 py-3.5 rounded-full font-bold text-base transition-colors text-center"
              style={{ border: "2px solid #0D0D0D", color: "#0D0D0D", background: "#FFFFFF" }}
            >
              {t('hero.browse')}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm" style={{ color: "#666666" }}>
            <span className="flex items-center gap-1.5">{t('hero.badge1')}</span>
            <span className="flex items-center gap-1.5">{t('hero.badge2')}</span>
            <span className="flex items-center gap-1.5">{t('hero.badge3')}</span>
          </div>
        </div>

        {/* Right — quiz card mock */}
        <div className="flex justify-center lg:justify-end" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: "1.5px solid #E8E8E8" }}
          >
            <div
              className="px-5 pt-5 pb-4 flex items-center justify-between"
              style={{ borderBottom: "1.5px solid #E8E8E8" }}
            >
              <div className="flex items-center gap-2">
                <img src="/junta-logo.png" alt="Junta" className="h-6 rounded" />
                <span className="text-sm font-bold" style={{ color: "#0D0D0D" }}>{t('quizCard.appName')}</span>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#F5F5F5", color: "#666666" }}
              >
                {t('quizCard.step')}
              </span>
            </div>
            <div style={{ height: 4, background: "#F5F5F5" }}>
              <div style={{ height: 4, background: "#eb4d02", width: "40%" }} />
            </div>
            <div className="px-5 py-6">
              <p
                className="text-xs mb-1 font-bold uppercase tracking-widest"
                style={{ color: "#666666" }}
              >
                {t('quizCard.interestLabel')}
              </p>
              <p className="text-lg font-black mb-5" style={{ color: "#0D0D0D" }}>
                {t('quizCard.question')}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {isNL ? (
                  <>
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
                            ? { background: "#0D0D0D", border: "1.5px solid #0D0D0D", color: "#fff" }
                            : { background: "#F5F5F5", border: "1.5px solid #E8E8E8", color: "#0D0D0D" }
                        }
                      >
                        {s.e} {s.l}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { e: "💻", l: "Tech" },
                      { e: "🤝", l: "Helping people" },
                      { e: "🍕", l: "Food & Hospitality" },
                      { e: "🔧", l: "Building" },
                      { e: "⚽", l: "Sport" },
                      { e: "🎨", l: "Creative" },
                    ].map(s => (
                      <div
                        key={s.l}
                        className="rounded-xl px-3 py-2 text-xs text-center font-semibold cursor-pointer"
                        style={
                          s.l === "Food & Hospitality"
                            ? { background: "#0D0D0D", border: "1.5px solid #0D0D0D", color: "#fff" }
                            : { background: "#F5F5F5", border: "1.5px solid #E8E8E8", color: "#0D0D0D" }
                        }
                      >
                        {s.e} {s.l}
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div
                className="rounded-xl py-3 text-center text-sm font-bold text-white"
                style={{ background: "#0D0D0D" }}
              >
                {t('quizCard.nextButton')}
              </div>
            </div>
            <div className="px-5 pb-4 text-center">
              <p className="text-xs" style={{ color: "#888888" }}>{t('quizCard.footer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        id="how-it-works"
        style={{ background: "#F5F5F5", borderTop: "1.5px solid #E8E8E8", borderBottom: "1.5px solid #E8E8E8" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16" style={{ color: "#0D0D0D" }}>
            {t('howItWorks.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-4">
                <span
                  className="text-6xl font-black leading-none"
                  style={{ color: "#eb4d02", opacity: 0.7 }}
                >
                  {s.n}
                </span>
                <h3 className="text-lg font-black" style={{ color: "#0D0D0D" }}>{s.title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: "#666666" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job categories ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-3" style={{ color: "#0D0D0D" }}>
            {t('categories.title')}
          </h2>
          <p className="text-center mb-10 max-w-md mx-auto text-sm" style={{ color: "#666666" }}>
            {t('categories.subtitle')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.label}
                className="rounded-xl px-4 py-4 flex items-center gap-3 transition-colors"
                style={{ background: "#F5F5F5", border: "1.5px solid #E8E8E8" }}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm font-semibold leading-snug" style={{ color: "#0D0D0D" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Anonymous promise ───────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: "#F5F5F5", borderTop: "1.5px solid #E8E8E8" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl mb-6 block">🔒</span>
          <h2 className="text-3xl sm:text-4xl font-black mb-5" style={{ color: "#0D0D0D" }}>
            {t('anonymous.title')}
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#666666" }}>
            {t('anonymous.desc')}
          </p>
        </div>
      </section>

      {/* ── Employer CTA ────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "#FFFFFF", borderTop: "1.5px solid #E8E8E8" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#0D0D0D" }}>
              {t('employer.title')}
            </h2>
            <p className="text-base max-w-md" style={{ color: "#666666" }}>
              {t('employer.desc')}
            </p>
          </div>
          <Link
            href="/employer"
            className="shrink-0 px-7 py-3.5 rounded-full font-bold text-base transition-colors text-center"
            style={{ border: "2px solid #eb4d02", color: "#eb4d02", background: "#FFFFFF", whiteSpace: "nowrap" }}
          >
            {t('employer.button')}
          </Link>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: "#0D0D0D" }}>
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          {t('cta.title')}
        </h2>
        <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
          {t('cta.desc')}
        </p>
        <Link
          href="/app"
          className="inline-block px-10 py-4 rounded-full text-lg font-black transition-colors"
          style={{ background: "#FFFFFF", color: "#0D0D0D" }}
        >
          {t('cta.button')}
        </Link>
        <p className="text-sm mt-5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {t('cta.note')}
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
        style={{ borderTop: "1.5px solid #E8E8E8", color: "#888888" }}
      >
        <img src="/junta-logo.png" alt="Junta" className="h-8 rounded-md" />
        <p>
          {t('footer.builtBy')}{" "}
          <span className="font-bold" style={{ color: "#0D0D0D" }}>{t('footer.team')}</span>
        </p>
        <p>{t('footer.hackathon')}</p>
      </footer>
    </div>
  );
}
