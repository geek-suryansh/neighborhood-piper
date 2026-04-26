export type Location = {
  name: string;  // weergavenaam from PDOK
  lat: number;
  lng: number;
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
  cvExperience?: Array<{ title: string; description: string }>;
  profileDescription?: string;
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

export const INTERESTS = [
  { id: "tech",     emoji: "💻", label: "Tech & Computers" },
  { id: "people",   emoji: "🤝", label: "Mensen helpen" },
  { id: "creative", emoji: "🎨", label: "Creatief werk" },
  { id: "sport",    emoji: "⚽", label: "Sport & Bewegen" },
  { id: "food",     emoji: "🍕", label: "Eten & Horeca" },
  { id: "animals",  emoji: "🐕", label: "Dieren" },
  { id: "music",    emoji: "🎵", label: "Muziek" },
  { id: "building", emoji: "🔧", label: "Bouwen & Maken" },
  { id: "nature",   emoji: "🌿", label: "Natuur & Buiten" },
  { id: "fashion",  emoji: "👟", label: "Mode & Style" },
  { id: "gaming",   emoji: "🎮", label: "Gaming" },
  { id: "science",  emoji: "🔬", label: "Wetenschap" },
];

export const SKILLS_OPTIONS = [
  "Goed met mensen praten", "Snel leren", "Goed in teamwork",
  "Zelfstandig werken", "Creatief denken", "Handig met social media",
  "Goed organiseren", "Fysiek sterk", "Talen spreken", "Geduldig",
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

export const EDU_YEARS = [
  "2019 of eerder", "2020", "2021", "2022", "2023",
  "2024", "2025", "2026", "2027", "Nog bezig",
];
