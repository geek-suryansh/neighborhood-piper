'use client';

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from 'next-intl';
import {
  INTERESTS, SKILLS_OPTIONS, SKILLS_OPTIONS_EN,
  LANGUAGES, LANGUAGES_EN, EDU_LEVELS, EDU_LEVELS_EN, EDU_YEARS, EDU_YEARS_EN,
  EXPERIENCE_OPTIONS, EXPERIENCE_OPTIONS_EN,
  HOURS_OPTIONS, HOURS_OPTIONS_EN, DAYS_NL, DAYS_EN,
  type AppData, type EscoMatch,
} from "@/lib/junta-data";
import { toProfile, type CandidateProfile, LANGUAGE_ISO } from "@/lib/profile";
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

const FONTS = `var(--font-nunito, 'Segoe UI', system-ui, sans-serif)`;
const TOTAL_STEPS = 11;

const CARD_PASTELS = [
  { bg: '#FFE8E0', accent: '#D94A00' },
  { bg: '#DCEEFF', accent: '#2B82CC' },
  { bg: '#D4F5E9', accent: '#1A8A56' },
  { bg: '#EDE9FE', accent: '#6D4ED6' },
  { bg: '#FFF3D4', accent: '#C47A00' },
];


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


// ── Refugee flow screens ──

function RefugeeCheckScreen({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div style={{ ...styles.container, paddingTop: 60 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
        Are you a newcomer in the Netherlands?
      </h2>
      <p style={{ color: COLORS.textDim, marginBottom: 40, fontSize: 15 }}>
        This helps us translate your foreign diplomas and experience correctly.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={onYes} style={{
          padding: "22px 20px", borderRadius: 16,
          border: `1.5px solid ${COLORS.border}`,
          background: COLORS.card, color: COLORS.text,
          fontSize: 17, fontWeight: 600, cursor: "pointer",
          textAlign: "left", fontFamily: FONTS,
          transition: "all 0.2s ease",
        }}>
          🌍 Yes, I am a newcomer
        </button>
        <button onClick={onNo} style={{
          padding: "22px 20px", borderRadius: 16,
          border: `1.5px solid ${COLORS.border}`,
          background: COLORS.card, color: COLORS.text,
          fontSize: 17, fontWeight: 600, cursor: "pointer",
          textAlign: "left", fontFamily: FONTS,
          transition: "all 0.2s ease",
        }}>
          🏠 No, I already live in the Netherlands
        </button>
      </div>
    </div>
  );
}

function CountryScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={0} total={10} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Which country are you from?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        This helps us put your qualifications in context.
      </p>
      <input
        value={data.originCountry || ""}
        onChange={e => setData({ ...data, originCountry: e.target.value })}
        placeholder="e.g. Syria, Afghanistan, Eritrea…"
        autoFocus
        style={inputStyle}
      />
      <BigButton onClick={onNext} disabled={!data.originCountry?.trim()}>Next →</BigButton>
    </div>
  );
}

function CredentialInputScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const [input, setInput] = useState("");

  const addCredential = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const current = data.rawCredentials ?? [];
    if (!current.includes(trimmed)) {
      setData({ ...data, rawCredentials: [...current, trimmed] });
    }
    setInput("");
  };

  const remove = (val: string) => {
    setData({ ...data, rawCredentials: (data.rawCredentials ?? []).filter(c => c !== val) });
  };

  return (
    <div style={styles.container}>
      <ProgressBar step={2} total={10} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>What diplomas or qualifications do you have?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        Add your foreign diplomas and certificates. You can write them in your own language.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCredential(); } }}
          placeholder="e.g. 'Nursing diploma', 'Bachelor Electrical Engineering'…"
          style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
        />
        <button onClick={addCredential} style={{
          padding: "14px 20px", borderRadius: 12,
          border: "none", background: "#0D0D0D", color: "#FFFFFF",
          fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: FONTS,
        }}>+</button>
      </div>
      {(data.rawCredentials ?? []).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {(data.rawCredentials ?? []).map(c => (
            <span key={c} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 20,
              background: "#0D0D0D", color: "#FFFFFF",
              fontSize: 13, fontWeight: 600,
            }}>
              {c}
              <button onClick={() => remove(c)} style={{
                background: "none", border: "none", color: "#FFFFFF99",
                cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
              }}>×</button>
            </span>
          ))}
        </div>
      )}
      <BigButton onClick={onNext} disabled={(data.rawCredentials ?? []).length === 0}>
        Analyse →
      </BigButton>
      <div style={{ marginTop: 12 }}>
        <BigButton onClick={onNext} secondary>Skip</BigButton>
      </div>
    </div>
  );
}

