# Junta — Technical Documentation

> Anonymous job-matching for underrepresented youth in Netherlands.  
> Hackathon 2026 · Erwin, Jeroen, Suryansh
>
> Product Url - https://gojunta.vercel.app/
> Deck Url - https://gojunta.framer.website/ (Built with Framer fully using Claude)

---

## Table of Contents

1. [Problem & Mission](#1-problem--mission)
2. [System Overview](#2-system-overview)
3. [Architecture](#3-architecture)
4. [User Journeys](#4-user-journeys)
5. [Wireframes](#5-wireframes)
6. [Data Model](#6-data-model)
7. [Matching Algorithm](#7-matching-algorithm)
8. [API Reference](#8-api-reference)
9. [Tech Stack](#9-tech-stack)

---

## 1. Problem & Mission

**The gap:** Amsterdam itself has 89,000 unemployed youth and 233,000 NEETs (not in education, employment, or training). Youth from non-European backgrounds face a 14.6% unemployment rate — more than double the 6.9% for Dutch-origin peers. A kid named Mohammed in Zuidoost gets 60% fewer callbacks than a kid named Daan with the exact same CV.

**The tools that exist don't serve this group:**
- YoungCapital and Indeed require Dutch, an account, and a polished CV
- Government benefits calculators (Berekenuwrecht) are not multilingual and are not designed for a 16-year-old
- No tool combines career discovery + job matching + anonymous application in one mobile flow

**Junta's answer:** A 5-minute anonymous quiz → AI-generated profile → hybrid semantic job matching → downloadable CV. No name required, no documents, no Dutch. On the employer side: a dashboard to post shifts and browse anonymous candidate profiles.

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          JUNTA                                   │
│                                                                  │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐  │
│  │  CANDIDATE  │    │   EMPLOYER       │    │  JOB DATA      │  │
│  │  /app       │    │   /employer      │    │  /jobs (map)   │  │
│  │  Quiz flow  │    │   Post + manage  │    │  Browse all    │  │
│  └──────┬──────┘    └────────┬─────────┘    └───────┬────────┘  │
│         │                    │                       │           │
│         ▼                    ▼                       ▼           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js API Routes                     │   │
│  │  /api/match   /api/jobs   /api/embed-jobs                 │   │
│  │  /api/generate-profile    /api/generate-experience        │   │
│  └──────────────┬───────────────────────┬───────────────────┘   │
│                 │                       │                        │
│         ┌───────▼───────┐      ┌────────▼────────┐              │
│         │   Supabase    │      │    OpenAI API    │              │
│         │   pgvector    │      │  text-embedding  │              │
│         │   jobs table  │      │  -3-small        │              │
│         │   profiles    │      │  gpt-4o-mini     │              │
│         │   applications│      └─────────────────-┘              │
│         └───────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Two actor types:**

| Actor | Entry point | Goal |
|-------|-------------|------|
| Candidate (youth) | `/app` | Find a job anonymously in 5 minutes |
| Employer (local business) | `/employer` | Post shifts, find matched youth |

---

## 3. Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (Postgres + pgvector) |
| AI — embeddings | OpenAI `text-embedding-3-small` (1536 dimensions) |
| AI — text generation | OpenAI `gpt-4o-mini` |
| Job data source | YoungCapital scraper (cheerio) |
| Map | Leaflet.js (dynamic import, SSR off) |
| Location autocomplete | PDOK Locatieserver API (Dutch government open data) |
| i18n | next-intl (EN + NL) |
| Deployment | Vercel |
| PWA | Service worker + Web App Manifest |

### File Structure

```
app/
├── page.tsx                  Landing page (bilingual, SSR)
├── app/
│   ├── page.tsx              Candidate quiz entry (imports _page-impl)
│   ├── _page-impl.tsx        All 11 quiz screens + result tabs (1400 lines)
│   └── layout.tsx            PWA metadata, service worker
├── employer/
│   ├── page.tsx              Employer portal entry
│   └── _page-impl.tsx        Auth + post job + manage listings + applications
├── jobs/
│   └── page.tsx              Public job map (Leaflet)
├── post/
│   └── page.tsx              Simple employer job post form
└── api/
    ├── jobs/route.ts         GET (serve) / POST (force re-scrape) YoungCapital
    ├── match/route.ts        Hybrid semantic job matching
    ├── embed-jobs/route.ts   Batch embedding for unembedded jobs
    ├── generate-profile/     GPT profile description generator
    ├── generate-experience/  GPT experience bullet generator
    ├── job-pairs/route.ts    Job preference pairs for quiz step 11
    └── junta/manifest/       PWA manifest

lib/
├── profile.ts                AppData → CandidateProfile schema converter
├── stap-data.ts              Quiz option constants (interests, skills, languages…)
├── junta-data.ts             Shared data constants
└── supabase.ts               Supabase client (anon + service-role admin)

supabase/migrations/
├── 000001  create_jobs
├── 000002  add_source_description
├── 000003  disable_rls (initial open state)
├── 000004  add_embeddings (vector(1536) column + IVFFlat index)
├── 000005  create_profiles
├── 000006  hybrid_match_jobs (SQL function)
├── 000010  employer_auth (employer_id FK + RLS policies)
├── 000011  drop_employer_fk
└── 000012  create_applications
```

---

## 4. User Journeys

### 4.1 Candidate Journey

```
Landing page (/)
      │
      ▼
  [Start — it's free]
      │
      ▼
┌─────────────────────────────────────────────┐
│           QUIZ FLOW  (/app)                  │
│                                              │
│  Step 0:  Age range (14-15 / 16-17 / …)     │
│  Step 1:  Name / nickname (+ optional email) │
│  Step 2:  Location (PDOK autocomplete)       │
│  Step 3:  Education level + school + year    │
│  Step 4:  Languages (15 options incl. Arabic,│
│           Turkish, Somali, Tigrinya…)        │
│  Step 5:  Interests (12 emoji chips)         │
│  Step 6:  Skills (10 options)                │
│  Step 7:  Availability (days + hours/week)   │
│  Step 8:  Dream job (free text, optional)    │
│  Step 9:  Experience types (8 options)       │
│  Step 10: Job preference pairs (3 rounds,    │
│           "Would you rather…" A vs B)        │
│                                              │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
           Loading screen
           ┌──────────────────────────────┐
           │  1. toProfile() — converts   │
           │     AppData → CandidateProfile│
           │  2. Save profile to Supabase │
           │  3. Parallel:                │
           │     • GPT profile description│
           │     • GPT experience bullets │
           └───────────┬──────────────────┘
                       │
                       ▼
           Results screen (2 tabs)
           ┌──────────────────────────────┐
           │  💼 Jobs tab                 │
           │   POST /api/match            │
           │   → embed profile text       │
           │   → run match_jobs()         │
           │   → ranked list with scores  │
           │                              │
           │  📄 CV tab                   │
           │   Preview + Download as PDF  │
           │   (client-side HTML → print) │
           └──────────────────────────────┘
```

**Key design principles for the candidate flow:**
- No account required at any point
- No question about residency status, visa, or background
- Name is optional (anonymous CV uses initials)
- Email is optional (only goes on the CV, never stored for marketing)
- Every screen has a "Skip" path — nothing is a hard blocker

---

### 4.2 Employer Journey

```
Landing page (/)
      │
      ▼
  [For employers] → /employer
      │
      ▼
┌─────────────────────────────────────────────┐
│           EMPLOYER PORTAL (/employer)        │
│                                              │
│  Auth gate (email + password)               │
│  ┌─────────────────────────────────────┐    │
│  │  Sign up / Sign in                  │    │
│  │  (Supabase Auth — mock flag in dev) │    │
│  └──────────────┬──────────────────────┘    │
│                 │                            │
│         ┌───────┴────────┐                  │
│         ▼                ▼                  │
│   Post new job      View my listings        │
│   ┌───────────┐     ┌────────────────┐      │
│   │ Title     │     │ Active jobs    │      │
│   │ Category  │     │ Edit / Delete  │      │
│   │ Type      │     └────────┬───────┘      │
│   │ Salary    │              │               │
│   │ Location  │              ▼               │
│   │ Desc.     │     View applications        │
│   │ URL       │     ┌────────────────┐      │
│   └─────┬─────┘     │ Per job:       │      │
│         │           │ candidate name │      │
│         ▼           │ email, message │      │
│   Insert to jobs    │ applied_at     │      │
│   + employer_id FK  └────────────────┘      │
│                                              │
└─────────────────────────────────────────────┘
```

---

### 4.3 Job Data Pipeline

```
Scrape trigger (GET /api/jobs when DB empty, or POST to force refresh)
      │
      ▼
YoungCapital scraper (cheerio)
  • Up to 27 pages of Amsterdam listings
  • Extracts: id, title, category, employment type, salary min/max, location
  • Fetches individual job pages for description text (3 concurrent)
  • Geocodes location text → lat/lng (NEIGHBORHOOD_COORDS lookup + jitter)
      │
      ▼
Upsert into jobs table (conflict on id)
      │
      ▼
POST /api/embed-jobs (separate trigger, batches of 50)
  • Fetches all jobs WHERE embedding IS NULL
  • For each: embed "[title] — [category] — [description]"
    using OpenAI text-embedding-3-small
  • Updates jobs.embedding with vector(1536)
      │
      ▼
Jobs are now matchable via match_jobs() RPC
```

---

## 5. Wireframes

### 5.1 Landing Page (`/`)

```
┌──────────────────────────────────────────────────────┐
│  [Junta logo]                    Jobs map  [Find my job →]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  Amsterdam              ┌─────────────────────┐     │
│  has your job.          │ Junta   Stap 2 van 5 │     │
│  Let's find it.         │─────────────────────│     │
│                         │ ████░░░░░░░░░░  40% │     │
│  Answer 5 questions.    │                     │     │
│  Get matched to real    │ Wat vind je leuk?   │     │
│  local jobs near you.   │                     │     │
│                         │ [💻 Tech] [🤝 Mensen]│     │
│  [Start — it's free]    │ [🍕 Horeca✓][🔧 Bouw]│     │
│  [Browse the map]       │ [⚽ Sport] [🎨 Creat]│     │
│                         │                     │     │
│  🔒 Fully anonymous     │    [Volgende →]      │     │
│  🌍 No Dutch required   │ Anoniem·Gratis·5 min│     │
│  📍 Amsterdam only      └─────────────────────┘     │
│                                                      │
├──────────────────────────────────────────────────────┤
│  HOW IT WORKS                                        │
│                                                      │
│  01               02               03               │
│  Tell us          We find          Apply             │
│  what you like    your matches     directly          │
│  5 min, no docs   AI + location    Real listings     │
│                                                      │
├──────────────────────────────────────────────────────┤
│  WHAT KIND OF JOBS?                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │📦 Warehouse│ │🍽️ Horeca │ │🏪 Retail │ │🧹 Clean│  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │💻 Admin  │ │🏗️ Build  │ │🤝 Care   │ │🚲 Deliv│  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│         🔒 We never ask who you are.                 │
│   No name. No address. No documents.                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│            Your job is out there.                    │
│         [Start the 5-minute quiz →]                  │
└──────────────────────────────────────────────────────┘
```

---

### 5.2 Quiz Flow (`/app`)

**Progress bar (shown on all steps 0–10):**
```
┌──────────────────────────────────────────────────────┐
│ ████████████░░░░░░░░░░░░░░░░░░  (11 segments)        │
└──────────────────────────────────────────────────────┘
```

**Step 0 — Age**
```
┌──────────────────────────────────────────────────────┐
│ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │
│                                                      │
│ Hoe oud ben je?                                      │
│ Dit bepaalt welke banen voor jou gelden.             │
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │  14-15 jaar                              │        │
│ └──────────────────────────────────────────┘        │
│ ┌──────────────────────────────────────────┐        │
│ │  16-17 jaar                    ← selected│        │
│ └──────────────────────────────────────────┘        │
│ ┌──────────────────────────────────────────┐        │
│ │  18-20 jaar                              │        │
│ └──────────────────────────────────────────┘        │
│ ┌──────────────────────────────────────────┐        │
│ │  21-23 jaar                              │        │
│ └──────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────┘
```
*Auto-advances on tap.*

**Step 5 — Interests (chip grid)**
```
┌──────────────────────────────────────────────────────┐
│ ██████████░░░░░░░░░░░░░░░░░░░░░░                     │
│                                                      │
│ Wat vind je leuk om te doen?                         │
│ Kies alles wat bij je past.                          │
│                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │💻 Tech   │ │🤝 Mensen │ │🎨 Creatief│ │⚽ Sport  │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │🍕 Horeca✓│ │🐕 Dieren │ │🎵 Muziek │ │🔧 Bouwen │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │🌿 Natuur │ │👟 Mode   │ │🎮 Gaming │ │🔬 Wetens.│ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                      │
│         [Volgende →]                                 │
└──────────────────────────────────────────────────────┘
```

**Step 10 — Job preference pairs**
```
┌──────────────────────────────────────────────────────┐
│ █████████████████████████████░░░                     │
│                                                      │
│ Zou je liever...                                     │
│ Keuze 2 van 3                                        │
│                                                      │
│ ● ●  ○                                               │  ← round progress
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │  Klantenservice medewerker               │        │
│ └──────────────────────────────────────────┘        │
│                                                      │
│                    of                                │
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │  Vakkenvuller supermarkt                 │        │
│ └──────────────────────────────────────────┘        │
│                                                      │
│               [Overslaan]                            │
└──────────────────────────────────────────────────────┘
```

**Loading screen**
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                      ⚡                              │
│                                                      │
│              Banen matchen...                        │
│                                                      │
│         ████████████████░░░░░░░░                     │
│                  67%                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 5.3 Results Screen

**Tab bar:**
```
┌──────────────────────────────────────────────────────┐
│  [Junta logo]  Jouw persoonlijke resultaten          │
│ ┌──────────────────┬───────────────────┐             │
│ │  💼 Banen  ← tab │      📄 CV        │             │
│ └──────────────────┴───────────────────┘             │
└──────────────────────────────────────────────────────┘
```

**Jobs tab:**
```
┌──────────────────────────────────────────────────────┐
│  12 banen gevonden die bij jou passen                │
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │ Barista Stage            #1  83% ●green  │        │
│ │ Centrum, Amsterdam                        │        │
│ │ ⏰ Part-time   💶 €13.50/hr              │        │
│ │ [Anoniem solliciteren →]                 │        │
│ └──────────────────────────────────────────┘        │
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │ Vakkenvuller Jumbo       #2  71% ●green  │        │
│ │ Nieuw-West, Amsterdam                     │        │
│ │ ⏰ Flexible   💶 €12.00/hr               │        │
│ │ [Anoniem solliciteren →]                 │        │
│ └──────────────────────────────────────────┘        │
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │ Keukenhulp Restaurant    #3  61% ●amber  │        │
│ │ De Pijp, Amsterdam                        │        │
│ │ ⏰ Evening   💶 €11.50/hr                │        │
│ │ [Anoniem solliciteren →]                 │        │
│ └──────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────┘
```

**CV tab:**
```
┌──────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────┐       │
│ │  ┌──┐  Yasmine B.                          │       │
│ │  │YB│  17 jaar · Bijlmer, Amsterdam        │       │
│ │  └──┘                                      │       │
│ │  🔒 Naam alleen op jouw CV gezet           │       │
│ │                                            │       │
│ │  PROFIEL                                   │       │
│ │  Gemotiveerde jongere van 17 jaar…         │       │
│ │                                            │       │
│ │  TALEN                                     │       │
│ │  [Nederlands] [Engels] [Arabisch]          │       │
│ │                                            │       │
│ │  VAARDIGHEDEN                              │       │
│ │  [Mensen helpen] [Snel leren] [Teamwork]   │       │
│ │                                            │       │
│ │  INTERESSES                                │       │
│ │  [Eten & Horeca] [Sport & Bewegen]         │       │
│ │                                            │       │
│ │  BESCHIKBAARHEID                           │       │
│ │  [Ma][Di][Wo][──][──][Za][──] · 8-16 uur  │       │
│ └────────────────────────────────────────────┘       │
│                                                      │
│         [📥 Download als PDF]                        │
└──────────────────────────────────────────────────────┘
```

---

### 5.4 Jobs Map (`/jobs`)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Home  |  [Junta]  Jobs in Amsterdam    [47 vacatures]        │
├─────────────────────────────────────────┬────────────────────────┤
│                                         │ ┌──────────────────┐   │
│         ┌─────────────────────────┐    │ │ Zoek vacatures…  │   │
│         │ 47 vacatures · klik pin │    │ └──────────────────┘   │
│         └─────────────────────────┘    │                        │
│                                         │ ┌────────────────────┐ │
│   [Leaflet map — Amsterdam]             │ │ Barista Stage  83% │ │
│                                         │ │ 📍 Centrum         │ │
│   ●navy  ●orange  ●green               │ │ Part-time  €13.50  │ │
│    (pins clustered by type)            │ │ [Bekijk →]         │ │
│                                         │ └────────────────────┘ │
│                                         │                        │
│  ┌─────────────┐                       │ ┌────────────────────┐ │
│  │ Type        │                       │ │ Vakkenvuller  71%  │ │
│  │ ● Full-time │                       │ │ 📍 Nieuw-West      │ │
│  │ ● Part-time │                       │ │ Flexible  €12.00   │ │
│  │ ● Flexible  │                       │ [Bekijk →]         │ │
│  │ ● Weekend   │                       │ └────────────────────┘ │
│  │ ● Evening   │                       │                        │
│  └─────────────┘                       │        sidebar         │
└─────────────────────────────────────────┴────────────────────────┘
```

---

### 5.5 Employer Portal (`/employer`)

```
┌──────────────────────────────────────────────────────┐
│  [Junta]  Werkgever portaal              [Uitloggen] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ 1.247       │  │ 86%          │  │ 43         │  │
│  │ Actieve     │  │ Gem. match   │  │ Ingehuurd  │  │
│  │ jongeren    │  │              │  │ deze maand │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
│                                                      │
│  ┌──────────────────────┬───────────────────────┐   │
│  │   VACATURE PLAATSEN  │   MIJN VACATURES       │   │
│  │                      │                       │   │
│  │  Vacaturetitel *     │  Barista Stage        │   │
│  │  ┌────────────────┐  │  📍 Centrum  Part-time│   │
│  │  │                │  │  [Bewerk] [Verwijder] │   │
│  │  └────────────────┘  │                       │   │
│  │  Categorie           │  Vakkenvuller Jumbo   │   │
│  │  ┌────────────────┐  │  📍 Nieuw-West        │   │
│  │  │                │  │  [Bewerk] [Verwijder] │   │
│  │  └────────────────┘  │                       │   │
│  │  Type  [select ▼]    │  AANMELDINGEN         │   │
│  │  Salaris             │  ┌─────────────────┐  │   │
│  │  Locatie (PDOK)      │  │ Kandidaat #A7x2 │  │   │
│  │  Omschrijving        │  │ 17 jr · 8-16 hr │  │   │
│  │  URL                 │  │ [Uitnodigen]    │  │   │
│  │                      │  └─────────────────┘  │   │
│  │  [Vacature plaatsen] │                       │   │
│  └──────────────────────┴───────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## 6. Data Model

### `jobs` table

```sql
id             text         PRIMARY KEY   -- YoungCapital ID or UUID for posted jobs
title          text         NOT NULL
category       text
type           text                       -- 'Full-time' | 'Part-time' | 'Flexible' | …
salary         text                       -- formatted: '€12.50/hr' or '€2.500/mo'
location       text
lat            float
lng            float
url            text
description    text                       -- up to 2000 chars scraped from job page
source         text                       -- 'youngcapital' | 'posted'
contact_email  text                       -- for employer-posted jobs
employer_id    uuid         REFERENCES auth.users(id)
embedding      vector(1536)               -- OpenAI text-embedding-3-small
scraped_at     timestamptz  DEFAULT now()
```

**RLS policies:**
- Public read: all rows
- Anon insert: allowed (scrapers + post form)
- Authenticated update/delete: own rows only (`employer_id = auth.uid()`)

---

### `profiles` table

```sql
id            uuid         PRIMARY KEY
email         text
display_name  text
age_range     text         -- '16-17'
profile       jsonb        -- full CandidateProfile object (see lib/profile.ts)
created_at    timestamptz  DEFAULT now()
```

**CandidateProfile schema (TypeScript):**
```ts
{
  profileId: string          // UUID
  schemaVersion: "1.0"
  identity: {
    displayName: string | null
    contactEmail: string | null
    isAnonymous: boolean
  }
  demographics: {
    ageRange: string         // "16-17"
    ageMin: number | null
    ageMax: number | null
    city: string             // always "Amsterdam"
    neighborhood: string | null
    lat: number | null
    lng: number | null
  }
  education: {
    institution: string | null
    levelLabel: string | null  // "VMBO", "MBO niveau 3–4", …
    levelCode: EduLevelCode | null
    graduationYear: number | null
    inProgress: boolean
  }
  languages: Array<{ label: string; isoCode: string }>
  skills: string[]
  interests: Array<{ id: string; label: string }>
  availability: {
    days: Array<{ short: string; full: string; isoWeekday: number }>
    hoursPerWeekLabel: string | null
    hoursMin: number | null
    hoursMax: number | null
  }
  aspiration: { dreamText: string | null }
  derived: {
    isEligibleForMinimumWage: boolean  // age >= 18
    canWorkWeekends: boolean
    languageCount: number
    skillCount: number
    interestIds: string[]
  }
}
```

---

### `applications` table

```sql
id              uuid         PRIMARY KEY DEFAULT gen_random_uuid()
job_id          text         NOT NULL
candidate_name  text
candidate_email text         NOT NULL
message         text
applied_at      timestamptz  DEFAULT now()
```

---

## 7. Matching Algorithm

The matching runs as a Postgres function `match_jobs()` using pgvector cosine similarity, plus three structured bonus signals.

### Score formula

```
score = semantic × 0.60
      + location_bonus        (up to +0.20)
      + hours_bonus           (up to +0.12)
      + language_bonus        (up to +0.08)
```

**Maximum possible score: 1.00**

### Semantic component (60%)

```sql
1 - (jobs.embedding <=> query_embedding)
```
The user's profile text is embedded at query time using `text-embedding-3-small`. The job's pre-stored embedding is compared using cosine distance (`<=>`).

Profile text is built from: skills, interests, languages, education, dream, availability, age range.

### Location bonus (up to +0.20)

```
bonus = 0.20 × max(0, 1 − distance_km / 15)
```
Full bonus within ~2 km, linear decay to 0 at 15 km. Uses flat-earth approximation (sufficient for Amsterdam's scale). Bonus is 0 if either coordinate is null.

### Hours compatibility bonus (up to +0.12)

| User hours/week | Job type | Bonus |
|-----------------|----------|-------|
| ≤ 20 hrs | Part-time | +0.12 |
| ≤ 20 hrs | Flexible | +0.10 |
| ≤ 20 hrs | Weekend | +0.08 |
| ≤ 20 hrs | Full-time | +0.00 (penalised) |
| ≥ 32 hrs | Full-time | +0.12 |
| ≥ 32 hrs | Flexible | +0.08 |
| ≥ 32 hrs | Part-time | +0.04 |
| Unknown | any | +0.06 (neutral) |

### Language bonus (up to +0.08)

| Condition | Bonus |
|-----------|-------|
| User speaks Dutch (`nl`) | +0.08 |
| User speaks English + job title is English | +0.05 |
| No shared language signal | +0.02 |

### Score display tiers

| Score | Badge colour | Label |
|-------|-------------|-------|
| ≥ 70% | Green | Strong match |
| 55–69% | Amber | Good match |
| < 55% | Grey | Possible match |

---

## 8. API Reference

### `GET /api/jobs`
Returns all jobs from Supabase. If the table is empty, triggers a YoungCapital scrape first (pages 1–27, ~400 jobs).

**Response:** `{ jobs: JobRow[], source: 'supabase' | 'scraped', count: number }`

---

### `POST /api/jobs?pages=N`
Force re-scrape YoungCapital (max 27 pages). Upserts all jobs into Supabase. Does **not** generate embeddings — call `/api/embed-jobs` separately.

---

### `POST /api/embed-jobs?limit=N`
Generates embeddings for all jobs where `embedding IS NULL`. Processes up to N jobs (default 50, max 200). Adds 100ms delay between calls to avoid rate limits.

**Embedding text format:** `"[title] — [category] — [description]"`

**Response:** `{ processed: number, failed: number, remaining: number }`

---

### `POST /api/match`
Hybrid semantic job matching.

**Request (option A — direct profile object):**
```json
{ "profile": { ...CandidateProfile } }
```

**Request (option B — profile ID lookup):**
```json
{ "profileId": "uuid" }
```

**Request (option C — free-form resume text):**
```json
{ "resumeText": "I'm 17, speak Arabic and Dutch, love cooking..." }
```

**Process:**
1. Build profile text string from structured profile fields
2. Call OpenAI embeddings API to get query vector
3. Call `match_jobs()` Postgres RPC with query vector + structured signals
4. Return top 20 ranked jobs

**Response:** `{ jobs: MatchedJob[], profileText: string }`

```ts
type MatchedJob = {
  id: string; title: string; type: string; salary: string;
  location: string; url: string; lat: number; lng: number;
  similarity: number;  // raw cosine similarity 0–1
  score: number;       // hybrid score 0–1
}
```

---

### `POST /api/generate-profile`
Generates a 2–3 sentence Dutch CV profile description using GPT.

**Request:** `{ data: AppData, picks: string[] }`  
**Response:** `{ description: string }`

---

### `POST /api/generate-experience`
Converts the user's experience type selections into CV bullet points using GPT.

**Request:** `{ experienceTypes: string[], experienceNote?: string }`  
**Response:** `{ items: Array<{ title: string, description: string }> }`

---

### `POST /api/job-pairs`
Returns 3 pairs of job titles for the preference quiz (step 10), tailored to the user's interests and skills.

**Request:** `{ interests: string[], skills: string[] }`  
**Response:** `{ pairs: Array<{ a: string, b: string }> }`

---

## 9. Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 14 App Router | SSR for landing page SEO, API routes co-located |
| Database | Supabase (Postgres) | pgvector built-in, RLS, Auth, free tier |
| Vector search | pgvector IVFFlat index | Cosine similarity at scale, no separate vector DB |
| Embeddings | OpenAI `text-embedding-3-small` | 1536d, fast, cheap (~$0.00002/1k tokens) |
| Text generation | OpenAI `gpt-4o-mini` | CV profile + experience bullets |
| Job data | YoungCapital scraper | Amsterdam-focused, youth jobs, 400+ listings |
| Geocoding | PDOK Locatieserver | Dutch government open data, neighbourhood-level |
| Map | Leaflet.js | Lightweight, no API key needed |
| i18n | next-intl | EN + NL, server-side locale detection |
| PWA | Next.js manifest + SW | Installable on iOS/Android, works offline (assets) |
| Deployment | Vercel | Zero-config Next.js, edge functions, env management |

---

*Built at Hackathon 2026 by Erwin, Jeroen & Suryansh*
