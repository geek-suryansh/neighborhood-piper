'use client';

import { useState, useEffect, useCallback } from 'react';

interface EmployerUser { email: string; }

const SESSION_KEY = 'junta_employer_session';

function loadSession(): EmployerUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
}
function saveSession(email: string): EmployerUser {
  const user: EmployerUser = { email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}
function clearSession() { localStorage.removeItem(SESSION_KEY); }

// ── Design tokens (match the rest of the app) ──────────────────────────────

const COLORS = {
  bg: '#FFFFFF',
  card: '#F9F9F9',
  accent: '#eb4d02',
  accentDim: '#eb4d0220',
  text: '#0D0D0D',
  textDim: '#888888',
  border: '#E8E8E8',
  green: '#22C55E',
  red: '#EF4444',
};
const FONTS = `var(--font-nunito, 'Segoe UI', system-ui, sans-serif)`;

const JOB_TYPES = ['Flexible', 'Full-time', 'Part-time', 'Evening', 'Weekend', 'Traineeship', 'Temporary'];
const PDOK_BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

// ── Shared style helpers ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${COLORS.border}`, background: '#FFFFFF',
  color: COLORS.text, fontSize: 14, fontFamily: FONTS,
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: COLORS.textDim, fontSize: 12, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
};

function PrimaryButton({ children, onClick, disabled, type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none',
        background: disabled ? COLORS.border : '#0D0D0D',
        color: disabled ? COLORS.textDim : '#FFFFFF',
        fontSize: 14, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
        fontFamily: FONTS, transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  );
}

// ── Location picker (copied from /post) ───────────────────────────────────

type PdokDoc = { id: string; weergavenaam: string; type: string };
type ResolvedLocation = { name: string; lat: number; lng: number };

function parseCentroide(wkt: string): { lat: number; lng: number } | null {
  const m = wkt.match(/POINT\(([^ ]+) ([^ )]+)\)/);
  if (!m) return null;
  return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

