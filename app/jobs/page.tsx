'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { Job } from '@/components/JobMap';

const JobMap = dynamic(() => import('@/components/JobMap'), { ssr: false });

const C = {
  bg: '#F2EDE4',
  card: '#FAFAF5',
  accent: '#E85520',
  navy: '#1D3B6B',
  textDim: '#7A8FA8',
  border: '#D4C9BA',
  white: '#FAFAF5',
};

const TYPE_COLORS: Record<string, string> = {
  'Full-time':             '#1D3B6B',
  'Part-time':             '#E85520',
  'Full-time / Part-time': '#2563eb',
  'Flexible':              '#059669',
  'Evening':               '#7c3aed',
  'Weekend':               '#db2777',
  'Traineeship':           '#0284c7',
  'Temporary':             '#d97706',
};

const LEGEND = Object.entries(TYPE_COLORS);
const FONTS = `'Segoe UI', system-ui, sans-serif`;

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((data) => { setJobs(data.jobs || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    const el = cardRefs.current[selectedJob.id];
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedJob]);

  const filtered = jobs.filter((j) =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase()) ||
    j.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, fontFamily: FONTS, color: C.navy }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: `1.5px solid ${C.border}`,
        background: C.white, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ color: C.textDim, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Home</a>
          <span style={{ color: C.border }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/junta-logo.png" alt="Junta" style={{ height: 32, borderRadius: 6 }} />
            <span style={{ fontWeight: 800, color: C.navy, fontSize: 15 }}>Jobs in Amsterdam</span>
            {loading ? (
              <span style={{ background: C.bg, color: C.textDim, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>Laden…</span>
            ) : (
              <span style={{ background: `${C.accent}18`, color: C.accent, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                {filtered.length} vacatures
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: C.textDim }}>
          {selectedJob && (
            <button
              onClick={() => setSelectedJob(null)}
              style={{ color: C.accent, fontWeight: 700, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS }}
            >
              ✕ Deselecteer
            </button>
          )}
          <span>YoungCapital &amp; Olympia</span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(242,237,228,0.85)', backdropFilter: 'blur(4px)', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, border: `4px solid ${C.accent}`, borderTopColor: 'transparent',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 14, color: C.textDim, margin: 0 }}>Vacatures laden…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          {error && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: C.bg, gap: 8,
            }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
              <p style={{ color: C.navy, fontWeight: 700, margin: 0 }}>Kon vacatures niet laden</p>
              <button
                onClick={() => {
                  setError(false); setLoading(true);
                  fetch('/api/jobs').then(r => r.json()).then(d => { setJobs(d.jobs || []); setLoading(false); }).catch(() => setError(true));
                }}
                style={{ color: C.accent, fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS }}
              >
                Opnieuw proberen
              </button>
            </div>
          )}

          <JobMap jobs={filtered} selected={selectedJob} onSelect={setSelectedJob} />

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 24, left: 16, zIndex: 1000,
            background: C.white, borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            padding: '14px 16px', border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontWeight: 700, color: C.navy, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Type</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {LEGEND.map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: C.textDim }}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {!loading && !error && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1000, background: 'rgba(250,250,245,0.92)', backdropFilter: 'blur(6px)',
              borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              padding: '6px 16px', fontSize: 12, color: C.textDim, pointerEvents: 'none',
              border: `1px solid ${C.border}`,
            }}>
              {filtered.length} vacatures · klik een pin of kaart om te selecteren
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{
          display: 'none',
          width: 320, borderLeft: `1.5px solid ${C.border}`,
          overflowY: 'auto', flexDirection: 'column', background: C.bg,
          // visible on large screens via media query workaround: use inline flex for lg
        }} className="sidebar-lg">
          <div style={{
            padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
            position: 'sticky', top: 0, background: C.white, zIndex: 10,
          }}>
            <input
              type="text"
              placeholder="Zoek vacatures, locaties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${C.border}`, background: C.card,
                color: C.navy, fontSize: 14, fontFamily: FONTS, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: C.card }}>
                  <div style={{ height: 14, background: C.border, borderRadius: 4, marginBottom: 8, width: '75%' }} />
                  <div style={{ height: 12, background: C.border, borderRadius: 4, marginBottom: 10, width: '50%' }} />
                  <div style={{ height: 18, background: C.border, borderRadius: 20, width: 70 }} />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <p style={{ fontSize: 13, color: C.textDim, textAlign: 'center', padding: '32px 0', margin: 0 }}>Geen vacatures gevonden</p>
            ) : (
              filtered.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const typeColor = TYPE_COLORS[job.type] || C.textDim;
                return (
                  <div
                    key={job.id}
                    ref={(el) => { cardRefs.current[job.id] = el; }}
                    onClick={() => setSelectedJob(isSelected ? null : job)}
                    style={{
                      border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                      borderRadius: 12, padding: 14, cursor: 'pointer',
                      background: isSelected ? `${C.accent}10` : C.card,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 2px 12px ${C.accent}22` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, color: isSelected ? C.accent : C.navy }}>
                        {job.title}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.accent, flexShrink: 0 }}>{job.salary}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>📍 {job.location}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
                        background: `${typeColor}18`, color: typeColor,
                      }}>
                        {job.type}
                      </span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 12, color: C.accent, fontWeight: 700, textDecoration: 'none' }}
                      >
                        Bekijk →
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-lg { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
