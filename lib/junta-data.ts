export type Location = {
  name: string;  // weergavenaam from PDOK
  lat: number;
  lng: number;
};

export type EscoMatch = {
  input: string;
  lookup: {
    matches: Array<{
      rank: number;
      esco_uri: string;
      confidence: number;
      isco_code: string;
      isco_label_en: string;
      preferred_labels: Record<string, string>;
      eqf: { level: number; range: [number, number]; dutch_equivalent: string } | null;
      regulated_warning: { warning: string; recognition_body: string } | null;
    }>;
  } | null;
  error?: string;
};

export type AppData = {
  age?: string;
  name?: string;
  email?: string;
  location?: Location;
  neighborhood?: string | null;
  school?: string;
  eduLevel?: string;
  eduYear?: string;
  languages: string[];
  interests: string[];
  skills: string[];
  days: string[];
  hours?: string;
  dream?: string;
  experienceTypes?: string[];
  experienceNote?: string;
  cvExperience?: Array<{ title: string; description: string; titleEn?: string; descriptionEn?: string }>;
  profileDescription?: string;
  profileDescriptionEn?: string;
  // refugee path
  isRefugee?: boolean;
  originCountry?: string;
  rawCredentials?: string[];
  escoMatches?: EscoMatch[];
};

export const EXPERIENCE_OPTIONS = [
  "Bijbaantje gehad",
  "Stage gelopen",
  "Vrijwilligerswerk gedaan",
  "Thuis geholpen (koken, schoonmaken, boodschappen)",
  "Klussen voor buren of familie",
  "In een team gesport of getraind",
  "Eigen project of website gemaakt",
  "Cursus of training gevolgd",
];

export const EXPERIENCE_OPTIONS_EN = [
  "Had a part-time job",
  "Did an internship",
  "Did volunteer work",
  "Helped at home (cooking, cleaning, shopping)",
  "Did odd jobs for neighbours or family",
  "Played or trained in a team",
  "Created my own project or website",
  "Followed a course or training",
];

export const INTERESTS = [
  { id: "tech",     emoji: "💻", label: "Tech & Computers",    labelEn: "Tech & Computers" },
  { id: "people",   emoji: "🤝", label: "Mensen helpen",       labelEn: "Helping people" },
  { id: "creative", emoji: "🎨", label: "Creatief werk",       labelEn: "Creative work" },
  { id: "sport",    emoji: "⚽", label: "Sport & Bewegen",     labelEn: "Sport & Exercise" },
  { id: "food",     emoji: "🍕", label: "Eten & Horeca",       labelEn: "Food & Hospitality" },
  { id: "animals",  emoji: "🐕", label: "Dieren",              labelEn: "Animals" },
  { id: "music",    emoji: "🎵", label: "Muziek",              labelEn: "Music" },
  { id: "building", emoji: "🔧", label: "Bouwen & Maken",      labelEn: "Building & Making" },
  { id: "nature",   emoji: "🌿", label: "Natuur & Buiten",     labelEn: "Nature & Outdoors" },
  { id: "fashion",  emoji: "👟", label: "Mode & Style",        labelEn: "Fashion & Style" },
  { id: "gaming",   emoji: "🎮", label: "Gaming",              labelEn: "Gaming" },
  { id: "science",  emoji: "🔬", label: "Wetenschap",          labelEn: "Science" },
];

export const SKILLS_OPTIONS = [
  "Goed met mensen praten", "Snel leren", "Goed in teamwork",
  "Zelfstandig werken", "Creatief denken", "Handig met social media",
  "Goed organiseren", "Fysiek sterk", "Talen spreken", "Geduldig",
];

export const SKILLS_OPTIONS_EN = [
  "Good at talking to people", "Fast learner", "Good at teamwork",
  "Can work independently", "Creative thinking", "Good with social media",
  "Good at organising", "Physically strong", "Speaking languages", "Patient",
];

export const LANGUAGES = [
  "Nederlands", "Engels", "Arabisch", "Turks", "Frans",
  "Spaans", "Dari/Farsi", "Somalisch", "Tigrinya", "Berbers",
  "Russisch", "Pools", "Portugees", "Chinees", "Koerdisch",
];

export const EDU_LEVELS = [
  "Basisschool", "VMBO", "HAVO", "VWO",
  "MBO niveau 1–2", "MBO niveau 3–4", "HBO", "WO (Universiteit)",
  "Buitenlands diploma",
];

export const EDU_LEVELS_EN = [
  "Primary school", "VMBO (pre-vocational)", "HAVO (general secondary)", "VWO (pre-university)",
  "MBO level 1–2 (vocational)", "MBO level 3–4 (vocational)", "HBO (applied sciences)", "University",
  "Foreign diploma",
];

export const EDU_YEARS = [
  "2019 of eerder", "2020", "2021", "2022", "2023",
  "2024", "2025", "2026", "2027", "Nog bezig",
];

export const EDU_YEARS_EN = [
  "2019 or earlier", "2020", "2021", "2022", "2023",
  "2024", "2025", "2026", "2027", "Still in progress",
];

export const HOURS_OPTIONS = ["4-8 uur", "8-16 uur", "16-24 uur", "24+ uur"];
export const HOURS_OPTIONS_EN = ["4-8 hrs", "8-16 hrs", "16-24 hrs", "24+ hrs"];

export const DAYS_NL = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
export const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
