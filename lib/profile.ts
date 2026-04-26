import type { AppData } from "./junta-data";
import { INTERESTS } from "./junta-data";

// ── Schema ──

export type EduLevelCode =
  | "primary" | "vmbo" | "havo" | "vwo"
  | "mbo_1_2" | "mbo_3_4" | "hbo" | "wo" | "foreign";

export type CandidateProfile = {
  profileId: string;
  schemaVersion: "1.0";
  createdAt: string; // ISO 8601

  identity: {
    displayName: string | null;
    contactEmail: string | null;
    isAnonymous: boolean;
  };

  demographics: {
    ageRange: string;       // raw: "16-17"
    ageMin: number | null;
    ageMax: number | null;
    city: string;
    neighborhood: string | null;
    lat: number | null;
    lng: number | null;
  };

  education: {
    institution: string | null;
    levelLabel: string | null; // raw Dutch label
    levelCode: EduLevelCode | null;
    graduationYear: number | null;
    inProgress: boolean;
  };

  languages: Array<{
    label: string;   // Dutch name: "Arabisch"
    isoCode: string; // ISO 639-1/3: "ar"
  }>;

  skills: string[];

  interests: Array<{
    id: string;    // "tech"
    label: string; // "Tech & Computers"
  }>;

  availability: {
    days: Array<{
      short: string;      // "Ma"
      full: string;       // "Maandag"
      isoWeekday: number; // 1 = Monday … 7 = Sunday
    }>;
    hoursPerWeekLabel: string | null; // "8-16 uur"
    hoursMin: number | null;
    hoursMax: number | null;          // null = open-ended ("24+")
  };

  aspiration: {
    dreamText: string | null;
  };

  refugee?: {
    originCountry: string | null;
    credentials: Array<{
      input: string;
      matchedOccupation: string | null;
      escoUri: string | null;
      eqfLevel: number | null;
      dutchEquivalent: string | null;
      iscoCode: string | null;
      confidence: number | null;
    }>;
  };

  // Pre-computed flags useful for matching queries
  derived: {
    isEligibleForMinimumWage: boolean; // age >= 18 (NL law)
    canWorkWeekends: boolean;
    languageCount: number;
    skillCount: number;
    interestIds: string[];             // copy of interests[].id for fast filtering
  };
};

// ── Lookup tables ──

const AGE_BOUNDS: Record<string, [number, number]> = {
  "14-15": [14, 15],
  "16-17": [16, 17],
  "18-20": [18, 20],
  "21-23": [21, 23],
};

const EDU_LEVEL_CODES: Record<string, EduLevelCode> = {
  "Basisschool":        "primary",
  "VMBO":               "vmbo",
  "HAVO":               "havo",
  "VWO":                "vwo",
  "MBO niveau 1–2":     "mbo_1_2",
  "MBO niveau 3–4":     "mbo_3_4",
  "HBO":                "hbo",
  "WO (Universiteit)":  "wo",
  "Buitenlands diploma":"foreign",
};

export const LANGUAGE_ISO: Record<string, string> = {
  // Dutch labels
  "Nederlands":  "nl",
  "Engels":      "en",
  "Arabisch":    "ar",
  "Turks":       "tr",
  "Frans":       "fr",
  "Spaans":      "es",
  "Dari/Farsi":  "fa",
  "Somalisch":   "so",
  "Tigrinya":    "ti",
  "Berbers":     "ber",
  "Russisch":    "ru",
  "Pools":       "pl",
  "Portugees":   "pt",
  "Chinees":     "zh",
  "Koerdisch":   "ku",
  // English labels (refugee flow)
  "Dutch":       "nl",
  "English":     "en",
  "Arabic":      "ar",
  "Turkish":     "tr",
  "French":      "fr",
  "Spanish":     "es",
  "Somali":      "so",
  "Berber":      "ber",
  "Russian":     "ru",
  "Polish":      "pl",
  "Portuguese":  "pt",
  "Chinese":     "zh",
  "Kurdish":     "ku",
};

