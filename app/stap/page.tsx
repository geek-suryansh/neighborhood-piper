'use client';

import { useState, useEffect, useRef } from "react";
import {
  INTERESTS, SKILLS_OPTIONS, LANGUAGES, EDU_LEVELS, EDU_YEARS,
  type AppData, type EscoMatch,
} from "@/lib/stap-data";
import { toProfile, LANGUAGE_ISO } from "@/lib/profile";
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
const TOTAL_STEPS = 8;
const TOTAL_STEPS_REFUGEE = 9;

const MOCK_JOBS = [
  { title: "Vakkenvuller", company: "Albert Heijn Bijlmer", distance: "1.2 km", hours: "8-12 uur/week", wage: "€6,73/uur", match: 94, tags: ["Flexibel", "Geen ervaring nodig"] },
  { title: "Junior Barista", company: "Coffee Company Oost", distance: "3.1 km", hours: "10-16 uur/week", wage: "€7,82/uur", match: 87, tags: ["Gezellig", "Koffie korting"] },
  { title: "Fiets Bezorger", company: "Thuisbezorgd", distance: "0 km (thuis starten)", hours: "Flexibel", wage: "€8,50/uur + fooien", match: 82, tags: ["Buiten", "Eigen tempo"] },
  { title: "Hulp bij Huiswerk", company: "Stichting Leren & Groeien", distance: "2.0 km", hours: "4-6 uur/week", wage: "€9,00/uur", match: 79, tags: ["Ervaring opdoen", "Impact maken"] },
  { title: "Magazijnmedewerker", company: "Bol.com Fulfillment", distance: "5.8 km", hours: "12-20 uur/week", wage: "€7,82/uur", match: 75, tags: ["Avondwerk", "Bonus mogelijk"] },
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

  const escoCredentials = (data.escoMatches ?? []).filter(m => m.lookup?.matches?.[0]);

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
  .edu { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .edu strong { font-size: 11pt; }
  .edu span { display: block; color: #666; font-size: 10pt; }
  .edu .year { color: #888; font-size: 10pt; white-space: nowrap; }
  .esco-item { padding: 10px 14px; border-left: 3px solid #00c087; margin-bottom: 10px; background: #f8fffe; }
  .esco-item .occ { font-size: 11pt; font-weight: 700; color: #0a0a0f; }
  .esco-item .meta { font-size: 9.5pt; color: #555; margin-top: 3px; }
  .esco-item .original { font-size: 9pt; color: #999; font-style: italic; margin-top: 2px; }
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
      <div class="sub">${data.age ? `${data.age} jaar &nbsp;·&nbsp; ` : ""}Amsterdam${data.originCountry ? ` &nbsp;·&nbsp; Afkomstig uit ${data.originCountry}` : ""}</div>
      <span class="badge">⚡ ${data.isRefugee ? "Nieuwkomer" : "Op zoek naar bijbaan"}</span>
    </div>
    <div class="contact">
      ${data.email ? `<div>${data.email}</div>` : ""}
      <div>Amsterdam, Nederland</div>
    </div>
  </div>

  <div class="section">
    <h2>Profiel</h2>
    <p>${data.isRefugee
      ? `Nieuwkomer afkomstig uit ${data.originCountry || "het buitenland"}, woonachtig in Amsterdam.${data.dream ? ` Toekomstdroom: <em>${data.dream}</em>.` : ""} Beschikbaar op ${fullDays.join(", ")}${data.hours ? ` voor ${data.hours} per week` : ""}.`
      : `Gemotiveerde jongere van ${data.age} jaar, woonachtig in Amsterdam, op zoek naar een bijbaan.${data.dream ? ` Toekomstdroom: <em>${data.dream}</em>.` : ""} Beschikbaar op ${fullDays.join(", ")}${data.hours ? ` voor ${data.hours} per week` : ""}.`
    }</p>
  </div>

  ${escoCredentials.length > 0 ? `
  <div class="section">
    <h2>Internationale kwalificaties (EU-equivalent via ESCO)</h2>
    ${escoCredentials.map(m => {
      const top = m.lookup!.matches[0];
      const nlLabel = top.preferred_labels?.nl || top.preferred_labels?.en || "—";
      const enLabel = top.preferred_labels?.en;
      return `
      <div class="esco-item">
        <div class="occ">${nlLabel}${enLabel && enLabel !== nlLabel ? ` <span style="font-weight:400;color:#555">(${enLabel})</span>` : ""}</div>
        <div class="meta">${top.isco_label_en || ""}${top.eqf ? ` &nbsp;·&nbsp; EQF ${top.eqf.level} ≈ ${top.eqf.dutch_equivalent}` : ""}</div>
        <div class="original">Opgegeven als: "${m.input}"</div>
        ${top.regulated_warning ? `<div style="color:#cc4a10;font-size:9pt;margin-top:4px">⚠ Gereglementeerd beroep — ${top.regulated_warning.recognition_body}</div>` : ""}
      </div>`;
    }).join("")}
    <p style="font-size:8pt;color:#bbb;margin-top:6px">* Indicatieve EU-equivalentie via ESCO v1.2.1. Geen officiële erkenning.</p>
  </div>` : ""}

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

// ── Refugee path screens ──

function RefugeeCheckScreen({ onRefugee, onNormal }: { onRefugee: () => void; onNormal: () => void }) {
  return (
    <div style={styles.container}>
      <div style={{ paddingTop: 60, textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em" }}>
          Welkom!
        </h2>
        <p style={{ color: COLORS.textDim, fontSize: 16, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
          Ben je een nieuwkomer of vluchteling met buitenlandse diploma&apos;s of werkervaring?
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={onRefugee} style={{
          padding: "20px", borderRadius: 16,
          border: `1.5px solid ${COLORS.accent}`,
          background: COLORS.accentDim,
          color: COLORS.text, cursor: "pointer", textAlign: "left",
          fontFamily: FONTS, display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 32 }}>✈️</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.accent }}>Ja, ik ben nieuwkomer</div>
            <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 3 }}>
              Ik heb buitenlandse diploma&apos;s of werkervaring
            </div>
          </div>
        </button>

        <button onClick={onNormal} style={{
          padding: "20px", borderRadius: 16,
          border: `1.5px solid ${COLORS.border}`,
          background: COLORS.card,
          color: COLORS.text, cursor: "pointer", textAlign: "left",
          fontFamily: FONTS, display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 32 }}>🏠</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Nee, ik woon al in Nederland</div>
            <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 3 }}>
              Ik zoek een bijbaan of mijn eerste baan
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function CountryScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={0} total={TOTAL_STEPS_REFUGEE} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Waar kom je vandaan?</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        Dit helpt ons jouw kwalificaties beter te begrijpen.
      </p>
      <input
        autoFocus
        value={data.originCountry ?? ""}
        onChange={e => setData({ ...data, originCountry: e.target.value })}
        onKeyDown={e => { if (e.key === "Enter" && data.originCountry?.trim()) onNext(); }}
        placeholder="Bijv. Syrië, Oekraïne, Afghanistan..."
        style={inputStyle}
      />
      <BigButton onClick={onNext} disabled={!data.originCountry?.trim()}>Volgende →</BigButton>
    </div>
  );
}

function CredentialInputScreen({ data, setData, onNext }: { data: AppData; setData: (d: AppData) => void; onNext: () => void }) {
  const [current, setCurrent] = useState("");
  const creds = data.rawCredentials ?? [];

  const add = () => {
    const t = current.trim();
    if (!t) return;
    setData({ ...data, rawCredentials: [...creds, t] });
    setCurrent("");
  };

  const remove = (i: number) => {
    setData({ ...data, rawCredentials: creds.filter((_, idx) => idx !== i) });
  };

  return (
    <div style={styles.container}>
      <ProgressBar step={2} total={TOTAL_STEPS_REFUGEE} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
        Jouw diploma&apos;s en werkervaring
      </h2>
      <p style={{ color: COLORS.textDim, marginBottom: 6, fontSize: 15 }}>
        Beschrijf elk diploma of beroep zo concreet mogelijk. Voeg er meerdere toe.
      </p>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 13, fontStyle: "italic" }}>
        Bijv: &quot;verpleegkundige, Damascus, 8 jaar&quot; of &quot;BSc Informatica, Universiteit Kiev&quot;
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={current}
          onChange={e => setCurrent(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Typ een diploma of beroep..."
          style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
        />
        <button onClick={add} disabled={!current.trim()} style={{
          padding: "0 20px", borderRadius: 12,
          border: "none",
          background: current.trim() ? COLORS.accent : COLORS.border,
          color: current.trim() ? COLORS.bg : COLORS.textDim,
          fontSize: 24, fontWeight: 700,
          cursor: current.trim() ? "pointer" : "not-allowed",
          flexShrink: 0,
        }}>+</button>
      </div>

      {creds.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {creds.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 12,
              border: `1.5px solid ${COLORS.accent}`,
              background: COLORS.accentDim,
            }}>
              <span style={{ color: COLORS.text, fontSize: 14, flex: 1, marginRight: 8 }}>{c}</span>
              <button onClick={() => remove(i)} style={{
                background: "none", border: "none", color: COLORS.textDim,
                fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0,
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      <BigButton onClick={onNext} disabled={creds.length === 0}>
        Zoek EU-equivalent →
      </BigButton>
    </div>
  );
}

function CredentialLoadingScreen({
  data, setData, onDone,
}: { data: AppData; setData: (d: AppData) => void; onDone: () => void }) {
  const [msg, setMsg] = useState("Kwalificaties analyseren...");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const credentials = data.rawCredentials ?? [];
      const nonNl = (data.languages ?? []).filter(l => l !== "Nederlands");
      const langHint = nonNl.length === 1 ? (LANGUAGE_ISO[nonNl[0]] ?? null) : null;

      const results: EscoMatch[] = [];
      for (const cred of credentials) {
        const preview = cred.length > 35 ? cred.slice(0, 35) + "…" : cred;
        setMsg(`Zoeken: "${preview}"`);
        try {
          const res = await fetch("/api/credential", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cred, input_lang: langHint }),
          });
          const json = await res.json();
          if (res.ok) {
            results.push({ input: cred, lookup: json.lookup ?? null });
          } else {
            results.push({ input: cred, lookup: null, error: json.error ?? "Fout bij ophalen" });
          }
        } catch {
          results.push({ input: cred, lookup: null, error: "Service niet bereikbaar" });
        }
      }

      setData({ ...data, escoMatches: results });
      setMsg("Klaar!");
      setTimeout(onDone, 600);
    };

    run(); // eslint-disable-line @typescript-eslint/no-floating-promises
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ ...styles.container, paddingTop: 120, textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 24 }}>🔍</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>{msg}</h2>
      <p style={{ color: COLORS.textDim, fontSize: 15 }}>We zoeken het dichtstbijzijnde EU-equivalent...</p>
    </div>
  );
}

function CredentialMatchScreen({ data, onNext }: { data: AppData; onNext: () => void }) {
  const matches = data.escoMatches ?? [];

  return (
    <div style={{ ...styles.container, paddingTop: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Dit vonden we ✓</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>
        Dit zijn de dichtstbijzijnde EU-beroepen. Ze worden op je CV gezet.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        {matches.map((m, i) => {
          const top = m.lookup?.matches?.[0] ?? null;
          const conf = top?.confidence ?? 0;
          const confColor = conf >= 0.75 ? COLORS.accent : conf >= 0.45 ? COLORS.orange : COLORS.textDim;
          const confLabel = conf >= 0.75 ? "Goede match" : conf >= 0.45 ? "Redelijke match" : "Onzekere match";

          return (
            <div key={i} style={{ padding: 18, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card }}>
              <p style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 10, fontStyle: "italic" }}>
                Jouw input: &ldquo;{m.input}&rdquo;
              </p>

              {top ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, flex: 1 }}>
                      {top.preferred_labels?.nl || top.preferred_labels?.en || "—"}
                    </h3>
                    <span style={{ color: confColor, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {confLabel}
                    </span>
                  </div>

                  {top.isco_label_en && (
                    <p style={{ color: COLORS.textDim, fontSize: 13, margin: "0 0 10px" }}>{top.isco_label_en}</p>
                  )}

                  {top.eqf && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: COLORS.accentDim, marginBottom: top.regulated_warning ? 10 : 0 }}>
                      <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 700 }}>EQF {top.eqf.level}</span>
                      <span style={{ color: COLORS.textDim, fontSize: 12 }}>≈ {top.eqf.dutch_equivalent}</span>
                    </div>
                  )}

                  {top.regulated_warning && (
                    <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: `${COLORS.orange}15`, border: `1px solid ${COLORS.orange}33`, color: COLORS.orange, fontSize: 12, lineHeight: 1.5 }}>
                      ⚠ {top.regulated_warning.warning}
                      {top.regulated_warning.recognition_body && (
                        <div style={{ marginTop: 4, color: COLORS.textDim }}>Erkenning via: {top.regulated_warning.recognition_body}</div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: COLORS.textDim, fontSize: 15 }}>
                  {m.error ?? "Geen match gevonden. Je kunt dit handmatig invullen op de volgende stap."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <BigButton onClick={onNext}>Doorgaan → Maak je profiel af</BigButton>
    </div>
  );
}

// ── Normal path screens ──

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

function NameScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
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

function EducationScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Jouw opleiding</h2>
      <p style={{ color: COLORS.textDim, marginBottom: 24, fontSize: 15 }}>Helpt werkgevers jouw achtergrond begrijpen.</p>
      {data.isRefugee && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, fontSize: 12, marginBottom: 20 }}>
          💡 Je kwalificaties zijn al opgeslagen. Vul hier eventuele aanvullende opleidingen in.
        </div>
      )}
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

function LanguagesScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  const toggle = (lang: string) => {
    const cur = data.languages || [];
    setData({ ...data, languages: cur.includes(lang) ? cur.filter(l => l !== lang) : [...cur, lang] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
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

function InterestsScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  const toggle = (id: string) => {
    const cur = data.interests || [];
    setData({ ...data, interests: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
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

function SkillsScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  const toggle = (s: string) => {
    const cur = data.skills || [];
    setData({ ...data, skills: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
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

function AvailabilityScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  const days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const toggle = (d: string) => {
    const cur = data.days || [];
    setData({ ...data, days: cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d] });
  };
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
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

function DreamScreen({ data, setData, onNext, step, total }: { data: AppData; setData: (d: AppData) => void; onNext: () => void; step: number; total: number }) {
  return (
    <div style={styles.container}>
      <ProgressBar step={step} total={total} />
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

function JobsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 32 }}>
      <p style={{ color: COLORS.textDim, fontSize: 14, margin: "0 0 8px" }}>{MOCK_JOBS.length} banen gevonden bij jou in de buurt</p>
      {MOCK_JOBS.map((job, i) => (
        <div key={i} style={{ padding: 18, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{job.title}</h3>
              <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0 }}>{job.company}</p>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #00c087)`, color: COLORS.bg, fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>
              {job.match}%
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: COLORS.textDim, marginBottom: 10 }}>
            <span>📍 {job.distance}</span><span>⏰ {job.hours}</span><span>💶 {job.wage}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {job.tags.map((tag) => (
              <span key={tag} style={{ padding: "4px 10px", borderRadius: 6, background: COLORS.purpleDim, color: COLORS.purple, fontSize: 11, fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
          <button style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${COLORS.accent}`, background: "transparent", color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONTS }}>
            Anoniem solliciteren →
          </button>
        </div>
      ))}
    </div>
  );
}

function CVTab({ data }: { data: AppData }) {
  const interests = (data.interests || []).map(id => INTERESTS.find(i => i.id === id)?.label).filter(Boolean);
  const [copied, setCopied] = useState(false);
  const escoCredentials = (data.escoMatches ?? []).filter(m => m.lookup?.matches?.[0]);

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
              {data.age ? `${data.age} jaar • ` : ""}Amsterdam{data.email && ` • ${data.email}`}
              {data.originCountry && ` • ${data.originCountry}`}
            </p>
          </div>
        </div>

        <div style={{ padding: "8px 12px", borderRadius: 8, background: `${COLORS.orange}22`, border: `1px solid ${COLORS.orange}44`, color: COLORS.orange, fontSize: 12, marginBottom: 16 }}>
          🔒 Naam en contactinfo worden alleen op jouw CV gezet
        </div>

        {escoCredentials.length > 0 && (
          <Section title="Internationale kwalificaties (EU-equivalent)">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {escoCredentials.map((m, i) => {
                const top = m.lookup!.matches[0];
                const nlLabel = top.preferred_labels?.nl || top.preferred_labels?.en || "—";
                const conf = top.confidence ?? 0;
                const confColor = conf >= 0.75 ? COLORS.accent : conf >= 0.45 ? COLORS.orange : COLORS.textDim;
                return (
                  <div key={i} style={{ padding: "10px 14px", borderRadius: 10, borderLeft: `3px solid ${COLORS.accent}`, background: `${COLORS.accentDim}88` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{nlLabel}</div>
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>{m.input}</div>
                    {top.eqf && (
                      <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 4 }}>
                        EQF {top.eqf.level} · {top.eqf.dutch_equivalent}
                        <span style={{ color: confColor, marginLeft: 8 }}>
                          {conf >= 0.75 ? "●" : conf >= 0.45 ? "◑" : "○"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="Profiel">
          <p style={{ color: COLORS.textDim, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {data.isRefugee
              ? `Nieuwkomer uit ${data.originCountry || "het buitenland"}, op zoek naar werk in Amsterdam.`
              : `Gemotiveerde jongere (${data.age} jaar) op zoek naar een bijbaan.`}
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
        <BigButton onClick={async () => {
          await navigator.clipboard.writeText(JSON.stringify(toProfile(data), null, 2));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }} secondary>
          {copied ? "✓ Gekopieerd!" : "{ } Export JSON"}
        </BigButton>
      </div>
    </div>
  );
}


function ResultsScreen({ data, onTab, activeTab }: { data: AppData; onTab: (tab: string) => void; activeTab: string }) {
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
      {activeTab === "jobs" && <JobsTab />}
      {activeTab === "cv" && <CVTab data={data} />}
    </div>
  );
}

function EmployerDashboard({ onBack }: { onBack: () => void }) {
  const candidates = [
    { id: "A7x2", age: "16-17", match: 94, skills: ["Goed met mensen praten", "Snel leren"], interests: ["Sport & Bewegen", "Eten & Horeca"], available: "Ma Di Za Zo", hours: "8-16 uur" },
    { id: "K3m9", age: "18-20", match: 87, skills: ["Creatief denken", "Handig met social media"], interests: ["Muziek", "Mode & Style"], available: "Wo Do Vr Za", hours: "12-20 uur" },
    { id: "R5p1", age: "16-17", match: 82, skills: ["Teamwork", "Fysiek sterk"], interests: ["Sport & Bewegen", "Bouwen & Maken"], available: "Ma Wo Vr Za Zo", hours: "8-16 uur" },
    { id: "T8j4", age: "18-20", match: 78, skills: ["Zelfstandig werken", "Goed organiseren"], interests: ["Tech & Computers", "Gaming"], available: "Di Do Za", hours: "16-24 uur" },
  ];
  return (
    <div style={styles.wide}>
      <div style={{ paddingTop: 24, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent, margin: 0 }}>STAP</h1>
          <span style={{ color: COLORS.textDim, fontSize: 13, fontWeight: 600, padding: "2px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 6 }}>Werkgever</span>
        </div>
        <button onClick={onBack} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 13, cursor: "pointer", fontFamily: FONTS }}>
          ← Terug naar app
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ label: "Actieve jongeren", value: "1.247", color: COLORS.accent }, { label: "Gemiddelde match", value: "86%", color: COLORS.purple }, { label: "Ingehuurd deze maand", value: "43", color: COLORS.orange }].map((s, i) => (
          <div key={i} style={{ flex: "1 1 140px", padding: 18, borderRadius: 14, background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.textDim, fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 32 }}>
        {candidates.map((c) => (
          <div key={c.id} style={{ padding: 20, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.card, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.accent}44, ${COLORS.purple}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: COLORS.accent, border: `1.5px solid ${COLORS.accent}44`, flexShrink: 0 }}>
              #{c.id}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Kandidaat #{c.id}</h3>
                  <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0 }}>{c.age} jaar • {c.available} • {c.hours}</p>
                </div>
                <div style={{ background: c.match >= 90 ? `linear-gradient(135deg, ${COLORS.accent}, #00c087)` : c.match >= 80 ? COLORS.purpleDim : `${COLORS.orange}33`, color: c.match >= 90 ? COLORS.bg : c.match >= 80 ? COLORS.purple : COLORS.orange, fontSize: 14, fontWeight: 800, padding: "4px 12px", borderRadius: 8 }}>
                  {c.match}% match
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {c.skills.map(s => <span key={s} style={{ padding: "3px 8px", borderRadius: 6, background: COLORS.purpleDim, color: COLORS.purple, fontSize: 11, fontWeight: 600 }}>{s}</span>)}
                {c.interests.map(i => <span key={i} style={{ padding: "3px 8px", borderRadius: 6, background: COLORS.accentDim, color: COLORS.accent, fontSize: 11, fontWeight: 600 }}>{i}</span>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONTS }}>Uitnodigen</button>
                <button style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONTS }}>Bewaren</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main app ──

export default function StapPage() {
  const [screen, setScreen] = useState("welcome");
  const [data, setData] = useState<AppData>({ interests: [], skills: [], days: [], languages: [] });
  const [resultTab, setResultTab] = useState("jobs");
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return (
      <div style={styles.app}>
        <div style={styles.glow} /><div style={styles.glowPurple} />
        <EmployerDashboard onBack={() => setShowDashboard(false)} />
      </div>
    );
  }

  const isRef = !!data.isRefugee;

  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return <WelcomeScreen onStart={() => setScreen("refugee-check")} />;

      case "refugee-check":
        return <RefugeeCheckScreen
          onRefugee={() => { setData({ ...data, isRefugee: true }); setScreen("country"); }}
          onNormal={() => { setData({ ...data, isRefugee: false }); setScreen("age"); }}
        />;

      // ── Refugee path ──
      case "country":
        return <CountryScreen data={data} setData={setData} onNext={() => setScreen("refugee-languages")} />;

      case "refugee-languages":
        return <LanguagesScreen data={data} setData={setData} onNext={() => setScreen("credential-input")} step={1} total={TOTAL_STEPS_REFUGEE} />;

      case "credential-input":
        return <CredentialInputScreen data={data} setData={setData} onNext={() => setScreen("credential-loading")} />;

      case "credential-loading":
        return <CredentialLoadingScreen data={data} setData={setData} onDone={() => setScreen("credential-match")} />;

      case "credential-match":
        return <CredentialMatchScreen data={data} onNext={() => setScreen("name")} />;

      // ── Normal path ──
      case "age":
        return <AgeScreen data={data} setData={setData} onNext={() => setScreen("name")} />;

      // ── Shared path ──
      case "name":
        return <NameScreen data={data} setData={setData} onNext={() => setScreen("education")} step={isRef ? 3 : 1} total={isRef ? TOTAL_STEPS_REFUGEE : TOTAL_STEPS} />;

      case "education":
        return <EducationScreen data={data} setData={setData} onNext={() => setScreen(isRef ? "interests" : "languages")} step={isRef ? 4 : 2} total={isRef ? TOTAL_STEPS_REFUGEE : TOTAL_STEPS} />;

      case "languages":
        return <LanguagesScreen data={data} setData={setData} onNext={() => setScreen("interests")} step={3} total={TOTAL_STEPS} />;

      case "interests":
        return <InterestsScreen data={data} setData={setData} onNext={() => setScreen("skills")} step={isRef ? 5 : 4} total={isRef ? TOTAL_STEPS_REFUGEE : TOTAL_STEPS} />;

      case "skills":
        return <SkillsScreen data={data} setData={setData} onNext={() => setScreen("availability")} step={isRef ? 6 : 5} total={isRef ? TOTAL_STEPS_REFUGEE : TOTAL_STEPS} />;

      case "availability":
        return <AvailabilityScreen data={data} setData={setData} onNext={() => setScreen("dream")} step={isRef ? 7 : 6} total={isRef ? TOTAL_STEPS_REFUGEE : TOTAL_STEPS} />;

      case "dream":
        return <DreamScreen data={data} setData={setData} onNext={() => setScreen("loading")} step={isRef ? 8 : 7} total={isRef ? TOTAL_STEPS_REFUGEE : TOTAL_STEPS} />;

      case "loading":
        return <LoadingScreen onDone={() => {
          setScreen("results");
          const profile = toProfile(data);
          void (async () => {
            try {
              await getSupabase().from("profiles").insert({
                id: profile.profileId,
                email: profile.identity.contactEmail,
                display_name: profile.identity.displayName,
                age_range: profile.demographics.ageRange,
                profile,
              });
            } catch { /* silent fail */ }
          })();
        }} />;

      case "results":
        return <ResultsScreen data={data} onTab={setResultTab} activeTab={resultTab} />;

      default:
        return null;
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.glow} /><div style={styles.glowPurple} />
      {renderScreen()}
      {screen === "results" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px", background: `${COLORS.bg}ee`, borderTop: `1px solid ${COLORS.border}`, backdropFilter: "blur(12px)", zIndex: 10, textAlign: "center" }}>
          <button onClick={() => setShowDashboard(true)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 12, cursor: "pointer", fontFamily: FONTS }}>
            🏢 Bekijk werkgever dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