function CredentialLoadingScreen({ data, setData, onDone }: { data: AppData; setData: (d: AppData) => void; onDone: () => void }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const credentials = data.rawCredentials ?? [];
    if (credentials.length === 0) { onDone(); return; }

    const inputLang = (() => {
      const langs = data.languages ?? [];
      for (const lang of langs) {
        const iso = LANGUAGE_ISO[lang];
        if (iso && iso !== "nl") return iso;
      }
      return null;
    })();

    Promise.all(
      credentials.map(async (cred) => {
        try {
          const res = await fetch("/api/credential", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cred, input_lang: inputLang }),
          });
          const json = await res.json();
          return { input: cred, lookup: json.error ? null : json, error: json.error } as EscoMatch;
        } catch {
          return { input: cred, lookup: null, error: "Netwerk fout" } as EscoMatch;
        }
      })
    ).then(matches => {
      setData({ ...data, escoMatches: matches });
      onDone();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ ...styles.container, paddingTop: 120, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
        Analysing your qualifications…
      </h2>
      <p style={{ color: COLORS.textDim, fontSize: 15 }}>
        We are looking up the Dutch and European equivalents for your credentials.
      </p>
    </div>
  );
}

const CONFIDENCE_LABELS: Array<{ min: number; label: string; color: string }> = [
  { min: 0.7, label: "Good match", color: "#059669" },
  { min: 0.4, label: "Moderate match", color: "#d97706" },
  { min: 0,   label: "Uncertain match", color: "#6b7280" },
];

function CredentialMatchScreen({ data, onNext }: { data: AppData; onNext: () => void }) {
  const matches = data.escoMatches ?? [];

  return (
    <div style={styles.container}>
      <ProgressBar step={3} total={10} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
        Your qualifications
      </h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        We have matched your credentials to European standards.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {matches.map((m, i) => {
          const top = m.lookup?.matches?.[0] ?? null;
          const conf = top?.confidence ?? 0;
          const confLabel = CONFIDENCE_LABELS.find(c => conf >= c.min) ?? CONFIDENCE_LABELS[2];
          return (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 14,
              border: `1.5px solid ${COLORS.border}`, background: COLORS.card,
            }}>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 6 }}>
                Your input: <em>{m.input}</em>
              </div>
              {top ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
                    {top.preferred_labels?.nl ?? top.preferred_labels?.en ?? m.input}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {top.eqf && (
                      <span style={{ padding: "3px 10px", borderRadius: 20, background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 600 }}>
                        EQF {top.eqf.level} — {top.eqf.dutch_equivalent}
                      </span>
                    )}
                    {top.isco_code && (
                      <span style={{ padding: "3px 10px", borderRadius: 20, background: "#f3f4f6", color: "#374151", fontSize: 12, fontWeight: 600 }}>
                        ISCO {top.isco_code}
                      </span>
                    )}
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: `${confLabel.color}20`, color: confLabel.color, fontSize: 12, fontWeight: 600 }}>
                      {confLabel.label}
                    </span>
                  </div>
                  {top.regulated_warning && (
                    <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "#fef3c7", color: "#92400e", fontSize: 12 }}>
                      ⚠️ {top.regulated_warning.warning}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: COLORS.textDim, fontSize: 14 }}>
                  No match found for this credential.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BigButton onClick={onNext}>Continue →</BigButton>
    </div>
  );
}


// ── CV Style presets ──

type CVColorId = 'green' | 'blue' | 'orange' | 'purple' | 'rose';
type CVFontId = 'modern' | 'classic' | 'clean' | 'mono' | 'friendly';
type CVSectionStyleId = 'line' | 'color' | 'block';
interface CVColorPreset { id: CVColorId; label: string; accent: string; tagBg: string; tagText: string; tagBorder: string; sidebarBg: string; }
interface CVFontPreset { id: CVFontId; label: string; stack: string; googleFont: string; }
interface CVSectionPreset { id: CVSectionStyleId; label: string; }
interface CVStyle { colorId: CVColorId; fontId: CVFontId; sectionStyleId: CVSectionStyleId; }

