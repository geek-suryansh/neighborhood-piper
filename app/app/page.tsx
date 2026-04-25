'use client';

import { useState, useEffect } from "react";
import {
  INTERESTS, SKILLS_OPTIONS, LANGUAGES, EDU_LEVELS, EDU_YEARS,
  type AppData,
} from "@/lib/stap-data";
import { toProfile, type CandidateProfile } from "@/lib/profile";
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
const TOTAL_STEPS = 9;


const styles = {
  app: {
    fontFamily: FONTS,
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: "100vh",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  glow: {
    position: "fixed" as const,
    width: 400, height: 400,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${COLORS.accentDim} 0%, transparent 70%)`,
    pointerEvents: "none" as const,
    zIndex: 0, top: -100, right: -100,
    filter: "blur(60px)",
  },
  glowPurple: {
    position: "fixed" as const,
    width: 300, height: 300,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${COLORS.purpleDim} 0%, transparent 70%)`,
    pointerEvents: "none" as const,
    zIndex: 0, bottom: -50, left: -50,
    filter: "blur(60px)",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "0 20px",
    position: "relative" as const,
    zIndex: 1,
  },
  wide: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 20px",
    position: "relative" as const,
    zIndex: 1,
  },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`,
  background: COLORS.card,
  color: COLORS.text,
  fontSize: 16,
  fontFamily: FONTS,
  boxSizing: "border-box",
  outline: "none",
  marginBottom: 16,
};


// ── Shared components ──

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "20px 0" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i <= step ? COLORS.accent : COLORS.border,
          transition: "background 0.4s ease",
        }} />
      ))}
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 16px", borderRadius: 12,
      border: `1.5px solid ${selected ? COLORS.accent : COLORS.border}`,
      background: selected ? COLORS.accentDim : "transparent",
      color: selected ? COLORS.accent : COLORS.textDim,
      fontSize: 14, cursor: "pointer",
      transition: "all 0.2s ease", fontFamily: FONTS,
    }}>
      {children}
    </button>
  );
}

function BigButton({ onClick, children, secondary, disabled }: {
  onClick: () => void; children: React.ReactNode; secondary?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "16px 24px", borderRadius: 14,
      border: secondary ? `1.5px solid ${COLORS.border}` : "none",
      background: disabled ? COLORS.border : secondary ? "transparent" : `linear-gradient(135deg, ${COLORS.accent}, #00c087)`,
      color: disabled ? COLORS.textDim : secondary ? COLORS.text : COLORS.bg,
      fontSize: 16, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.3s ease", fontFamily: FONTS, letterSpacing: "-0.01em",
    }}>
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

// ── CV PDF generation ──

