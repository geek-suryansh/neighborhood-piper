'use client';

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

const COLORS = {
  bg: "#0a0a0f",
  card: "#12121a",
  accent: "#00e5a0",
  accentDim: "#00e5a033",
  purple: "#8b5cf6",
  purpleDim: "#8b5cf633",
  orange: "#ff6b35",
  text: "#e8e8f0",
  textDim: "#8888a0",
  border: "#22222f",
};

const FONTS = `'Segoe UI', system-ui, sans-serif`;
const JOB_TYPES = ["Flexible", "Full-time", "Part-time", "Evening", "Weekend", "Traineeship", "Temporary"];
const PDOK_BASE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1";

type PdokDoc = { id: string; weergavenaam: string; type: string };
type ResolvedLocation = { name: string; lat: number; lng: number };

function parseCentroide(wkt: string): { lat: number; lng: number } | null {
  const m = wkt.match(/POINT\(([^ ]+) ([^ )]+)\)/);
  if (!m) return null;
  return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

const CANDIDATES = [
  { id: "A7x2", age: "16-17", match: 94, skills: ["Goed met mensen praten", "Snel leren"], interests: ["Sport & Bewegen", "Eten & Horeca"], available: "Ma Di Za Zo", hours: "8-16 uur" },
  { id: "K3m9", age: "18-20", match: 87, skills: ["Creatief denken", "Handig met social media"], interests: ["Muziek", "Mode & Style"], available: "Wo Do Vr Za", hours: "12-20 uur" },
  { id: "R5p1", age: "16-17", match: 82, skills: ["Teamwork", "Fysiek sterk"], interests: ["Sport & Bewegen", "Bouwen & Maken"], available: "Ma Wo Vr Za Zo", hours: "8-16 uur" },
  { id: "T8j4", age: "18-20", match: 78, skills: ["Zelfstandig werken", "Goed organiseren"], interests: ["Tech & Computers", "Gaming"], available: "Di Do Za", hours: "16-24 uur" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: `1px solid ${COLORS.border}`,
  background: "#0f0f18",
  color: COLORS.text,
  fontSize: 14,
  fontFamily: FONTS,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: COLORS.textDim,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

function LocationPicker({ value, onChange }: { value: ResolvedLocation | null; onChange: (loc: ResolvedLocation | null) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PdokDoc[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length < 2) { setSuggestions([]); return; }
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          fq: "type:(buurt OR wijk OR woonplaats OR gemeente)",
          rows: "8",
          fl: "id weergavenaam type score",
        });
        const res = await fetch(`${PDOK_BASE}/suggest?${params}`);
        const json = await res.json();
        setSuggestions(json.response?.docs ?? []);
      } catch { setSuggestions([]); }
      setSearching(false);
    }, query.length < 2 ? 0 : 300);
    return () => clearTimeout(t);
  }, [query]);

  const pick = async (doc: PdokDoc) => {
    setSuggestions([]);
    setQuery("");
    try {
      const params = new URLSearchParams({ id: doc.id, fl: "id weergavenaam centroide_ll" });
      const res = await fetch(`${PDOK_BASE}/lookup?${params}`);
      const json = await res.json();
      const detail = json.response?.docs?.[0];
      const coords = detail?.centroide_ll ? parseCentroide(detail.centroide_ll) : null;
      onChange({ name: detail?.weergavenaam ?? doc.weergavenaam, ...(coords ?? { lat: 0, lng: 0 }) });
    } catch {
      onChange({ name: doc.weergavenaam, lat: 0, lng: 0 });
    }
  };

  const typeLabel: Record<string, string> = { buurt: "Buurt", wijk: "Wijk", woonplaats: "Stad", gemeente: "Gemeente" };

  if (value) {
    return (
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.accent}`, background: COLORS.accentDim, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14 }}>📍 {value.name}</div>
          <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 2 }}>{value.lat.toFixed(4)}, {value.lng.toFixed(4)}</div>
        </div>
        <button type="button" onClick={() => onChange(null)} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 11, cursor: "pointer", fontFamily: FONTS }}>
          Wijzigen
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Typ een buurt, wijk of stad…"
        style={{ ...inputStyle, paddingRight: searching ? 40 : 14 }}
      />
      {searching && <div style={{ position: "absolute", right: 14, top: 12, color: COLORS.textDim, fontSize: 13 }}>…</div>}
      {suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: "hidden", zIndex: 10 }}>
          {suggestions.map(doc => (
            <button
              key={doc.id}
              type="button"
              onClick={() => pick(doc)}
              style={{ width: "100%", padding: "10px 14px", border: "none", borderBottom: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: FONTS, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>{doc.weergavenaam}</span>
              <span style={{ color: COLORS.textDim, fontSize: 11 }}>{typeLabel[doc.type] ?? doc.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type FormState = {
  title: string;
  category: string;
  type: string;
  salary: string;
  description: string;
  url: string;
};

const EMPTY_FORM: FormState = { title: "", category: "", type: "Flexible", salary: "", description: "", url: "" };

export default function PostPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    const { error } = await getSupabase().from("jobs").insert({
      id: crypto.randomUUID(),
      title: form.title.trim(),
      category: form.category.trim() || null,
      type: form.type,
      salary: form.salary.trim() || null,
      location: location?.name ?? "Amsterdam",
      lat: location?.lat ?? 52.3702,
      lng: location?.lng ?? 4.8952,
      url: form.url.trim() || null,
      description: form.description.trim() || null,
      source: "posted",
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
      setForm(EMPTY_FORM);
      setLocation(null);
    }
  }

  return (
    <div style={{ fontFamily: FONTS, background: COLORS.bg, color: COLORS.text, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.accentDim} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, top: -100, right: -100, filter: "blur(60px)" }} />
      <div style={{ position: "fixed", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.purpleDim} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, bottom: -50, left: -50, filter: "blur(60px)" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ paddingTop: 28, paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent, margin: 0 }}>STAP</h1>
            <span style={{ color: COLORS.textDim, fontSize: 13, fontWeight: 600, padding: "2px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 6 }}>Werkgever</span>
          </div>
          <a href="/stap" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, color: COLORS.textDim, fontSize: 13, textDecoration: "none" }}>
            ← Terug naar STAP
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { label: "Actieve jongeren", value: "1.247", color: COLORS.accent },
            { label: "Gemiddelde match", value: "86%", color: COLORS.purple },
            { label: "Ingehuurd deze maand", value: "43", color: COLORS.orange },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 140px", padding: 18, borderRadius: 14, background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              <p style={{ color: COLORS.textDim, fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start", paddingBottom: 48 }}>
          {/* Left: Create job form */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: COLORS.text }}>Vacature plaatsen</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Vacaturetitel *</label>
                <input
                  style={inputStyle}
                  placeholder="bijv. Vakkenvuller, Junior Barista"
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Categorie</label>
                <input
                  style={inputStyle}
                  placeholder="bijv. Horeca, Retail, Logistiek"
                  value={form.category}
                  onChange={e => set("category", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.type}
                  onChange={e => set("type", e.target.value)}
                >
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Salaris</label>
                <input
                  style={inputStyle}
                  placeholder="bijv. €12,50/hr of €2.500/mo"
                  value={form.salary}
                  onChange={e => set("salary", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Locatie</label>
                <LocationPicker value={location} onChange={setLocation} />
              </div>
              <div>
                <label style={labelStyle}>Omschrijving</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                  placeholder="Beschrijf de vacature, taken, vereisten…"
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>URL vacaturepagina</label>
                <input
                  style={inputStyle}
                  type="url"
                  placeholder="https://..."
                  value={form.url}
                  onChange={e => set("url", e.target.value)}
                />
              </div>

              {status === "error" && (
                <p style={{ color: COLORS.orange, fontSize: 13, margin: 0 }}>{errorMsg}</p>
              )}
              {status === "success" && (
                <p style={{ color: COLORS.accent, fontSize: 13, margin: 0, fontWeight: 600 }}>Vacature succesvol geplaatst.</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: status === "loading" ? COLORS.accentDim : COLORS.accent, color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: status === "loading" ? "default" : "pointer", fontFamily: FONTS, transition: "opacity 0.15s" }}
              >
                {status === "loading" ? "Opslaan..." : "Vacature plaatsen"}
              </button>
            </form>
          </div>

          {/* Right: Candidate applications */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: COLORS.text }}>Aanmeldingen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CANDIDATES.map((c) => (
                <div key={c.id} style={{ padding: 20, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.accent}44, ${COLORS.purple}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: COLORS.accent, border: `1.5px solid ${COLORS.accent}44`, flexShrink: 0 }}>
                    #{c.id}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px" }}>Kandidaat #{c.id}</h3>
                        <p style={{ color: COLORS.textDim, fontSize: 12, margin: 0 }}>{c.age} jaar • {c.available} • {c.hours}</p>
                      </div>
                      <div style={{ background: c.match >= 90 ? `linear-gradient(135deg, ${COLORS.accent}, #00c087)` : c.match >= 80 ? COLORS.purpleDim : `${COLORS.orange}33`, color: c.match >= 90 ? COLORS.bg : c.match >= 80 ? COLORS.purple : COLORS.orange, fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                        {c.match}%
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                      {c.skills.map(s => <span key={s} style={{ padding: "3px 7px", borderRadius: 6, background: COLORS.purpleDim, color: COLORS.purple, fontSize: 10, fontWeight: 600 }}>{s}</span>)}
                      {c.interests.map(i => <span key={i} style={{ padding: "3px 7px", borderRadius: 6, background: COLORS.accentDim, color: COLORS.accent, fontSize: 10, fontWeight: 600 }}>{i}</span>)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.bg, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONTS }}>Uitnodigen</button>
                      <button style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: FONTS }}>Bewaren</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