const CV_COLORS: CVColorPreset[] = [
  { id: 'green',  label: 'Groen',  accent: '#059669', tagBg: '#ecfdf5', tagText: '#065f46', tagBorder: '#05966933', sidebarBg: '#d1fae5' },
  { id: 'blue',   label: 'Blauw',  accent: '#2563eb', tagBg: '#eff6ff', tagText: '#1d4ed8', tagBorder: '#2563eb33', sidebarBg: '#dbeafe' },
  { id: 'orange', label: 'Oranje', accent: '#d97706', tagBg: '#fffbeb', tagText: '#92400e', tagBorder: '#d9770633', sidebarBg: '#fef3c7' },
  { id: 'purple', label: 'Paars',  accent: '#7c3aed', tagBg: '#f5f3ff', tagText: '#5b21b6', tagBorder: '#7c3aed33', sidebarBg: '#ede9fe' },
  { id: 'rose',   label: 'Roze',   accent: '#db2777', tagBg: '#fdf2f8', tagText: '#9d174d', tagBorder: '#db277733', sidebarBg: '#fce7f3' },
];
const CV_FONTS: CVFontPreset[] = [
  { id: 'modern',   label: 'Modern',      stack: "'Inter', system-ui, sans-serif",              googleFont: 'Inter:wght@400;500;600;700;800;900' },
  { id: 'classic',  label: 'Klassiek',    stack: "'Playfair Display', Georgia, serif",           googleFont: 'Playfair+Display:wght@400;600;700;800;900' },
  { id: 'clean',    label: 'Clean',       stack: "'DM Sans', Arial, sans-serif",                 googleFont: 'DM+Sans:wght@400;500;700;800' },
  { id: 'mono',     label: 'Mono',        stack: "'IBM Plex Mono', 'Courier New', monospace",    googleFont: 'IBM+Plex+Mono:wght@400;500;600;700' },
  { id: 'friendly', label: 'Vriendelijk', stack: "'Nunito', Tahoma, sans-serif",                 googleFont: 'Nunito:wght@400;600;700;800;900' },
];
const CV_SECTION_STYLES: CVSectionPreset[] = [
  { id: 'line',  label: 'Lijn' },
  { id: 'color', label: 'Kleur' },
  { id: 'block', label: 'Blok' },
];
const DEFAULT_CV_STYLE: CVStyle = { colorId: 'blue', fontId: 'modern', sectionStyleId: 'line' };

// ── CV PDF generation — always Dutch ──

