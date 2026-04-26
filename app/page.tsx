export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪈</span>
          <span className="font-bold text-xl text-gray-900">neighborhood-piper</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/jobs"
            className="text-gray-600 text-sm font-medium hover:text-orange-500 transition-colors"
          >
            🗺️ Jobs Map
          </a>
          <a
            href="/stap"
            className="text-gray-600 text-sm font-medium hover:text-orange-500 transition-colors"
          >
            ⚡ STAP
          </a>
          <a
            href="#get-started"
            className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span>🇳🇱</span> Built at a hackathon in Amsterdam
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto">
          Amsterdam is yours.<br />
          <span className="text-orange-500">We&apos;ll show you around.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Neighborhood Piper is a local guide built for refugees arriving in Amsterdam —
          helping you find housing, food, healthcare, and community in your new home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center" id="get-started">
          <a
            href="#"
            className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Explore Amsterdam
          </a>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            How it works
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Everything you need to settle in
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            We&apos;ve mapped the resources that matter most — so you spend less time searching and more time living.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: "💼", title: "Jobs Near You", desc: "Browse local job listings on an interactive map. Filter by neighborhood and type.", link: "/jobs" },
              { emoji: "⚡", title: "STAP — Vind je baan", desc: "Ontdek welke bijbaan bij je past via een korte quiz. Anoniem, in 5 minuten.", link: "/stap" },
              { emoji: "🏠", title: "Housing", desc: "Find shelters, temp housing, and social housing registrations near you." },
              { emoji: "🥗", title: "Food & Groceries", desc: "Food banks, halal markets, community kitchens, and cheap supermarkets." },
              { emoji: "🏥", title: "Healthcare", desc: "GP registration, mental health support, dental care, and pharmacies." },
              { emoji: "🗣️", title: "Language & Integration", desc: "Free Dutch classes, translation help, and integration programs." },
              { emoji: "⚖️", title: "Legal Aid", desc: "Know your rights. Connect with legal aid services and refugee lawyers." },
              { emoji: "🚲", title: "Getting Around", desc: "Bike rentals, OV chip card help, and public transport guides." },
              { emoji: "👥", title: "Community", desc: "Meet your neighbors. Find cultural associations and social events." },
              { emoji: "📞", title: "Emergency Contacts", desc: "Crisis lines, police, ambulance, and refugee support hotlines." },
            ].map((f) => (
              f.link ? (
                <a key={f.title} href={f.link} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-200 border border-transparent transition-all group">
                  <div className="text-3xl mb-4">{f.emoji}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  <p className="text-xs text-orange-500 font-semibold mt-3">Open map →</p>
                </a>
              ) : (
                <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-4">{f.emoji}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 max-w-6xl mx-auto px-6" id="how-it-works">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Simple. Clear. Yours.
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          No complicated sign-ups. No waiting. Just open and explore.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Pick your neighborhood", desc: "Tell us which part of Amsterdam you're in — or anywhere you're headed." },
            { step: "02", title: "Choose what you need", desc: "Browse by category: food, health, legal, community — in your language." },
            { step: "03", title: "Get there", desc: "Get directions, contact info, and opening hours. Fully offline-ready." },
          ].map((s) => (
            <div key={s.step} className="flex flex-col gap-4">
              <span className="text-5xl font-black text-orange-100">{s.step}</span>
              <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-orange-500 py-20 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          A new city shouldn&apos;t feel like a maze.
        </h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          We built this because everyone deserves a neighbor who knows the way.
        </p>
        <a
          href="#"
          className="bg-white text-orange-500 px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-50 transition-colors inline-block"
        >
          Open the Guide
        </a>
      </section>

      {/* Footer / Team */}
      <footer className="py-12 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-lg">🪈</span>
          <span>neighborhood-piper</span>
        </div>
        <p>Built with ❤️ in Amsterdam by <span className="text-gray-700 font-medium">Erwin, Jeroen &amp; Suryansh</span></p>
        <p>Hackathon 2026</p>
      </footer>
    </div>
  );
}
