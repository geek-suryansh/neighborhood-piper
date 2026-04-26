"""
Job Matching Algorithm - Local Demo
====================================
Tests the core matching logic using sentence-transformers (no API key needed).
It embeds a user profile and several job descriptions, then ranks the jobs
by semantic similarity to the user.

Install dependencies first:
    pip install sentence-transformers scikit-learn numpy

Then run:
    python matching_demo.py
"""

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# ─────────────────────────────────────────────
# 1. FAKE JOB DESCRIPTIONS
# ─────────────────────────────────────────────

jobs = [
    {
        "id": 1,
        "title": "Magazijnmedewerker – Logistics Assistant",
        "location": "Rotterdam",
        "contract": "Part-time, 20 uur/week",
        "dutch_required": "A2",
        "description": """
            We zoeken een enthousiaste magazijnmedewerker voor ons distributiecentrum.
            Je sorteert en verpakt pakketten, organiseert inkomende en uitgaande goederen
            en werkt samen in een team. Fysiek werk, geen vooropleiding vereist.
            Rijbewijs B is een pré. We waarderen betrouwbaarheid en stiptheid.
            Wij zijn een inclusieve werkgever en verwelkomen sollicitanten van alle achtergronden.
        """
    },
    {
        "id": 2,
        "title": "Keukenhulp – Kitchen Assistant",
        "location": "Amsterdam",
        "contract": "Fulltime, 38 uur/week",
        "dutch_required": "A1",
        "description": """
            Druk restaurant zoekt keukenhulp voor het voorbereiden van ingrediënten,
            afwassen en schoonhouden van de keuken. Werkervaring niet noodzakelijk,
            we leren je alles. Je werkt in een internationaal team. Flexibele werktijden,
            ook avonden en weekenden. Passie voor eten is een plus.
        """
    },
    {
        "id": 3,
        "title": "Naai- en Textielhulp – Textile Worker",
        "location": "Utrecht",
        "contract": "Part-time, 24 uur/week",
        "dutch_required": "A2",
        "description": """
            Textielwerkplaats zoekt iemand met naaiervaring voor het vervaardigen en
            herstellen van kleding en stoffen producten. Kennis van naaimachines vereist.
            Je werkt in een rustige creatieve omgeving. Opleiding in mode of textiel is een pré.
            We bieden begeleiding en mogelijkheden om door te groeien.
        """
    },
    {
        "id": 4,
        "title": "Administratief Medewerker – Office Assistant",
        "location": "Den Haag",
        "contract": "Fulltime, 32 uur/week",
        "dutch_required": "B1",
        "description": """
            Wij zoeken een administratief medewerker voor het verwerken van facturen,
            beantwoorden van e-mails en ondersteunen van het team met kantoorwerkzaamheden.
            MBO werk- en denkniveau. Goede beheersing van Nederlands vereist (B1).
            Ervaring met Excel of Google Sheets is een pré. Nauwkeurig en georganiseerd.
        """
    },
    {
        "id": 5,
        "title": "Schoonmaakmedewerker – Cleaning Staff",
        "location": "Rotterdam",
        "contract": "Part-time, 16 uur/week",
        "dutch_required": "A1",
        "description": """
            Schoonmaakbedrijf zoekt betrouwbare medewerker voor dagelijkse schoonmaak
            van kantoren en bedrijfspanden in Rotterdam. Vroege ochtenduren (6:00–10:00).
            Geen ervaring nodig, materialen worden verstrekt. Zelfstandig werken.
            Rijbewijs of OV-kaart vereist om locaties te bereiken.
        """
    },
    {
        "id": 6,
        "title": "Zorgassistent – Care Assistant",
        "location": "Rotterdam",
        "contract": "Part-time, 20 uur/week",
        "dutch_required": "A2",
        "description": """
            Zorginstelling zoekt een warmhartige zorgassistent om ouderen te ondersteunen
            bij dagelijkse activiteiten, maaltijden en gezelschap. Geen zorgopleiding vereist,
            maar empathie en geduld zijn essentieel. Je werkt onder begeleiding van verpleegkundigen.
            Ervaring met zorg of werken met kwetsbare mensen is een pré.
        """
    },
]

# ─────────────────────────────────────────────
# 2. FAKE USER PROFILES
# ─────────────────────────────────────────────