function generateCVHTML(data: AppData, style: CVStyle = DEFAULT_CV_STYLE): string {
  const interestLabels = (data.interests || [])
    .map(id => INTERESTS.find(i => i.id === id)?.label)
    .filter(Boolean);
  const dayMap: Record<string, string> = {
    Ma: "Ma", Di: "Di", Wo: "Wo",
    Do: "Do", Vr: "Vr", Za: "Za", Zo: "Zo",
  };
  const shortDays = (data.days || []).map(d => dayMap[d] || d);
  const fullDayMap: Record<string, string> = {
    Ma: "Maandag", Di: "Dinsdag", Wo: "Woensdag",
    Do: "Donderdag", Vr: "Vrijdag", Za: "Zaterdag", Zo: "Zondag",
  };
  const fullDays = (data.days || []).map(d => fullDayMap[d] || d);

  const colorPreset = CV_COLORS.find(c => c.id === style.colorId) ?? CV_COLORS[0];
  const fontPreset = CV_FONTS.find(f => f.id === style.fontId) ?? CV_FONTS[0];
  const { accent, tagText, tagBorder, sidebarBg } = colorPreset;
  const fontStack = fontPreset.stack;

  let mainHeadingCSS: string;
  if (style.sectionStyleId === 'color') {
    mainHeadingCSS = `font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: ${accent}; margin: 0 0 10px; padding-bottom: 5px; border-bottom: 2px solid ${accent};`;
  } else if (style.sectionStyleId === 'block') {
    mainHeadingCSS = `font-size: 7.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: white; background: ${accent}; padding: 4px 12px; border-radius: 4px; display: inline-block; margin: 0 0 10px;`;
  } else {
    mainHeadingCSS = `font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #111827; margin: 0 0 10px; padding-bottom: 5px; border-bottom: 2px solid ${accent};`;
  }

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>CV — ${data.name || "Anoniem"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fontPreset.googleFont}&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: ${fontStack}; color: #1a1a1a; background: white; font-size: 10pt; line-height: 1.55; }
  .page { display: flex; width: 100%; min-height: 100vh; align-items: stretch; }
  .sidebar { width: 210px; flex-shrink: 0; background: ${sidebarBg}; padding: 0 20px; align-self: stretch; }
  .s-name { font-size: 18pt; font-weight: 900; letter-spacing: -0.025em; color: #0a0a0f; line-height: 1.05; margin-bottom: 5px; padding-top: 24px; }
  .s-badge { display: inline-block; font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: ${accent}; background: white; border: 1.5px solid ${tagBorder}; padding: 2px 9px; border-radius: 20px; margin-bottom: 18px; }
  .s-section { margin-bottom: 14px; }
  .s-heading { font-size: 7pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: ${accent}; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1.5px solid ${accent}; }
  .s-item { font-size: 8.5pt; color: #374151; margin-bottom: 3px; word-break: break-word; }
  .s-tag { display: inline-block; background: white; border: 1px solid ${tagBorder}; color: ${tagText}; padding: 1px 7px; border-radius: 20px; font-size: 7.5pt; font-weight: 600; margin: 1px 2px 1px 0; }
  .s-day { display: inline-block; font-size: 7.5pt; font-weight: 600; padding: 1px 7px; border-radius: 20px; margin: 1px 2px 1px 0; background: white; border: 1px solid ${accent}; color: ${tagText}; }
  .main { flex: 1; padding: 24px 30px; background: white; }
  .m-section { margin-bottom: 14px; }
  .m-heading { ${mainHeadingCSS} }
  .body-text { font-size: 9.5pt; color: #374151; line-height: 1.6; }
  .edu-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .edu-name { font-size: 9.5pt; font-weight: 700; color: #111827; }
  .edu-level { font-size: 8.5pt; color: #6b7280; margin-top: 1px; }
  .edu-year { font-size: 8.5pt; color: #9ca3af; white-space: nowrap; }
  .exp-item { margin-bottom: 10px; }
  .exp-title { font-size: 9.5pt; font-weight: 700; color: #111827; }
  .exp-desc { font-size: 8.5pt; color: #4b5563; line-height: 1.5; margin-top: 1px; }
  @media print { .page { min-height: 297mm; } @page { size: A4; margin: 0; } }
</style>
</head>
<body>
<div class="page">
  <div class="sidebar">
    <div class="s-name">${data.name || "Anoniem"}</div>
    <div class="s-badge">Op zoek naar bijbaan</div>

    <div class="s-section">
      <div class="s-heading">Contact</div>
      ${data.email ? `<div class="s-item">✉ ${data.email}</div>` : ""}
      <div class="s-item">📍 ${data.location ? data.location.name : "Nederland"}</div>
      ${data.age ? `<div class="s-item">🎂 ${data.age} jaar</div>` : ""}
    </div>

    ${(data.skills || []).length > 0 ? `
    <div class="s-section">
      <div class="s-heading">Vaardigheden</div>
      <div>${(data.skills || []).map(s => `<span class="s-tag">${s}</span>`).join("")}</div>
    </div>` : ""}

    ${(data.languages || []).length > 0 ? `
    <div class="s-section">
      <div class="s-heading">Talen</div>
      <div>${(data.languages || []).map(l => `<span class="s-tag">${l}</span>`).join("")}</div>
    </div>` : ""}

    ${interestLabels.length > 0 ? `
    <div class="s-section">
      <div class="s-heading">Interesses</div>
      <div>${interestLabels.map(i => `<span class="s-tag">${i}</span>`).join("")}</div>
    </div>` : ""}

    ${shortDays.length > 0 ? `
    <div class="s-section">
      <div class="s-heading">Beschikbaarheid</div>
      <div>${shortDays.map(d => `<span class="s-day">${d}</span>`).join("")}</div>
      ${data.hours ? `<div class="s-item" style="margin-top:6px;">${data.hours} per week</div>` : ""}
    </div>` : ""}
  </div>

  <div class="main">
    <div class="m-section">
      <div class="m-heading">Profiel</div>
      <p class="body-text">${data.profileDescription ?? `Gemotiveerde jongere van ${data.age} jaar, woonachtig in ${data.location ? data.location.name : "Nederland"}, op zoek naar een bijbaan.${data.dream ? ` Toekomstdroom: <em>${data.dream}</em>.` : ""} Beschikbaar op ${fullDays.join(", ")}${data.hours ? ` voor ${data.hours} per week` : ""}.`}</p>
    </div>

    ${(data.school || data.eduLevel) ? `
    <div class="m-section">
      <div class="m-heading">Opleiding</div>
      <div class="edu-row">
        <div>
          <div class="edu-name">${data.school || "School / Instelling"}</div>
          ${data.eduLevel ? `<div class="edu-level">${data.eduLevel}</div>` : ""}
        </div>
        ${data.eduYear ? `<div class="edu-year">${data.eduYear}</div>` : ""}
      </div>
    </div>` : ""}

    ${(data.cvExperience || []).length > 0 ? `
    <div class="m-section">
      <div class="m-heading">Ervaring</div>
      ${(data.cvExperience || []).map(item => `
      <div class="exp-item">
        <div class="exp-title">${item.title}</div>
        <div class="exp-desc">${item.description}</div>
      </div>`).join("")}
    </div>` : ""}

    ${(data.escoMatches || []).filter(m => m.lookup?.matches?.[0]).length > 0 ? `
    <div class="m-section">
      <div class="m-heading">Internationale kwalificaties</div>
      ${(data.escoMatches || []).map(m => {
        const top = m.lookup?.matches?.[0];
        if (!top) return "";
        const label = top.preferred_labels?.nl ?? top.preferred_labels?.en ?? m.input;
        const eqf = top.eqf ? ` · EQF ${top.eqf.level} (${top.eqf.dutch_equivalent})` : "";
        return `
      <div class="exp-item">
        <div class="exp-title">${label}${eqf}</div>
        <div class="exp-desc">Origineel diploma: ${m.input}${data.originCountry ? ` (${data.originCountry})` : ""}</div>
      </div>`;
      }).join("")}
    </div>` : ""}
  </div>
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
      {/* <div style={{ padding: "10px 14px", borderRadius: 10, background: `${COLORS.orange}15`, border: `1px solid ${COLORS.orange}33`, color: COLORS.orange, fontSize: 12, marginBottom: 32 }}>
        {t('privacyNote')}
      </div> */}
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

function LanguagesScreen({ data, setData, onNext, langs }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; langs?: string[] }) {
  const t = useTranslations('app.languages');
  const list = langs ?? LANGUAGES;
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
        {list.map((lang) => (
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
  const locale = useLocale();
  const [pairs, setPairs] = useState<{ a: string; b: string; aEn?: string; bEn?: string }[]>([]);
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
        {([['a', 'aEn'], ['b', 'bEn']] as const).map(([nlKey, enKey]) => {
          const job = currentPair[nlKey];
          const label = locale === 'en' ? (currentPair[enKey] ?? job) : job;
          return (
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
              {label}
            </button>
          );
        })}
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


interface MatchedJob {
  id: string;
  title: string;
  type: string;
  salary: string;
  location: string;
  url: string | null;
  contact_email?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  score?: number;
  similarity?: number;
}

function ApplyForm({ job, profile, onSuccess, onCancel }: {
  job: MatchedJob;
  profile: CandidateProfile;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(profile.identity.displayName ?? '');
  const [email, setEmail] = useState(profile.identity.contactEmail ?? '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    if (!email.trim()) { setErr('Vul je e-mailadres in.'); return; }
    setSubmitting(true);
    const { error } = await getSupabase().from('applications').insert({
      job_id: job.id,
      candidate_name: name.trim() || null,
      candidate_email: email.trim(),
      message: message.trim() || null,
    });
    if (error) { setErr(error.message); setSubmitting(false); return; }
    onSuccess();
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: `1px solid ${COLORS.border}`, background: '#FFFFFF',
    color: COLORS.text, fontSize: 13, fontFamily: FONTS,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text }}>Direct solliciteren bij {job.title}</p>
      <input style={fieldStyle} placeholder="Naam" value={name} onChange={e => setName(e.target.value)} />
      <input style={fieldStyle} type="email" placeholder="E-mailadres *" value={email} onChange={e => setEmail(e.target.value)} required />
      <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 72 }} placeholder="Korte motivatie (optioneel)" value={message} onChange={e => setMessage(e.target.value)} />
      {err && <p style={{ margin: 0, fontSize: 12, color: COLORS.accent }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={submit} disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: submitting ? COLORS.border : '#0D0D0D', color: submitting ? COLORS.textDim : '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: FONTS }}>
          {submitting ? 'Versturen…' : 'Solliciteer →'}
        </button>
        <button onClick={onCancel} style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, background: 'transparent', color: COLORS.textDim, fontSize: 13, cursor: 'pointer', fontFamily: FONTS }}>
          Annuleren
        </button>
      </div>
    </div>
  );
}

function JobsTab({ profile }: { profile: CandidateProfile }) {
  const t = useTranslations('app.results');
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

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
        const pastel = CARD_PASTELS[idx % CARD_PASTELS.length];
        const rank = idx + 1;
        const isExpanded = expandedId === job.id;
        return (
          <div key={job.id} style={{ borderRadius: 20, background: pastel.bg, overflow: "hidden", transition: "transform 0.15s" }}>
            {/* Clickable header row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : job.id)}
              style={{ width: "100%", padding: "18px 18px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: FONTS }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 3px", lineHeight: 1.25, color: "#0D0D0D" }}>{job.title}</h3>
                  <p style={{ color: "#0D0D0DAA", fontSize: 13, margin: 0 }}>{job.location}</p>
                </div>
                {pct !== null && (
                  <div style={{ background: pastel.accent + "22", color: pastel.accent, fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 99, flexShrink: 0 }}>
                    #{rank} · {pct}%
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                <span style={{ background: "#0D0D0D14", color: "#0D0D0D", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>⏰ {job.type}</span>
                {job.salary && <span style={{ background: "#0D0D0D14", color: "#0D0D0D", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>💶 {job.salary}</span>}
                <span style={{ marginLeft: "auto", color: "#0D0D0D66", fontSize: 13, transition: "transform 0.2s", display: "inline-block", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </div>
            </button>

            {/* Expanded description + apply button */}
            {isExpanded && (
              <div style={{ padding: "0 18px 18px", borderTop: `1px solid #0D0D0D14` }}>
                {job.description ? (() => {
                  const MAX = 480;
                  const trimmed = job.description.trim();
                  const isTruncated = trimmed.length > MAX;
                  const excerpt = isTruncated
                    ? trimmed.slice(0, trimmed.lastIndexOf(' ', MAX)) + '…'
                    : trimmed;
                  return (
                    <p style={{ color: COLORS.textDim, fontSize: 13, lineHeight: 1.7, margin: "14px 0 0" }}>
                      {excerpt}
                      {isTruncated && job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, color: pastel.accent, textDecoration: "none", fontWeight: 600 }}>
                          Lees meer →
                        </a>
                      )}
                    </p>
                  );
                })() : (
                  <p style={{ color: COLORS.textDim, fontSize: 13, margin: "14px 0 0", fontStyle: "italic" }}>
                    Geen beschrijving beschikbaar.
                  </p>
                )}
                {appliedIds.has(job.id) ? (
                  <p style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: '#1A7A4A', textAlign: 'center' }}>
                    ✓ Sollicitatie verstuurd!
                  </p>
                ) : applyJobId === job.id ? (
                  <ApplyForm
                    job={job}
                    profile={profile}
                    onSuccess={() => {
                      setAppliedIds(prev => new Set(prev).add(job.id));
                      setApplyJobId(null);
                    }}
                    onCancel={() => setApplyJobId(null)}
                  />
                ) : (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      onClick={() => setApplyJobId(job.id)}
                      style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#0D0D0D', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS }}
                    >
                      Direct solliciteren →
                    </button>
                    {job.contact_email ? (
                      <a
                        href={`mailto:${job.contact_email}?subject=${encodeURIComponent(`Sollicitatie: ${job.title}`)}&body=${encodeURIComponent(`Hallo,\n\nIk solliciteer graag naar de functie ${job.title}.\n\nMet vriendelijke groet,\n${profile.identity.displayName ?? ''}`)}`}
                        style={{ display: 'block', width: '100%', padding: '10px', borderRadius: 10, border: `1.5px solid ${pastel.accent}`, background: 'transparent', color: pastel.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
                      >
                        {t('applyEmail')}
                      </a>
                    ) : job.url ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: 10, border: `1.5px solid ${pastel.accent}`, background: 'transparent', color: pastel.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                        {t('apply')}
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CVStylePicker({ style, onChange }: { style: CVStyle; onChange: (s: CVStyle) => void }) {
  return (
    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        Stijl aanpassen
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 6 }}>Kleur</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {CV_COLORS.map(c => (
            <button key={c.id} title={c.label} onClick={() => onChange({ ...style, colorId: c.id })} style={{
              width: 28, height: 28, borderRadius: "50%", background: c.accent,
              border: style.colorId === c.id ? `3px solid #0D0D0D` : `3px solid transparent`,
              outline: style.colorId === c.id ? `2px solid ${c.accent}` : "none",
              outlineOffset: 2, cursor: "pointer", padding: 0,
            }} />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 6 }}>Lettertype</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CV_FONTS.map(f => (
            <button key={f.id} onClick={() => onChange({ ...style, fontId: f.id })} style={{
              padding: "4px 10px", borderRadius: 8,
              border: `1.5px solid ${style.fontId === f.id ? "#0D0D0D" : COLORS.border}`,
              background: style.fontId === f.id ? "#0D0D0D" : COLORS.bg,
              color: style.fontId === f.id ? "#FFFFFF" : COLORS.text,
              fontSize: 13, fontFamily: f.stack, cursor: "pointer",
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 6 }}>Kopteksten</div>
        <div style={{ display: "flex", gap: 6 }}>
          {CV_SECTION_STYLES.map(s => (
            <button key={s.id} onClick={() => onChange({ ...style, sectionStyleId: s.id })} style={{
              padding: "4px 12px", borderRadius: 8,
              border: `1.5px solid ${style.sectionStyleId === s.id ? "#0D0D0D" : COLORS.border}`,
              background: style.sectionStyleId === s.id ? "#0D0D0D" : COLORS.bg,
              color: style.sectionStyleId === s.id ? "#FFFFFF" : COLORS.text,
              fontSize: 13, cursor: "pointer", fontFamily: FONTS,
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CVTab({ data }: { data: AppData }) {
  const t = useTranslations('app.cv');
  const locale = useLocale();
  const [cvStyle, setCvStyle] = useState<CVStyle>(DEFAULT_CV_STYLE);
  const colorPreset = CV_COLORS.find(c => c.id === cvStyle.colorId) ?? CV_COLORS[0];
  const { accent, tagText, tagBorder, sidebarBg } = colorPreset;

  const interests = (data.interests || []).map(id => {
    const interest = INTERESTS.find(i => i.id === id);
    return locale === 'nl' ? interest?.label : interest?.labelEn;
  }).filter(Boolean);

  const handleDownload = () => {
    const html = generateCVHTML(data, cvStyle);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) { alert("Sta pop-ups toe om het CV te downloaden."); URL.revokeObjectURL(url); return; }
    setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
  };

  const tResults = useTranslations('app.results');

  const sidebarHeading: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em",
    color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 8,
  };
  const mainHeading: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em",
    color: "#111827", borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8,
  };
  const pill: React.CSSProperties = {
    display: "inline-block", background: "white", border: `1px solid ${tagBorder}`,
    color: tagText, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
    margin: "2px 3px 2px 0",
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Two-column CV preview */}
      <div style={{
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        marginBottom: 16,
        display: "flex",
        minHeight: 420,
      }}>
        {/* Sidebar */}
        <div style={{ width: "38%", background: sidebarBg, padding: "20px 16px", flexShrink: 0, borderRight: `1px solid ${tagBorder}` }}>
          <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.025em", color: "#0a0a0f", lineHeight: 1.05, marginBottom: 4 }}>
            {data.name || t('anonymousProfile')}
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.18em", color: accent, marginBottom: 18 }}>
            Bijbaan gezocht
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sidebarHeading}>{t('contact') || "Contact"}</div>
            {data.email && <div style={{ fontSize: 10, color: "#374151", marginBottom: 3, wordBreak: "break-all" as const }}>✉ {data.email}</div>}
            <div style={{ fontSize: 10, color: "#374151", marginBottom: 3 }}>📍 {data.location ? data.location.name : "Nederland"}</div>
            {data.age && <div style={{ fontSize: 10, color: "#374151" }}>🎂 {data.age} jaar</div>}
          </div>

          {(data.skills || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={sidebarHeading}>{t('skills')}</div>
              <div>{(data.skills || []).slice(0, 6).map(s => <span key={s} style={pill}>{s}</span>)}</div>
            </div>
          )}

          {(data.languages || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={sidebarHeading}>{t('languages')}</div>
              <div>{(data.languages || []).map(l => <span key={l} style={pill}>{l}</span>)}</div>
            </div>
          )}

          {interests.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={sidebarHeading}>{t('interests')}</div>
              <div>{interests.slice(0, 5).map(i => <span key={i} style={pill}>{i}</span>)}</div>
            </div>
          )}

          {(data.days || []).length > 0 && (
            <div>
              <div style={sidebarHeading}>{t('availability')}</div>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 3 }}>
                {DAYS_NL.map(d => (
                  <span key={d} style={{
                    display: "inline-block", fontSize: 9, fontWeight: 700,
                    padding: "2px 7px", borderRadius: 20,
                    background: (data.days || []).includes(d) ? "white" : "transparent",
                    border: `1px solid ${(data.days || []).includes(d) ? accent : tagBorder}`,
                    color: (data.days || []).includes(d) ? tagText : COLORS.textDim,
                  }}>{d}</span>
                ))}
              </div>
              {data.hours && <div style={{ fontSize: 10, color: "#6b7280", marginTop: 5 }}>{data.hours}/week</div>}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "20px 18px", background: "white" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={mainHeading}>{t('profile')}</div>
            <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.65, margin: 0 }}>
              {(locale === 'en' ? data.profileDescriptionEn : data.profileDescription) ?? (
                `Gemotiveerde jongere van ${data.age ?? "?"} jaar op zoek naar een bijbaan.${data.dream ? ` Droom: ${data.dream}.` : ""}`
              )}
            </p>
          </div>

          {(data.school || data.eduLevel) && (
            <div style={{ marginBottom: 16 }}>
              <div style={mainHeading}>{t('education')}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{data.school || t('school')}</div>
              {data.eduLevel && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{data.eduLevel}</div>}
              {data.eduYear && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{data.eduYear}</div>}
            </div>
          )}

          {(data.cvExperience || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={mainHeading}>{t('experience')}</div>
              {(data.cvExperience || []).slice(0, 4).map((item, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>
                    {locale === 'en' ? (item.titleEn ?? item.title) : item.title}
                  </div>
                  <div style={{ fontSize: 10, color: "#4b5563", lineHeight: 1.55, marginTop: 1 }}>
                    {locale === 'en' ? (item.descriptionEn ?? item.description) : item.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(data.escoMatches || []).filter(m => m.lookup?.matches?.[0]).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={mainHeading}>Internationale kwalificaties</div>
              {(data.escoMatches || []).filter(m => m.lookup?.matches?.[0]).map((m, i) => {
                const top = m.lookup!.matches[0];
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>
                      {top.preferred_labels?.nl ?? top.preferred_labels?.en ?? m.input}
                      {top.eqf ? ` · EQF ${top.eqf.level}` : ""}
                    </div>
                    <div style={{ fontSize: 10, color: "#4b5563", marginTop: 1 }}>
                      {m.input}{data.originCountry ? ` (${data.originCountry})` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CVStylePicker style={cvStyle} onChange={setCvStyle} />
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
      case "welcome": return <WelcomeScreen onStart={() => setScreen("refugee-check")} />;
      case "refugee-check": return <RefugeeCheckScreen
        onYes={() => { setData({ ...data, isRefugee: true }); setScreen("country"); }}
        onNo={() => { setData({ ...data, isRefugee: false }); setScreen("age"); }}
      />;
      case "country": return <CountryScreen data={data} setData={setData} onNext={() => setScreen("refugee-languages")} />;
      case "refugee-languages": return <LanguagesScreen data={data} setData={setData} onNext={() => setScreen("credential-input")} langs={LANGUAGES_EN} />;
      case "credential-input": return <CredentialInputScreen data={data} setData={setData} onNext={() => setScreen("credential-loading")} />;
      case "credential-loading": return <CredentialLoadingScreen data={data} setData={setData} onDone={() => setScreen("credential-match")} />;
      case "credential-match": return <CredentialMatchScreen data={data} onNext={() => setScreen("name")} />;
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