const DAY_META: Record<string, { full: string; isoWeekday: number }> = {
  "Ma": { full: "Maandag",    isoWeekday: 1 },
  "Di": { full: "Dinsdag",    isoWeekday: 2 },
  "Wo": { full: "Woensdag",   isoWeekday: 3 },
  "Do": { full: "Donderdag",  isoWeekday: 4 },
  "Vr": { full: "Vrijdag",    isoWeekday: 5 },
  "Za": { full: "Zaterdag",   isoWeekday: 6 },
  "Zo": { full: "Zondag",     isoWeekday: 7 },
};

const HOURS_BOUNDS: Record<string, [number, number]> = {
  "4-8 uur":   [4,  8],
  "8-16 uur":  [8,  16],
  "16-24 uur": [16, 24],
  "24+ uur":   [24, 40], // treat as fulltime-eligible
};

// ── Converter ──

export function toProfile(data: AppData): CandidateProfile {
  const [ageMin = null, ageMax = null] = data.age ? (AGE_BOUNDS[data.age] ?? []) : [];
  const [hoursMin = null, hoursMax = null] = data.hours ? (HOURS_BOUNDS[data.hours] ?? []) : [];

  const graduationYear = (() => {
    if (!data.eduYear || data.eduYear === "Nog bezig") return null;
    if (data.eduYear === "2019 of eerder") return 2019;
    const n = parseInt(data.eduYear, 10);
    return isNaN(n) ? null : n;
  })();

  const days = (data.days ?? []).map(d => ({
    short: d,
    full: DAY_META[d]?.full ?? d,
    isoWeekday: DAY_META[d]?.isoWeekday ?? 0,
  }));

  const interests = (data.interests ?? [])
    .map(id => INTERESTS.find(i => i.id === id))
    .filter((x): x is (typeof INTERESTS)[number] => x != null)
    .map(({ id, label }) => ({ id, label }));

  const languages = (data.languages ?? []).map(label => ({
    label,
    isoCode: LANGUAGE_ISO[label] ?? "und",
  }));

  return {
    profileId: crypto.randomUUID(),
    schemaVersion: "1.0",
    createdAt: new Date().toISOString(),

    identity: {
      displayName:  data.name?.trim()  || null,
      contactEmail: data.email?.trim() || null,
      isAnonymous:  !data.name?.trim(),
    },

    demographics: {
      ageRange: data.age ?? "",
      ageMin,
      ageMax,
      city: data.location?.name ?? "Amsterdam",
      neighborhood: data.location?.name ?? null,
      lat: data.location?.lat ?? null,
      lng: data.location?.lng ?? null,
    },

    education: {
      institution:     data.school?.trim()  || null,
      levelLabel:      data.eduLevel         || null,
      levelCode:       data.eduLevel ? (EDU_LEVEL_CODES[data.eduLevel] ?? null) : null,
      graduationYear,
      inProgress:      data.eduYear === "Nog bezig",
    },

    languages,
    skills: data.skills ?? [],
    interests,

    availability: {
      days,
      hoursPerWeekLabel: data.hours ?? null,
      hoursMin,
      hoursMax,
    },

    aspiration: {
      dreamText: data.dream?.trim() || null,
    },

    refugee: data.isRefugee ? {
      originCountry: data.originCountry?.trim() || null,
      credentials: (data.escoMatches ?? []).map(m => {
        const top = m.lookup?.matches?.[0] ?? null;
        return {
          input: m.input,
          matchedOccupation: top?.preferred_labels?.nl ?? top?.preferred_labels?.en ?? null,
          escoUri: top?.esco_uri ?? null,
          eqfLevel: top?.eqf?.level ?? null,
          dutchEquivalent: top?.eqf?.dutch_equivalent ?? null,
          iscoCode: top?.isco_code ?? null,
          confidence: top?.confidence ?? null,
        };
      }),
    } : undefined,

    derived: {
      isEligibleForMinimumWage: ageMin != null && ageMin >= 18,
      canWorkWeekends: (data.days ?? []).some(d => d === "Za" || d === "Zo"),
      languageCount: languages.length,
      skillCount: (data.skills ?? []).length,
      interestIds: data.interests ?? [],
    },
  };
}
