'use client';

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import {
  INTERESTS, SKILLS_OPTIONS, SKILLS_OPTIONS_EN,
  LANGUAGES, EDU_LEVELS, EDU_LEVELS_EN, EDU_YEARS, EDU_YEARS_EN,
  EXPERIENCE_OPTIONS, EXPERIENCE_OPTIONS_EN,
  HOURS_OPTIONS, HOURS_OPTIONS_EN, DAYS_NL, DAYS_EN,
  type AppData,
} from "@/lib/junta-data";
import { toProfile, type CandidateProfile } from "@/lib/profile";
import { getSupabase } from "@/lib/supabase";

const COLORS = {
  bg: "#FFFFFF",
  card: "#F9F9F9",
  accent: "#eb4d02",
  accentDim: "#eb4d0220",
  purple: "#4A9FE5",
  purpleDim: "#4A9FE520",
  orange: "#F59E0B",
  text: "#0D0D0D",
  textDim: "#888888",
  border: "#E8E8E8",
};

const FONTS = `'Segoe UI', system-ui, sans-serif`;
const TOTAL_STEPS = 11;


const styles = {
  app: {
    fontFamily: FONTS,
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: "100vh",
    position: "relative" as const,
    overflow: "hidden" as const,
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
  background: "#FFFFFF",
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
      border: `1.5px solid ${selected ? "#0D0D0D" : COLORS.border}`,
      background: selected ? "#0D0D0D" : COLORS.card,
      color: selected ? "#FFFFFF" : COLORS.text,
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
      background: disabled ? COLORS.border : secondary ? "transparent" : "#0D0D0D",
      color: disabled ? COLORS.textDim : secondary ? COLORS.textDim : "#FFFFFF",
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

// ── CV PDF generation — always Dutch ──

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
  .exp-item { margin-bottom: 10px; }
  .exp-item strong { font-size: 10.5pt; display: block; }
  .exp-item span { color: #555; font-size: 10pt; }
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
    <p>${data.profileDescription ?? `Gemotiveerde jongere van ${data.age} jaar, woonachtig in ${data.location ? `${data.location.name}, ` : ""}Amsterdam, op zoek naar een bijbaan.${data.dream ? ` Toekomstdroom: <em>${data.dream}</em>.` : ""} Beschikbaar op ${fullDays.join(", ")}${data.hours ? ` voor ${data.hours} per week` : ""}.`}</p>
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

  ${(data.cvExperience || []).length > 0 ? `
  <div class="section">
    <h2>Ervaring</h2>
    ${(data.cvExperience || []).map(item => `
    <div class="exp-item">
      <strong>${item.title}</strong>
      <span>${item.description}</span>
    </div>`).join("")}
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
    <span>Gemaakt via Junta</span>
    <span>Amsterdam ${new Date().getFullYear()}</span>
  </div>
</body>
</html>`;
}

// ── Screens ──

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const t = useTranslations('app.welcome');
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);
  return (
    <div style={{ ...styles.container, paddingTop: 80, textAlign: "center", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
      <img src="/junta-logo.png" alt="Junta" style={{ height: 120, borderRadius: 16, marginBottom: 32, display: "inline-block" }} />
      <p style={{ color: COLORS.textDim, fontSize: 17, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 48px" }}>
        {t('tagline')}<br />
        <span style={{ color: COLORS.accent }}>{t('highlight')}</span>
      </p>
      <BigButton onClick={onStart}>{t('cta')}</BigButton>
      <p style={{ color: COLORS.textDim, fontSize: 12, marginTop: 16 }}>{t('note')}</p>
    </div>
  );
}

function AgeScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.age');
  return (
    <div style={styles.container}>
      <ProgressBar step={0} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 32, fontSize: 15 }}>{t('subtitle')}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {["14-15", "16-17", "18-20", "21-23", "23+"].map((age) => (
          <button key={age} onClick={() => { setData({ ...data, age }); onNext(); }} style={{
            padding: "18px 20px", borderRadius: 14,
            border: `1.5px solid ${data.age === age ? "#0D0D0D" : COLORS.border}`,
            background: data.age === age ? "#0D0D0D" : COLORS.card,
            color: data.age === age ? "#FFFFFF" : COLORS.text, fontSize: 18, fontWeight: 600,
            cursor: "pointer", textAlign: "left",
            transition: "all 0.2s ease", fontFamily: FONTS,
          }}>
            {age} {t('suffix')}
          </button>
        ))}
      </div>
    </div>
  );
}

function NameScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.name');
  return (
    <div style={styles.container}>
      <ProgressBar step={1} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        {t('subtitle')}
      </p>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 6, display: "block" }}>{t('nameLabel')}</label>
      <input
        value={data.name || ""}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        placeholder={t('namePlaceholder')}
        style={inputStyle}
      />
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 6, display: "block" }}>
        {t('contactLabel')} <span style={{ fontStyle: "italic" }}>{t('contactOptional')}</span>
      </label>
      <input
        value={data.email || ""}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        placeholder={t('contactPlaceholder')}
        style={inputStyle}
      />
      <div style={{ padding: "10px 14px", borderRadius: 10, background: `${COLORS.orange}15`, border: `1px solid ${COLORS.orange}33`, color: COLORS.orange, fontSize: 12, marginBottom: 32 }}>
        {t('privacyNote')}
      </div>
      <BigButton onClick={onNext} disabled={!data.name?.trim()}>{t('next')}</BigButton>
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
  const t = useTranslations('app.location');
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PdokDoc[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
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
    return () => clearTimeout(timer);
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

  const typeLabels: Record<string, string> = {
    buurt: t('typeLabels.buurt'),
    wijk: t('typeLabels.wijk'),
    woonplaats: t('typeLabels.woonplaats'),
    gemeente: t('typeLabels.gemeente'),
  };

  return (
    <div style={styles.container}>
      <ProgressBar step={2} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        {t('subtitle')}
      </p>

      {data.location ? (
        <div style={{ marginBottom: 32 }}>
          <div style={{ padding: "16px 18px", borderRadius: 14, border: `1.5px solid ${COLORS.border}`, background: COLORS.card, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div>
              <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 16 }}>📍 {data.location.name}</div>
              <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2 }}>{data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}</div>
            </div>
            <button onClick={() => setData({ ...data, location: undefined })} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 12, cursor: "pointer", fontFamily: FONTS }}>
              {t('change')}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", marginBottom: 32 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            autoFocus
            style={{ ...inputStyle, marginBottom: 0, paddingRight: searching ? 48 : 16 }}
          />
          {searching && (
            <div style={{ position: "absolute", right: 14, top: 16, color: COLORS.textDim, fontSize: 13 }}>…</div>
          )}
          {suggestions.length > 0 && (
            <div style={{ marginTop: 4, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              {suggestions.map((doc) => (
                <button key={doc.id} onClick={() => pick(doc)} style={{
                  width: "100%", padding: "12px 16px", border: "none", borderBottom: `1px solid ${COLORS.border}`,
                  background: "transparent", color: COLORS.text, fontSize: 14, cursor: "pointer",
                  fontFamily: FONTS, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{doc.weergavenaam}</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim, marginLeft: 8, flexShrink: 0 }}>{typeLabels[doc.type] ?? doc.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <BigButton onClick={onNext} disabled={!data.location}>{t('next')}</BigButton>
      <div style={{ marginTop: 12 }}>
        <BigButton onClick={onNext} secondary>{t('skip')}</BigButton>
      </div>
    </div>
  );
}

function EducationScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.education');
  const locale = useLocale();
  const eduLevels = locale === 'nl' ? EDU_LEVELS : EDU_LEVELS_EN;
  const eduYears = locale === 'nl' ? EDU_YEARS : EDU_YEARS_EN;

  return (
    <div style={styles.container}>
      <ProgressBar step={3} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>{t('subtitle')}</p>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 6, display: "block" }}>{t('schoolLabel')}</label>
      <input
        value={data.school || ""}
        onChange={(e) => setData({ ...data, school: e.target.value })}
        placeholder={t('schoolPlaceholder')}
        style={inputStyle}
      />
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 10, display: "block" }}>{t('levelLabel')}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {EDU_LEVELS.map((level, i) => (
          <Chip key={level} selected={data.eduLevel === level} onClick={() => setData({ ...data, eduLevel: level })}>
            {eduLevels[i]}
          </Chip>
        ))}
      </div>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 10, display: "block" }}>{t('yearLabel')}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
        {EDU_YEARS.map((year, i) => (
          <Chip key={year} selected={data.eduYear === year} onClick={() => setData({ ...data, eduYear: year })}>
            {eduYears[i]}
          </Chip>
        ))}
      </div>
      <BigButton onClick={onNext} disabled={!data.eduLevel}>{t('next')}</BigButton>
      <div style={{ marginTop: 12 }}>
        <BigButton onClick={onNext} secondary>{t('skip')}</BigButton>
      </div>
    </div>
  );
}

function LanguagesScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.languages');
  const toggle = (lang: string) => {
    const cur = data.languages || [];
    setData({ ...data, languages: cur.includes(lang) ? cur.filter(l => l !== lang) : [...cur, lang] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={4} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>{t('subtitle')}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
        {LANGUAGES.map((lang) => (
          <Chip key={lang} selected={(data.languages || []).includes(lang)} onClick={() => toggle(lang)}>
            {lang}
          </Chip>
        ))}
      </div>
      <BigButton onClick={onNext} disabled={(data.languages || []).length < 1}>{t('next')}</BigButton>
    </div>
  );
}

function InterestsScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.interests');
  const locale = useLocale();
  const toggle = (id: string) => {
    const cur = data.interests || [];
    setData({ ...data, interests: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={5} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>{t('subtitle')}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {INTERESTS.map((interest) => {
          const sel = (data.interests || []).includes(interest.id);
          const label = locale === 'nl' ? interest.label : interest.labelEn;
          return (
            <button key={interest.id} onClick={() => toggle(interest.id)} style={{
              padding: "12px 16px", borderRadius: 14,
              border: `1.5px solid ${sel ? "#0D0D0D" : COLORS.border}`,
              background: sel ? "#0D0D0D" : COLORS.card,
              color: sel ? "#FFFFFF" : COLORS.text,
              fontSize: 14, cursor: "pointer",
              transition: "all 0.2s ease", fontFamily: FONTS,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 20 }}>{interest.emoji}</span>{label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext} disabled={(data.interests || []).length < 2}>{t('next')}</BigButton>
      </div>
    </div>
  );
}

function SkillsScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.skills');
  const locale = useLocale();
  const toggle = (nlValue: string) => {
    const cur = data.skills || [];
    setData({ ...data, skills: cur.includes(nlValue) ? cur.filter(x => x !== nlValue) : [...cur, nlValue] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={6} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>{t('subtitle')}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {SKILLS_OPTIONS.map((nlSkill, i) => (
          <Chip key={nlSkill} selected={(data.skills || []).includes(nlSkill)} onClick={() => toggle(nlSkill)}>
            {locale === 'nl' ? nlSkill : SKILLS_OPTIONS_EN[i]}
          </Chip>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext} disabled={(data.skills || []).length < 1}>{t('next')}</BigButton>
      </div>
    </div>
  );
}

function AvailabilityScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.availability');
  const locale = useLocale();
  const daysDisplay = locale === 'nl' ? DAYS_NL : DAYS_EN;

  const toggle = (d: string) => {
    const cur = data.days || [];
    setData({ ...data, days: cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={7} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>{t('subtitle')}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {DAYS_NL.map((d, i) => {
          const sel = (data.days || []).includes(d);
          return (
            <button key={d} onClick={() => toggle(d)} style={{
              flex: 1, padding: "14px 0", borderRadius: 12,
              border: `1.5px solid ${sel ? "#0D0D0D" : COLORS.border}`,
              background: sel ? "#0D0D0D" : COLORS.card,
              color: sel ? "#FFFFFF" : COLORS.textDim,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONTS, transition: "all 0.2s ease",
            }}>
              {daysDisplay[i]}
            </button>
          );
        })}
      </div>
      <p style={{ color: COLORS.textDim, marginBottom: 16, fontSize: 15 }}>{t('hoursLabel')}</p>
      <div style={{ display: "flex", gap: 10 }}>
        {HOURS_OPTIONS.map((h, i) => (
          <Chip key={h} selected={data.hours === h} onClick={() => setData({ ...data, hours: h })}>
            {locale === 'nl' ? h : HOURS_OPTIONS_EN[i]}
          </Chip>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext} disabled={(data.days || []).length < 1 || !data.hours}>{t('next')}</BigButton>
      </div>
    </div>
  );
}

function DreamScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.dream');
  return (
    <div style={styles.container}>
      <ProgressBar step={8} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        {t('subtitle')}
      </p>
      <textarea
        value={data.dream || ""}
        onChange={(e) => setData({ ...data, dream: e.target.value })}
        placeholder={t('placeholder')}
        style={{
          width: "100%", minHeight: 120, padding: 16, borderRadius: 14,
          border: `1.5px solid ${COLORS.border}`, background: COLORS.card,
          color: COLORS.text, fontSize: 16, fontFamily: FONTS,
          resize: "vertical", boxSizing: "border-box", outline: "none",
        }}
      />
      <div style={{ marginTop: 32 }}>
        <BigButton onClick={onNext}>{t('next')}</BigButton>
      </div>
    </div>
  );
}

function ExperienceScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.experience');
  const locale = useLocale();
  const toggle = (nlValue: string) => {
    const cur = data.experienceTypes || [];
    setData({ ...data, experienceTypes: cur.includes(nlValue) ? cur.filter(x => x !== nlValue) : [...cur, nlValue] });
  };

  return (
    <div style={styles.container}>
      <ProgressBar step={9} total={TOTAL_STEPS} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{t('title')}</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        {t('subtitle')}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        {EXPERIENCE_OPTIONS.map((nlExp, i) => (
          <Chip key={nlExp} selected={(data.experienceTypes || []).includes(nlExp)} onClick={() => toggle(nlExp)}>
            {locale === 'nl' ? nlExp : EXPERIENCE_OPTIONS_EN[i]}
          </Chip>
        ))}
      </div>
      <label style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 8, display: "block" }}>
        {t('noteLabel')} <span style={{ fontStyle: "italic" }}>{t('noteOptional')}</span>
      </label>
      <textarea
        value={data.experienceNote || ""}
        onChange={e => setData({ ...data, experienceNote: e.target.value })}
        placeholder={t('notePlaceholder')}
        style={{
          width: "100%", minHeight: 90, padding: "12px 14px",
          borderRadius: 12, border: `1.5px solid ${COLORS.border}`,
          background: COLORS.card, color: COLORS.text,
          fontSize: 14, fontFamily: FONTS,
          resize: "vertical", boxSizing: "border-box", outline: "none",
          marginBottom: 32,
        }}
      />
      <BigButton onClick={onNext}>{t('next')}</BigButton>
      <div style={{ marginTop: 12 }}>
        <BigButton onClick={onNext} secondary>{t('skip')}</BigButton>
      </div>
    </div>
  );
}

function JobPicksScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const t = useTranslations('app.jobPicks');
  const [pairs, setPairs] = useState<{ a: string; b: string }[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [loadingPairs, setLoadingPairs] = useState(true);
  const [generatingCV, setGeneratingCV] = useState(false);
  const [error, setError] = useState(false);

  const round = picks.length;

  useEffect(() => {
    fetch('/api/job-pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(r => r.json())
      .then(json => {
        if (json.pairs?.length >= 3) {
          setPairs(json.pairs);
        } else {
          setError(true);
        }
        setLoadingPairs(false);
      })
      .catch(() => { setError(true); setLoadingPairs(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = async (job: string) => {
    const newPicks = [...picks, job];
    setPicks(newPicks);

    if (newPicks.length === 3) {
      setGeneratingCV(true);
      try {
        const [profileRes, expRes] = await Promise.all([
          fetch('/api/generate-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, picks: newPicks }),
          }),
          fetch('/api/generate-experience', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              experienceTypes: data.experienceTypes,
              experienceNote: data.experienceNote,
            }),
          }),
        ]);
        const [profileJson, expJson] = await Promise.all([profileRes.json(), expRes.json()]);
        setData({
          ...data,
          profileDescription: profileJson.nl || undefined,
          profileDescriptionEn: profileJson.en || undefined,
          cvExperience: expJson.items?.length ? expJson.items : undefined,
        });
      } catch { /* silently fall back to template text */ }
      onNext();
    }
  };

  if (loadingPairs || generatingCV) {
    const msg = generatingCV ? t('generatingCV') : t('loading');
    const desc = generatingCV ? t('generatingDesc') : t('loadingDesc');
    return (
      <div style={{ ...styles.container, paddingTop: 120, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>✨</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{msg}</h2>
        <p style={{ color: COLORS.textDim, fontSize: 15 }}>{desc}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <ProgressBar step={10} total={TOTAL_STEPS} />
        <p style={{ color: COLORS.orange, marginBottom: 32, fontSize: 15 }}>
          {t('error')}
        </p>
        <BigButton onClick={onNext} secondary>{t('skip')}</BigButton>
      </div>
    );
  }

  const currentPair = pairs[round];

  return (
    <div style={styles.container}>
      <ProgressBar step={10} total={TOTAL_STEPS} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{t('title')}</h2>
      </div>
      <p style={{ color: COLORS.textDim, marginBottom: 8, fontSize: 15 }}>
        {t('subtitle', { n: round + 1 })}
      </p>
      <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < round ? COLORS.accent : i === round ? COLORS.purple : COLORS.border,
            transition: "background 0.3s ease",
          }} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[currentPair.a, currentPair.b].map((job) => (
          <button
            key={job}
            onClick={() => pick(job)}
            style={{
              padding: "22px 20px",
              borderRadius: 16,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.card,
              color: COLORS.text,
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: FONTS,
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#0D0D0D";
              (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D";
              (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = COLORS.border;
              (e.currentTarget as HTMLButtonElement).style.background = COLORS.card;
              (e.currentTarget as HTMLButtonElement).style.color = COLORS.text;
            }}
          >
            {job}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={() => onNext()}
          style={{ background: "none", border: "none", color: COLORS.textDim, fontSize: 13, cursor: "pointer", fontFamily: FONTS }}
        >
          {t('skip')}
        </button>
      </div>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const t = useTranslations('app.loading');
  const [progress, setProgress] = useState(0);
  const msgs = [t('msgs0'), t('msgs1'), t('msgs2'), t('msgs3')];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const timer = setTimeout(onDone, 400);
    return () => clearTimeout(timer);
  }, [progress, onDone]);

  const msgIdx = Math.min(Math.floor(progress / 25), 3);
  return (
    <div style={{ ...styles.container, paddingTop: 120, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 24, animation: "pulse 1.5s infinite" }}>⚡</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, letterSpacing: "-0.02em" }}>{msgs[msgIdx]}</h2>
      <div style={{ background: COLORS.border, borderRadius: 8, height: 6, overflow: "hidden", maxWidth: 280, margin: "0 auto" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: COLORS.accent, borderRadius: 8, transition: "width 0.1s ease" }} />
      </div>
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }`}</style>
    </div>
  );
}

// ── Result tabs ──

function scoreColor(score: number): string {
  if (score >= 0.70) return COLORS.accent;
  if (score >= 0.55) return COLORS.purple;
  return COLORS.textDim;
}

interface MatchedJob {
  id: string;
  title: string;
  type: string;
  salary: string;
  location: string;
  url: string | null;
  contact_email?: string | null;
  lat?: number | null;
  lng?: number | null;
  score?: number;
  similarity?: number;
}

function JobsTab({ profile }: { profile: CandidateProfile }) {
  const t = useTranslations('app.results');
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    })
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => { setError(t('jobsError')); setLoading(false); });
  }, [profile, t]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textDim }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
      <p style={{ margin: 0, fontSize: 14 }}>{t('jobsLoading')}</p>
    </div>
  );

  if (error) return <p style={{ color: COLORS.orange, fontSize: 14 }}>{error}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 32 }}>
      <p style={{ color: COLORS.textDim, fontSize: 14, margin: "0 0 8px" }}>{t('jobsFound', { count: jobs.length })}</p>
      {jobs.map((job, idx) => {
        const score = job.score ?? job.similarity ?? 0;
        const pct = score ? Math.round(score * 100) : null;
        const color = scoreColor(score);
        const rank = idx + 1;
        return (
          <div key={job.id} style={{ padding: 18, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{job.title}</h3>
                <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0 }}>{job.location}</p>
              </div>
              {pct !== null && (
                <div style={{
                  background: `${color}22`, color, border: `1px solid ${color}55`,
                  fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>#{rank}</span>
                  {pct}%
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: COLORS.textDim, flexWrap: "wrap" }}>
              <span>⏰ {job.type}</span><span>💶 {job.salary}</span>
            </div>
            {job.contact_email ? (
              <a
                href={`mailto:${job.contact_email}?subject=${encodeURIComponent(`Sollicitatie: ${job.title}`)}&body=${encodeURIComponent(`Hallo,\n\nIk solliciteer graag naar de functie ${job.title}.\n\nMet vriendelijke groet,\n${profile.identity.displayName ?? ''}`)}`}
                style={{ display: "block", marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${color}`, background: "transparent", color, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONTS, textAlign: "center", textDecoration: "none" }}
              >
                {t('applyEmail')}
              </a>
            ) : job.url ? (
              <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${color}`, background: "transparent", color, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONTS, textAlign: "center", textDecoration: "none" }}>
                {t('apply')}
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CVTab({ data }: { data: AppData }) {
  const t = useTranslations('app.cv');
  const locale = useLocale();
  const interests = (data.interests || []).map(id => {
    const interest = INTERESTS.find(i => i.id === id);
    return locale === 'nl' ? interest?.label : interest?.labelEn;
  }).filter(Boolean);

  const handleDownload = () => {
    const html = generateCVHTML(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) { alert("Sta pop-ups toe om het CV te downloaden."); URL.revokeObjectURL(url); return; }
    setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
  };

  const tResults = useTranslations('app.results');

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Preview */}
      <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "#0D0D0D",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#FFFFFF",
          }}>
            {data.name ? data.name[0].toUpperCase() : "A"}
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{data.name || t('anonymousProfile')}</h3>
            <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0 }}>
              {data.age} jaar • {data.neighborhood ? `${data.neighborhood}, ` : ""}Amsterdam{data.email && ` • ${data.email}`}
            </p>
          </div>
        </div>

        <div style={{ padding: "8px 12px", borderRadius: 8, background: `${COLORS.orange}22`, border: `1px solid ${COLORS.orange}44`, color: COLORS.orange, fontSize: 12, marginBottom: 16 }}>
          {t('privacyNote')}
        </div>

        <Section title={t('profile')}>
          <p style={{ color: COLORS.textDim, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {(locale === 'en' ? data.profileDescriptionEn : data.profileDescription) ?? (
              <>
                {t('profileFallback', { age: data.age ?? '' })}
                {data.dream && ` ${t('dreamPrefix')} ${data.dream}.`}
                {" "}{(data.days || []).join(", ")} ({data.hours}).
              </>
            )}
          </p>
        </Section>

        {(data.school || data.eduLevel) && (
          <Section title={t('education')}>
            <p style={{ color: COLORS.text, fontSize: 14, margin: 0 }}>
              <strong>{data.school || t('school')}</strong>
              {data.eduYear && <span style={{ color: COLORS.textDim }}> — {data.eduYear}</span>}
            </p>
            {data.eduLevel && <p style={{ color: COLORS.textDim, fontSize: 13, margin: "2px 0 0" }}>{data.eduLevel}</p>}
          </Section>
        )}

        {(data.cvExperience || []).length > 0 && (
          <Section title={t('experience')}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(data.cvExperience || []).map((item, i) => (
                <div key={i}>
                  <p style={{ color: COLORS.text, fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {locale === 'en' ? (item.titleEn ?? item.title) : item.title}
                  </p>
                  <p style={{ color: COLORS.textDim, fontSize: 13, margin: "2px 0 0" }}>
                    {locale === 'en' ? (item.descriptionEn ?? item.description) : item.description}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {(data.languages || []).length > 0 && (
          <Section title={t('languages')}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(data.languages || []).map(l => (
                <span key={l} style={{ padding: "4px 10px", borderRadius: 6, background: `${COLORS.orange}22`, color: COLORS.orange, fontSize: 12, fontWeight: 600 }}>{l}</span>
              ))}
            </div>
          </Section>
        )}

        <Section title={t('skills')}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(data.skills || []).map(s => (
              <span key={s} style={{ padding: "4px 10px", borderRadius: 6, background: COLORS.purpleDim, color: COLORS.purple, fontSize: 12, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </Section>

        <Section title={t('interests')}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {interests.map(i => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: `${COLORS.accentDim}`, color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>{i}</span>
            ))}
          </div>
        </Section>

        <Section title={t('availability')}>
          <div style={{ display: "flex", gap: 6 }}>
            {DAYS_NL.map(d => (
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

      <BigButton onClick={handleDownload}>{tResults('downloadCV')}</BigButton>
    </div>
  );
}


function ResultsScreen({ data, onTab, activeTab, profile, onReset }: { data: AppData; onTab: (tab: string) => void; activeTab: string; profile: CandidateProfile; onReset: () => void }) {
  const t = useTranslations('app.results');
  return (
    <div style={styles.container}>
      <div style={{ paddingTop: 24, paddingBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <img src="/junta-logo.png" alt="Junta" style={{ height: 48, borderRadius: 10, flexShrink: 0 }} />
        <p style={{ color: COLORS.textDim, fontSize: 14, margin: 0, flex: 1 }}>{t('subtitle')}</p>
        <button onClick={onReset} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textDim, fontSize: 12, cursor: "pointer", fontFamily: FONTS, padding: "6px 10px", flexShrink: 0 }}>
          {t('reset')}
        </button>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.card, borderRadius: 14, padding: 4, border: `1px solid ${COLORS.border}` }}>
        {[{ id: "jobs", label: t('jobsTab'), icon: "💼" }, { id: "cv", label: t('cvTab'), icon: "📄" }].map((tab) => (
          <button key={tab.id} onClick={() => onTab(tab.id)} style={{
            flex: 1, padding: "12px 8px", borderRadius: 10, border: "none",
            background: activeTab === tab.id ? "#0D0D0D" : "transparent",
            color: activeTab === tab.id ? "#FFFFFF" : COLORS.textDim,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONTS, transition: "all 0.2s ease",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "jobs" && <JobsTab profile={profile} />}
      {activeTab === "cv" && <CVTab data={data} />}
    </div>
  );
}

// ── Main app ──

const STORAGE_KEY = "junta_resume";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { data: AppData; profile: CandidateProfile };
  } catch { /* ignore */ }
  return null;
}

export default function JuntaPage() {
  const [screen, setScreen] = useState(() => (loadSaved() ? "results" : "welcome"));
  const [data, setData] = useState<AppData>(() => loadSaved()?.data ?? { interests: [], skills: [], days: [], languages: [] });
  const [resultTab, setResultTab] = useState("jobs");
  const [profile, setProfile] = useState<CandidateProfile | null>(() => loadSaved()?.profile ?? null);

  const saveToStorage = (savedData: AppData, savedProfile: CandidateProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: savedData, profile: savedProfile }));
    } catch { /* ignore quota errors */ }
  };

  const resetProfile = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setData({ interests: [], skills: [], days: [], languages: [] });
    setProfile(null);
    setResultTab("jobs");
    setScreen("welcome");
  };

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
      case "dream": return <DreamScreen data={data} setData={setData} onNext={() => setScreen("experience")} />;
      case "experience": return <ExperienceScreen data={data} setData={setData} onNext={() => setScreen("cvprofile")} />;
      case "cvprofile": return <JobPicksScreen data={data} setData={setData} onNext={() => setScreen("loading")} />;
      case "loading": return <LoadingScreen onDone={() => {
        const built = toProfile(data);
        setProfile(built);
        saveToStorage(data, built);
        setScreen("results");
        void getSupabase().from("profiles").insert({
          id: built.profileId,
          email: built.identity.contactEmail,
          display_name: built.identity.displayName,
          age_range: built.demographics.ageRange,
          profile: built,
        });
      }} />;
      case "results": return profile
        ? <ResultsScreen data={data} onTab={setResultTab} activeTab={resultTab} profile={profile} onReset={resetProfile} />
        : null;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      {renderScreen()}
    </div>
  );
}