function generateCVHTML(data: AppData): string {
  const interestLabels = (data.interests || [])
    .map(id => INTERESTS.find(i => i.id === id)?.label)
    .filter(Boolean);
  const dayMap: Record<string, string> = {
    Ma: "Maandag", Di: "Dinsdag", Wo: "Woensdag",
    Do: "Donderdag", Vr: "Vrijdag", Za: "Zaterdag", Zo: "Zondag",
  };
  const fullDays = (data.days || []).map(d => dayMap[d] || d);

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>CV — ${data.name || "Anoniem"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: white; padding: 48px 52px; font-size: 10.5pt; line-height: 1.55; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2.5px solid #00c087; }
  .header h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.03em; color: #0a0a0f; line-height: 1.1; }
  .header .sub { color: #666; font-size: 11pt; margin-top: 4px; }
  .badge { display: inline-block; background: #00e5a0; color: #0a0a0f; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 3px 10px; border-radius: 20px; margin-top: 8px; }
  .contact { text-align: right; color: #555; font-size: 10pt; line-height: 1.8; }
  .section { margin-bottom: 22px; }
  .section h2 { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #999; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #eee; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: #f0faf6; border: 1px solid #00e5a033; color: #007a55; padding: 4px 12px; border-radius: 20px; font-size: 9.5pt; }
  .tag.skill { background: #f5f0ff; border-color: #8b5cf633; color: #6d4ac7; }
  .tag.lang { background: #fff8f0; border-color: #ff6b3533; color: #cc4a10; }
  .edu { display: flex; justify-content: space-between; }
  .edu strong { font-size: 11pt; }
  .edu span { display: block; color: #666; font-size: 10pt; }
  .edu .year { color: #888; font-size: 10pt; white-space: nowrap; }
  .avail { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
  .avail span { background: #f0faf6; border: 1px solid #00e5a044; color: #007a55; padding: 5px 14px; border-radius: 20px; font-size: 9.5pt; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #eee; color: #bbb; font-size: 8.5pt; display: flex; justify-content: space-between; }
  @media print { body { padding: 32px 40px; } @page { size: A4; margin: 0; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${data.name || "Anoniem"}</h1>
      <div class="sub">${data.age} jaar &nbsp;·&nbsp; ${data.location ? `${data.location.name}, Amsterdam` : "Amsterdam"}</div>
      <span class="badge">⚡ Op zoek naar bijbaan</span>
    </div>
    <div class="contact">
      ${data.email ? `<div>${data.email}</div>` : ""}
      <div>${data.location ? `${data.location.name}, ` : ""}Amsterdam, Nederland</div>
    </div>
  </div>

  <div class="section">
    <h2>Profiel</h2>
    <p>Gemotiveerde jongere van ${data.age} jaar, woonachtig in ${data.location ? `${data.location.name}, ` : ""}Amsterdam, op zoek naar een bijbaan.${data.dream ? ` Toekomstdroom: <em>${data.dream}</em>.` : ""} Beschikbaar op ${fullDays.join(", ")}${data.hours ? ` voor ${data.hours} per week` : ""}.</p>
  </div>

  ${(data.school || data.eduLevel) ? `
  <div class="section">
    <h2>Opleiding</h2>
    <div class="edu">
      <div>
        <strong>${data.school || "School / Instelling"}</strong>
        ${data.eduLevel ? `<span>${data.eduLevel}</span>` : ""}
      </div>
      ${data.eduYear ? `<div class="year">${data.eduYear}</div>` : ""}
    </div>
  </div>` : ""}

  ${(data.skills || []).length > 0 ? `
  <div class="section">
    <h2>Vaardigheden</h2>
    <div class="tags">${(data.skills || []).map(s => `<span class="tag skill">${s}</span>`).join("")}</div>
  </div>` : ""}

  ${(data.languages || []).length > 0 ? `
  <div class="section">
    <h2>Talen</h2>
    <div class="tags">${(data.languages || []).map(l => `<span class="tag lang">${l}</span>`).join("")}</div>
  </div>` : ""}

  ${interestLabels.length > 0 ? `
  <div class="section">
    <h2>Interesses</h2>
    <div class="tags">${interestLabels.map(i => `<span class="tag">${i}</span>`).join("")}</div>
  </div>` : ""}

  <div class="section">
    <h2>Beschikbaarheid</h2>
    <div class="avail">${fullDays.map(d => `<span>${d}</span>`).join("")}</div>
    ${data.hours ? `<p style="color:#555">${data.hours} per week</p>` : ""}
  </div>

  <div class="footer">
    <span>Gemaakt via STAP — Skills · Talent · Actie · Perspectief</span>
    <span>Amsterdam ${new Date().getFullYear()}</span>
  </div>
</body>
</html>`;
}

// ── Screens ──

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);
  return (
    <div style={{ ...styles.container, paddingTop: 80, textAlign: "center", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
      <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px", lineHeight: 1.1 }}>
        <span style={{ color: COLORS.accent }}>STAP</span>
      </h1>
      <p style={{ color: COLORS.textDim, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 32 }}>
        Skills → Talent → Actie → Perspectief
      </p>
      <p style={{ color: COLORS.textDim, fontSize: 17, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 48px" }}>
        Ontdek wat bij je past. Vind een baan. Bouw je toekomst.<br />
        <span style={{ color: COLORS.accent }}>In 5 minuten.</span>
      </p>
      <BigButton onClick={onStart}>Let&apos;s go →</BigButton>
      <p style={{ color: COLORS.textDim, fontSize: 12, marginTop: 16 }}>Geen account nodig • 100% anoniem</p>
    </div>
  );
}

function AgeScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={0} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Hoe oud ben je?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 32, fontSize: 15 }}>Dit bepaalt welke banen en regelingen voor jou gelden.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {["14-15", "16-17", "18-20", "21-23"].map((age) => (
          <button key={age} onClick={() => { setData({ ...data, age }); onNext(); }} style={{
            padding: "18px 20px", borderRadius: 14,
            border: `1.5px solid ${data.age === age ? COLORS.accent : COLORS.border}`,
            background: data.age === age ? COLORS.accentDim : COLORS.card,
            color: COLORS.text, fontSize: 18, fontWeight: 600,
            cursor: "pointer", textAlign: "left",
            transition: "all 0.2s ease", fontFamily: FONTS,
          }}>
            {age} jaar
          </button>
        ))}
      </div>
    </div>
  );
}

function NameScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={1} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Hoe mogen we je noemen?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        Dit komt op je CV. Een bijnaam of initialen mag ook.
      </p>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 6, display: "block" }}>Naam *</label>
      <input
        value={data.name || ""}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        placeholder="Voornaam of bijnaam"
        style={inputStyle}
      />
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 6, display: "block" }}>
        E-mail of telefoonnummer <span style={{ fontStyle: "italic" }}>(optioneel)</span>
      </label>
      <input
        value={data.email || ""}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        placeholder="naam@email.com of 06-..."
        style={inputStyle}
      />
      <div style={{ padding: "10px 14px", borderRadius: 10, background: `${COLORS.orange}15`, border: `1px solid ${COLORS.orange}33`, color: COLORS.orange, fontSize: 12, marginBottom: 32 }}>
        🔒 Contactinfo wordt alleen op jouw CV gezet — we slaan niets op.
      </div>
      <BigButton onClick={onNext} disabled={!data.name?.trim()}>Volgende →</BigButton>
    </div>
  );
}

const PDOK_BASE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1";

type PdokDoc = { id: string; weergavenaam: string; type: string };

function parseCentroide(wkt: string): { lat: number; lng: number } | null {
  const m = wkt.match(/POINT\(([^ ]+) ([^ )]+)\)/);
  if (!m) return null;
  return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

function LocationScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
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
      setData({ ...data, location: { name: detail?.weergavenaam ?? doc.weergavenaam, ...(coords ?? { lat: 0, lng: 0 }) } });
    } catch {
      setData({ ...data, location: { name: doc.weergavenaam, lat: 0, lng: 0 } });
    }
  };

  const typeLabel: Record<string, string> = { buurt: "Buurt", wijk: "Wijk", woonplaats: "Stad", gemeente: "Gemeente" };

  return (
    <div style={styles.container}>
      <ProgressBar step={2} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Waar woon je?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        Zoek je buurt, wijk of stad. We gebruiken dit om banen bij jou in de buurt te vinden.
      </p>

      {data.location ? (
        <div style={{ marginBottom: 32 }}>
          <div style={{ padding: "16px 18px", borderRadius: 14, border: `1.5px solid ${COLORS.accent}`, background: COLORS.accentDim, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 16 }}>📍 {data.location.name}</div>
              <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2 }}>{data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}</div>
            </div>
            <button onClick={() => setData({ ...data, location: undefined })} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 12, cursor: "pointer", fontFamily: FONTS }}>
              Wijzigen
            </button>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", marginBottom: 32 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Typ je buurt, wijk of stad…"
            autoFocus
            style={{ ...inputStyle, marginBottom: 0, paddingRight: searching ? 48 : 16 }}
          />
          {searching && (
            <div style={{ position: "absolute", right: 14, top: 16, color: COLORS.textDim, fontSize: 13 }}>…</div>
          )}
          {suggestions.length > 0 && (
            <div style={{ marginTop: 4, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: "hidden" }}>
              {suggestions.map((doc) => (
                <button key={doc.id} onClick={() => pick(doc)} style={{
                  width: "100%", padding: "12px 16px", border: "none", borderBottom: `1px solid ${COLORS.border}`,
                  background: "transparent", color: COLORS.text, fontSize: 14, cursor: "pointer",
                  fontFamily: FONTS, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{doc.weergavenaam}</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim, marginLeft: 8, flexShrink: 0 }}>{typeLabel[doc.type] ?? doc.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <BigButton onClick={onNext} disabled={!data.location}>Volgende →</BigButton>
      <div style={{ marginTop: 12 }}>
        <BigButton onClick={onNext} secondary>Overslaan</BigButton>
      </div>
    </div>
  );
}

function EducationScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={3} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Jouw opleiding</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>Helpt werkgevers jouw achtergrond begrijpen.</p>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 6, display: "block" }}>School of instelling</label>
      <input
        value={data.school || ""}
        onChange={(e) => setData({ ...data, school: e.target.value })}
        placeholder="Bijv. ROC Amsterdam, Montessori College..."
        style={inputStyle}
      />
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 10, display: "block" }}>Niveau</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {EDU_LEVELS.map((level) => (
          <Chip key={level} selected={data.eduLevel === level} onClick={() => setData({ ...data, eduLevel: level })}>
            {level}
          </Chip>
        ))}
      </div>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 10, display: "block" }}>Jaar van afstuderen</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
        {EDU_YEARS.map((year) => (
          <Chip key={year} selected={data.eduYear === year} onClick={() => setData({ ...data, eduYear: year })}>
            {year}
          </Chip>
        ))}
      </div>
      <BigButton onClick={onNext} disabled={!data.eduLevel}>Volgende →</BigButton>
      <div style={{ marginTop: 12 }}>
        <BigButton onClick={onNext} secondary>Overslaan</BigButton>
      </div>
    </div>
  );
}

function LanguagesScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const toggle = (lang: string) => {
    const cur = data.languages || [];
    setData({ ...data, languages: cur.includes(lang) ? cur.filter(l => l !== lang) : [...cur, lang] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={4} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Welke talen spreek je?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>Kies alle talen die je spreekt, verstaat of leert.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
        {LANGUAGES.map((lang) => (
          <Chip key={lang} selected={(data.languages || []).includes(lang)} onClick={() => toggle(lang)}>
            {lang}
          </Chip>
        ))}
      </div>
      <BigButton onClick={onNext} disabled={(data.languages || []).length < 1}>Volgende →</BigButton>
    </div>
  );
}

function InterestsScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const toggle = (id: string) => {
    const cur = data.interests || [];
    setData({ ...data, interests: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={5} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Waar word je blij van?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>Kies er minimaal 2. Dit helpt ons banen te vinden die bij je passen.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {INTERESTS.map((i) => {
          const sel = (data.interests || []).includes(i.id);
          return (
            <button key={i.id} onClick={() => toggle(i.id)} style={{
              padding: "12px 16px", borderRadius: 14,
              border: `1.5px solid ${sel ? COLORS.accent : COLORS.border}`,
              background: sel ? COLORS.accentDim : COLORS.card,
              color: sel ? COLORS.accent : COLORS.text,
              fontSize: 14, cursor: "pointer",
              transition: "all 0.2s ease", fontFamily: FONTS,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 20 }}>{i.emoji}</span>{i.label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext} disabled={(data.interests || []).length < 2}>Volgende →</BigButton>
      </div>
    </div>
  );
}

function SkillsScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const toggle = (s: string) => {
    const cur = data.skills || [];
    setData({ ...data, skills: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={6} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Waar ben je goed in?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>Wees eerlijk — er zijn geen foute antwoorden.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {SKILLS_OPTIONS.map((s) => (
          <Chip key={s} selected={(data.skills || []).includes(s)} onClick={() => toggle(s)}>{s}</Chip>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext} disabled={(data.skills || []).length < 1}>Volgende →</BigButton>
      </div>
    </div>
  );
}

function AvailabilityScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const toggle = (d: string) => {
    const cur = data.days || [];
    setData({ ...data, days: cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={7} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Wanneer kun je werken?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>Tik de dagen aan waarop je beschikbaar bent.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {days.map((d) => {
          const sel = (data.days || []).includes(d);
          return (
            <button key={d} onClick={() => toggle(d)} style={{
              flex: 1, padding: "14px 0", borderRadius: 12,
              border: `1.5px solid ${sel ? COLORS.accent : COLORS.border}`,
              background: sel ? COLORS.accentDim : COLORS.card,
              color: sel ? COLORS.accent : COLORS.textDim,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONTS, transition: "all 0.2s ease",
            }}>
              {d}
            </button>
          );
        })}
      </div>
      <p style={{ color: COLORS.textDim, marginBottom: 16, fontSize: 15 }}>Hoeveel uur per week?</p>
      <div style={{ display: "flex", gap: 10 }}>
        {["4-8 uur", "8-16 uur", "16-24 uur", "24+ uur"].map((h) => (
          <Chip key={h} selected={data.hours === h} onClick={() => setData({ ...data, hours: h })}>{h}</Chip>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext} disabled={(data.days || []).length < 1 || !data.hours}>Volgende →</BigButton>
      </div>
    </div>
  );
}

function DreamScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={8} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Laatste vraag ✨</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        Als je alles kon worden, wat zou je dan doen? Typ gewoon wat je denkt.
      </p>
      <textarea
        value={data.dream || ""}
        onChange={(e) => setData({ ...data, dream: e.target.value })}
        placeholder="Bijv. 'Iets met muziek', 'Eigen bedrijf starten', 'Weet ik nog niet'..."
        style={{
          width: "100%", minHeight: 120, padding: 16, borderRadius: 14,
          border: `1.5px solid ${COLORS.border}`, background: COLORS.card,
          color: COLORS.text, fontSize: 16, fontFamily: FONTS,
          resize: "vertical", boxSizing: "border-box", outline: "none",
        }}
      />
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext}>🚀 Bekijk mijn resultaten</BigButton>
      </div>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const msgs = ["Profiel analyseren...", "Banen matchen...", "CV opbouwen...", "Klaar!"];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const t = setTimeout(onDone, 400);
    return () => clearTimeout(t);
  }, [progress, onDone]);

  const msgIdx = Math.min(Math.floor(progress / 25), 3);
  return (
    <div style={{ ...styles.container, paddingTop: 120, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 24, animation: "pulse 1.5s infinite" }}>⚡</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, letterSpacing: "-0.02em" }}>{msgs[msgIdx]}</h2>
      <div style={{ background: COLORS.border, borderRadius: 8, height: 6, overflow: "hidden", maxWidth: 280, margin: "0 auto" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.purple})`, borderRadius: 8, transition: "width 0.1s ease" }} />
      </div>
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }`}</style>
    </div>
  );
}

// ── Result tabs ──

interface MatchedJob {
  id: string;
  title: string;
  type: string;
  salary: string;
  location: string;
  url: string;
  score?: number;
  similarity?: number;
}

function JobsTab({ profile }: { profile: CandidateProfile }) {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }), // send directly — no DB lookup, no race condition
    })
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => { setError('Kon banen niet laden'); setLoading(false); });
  }, [profile]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textDim }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
      <p style={{ margin: 0, fontSize: 14 }}>Banen zoeken die bij jou passen…</p>
    </div>
  );

  if (error) return <p style={{ color: COLORS.orange, fontSize: 14 }}>{error}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 32 }}>
      <p style={{ color: COLORS.textDim, fontSize: 14, margin: "0 0 8px" }}>{jobs.length} banen gevonden bij jou in de buurt</p>
      {jobs.map((job) => {
        const pct = (job.score ?? job.similarity) ? Math.round((job.score ?? job.similarity ?? 0) * 100) : null;
        return (
          <div key={job.id} style={{ padding: 18, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{job.title}</h3>
                <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0 }}>{job.location}</p>
              </div>
              {pct && (
                <div style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #00c087)`, color: COLORS.bg, fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>
                  {pct}%
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: COLORS.textDim, marginBottom: 10, flexWrap: "wrap" }}>
              <span>⏰ {job.type}</span><span>💶 {job.salary}</span>
            </div>
            <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${COLORS.accent}`, background: "transparent", color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONTS, textAlign: "center", textDecoration: "none" }}>
              Anoniem solliciteren →
            </a>
          </div>
        );
      })}
    </div>
  );
}

function CVTab({ data }: { data: AppData }) {
  const interests = (data.interests || []).map(id => INTERESTS.find(i => i.id === id)?.label).filter(Boolean);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const html = generateCVHTML(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) { alert("Sta pop-ups toe om het CV te downloaden."); URL.revokeObjectURL(url); return; }
    setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Preview */}
      <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card, marginBottom: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: COLORS.bg,
          }}>
            {data.name ? data.name[0].toUpperCase() : "A"}
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{data.name || "Anoniem Profiel"}</h3>
            <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0 }}>
              {data.age} jaar • {data.neighborhood ? `${data.neighborhood}, ` : ""}Amsterdam{data.email && ` • ${data.email}`}
            </p>
          </div>
        </div>

        <div style={{ padding: "8px 12px", borderRadius: 8, background: `${COLORS.orange}22`, border: `1px solid ${COLORS.orange}44`, color: COLORS.orange, fontSize: 12, marginBottom: 16 }}>
          🔒 Naam en contactinfo worden alleen op jouw CV gezet
        </div>

        <Section title="Profiel">
          <p style={{ color: COLORS.textDim, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Gemotiveerde jongere ({data.age} jaar) op zoek naar een bijbaan.
            {data.dream && ` Droombaan: ${data.dream}.`}
            {" "}Beschikbaar {(data.days || []).join(", ")} ({data.hours}).
          </p>
        </Section>

        {(data.school || data.eduLevel) && (
          <Section title="Opleiding">
            <p style={{ color: COLORS.text, fontSize: 14, margin: 0 }}>
              <strong>{data.school || "School"}</strong>
              {data.eduYear && <span style={{ color: COLORS.textDim }}> — {data.eduYear}</span>}
            </p>
            {data.eduLevel && <p style={{ color: COLORS.textDim, fontSize: 13, margin: "2px 0 0" }}>{data.eduLevel}</p>}
          </Section>
        )}

        {(data.languages || []).length > 0 && (
          <Section title="Talen">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(data.languages || []).map(l => (
                <span key={l} style={{ padding: "4px 10px", borderRadius: 6, background: `${COLORS.orange}22`, color: COLORS.orange, fontSize: 12, fontWeight: 600 }}>{l}</span>
              ))}
            </div>
          </Section>
        )}

        <Section title="Vaardigheden">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(data.skills || []).map(s => (
              <span key={s} style={{ padding: "4px 10px", borderRadius: 6, background: COLORS.purpleDim, color: COLORS.purple, fontSize: 12, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </Section>

        <Section title="Interesses">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {interests.map(i => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: `${COLORS.accentDim}`, color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>{i}</span>
            ))}
          </div>
        </Section>

        <Section title="Beschikbaarheid">
          <div style={{ display: "flex", gap: 6 }}>
            {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map(d => (
              <div key={d} style={{
                width: 36, height: 36, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600,
                background: (data.days || []).includes(d) ? COLORS.accentDim : COLORS.bg,
                color: (data.days || []).includes(d) ? COLORS.accent : COLORS.textDim,
                border: `1px solid ${(data.days || []).includes(d) ? COLORS.accent : COLORS.border}`,
              }}>
                {d}
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <BigButton onClick={handleDownload}>📥 Download als PDF</BigButton>
        {/* <BigButton onClick={async () => {
          await navigator.clipboard.writeText(JSON.stringify(toProfile(data), null, 2));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }} secondary>
          {copied ? "✓ Gekopieerd!" : "{ } Export JSON"}
        </BigButton> */}
      </div>
    </div>
  );
}


function ResultsScreen({ data, onTab, activeTab, profile }: { data: AppData; onTab: (tab: string) => void; activeTab: string; profile: CandidateProfile }) {
  return (
    <div style={styles.container}>
      <div style={{ paddingTop: 24, paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.accent, letterSpacing: "-0.02em", margin: 0 }}>STAP</h1>
        </div>
        <p style={{ color: COLORS.textDim, fontSize: 14, margin: 0 }}>Jouw persoonlijke resultaten</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.card, borderRadius: 14, padding: 4 }}>
        {[{ id: "jobs", label: "Banen", icon: "💼" }, { id: "cv", label: "CV", icon: "📄" }].map((t) => (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, padding: "12px 8px", borderRadius: 10, border: "none",
            background: activeTab === t.id ? COLORS.accentDim : "transparent",
            color: activeTab === t.id ? COLORS.accent : COLORS.textDim,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONTS, transition: "all 0.2s ease",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {activeTab === "jobs" && <JobsTab profile={profile} />}
      {activeTab === "cv" && <CVTab data={data} />}
    </div>
  );
}

// ── Main app ──

export default function StapPage() {
  const [screen, setScreen] = useState("welcome");
  const [data, setData] = useState<AppData>({ interests: [], skills: [], days: [], languages: [] });
  const [resultTab, setResultTab] = useState("jobs");
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  // if (showDashboard) {
  //   return (
  //     <div style={styles.app}>
  //       <div style={styles.glow} /><div style={styles.glowPurple} />
  //       <EmployerDashboard onBack={() => setShowDashboard(false)} />
  //     </div>
  //   );
  // }

  const renderScreen = () => {
    switch (screen) {
      case "welcome": return <WelcomeScreen onStart={() => setScreen("age")} />;
      case "age": return <AgeScreen data={data} setData={setData} onNext={() => setScreen("name")} />;
      case "name": return <NameScreen data={data} setData={setData} onNext={() => setScreen("location")} />;
      case "location": return <LocationScreen data={data} setData={setData} onNext={() => setScreen("education")} />;
      case "education": return <EducationScreen data={data} setData={setData} onNext={() => setScreen("languages")} />;
      case "languages": return <LanguagesScreen data={data} setData={setData} onNext={() => setScreen("interests")} />;
      case "interests": return <InterestsScreen data={data} setData={setData} onNext={() => setScreen("skills")} />;
      case "skills": return <SkillsScreen data={data} setData={setData} onNext={() => setScreen("availability")} />;
      case "availability": return <AvailabilityScreen data={data} setData={setData} onNext={() => setScreen("dream")} />;
      case "dream": return <DreamScreen data={data} setData={setData} onNext={() => setScreen("loading")} />;
      case "loading": return <LoadingScreen onDone={() => {
        const built = toProfile(data);
        setProfile(built);
        setScreen("results");
        // Save to DB in background for record-keeping — matching no longer depends on this
        void getSupabase().from("profiles").insert({
          id: built.profileId,
          email: built.identity.contactEmail,
          display_name: built.identity.displayName,
          age_range: built.demographics.ageRange,
          profile: built,
        });
      }} />;
      case "results": return profile
        ? <ResultsScreen data={data} onTab={setResultTab} activeTab={resultTab} profile={profile} />
        : null;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.glow} /><div style={styles.glowPurple} />
      {renderScreen()}

    </div>
  );
}
