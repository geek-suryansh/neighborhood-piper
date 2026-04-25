'use client';

import dynamic from 'next/dynamic';

const JobMap = dynamic(() => import('@/components/JobMap'), { ssr: false });

const LEGEND = [
  { type: "Full-time", color: "#f97316" },
  { type: "Part-time", color: "#3b82f6" },
  { type: "Flexible", color: "#10b981" },
  { type: "Evening shifts", color: "#8b5cf6" },
];

export default function JobsPage() {
  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Home
          </a>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <span className="font-bold text-gray-900">Jobs Near You</span>
            <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">12 listings</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <span>📍 Amsterdam</span>
          <span className="text-gray-200">·</span>
          <span>No Dutch required for most roles</span>
        </div>
      </header>

      {/* Map + Legend */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <JobMap />

          {/* Legend overlay */}
          <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-lg p-4 text-xs">
            <p className="font-semibold text-gray-700 mb-3">Job Type</p>
            <div className="flex flex-col gap-2">
              {LEGEND.map((l) => (
                <div key={l.type} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: l.color }} />
                  <span className="text-gray-600">{l.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tip overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-full shadow px-4 py-2 text-xs text-gray-500 pointer-events-none">
            Click a pin to see job details
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-gray-100 overflow-y-auto">
          <div className="p-4 border-b border-gray-50">
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { title: "Warehouse Associate", company: "PostNL", neighborhood: "Noord", type: "Full-time", salary: "€13/hr", color: "#f97316" },
              { title: "Kitchen Helper", company: "Pllek", neighborhood: "Noord", type: "Part-time", salary: "€12.50/hr", color: "#3b82f6" },
              { title: "Bicycle Courier", company: "Gorillas", neighborhood: "Centrum", type: "Flexible", salary: "€13/hr", color: "#10b981" },
              { title: "Cleaning Staff", company: "Sodexo", neighborhood: "Zuidas", type: "Full-time", salary: "€12.50/hr", color: "#f97316" },
              { title: "Market Stall Helper", company: "Albert Cuyp", neighborhood: "De Pijp", type: "Part-time", salary: "€11/hr", color: "#3b82f6" },
              { title: "Hotel Housekeeper", company: "NH Hotels", neighborhood: "Centrum", type: "Full-time", salary: "€13.50/hr", color: "#f97316" },
              { title: "Construction Laborer", company: "VolkerWessels", neighborhood: "Sloterdijk", type: "Full-time", salary: "€14/hr", color: "#f97316" },
              { title: "Supermarket Cashier", company: "Albert Heijn", neighborhood: "Oost", type: "Part-time", salary: "€12/hr", color: "#3b82f6" },
              { title: "Dishwasher", company: "Cafe de Jaren", neighborhood: "Centrum", type: "Evening shifts", salary: "€12/hr", color: "#8b5cf6" },
              { title: "Flower Packer", company: "FloraHolland", neighborhood: "Westpoort", type: "Full-time", salary: "€13/hr", color: "#f97316" },
              { title: "Care Assistant", company: "Cordaan", neighborhood: "Jordaan", type: "Part-time", salary: "€14/hr", color: "#3b82f6" },
              { title: "Logistics Picker", company: "Bol.com", neighborhood: "Bijlmer", type: "Full-time", salary: "€13.50/hr", color: "#f97316" },
            ].map((job) => (
              <div key={job.title} className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900 group-hover:text-orange-500 transition-colors">{job.title}</span>
                  <span className="text-xs font-bold text-orange-500 shrink-0 ml-2">{job.salary}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{job.company} · {job.neighborhood}</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: job.color + '20', color: job.color }}>
                  {job.type}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