users = [
    {
        "name": "Ahmed (22, Rotterdam)",
        "background": "Syria",
        "profile": """
            Jonge man van 22 jaar, oorspronkelijk uit Syrië. Woont in Rotterdam.
            Spreekt Arabisch als moedertaal, Nederlands op A2-niveau, basis Engels.
            Heeft ervaring met helpen in de familiaire kruidenierswinkel: schappen vullen,
            voorraad organiseren en klanten helpen. Beschikt over rijbewijs B (Nederland).
            Houdt van fysiek, praktisch werk. Beschikbaar voor parttime.
            Hardwerkend, betrouwbaar en punctueel. Geen formeel diploma (MBO) maar
            bereid te leren en te werken.
        """
    },
    {
        "name": "Fatima (25, Amsterdam)",
        "background": "Eritrea",
        "profile": """
            Jonge vrouw van 25 jaar, oorspronkelijk uit Eritrea. Woont in Amsterdam.
            Spreekt Tigrinya als moedertaal, basis Nederlands (A1), geen Engels.
            Heeft jarenlange ervaring als naaister en textielwerkster, werkte in een
            kledingfabriek. Heeft een naailcursus gevolgd in Nederland.
            Creatief, gedetailleerd, houdt van werken met stof en kleding.
            Op zoek naar fulltimewerk in een creatieve omgeving. Geen rijbewijs.
        """
    },
    {
        "name": "Omar (19, Den Haag)",
        "background": "Morocco",
        "profile": """
            Jongeman van 19 jaar, tweede generatie Marokkaans-Nederlands. Woont in Den Haag.
            Spreekt Nederlands vloeiend (B2), Arabisch en Darija.
            Heeft VMBO-diploma en volgt nu een MBO-opleiding administratie.
            Bijbaantjes gehad in een supermarkt en als bezorger.
            Georganiseerd, goed met computers en spreadsheets.
            Op zoek naar een kantoorbaan om werkervaring op te doen naast zijn studie.
            Parttime of fulltime, bij voorkeur kantooruren.
        """
    },
]

# ─────────────────────────────────────────────
# 3. BUILD TEXT DOCUMENTS FOR EMBEDDING
# ─────────────────────────────────────────────

def build_job_document(job):
    """Combine job fields into a single text for embedding."""
    return f"""
    {job['title']}. Locatie: {job['location']}. Contract: {job['contract']}.
    Nederlands vereist: {job['dutch_required']}.
    {job['description']}
    """.strip()

def build_user_document(user):
    """Use the profile text directly for embedding."""
    return user['profile'].strip()

# ─────────────────────────────────────────────
# 4. LOAD MODEL AND EMBED
# ─────────────────────────────────────────────

print("\n🔄 Loading multilingual embedding model...")
print("   (first run downloads ~500MB, subsequent runs are instant)\n")

# Multilingual model — handles Dutch, Arabic, English, Tigrinya, etc.
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

job_documents = [build_job_document(job) for job in jobs]
user_documents = [build_user_document(user) for user in users]

print("⚙️  Embedding jobs and user profiles...")
job_embeddings = model.encode(job_documents, show_progress_bar=False)
user_embeddings = model.encode(user_documents, show_progress_bar=False)
print("✅ Done.\n")

# ─────────────────────────────────────────────
# 5. MATCH AND RANK
# ─────────────────────────────────────────────

def rank_jobs_for_user(user_embedding, job_embeddings, jobs):
    """Compute cosine similarity and return jobs ranked best to worst."""
    scores = cosine_similarity([user_embedding], job_embeddings)[0]
    ranked = sorted(zip(scores, jobs), key=lambda x: x[0], reverse=True)
    return ranked

# ─────────────────────────────────────────────
# 6. PRINT RESULTS
# ─────────────────────────────────────────────

def score_bar(score, width=20):
    """Visual bar for match score."""
    filled = int(score * width)
    return "█" * filled + "░" * (width - filled)

print("=" * 60)
print("  JOB MATCHING DEMO — RANKED RESULTS")
print("=" * 60)

for i, user in enumerate(users):
    ranked = rank_jobs_for_user(user_embeddings[i], job_embeddings, jobs)

    print(f"\n👤 USER: {user['name']} (from {user['background']})")
    print(f"{'─' * 60}")

    for rank, (score, job) in enumerate(ranked, 1):
        bar = score_bar(score)
        medal = "🥇" if rank == 1 else ("🥈" if rank == 2 else ("🥉" if rank == 3 else f"  {rank}.")  )
        print(f"  {medal}  {job['title']}")
        print(f"       {bar}  {score:.1%}  |  {job['location']}  |  NL: {job['dutch_required']}")

    print(f"\n  ✅ Best match: {ranked[0][1]['title']} ({ranked[0][0]:.1%})")
    print(f"  ❌ Worst match: {ranked[-1][1]['title']} ({ranked[-1][0]:.1%})")

print("\n" + "=" * 60)
print("  HOW THIS WORKS")
print("=" * 60)
print("""
  1. Each job description is converted to a vector (list of numbers)
     that captures its *meaning* using a multilingual AI model.

  2. Each user profile is converted the same way.

  3. We measure how "close" each job vector is to the user vector
     using cosine similarity (0% = no match, 100% = identical).

  4. Jobs are ranked by that score — highest first.

  In production:
  - User profiles come from the guided onboarding form
  - Job vectors are stored in Pinecone (fast search at scale)
  - Hard filters (location, Dutch level) are applied before ranking
  - The model handles Dutch, Arabic, Tigrinya, and 50+ other languages
""")