function LocationPicker({ value, onChange }: {
  value: ResolvedLocation | null;
  onChange: (loc: ResolvedLocation | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PdokDoc[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) { setSuggestions([]); return; }
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          fq: 'type:(buurt OR wijk OR woonplaats OR gemeente)',
          rows: '8',
          fl: 'id weergavenaam type score',
        });
        const res = await fetch(`${PDOK_BASE}/suggest?${params}`);
        const json = await res.json();
        setSuggestions(json.response?.docs ?? []);
      } catch { setSuggestions([]); }
      setSearching(false);
    }, query.length < 2 ? 0 : 300);
    return () => clearTimeout(timer);
  }, [query]);

  const pick = async (doc: PdokDoc) => {
    setSuggestions([]);
    setQuery('');
    try {
      const params = new URLSearchParams({ id: doc.id, fl: 'id weergavenaam centroide_ll' });
      const res = await fetch(`${PDOK_BASE}/lookup?${params}`);
      const json = await res.json();
      const detail = json.response?.docs?.[0];
      const coords = detail?.centroide_ll ? parseCentroide(detail.centroide_ll) : null;
      onChange({ name: detail?.weergavenaam ?? doc.weergavenaam, ...(coords ?? { lat: 0, lng: 0 }) });
    } catch {
      onChange({ name: doc.weergavenaam, lat: 0, lng: 0 });
    }
  };

  if (value) {
    return (
      <div style={{ padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${COLORS.accent}`, background: COLORS.accentDim, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14 }}>📍 {value.name}</div>
          <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 2 }}>{value.lat.toFixed(4)}, {value.lng.toFixed(4)}</div>
        </div>
        <button type="button" onClick={() => onChange(null)} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${COLORS.border}`, background: 'transparent', color: COLORS.textDim, fontSize: 11, cursor: 'pointer', fontFamily: FONTS }}>
          Wijzigen
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Zoek buurt, wijk of gemeente…"
        style={{ ...inputStyle, paddingRight: searching ? 40 : 14 }}
      />
      {searching && <div style={{ position: 'absolute', right: 14, top: 12, color: COLORS.textDim, fontSize: 13 }}>…</div>}
      {suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: 'hidden', zIndex: 10 }}>
          {suggestions.map(doc => (
            <button key={doc.id} type="button" onClick={() => pick(doc)} style={{ width: '100%', padding: '10px 14px', border: 'none', borderBottom: `1px solid ${COLORS.border}`, background: 'transparent', color: COLORS.text, fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: FONTS, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{doc.weergavenaam}</span>
              <span style={{ color: COLORS.textDim, fontSize: 11 }}>{doc.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Post form ──────────────────────────────────────────────────────────────

type FormState = {
  title: string; category: string; type: string; salary: string;
  description: string; url: string;
};
const EMPTY_FORM: FormState = { title: '', category: '', type: 'Flexible', salary: '', description: '', url: '' };

function PostForm({ user, onSuccess }: { user: EmployerUser; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    const res = await fetch('/api/employer/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-employer-email': user.email },
      body: JSON.stringify({
        title: form.title.trim(),
        category: form.category.trim(),
        type: form.type,
        salary: form.salary.trim(),
        location: location?.name ?? 'Nederland',
        lat: location?.lat ?? 52.1326,
        lng: location?.lng ?? 5.2913,
        url: form.url.trim(),
        description: form.description.trim(),
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setStatus('error');
      setErrorMsg(json.error ?? 'Er ging iets mis.');
    } else {
      setForm(EMPTY_FORM);
      setLocation(null);
      setStatus('idle');
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Functietitel *</label>
        <input style={inputStyle} placeholder="bijv. Bijbaan caissière, Junior barista" value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Categorie</label>
          <input style={inputStyle} placeholder="bijv. Horeca, Retail" value={form.category} onChange={e => set('category', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => set('type', e.target.value)}>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Salaris</label>
        <input style={inputStyle} placeholder="bijv. €13/uur of €2.500/mnd" value={form.salary} onChange={e => set('salary', e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Locatie</label>
        <LocationPicker value={location} onChange={setLocation} />
      </div>
      <div>
        <label style={labelStyle}>Omschrijving</label>
        <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} placeholder="Taken, vereisten en wat jij biedt…" value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Vacaturelink</label>
        <input style={inputStyle} type="url" placeholder="https://…" value={form.url} onChange={e => set('url', e.target.value)} />
      </div>
      {status === 'error' && <p style={{ color: COLORS.red, fontSize: 13, margin: 0 }}>{errorMsg}</p>}
      <PrimaryButton type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Bezig met plaatsen…' : 'Vacature plaatsen'}
      </PrimaryButton>
    </form>
  );
}

// ── Auth screens ───────────────────────────────────────────────────────────

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FONTS, background: COLORS.bg, color: COLORS.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>Junta</h1>
          <p style={{ color: COLORS.textDim, fontSize: 14, margin: 0 }}>Werkgeversportaal</p>
        </div>
        <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 28 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: EmployerUser) => void }) {
  const [email, setEmail] = useState('');

  function submit() {
    if (!email.trim()) return;
    onLogin(saveSession(email.trim()));
  }

  return (
    <AuthCard>
      <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>Inloggen</h2>
      <p style={{ color: COLORS.textDim, fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
        Voer je e-mailadres in om je vacatures te beheren.
      </p>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>E-mailadres</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="jij@bedrijf.nl"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
      </div>
      <PrimaryButton onClick={submit} disabled={!email.trim()}>
        Inloggen
      </PrimaryButton>
    </AuthCard>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

interface PostedJob {
  id: string;
  title: string;
  type: string;
  salary: string | null;
  location: string;
  scraped_at: string;
}

interface Application {
  id: string;
  job_id: string;
  candidate_name: string | null;
  candidate_email: string;
  message: string | null;
  applied_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  return `${days}d geleden`;
}

function DashboardScreen({ user }: { user: EmployerUser }) {
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedAppsJobId, setExpandedAppsJobId] = useState<string | null>(null);

  const authHeaders = { 'x-employer-email': user.email };

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    const [jobsRes, appsRes] = await Promise.all([
      fetch('/api/employer/jobs', { headers: { 'x-employer-email': user.email } }),
      fetch('/api/employer/applications', { headers: { 'x-employer-email': user.email } }),
    ]);
    setJobs(jobsRes.ok ? await jobsRes.json() : []);
    setApplications(appsRes.ok ? await appsRes.json() : []);
    setLoadingJobs(false);
  }, [user.email]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function deleteJob(id: string) {
    setDeleting(id);
    await fetch(`/api/employer/jobs/${id}`, { method: 'DELETE', headers: { 'x-employer-email': user.email } });
    setJobs(prev => prev.filter(j => j.id !== id));
    setApplications(prev => prev.filter(a => a.job_id !== id));
    setDeleting(null);
  }

  function signOut() {
    clearSession();
    window.location.reload();
  }

  return (
    <div style={{ fontFamily: FONTS, background: COLORS.bg, color: COLORS.text, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>Junta</span>
            <span style={{ color: COLORS.textDim, fontSize: 13, fontWeight: 500 }}>Werkgeversportaal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: COLORS.textDim, fontSize: 13 }}>{user.email}</span>
            <button onClick={signOut} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: 'transparent', color: COLORS.textDim, fontSize: 12, cursor: 'pointer', fontFamily: FONTS }}>
              Uitloggen
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Page title + stat + new button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Mijn vacatures</h2>
            <span style={{ fontSize: 13, color: COLORS.textDim }}>
              {loadingJobs ? '…' : `${jobs.length} vacature${jobs.length !== 1 ? 's' : ''} geplaatst`}
            </span>
          </div>
          <button
            onClick={() => setShowForm(f => !f)}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: showForm ? COLORS.border : '#0D0D0D', color: showForm ? COLORS.textDim : '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS, transition: 'all 0.15s' }}
          >
            {showForm ? '✕ Annuleren' : '＋ Nieuwe vacature'}
          </button>
        </div>

        {/* Inline post form */}
        {showForm && (
          <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>Vacature plaatsen</h3>
            <PostForm
              user={user}
              onSuccess={() => { setShowForm(false); fetchJobs(); }}
            />
          </div>
        )}

        {/* Job list */}
        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: COLORS.textDim }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
            <p style={{ margin: 0, fontSize: 14 }}>Vacatures laden…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', color: COLORS.textDim, border: `1.5px dashed ${COLORS.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: COLORS.text }}>Nog geen vacatures</p>
            <p style={{ margin: 0, fontSize: 13 }}>Klik op "Nieuwe vacature" om je eerste bijbaan te plaatsen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.map(job => {
              const jobApps = applications.filter(a => a.job_id === job.id);
              const isAppsExpanded = expandedAppsJobId === job.id;
              return (
                <div key={job.id} style={{ borderRadius: 14, border: `1px solid ${isAppsExpanded ? COLORS.accent + '44' : COLORS.border}`, background: COLORS.card, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</div>
                      <div style={{ fontSize: 13, color: COLORS.textDim, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>⏰ {job.type}</span>
                        {job.salary && <span>💶 {job.salary}</span>}
                        <span>📍 {job.location}</span>
                        <span>🕐 {timeAgo(job.scraped_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                      <button
                        onClick={() => setExpandedAppsJobId(isAppsExpanded ? null : job.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 8,
                          border: `1px solid ${jobApps.length > 0 ? COLORS.accent + '66' : COLORS.border}`,
                          background: jobApps.length > 0 ? COLORS.accentDim : 'transparent',
                          color: jobApps.length > 0 ? COLORS.accent : COLORS.textDim,
                          fontSize: 12, cursor: 'pointer', fontFamily: FONTS,
                          fontWeight: jobApps.length > 0 ? 700 : 400,
                        }}
                      >
                        {jobApps.length} sollicitatie{jobApps.length !== 1 ? 's' : ''} {isAppsExpanded ? '▴' : '▾'}
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        disabled={deleting === job.id}
                        style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: 'transparent', color: deleting === job.id ? COLORS.textDim : COLORS.red, fontSize: 12, cursor: deleting === job.id ? 'default' : 'pointer', fontFamily: FONTS }}
                      >
                        {deleting === job.id ? '…' : 'Verwijderen'}
                      </button>
                    </div>
                  </div>

                  {/* Applicants panel */}
                  {isAppsExpanded && (
                    <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {jobApps.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, fontStyle: 'italic' }}>Nog geen sollicitaties ontvangen.</p>
                      ) : jobApps.map(app => (
                        <div key={app.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{app.candidate_name || app.candidate_email}</div>
                            <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: app.message ? 6 : 0 }}>
                              {app.candidate_name ? app.candidate_email + ' · ' : ''}{timeAgo(app.applied_at)}
                            </div>
                            {app.message && <p style={{ margin: 0, fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{app.message}</p>}
                          </div>
                          <a
                            href={`mailto:${app.candidate_email}?subject=${encodeURIComponent(`Re: Sollicitatie ${job.title}`)}`}
                            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #0D0D0D', background: '#0D0D0D', color: '#FFFFFF', fontSize: 12, fontWeight: 700, textDecoration: 'none', fontFamily: FONTS, whiteSpace: 'nowrap' }}
                          >
                            Contact →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────

type Screen = 'loading' | 'login' | 'dashboard';

export default function EmployerApp() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [user, setUser] = useState<EmployerUser | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (session) { setUser(session); setScreen('dashboard'); }
    else setScreen('login');
  }, []);

  if (screen === 'loading') {
    return (
      <div style={{ fontFamily: FONTS, background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28 }}>⚡</span>
      </div>
    );
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={u => { setUser(u); setScreen('dashboard'); }} />;
  }

  if (screen === 'dashboard' && user) {
    return <DashboardScreen user={user} />;
  }

  return null;
}
