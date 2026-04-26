'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Job } from '@/components/JobMap';

const JobMap = dynamic(() => import('@/components/JobMap'), { ssr: false });

const TYPE_COLORS: Record<string, string> = {
  'Full-time':   '#f97316',
  'Part-time':   '#3b82f6',
  'Flexible':    '#10b981',
  'Evening':     '#8b5cf6',
  'Weekend':     '#ec4899',
  'Traineeship': '#0ea5e9',
  'Temporary':   '#f59e0b',
};

const LEGEND = Object.entries(TYPE_COLORS);

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((data) => { setJobs(data.jobs || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const filtered = jobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase()) ||
    j.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">← Home</a>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <span className="font-bold text-gray-900">Jobs Near You</span>
            {loading ? (
              <span className="bg-gray-100 text-gray-400 text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">Loading…</span>
            ) : (
              <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {filtered.length} listings
              </span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <span>Source:</span>
          <a href="https://www.youngcapital.nl/vacatures-in/amsterdam" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-semibold hover:underline">YoungCapital Amsterdam</a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Fetching live jobs from YoungCapital…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-white gap-2">
              <span className="text-4xl">⚠️</span>
              <p className="text-gray-700 font-semibold">Could not load jobs</p>
              <button onClick={() => { setError(false); setLoading(true); fetch('/api/jobs').then(r => r.json()).then(d => { setJobs(d.jobs || []); setLoading(false); }).catch(() => setError(true)); }} className="text-sm text-orange-500 hover:underline">Try again</button>
            </div>
          )}
          <JobMap jobs={filtered} />

          {/* Legend */}
          <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-lg p-4 text-xs">
            <p className="font-semibold text-gray-700 mb-3">Job Type</p>
            <div className="flex flex-col gap-2">
              {LEGEND.map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-gray-600">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {!loading && !error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-full shadow px-4 py-2 text-xs text-gray-500 pointer-events-none">
              {filtered.length} live jobs · Click a pin for details
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-gray-100 overflow-y-auto">
          <div className="p-4 border-b border-gray-50 sticky top-0 bg-white z-10">
            <input
              type="text"
              placeholder="Search jobs, locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="p-4 flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded mb-3 w-1/2" />
                  <div className="h-5 bg-gray-100 rounded-full w-20" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No jobs found</p>
            ) : (
              filtered.map((job) => (
                <a
                  key={job.id}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all group block"
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <span className="font-semibold text-sm text-gray-900 group-hover:text-orange-500 transition-colors leading-tight">{job.title}</span>
                    <span className="text-xs font-bold text-orange-500 shrink-0">{job.salary}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">📍 {job.location}</div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: (TYPE_COLORS[job.type] || '#6b7280') + '20', color: TYPE_COLORS[job.type] || '#6b7280' }}
                  >
                    {job.type}
                  </span>
                </a>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
