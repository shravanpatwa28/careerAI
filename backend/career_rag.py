"""
career_rag.py
-------------
Retrieval-Augmented Generation (RAG) knowledge base.
Uses SentenceTransformers to embed career documents,
then retrieves the most relevant ones for each chatbot query.

Careers covered (8):
  AI Engineer, Software Engineer, Data Analyst,
  UI/UX Designer, Marketing Manager,
  Cybersecurity Analyst, Product Manager, Biomedical Researcher
"""

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

print("Loading SentenceTransformer for RAG (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# ─────────────────────────────────────────────────────────────────
# Knowledge Base (8 careers, 2 docs each)
# ─────────────────────────────────────────────────────────────────

knowledge_base = [
    # ── AI Engineer ──────────────────────────────────────────────
    {
        "career": "AI Engineer",
        "doc": (
            "Roadmap for AI Engineer: 1. Learn Python deeply (NumPy, Pandas, Matplotlib). "
            "2. Master Linear Algebra, Calculus, and Statistics. "
            "3. Learn classical ML (scikit-learn). "
            "4. Deep Learning frameworks: PyTorch (preferred) and TensorFlow. "
            "5. Study Computer Vision (CNNs) and NLP (Transformers, BERT, GPT). "
            "6. Build MLOps pipelines (MLflow, Docker, CI/CD). "
            "Key skills: Python, PyTorch, Neural Networks, Model Optimization, MLOps."
        )
    },
    {
        "career": "AI Engineer",
        "doc": (
            "Top courses and resources for AI Engineering: "
            "Andrew Ng's Machine Learning Specialization (Coursera), "
            "DeepLearning.AI Deep Learning Specialization, "
            "fast.ai Practical Deep Learning for Coders, "
            "CS231n (Stanford, Computer Vision), "
            "Hugging Face NLP course (free). "
            "Build projects: image classifier, sentiment analyser, LLM fine-tuning. "
            "Salary range: ₹12–40 LPA in India, $120K–$200K+ globally."
        )
    },

    # ── Software Engineer ─────────────────────────────────────────
    {
        "career": "Software Engineer",
        "doc": (
            "Roadmap for Software Engineer: 1. Master a language (Python, Java, or C++). "
            "2. Data Structures & Algorithms (LeetCode, Codeforces). "
            "3. System Design (high-level and low-level). "
            "4. Databases: SQL (PostgreSQL) and NoSQL (MongoDB). "
            "5. Version control with Git and GitHub. "
            "6. REST API design and microservices. "
            "Key skills: DSA, System Design, Clean Code, Testing."
        )
    },
    {
        "career": "Software Engineer",
        "doc": (
            "Resources for Software Engineers: "
            "Cracking the Coding Interview (book), "
            "Grokking System Design (Educative.io), "
            "The Pragmatic Programmer (book), "
            "CS50 Harvard (free), "
            "freeCodeCamp full-stack path. "
            "Practice platforms: LeetCode, HackerRank, Codeforces. "
            "Build: REST APIs, web apps, CLI tools, contribute to open source."
        )
    },

    # ── Data Analyst ──────────────────────────────────────────────
    {
        "career": "Data Analyst",
        "doc": (
            "Roadmap for Data Analyst: 1. Advanced Excel and Google Sheets. "
            "2. SQL for querying databases (PostgreSQL, MySQL). "
            "3. Python for data wrangling (Pandas, NumPy). "
            "4. Data visualization: Tableau, Power BI, or Matplotlib/Seaborn. "
            "5. Statistics fundamentals: distributions, hypothesis testing, A/B tests. "
            "6. Dashboarding and storytelling with data. "
            "Key skills: SQL, Python, Visualization, Statistical thinking."
        )
    },
    {
        "career": "Data Analyst",
        "doc": (
            "Resources for Data Analysts: "
            "Google Data Analytics Certificate (Coursera), "
            "SQL for Data Science (Coursera), "
            "Kaggle Learn (free Python, SQL, ML tracks), "
            "Storytelling with Data (book by Cole Nussbaumer Knaflic). "
            "Build: Sales dashboards, market analysis reports, A/B test analyses. "
            "Salary: ₹5–18 LPA in India, $65K–$110K globally."
        )
    },

    # ── UI/UX Designer ───────────────────────────────────────────
    {
        "career": "UI/UX Designer",
        "doc": (
            "Roadmap for UI/UX Designer: 1. Learn Figma (industry standard for wireframing & prototyping). "
            "2. Understand Color Theory, Typography, and Grid Systems. "
            "3. User Research: interviews, surveys, usability testing. "
            "4. Information Architecture and User Flows. "
            "5. Interaction Design: micro-animations, transitions. "
            "6. Build a portfolio with 3–5 case studies. "
            "Key skills: Figma, Empathy, Visual Design, User Research, Prototyping."
        )
    },
    {
        "career": "UI/UX Designer",
        "doc": (
            "Resources for UI/UX Designers: "
            "Google UX Design Certificate (Coursera), "
            "Refactoring UI (book/guide for developers learning design), "
            "Figma tutorials (YouTube: DesignCourse, Flux Academy), "
            "Nielsen Norman Group UX research articles (free). "
            "Build portfolio: redesign a popular app, design a mobile app from scratch. "
            "Salary: ₹6–20 LPA in India, $75K–$130K globally."
        )
    },

    # ── Marketing Manager ────────────────────────────────────────
    {
        "career": "Marketing Manager",
        "doc": (
            "Roadmap for Marketing Manager: 1. Content Marketing and SEO fundamentals. "
            "2. Google Analytics 4 and Meta Ads Manager. "
            "3. Email marketing (Mailchimp, HubSpot). "
            "4. Social Media Strategy (Instagram, LinkedIn, YouTube). "
            "5. Campaign planning, budgeting, and ROI measurement. "
            "6. CRM tools (Salesforce, HubSpot). "
            "Key skills: Strategy, Copywriting, Data interpretation, Campaign management."
        )
    },
    {
        "career": "Marketing Manager",
        "doc": (
            "Resources for Marketing: "
            "Google Digital Marketing Certificate (free), "
            "HubSpot Academy (free certifications: inbound, content, email), "
            "Seth Godin's blog and books (This is Marketing), "
            "Neil Patel's SEO guides (neilpatel.com, free). "
            "Build: run a small social media campaign, write an SEO blog, "
            "create a Google Ads case study. "
            "Salary: ₹6–22 LPA in India, $70K–$130K globally."
        )
    },

    # ── Cybersecurity Analyst ─────────────────────────────────────
    {
        "career": "Cybersecurity Analyst",
        "doc": (
            "Roadmap for Cybersecurity Analyst: 1. Learn networking fundamentals (TCP/IP, DNS, HTTP). "
            "2. Operating Systems: Linux command line mastery. "
            "3. Security fundamentals: CIA triad, OWASP Top 10. "
            "4. Tools: Wireshark, Nmap, Metasploit, Burp Suite. "
            "5. Ethical hacking and penetration testing. "
            "6. Certifications: CompTIA Security+, CEH, OSCP. "
            "Key skills: Networking, Linux, Threat analysis, Pen testing, Incident response."
        )
    },
    {
        "career": "Cybersecurity Analyst",
        "doc": (
            "Resources for Cybersecurity: "
            "TryHackMe and HackTheBox (hands-on labs, free tiers), "
            "CompTIA Security+ study guide, "
            "Cybrary (free cybersecurity courses), "
            "SANS Institute courses (advanced). "
            "Build: set up a home lab with VMs, complete CTF challenges, "
            "write a vulnerability report. "
            "Salary: ₹8–25 LPA in India, $80K–$150K globally."
        )
    },

    # ── Product Manager ───────────────────────────────────────────
    {
        "career": "Product Manager",
        "doc": (
            "Roadmap for Product Manager: 1. Understand the product lifecycle (discovery → launch → growth). "
            "2. Learn Agile/Scrum methodologies. "
            "3. Product analytics: Mixpanel, Amplitude, Google Analytics. "
            "4. User story writing and roadmap prioritization (MoSCoW, RICE). "
            "5. Stakeholder management and cross-functional communication. "
            "6. Learn basic tech: SQL, API concepts (not coding). "
            "Key skills: Strategy, Communication, Data analysis, Prioritization, Empathy."
        )
    },
    {
        "career": "Product Manager",
        "doc": (
            "Resources for Product Managers: "
            "Inspired by Marty Cagan (book — must-read), "
            "Product School free courses, "
            "Reforge (advanced, paid), "
            "Lenny's Newsletter (free, top PM insights). "
            "Build: create a PRD (Product Requirements Document) for an app idea, "
            "conduct user interviews, build a product roadmap. "
            "Salary: ₹12–35 LPA in India, $110K–$180K globally."
        )
    },

    # ── Biomedical Researcher ─────────────────────────────────────
    {
        "career": "Biomedical Researcher",
        "doc": (
            "Roadmap for Biomedical Researcher: 1. Strong foundation in Biology, Chemistry, and Mathematics. "
            "2. Learn research methodology and experimental design. "
            "3. Bioinformatics tools: Python/R for genomics data. "
            "4. Lab techniques: PCR, cell culture, microscopy. "
            "5. Publish research: write papers, present at conferences. "
            "6. Pursue a Master's or PhD in Biomedical Science or related field. "
            "Key skills: Scientific thinking, Lab skills, R/Python, Research writing, Data analysis."
        )
    },
    {
        "career": "Biomedical Researcher",
        "doc": (
            "Resources for Biomedical Research: "
            "Coursera: Genomic Data Science Specialization (Johns Hopkins), "
            "edX: Bioinformatics MicroMasters, "
            "PubMed (free research papers), "
            "R for Data Science (free online book). "
            "Build: analyse a public genomics dataset (NCBI), "
            "replicate a published study, contribute to open-source bioinformatics tools. "
            "Salary: Rs.4-15 LPA in India, $60K-$120K globally (academia vs industry varies significantly)."
        )
    },

    # ── 8 NEW CAREERS (2 docs each) ────────────────────────────────

    {
        "career": "Finance Analyst",
        "doc": (
            "Finance Analyst career path: Master financial modelling, accounting, and valuation. "
            "Key skills: Excel, financial statements, DCF valuation, risk analysis, Bloomberg terminal. "
            "Certifications: CFA (Chartered Financial Analyst) is the gold standard, CPA, FRM for risk. "
            "Start with: Investopedia courses, CA Foundation, NSE Academy certifications. "
            "Roles: Equity Research Analyst, Investment Banker, Risk Manager, Portfolio Manager. "
            "Salary: Rs.5-25 LPA in India, $60K-$150K globally. Top recruiters: Goldman Sachs, JP Morgan, HDFC, Deloitte."
        )
    },
    {
        "career": "Finance Analyst",
        "doc": (
            "Finance Analyst roadmap: "
            "Step 1: Learn accounting fundamentals and financial statements (P&L, Balance Sheet, Cash Flow). "
            "Step 2: Master Excel and financial modelling techniques (3-statement model, DCF). "
            "Step 3: Learn valuation: comparable companies, precedent transactions, LBO. "
            "Step 4: Pursue CFA Level 1 or CA/MBA Finance for credibility. "
            "Step 5: Build a stock pitch or personal finance project for your portfolio. "
            "Tools: Excel, Python (Pandas for data analysis), Power BI, Bloomberg."
        )
    },
    {
        "career": "Content Creator",
        "doc": (
            "Content Creator career guide: This career spans YouTube, blogging, podcasting, social media, and copywriting. "
            "Key skills: Storytelling, video editing (Premiere Pro, DaVinci Resolve), SEO, audience analytics, personal branding. "
            "Monetisation: YouTube AdSense, brand sponsorships, Patreon, digital products, affiliate marketing. "
            "Tools: Canva, Adobe Suite, CapCut, ChatGPT for ideation, TubeBuddy for YouTube analytics. "
            "Salary: Highly variable - Rs.0 to Rs.1 Cr+ based on audience size; top creators earn crores annually."
        )
    },
    {
        "career": "Content Creator",
        "doc": (
            "Content Creator roadmap: "
            "Step 1: Pick a niche (tech, finance, education, lifestyle, gaming) and define your audience. "
            "Step 2: Learn the basics of video production or writing - lighting, sound, structure. "
            "Step 3: Publish consistently for 6 months minimum before expecting monetisation. "
            "Step 4: Learn SEO for YouTube or Google - titles, thumbnails, keywords matter enormously. "
            "Step 5: Build multiple income streams - don't rely on one platform alone. "
            "Courses: Coursera Digital Marketing, YouTube Creator Academy (free), Skillshare."
        )
    },
    {
        "career": "Architect",
        "doc": (
            "Architect career path: Architects design buildings, spaces, and urban environments. "
            "Education: 5-year B.Arch degree (mandatory in India), followed by internship and Council of Architecture registration. "
            "Key skills: AutoCAD, Revit (BIM), SketchUp, structural knowledge, design principles, client communication. "
            "Specialisations: Residential, commercial, interior design, urban planning, landscape architecture. "
            "Salary: Rs.3-20 LPA in India, $50K-$120K in USA. Top firms: Zaha Hadid, Gensler, B+S Architects."
        )
    },
    {
        "career": "Architect",
        "doc": (
            "Architect roadmap: "
            "Step 1: Build strong fundamentals in technical drawing, geometry, and design principles. "
            "Step 2: Learn AutoCAD and Revit for 2D drafting and 3D BIM modelling. "
            "Step 3: Develop a design portfolio - 5+ projects showing your aesthetic and technical ability. "
            "Step 4: Complete mandatory internship (1-2 years) under a registered architect. "
            "Step 5: Register with the Council of Architecture (India) or AIA (USA). "
            "Software to master: AutoCAD, Revit, SketchUp, Lumion, Adobe Photoshop for renders."
        )
    },
    {
        "career": "Psychologist",
        "doc": (
            "Psychologist career guide: Psychology covers counselling, clinical, educational, industrial and research branches. "
            "Education: BA/BSc Psychology -> MA/MSc -> MPhil Clinical Psychology (mandatory for clinical practice in India). "
            "Key skills: Empathy, active listening, psychological assessment, CBT, research methodology, report writing. "
            "Certifications: RCI (Rehabilitation Council of India) registration for clinical practice. "
            "Salary: Rs.3-15 LPA (clinical), higher in corporate HR or UX research roles. "
            "Roles: Clinical Psychologist, Counselor, HR Specialist, UX Researcher, School Counselor."
        )
    },
    {
        "career": "Psychologist",
        "doc": (
            "Psychologist roadmap: "
            "Step 1: Study core psychology - personality, abnormal, developmental, social psychology. "
            "Step 2: Learn psychological assessment tools: IQ tests, personality inventories, projective tests. "
            "Step 3: Practice counselling skills through role plays and supervised sessions. "
            "Step 4: Pursue MPhil Clinical Psychology (2 years) for clinical registration in India. "
            "Step 5: Consider specialising in CBT, DBT, EMDR for therapy, or I/O Psychology for corporate roles. "
            "Books: DSM-5, Introduction to Psychology by Atkinson, Theories of Personality by Schultz."
        )
    },
    {
        "career": "Civil Services",
        "doc": (
            "Civil Services (IAS/IPS/IFS) career guide: The UPSC Civil Services Examination is India's most prestigious exam. "
            "Exam pattern: Prelims (objective) -> Mains (9 papers, essay, GS, optional) -> Interview (personality test). "
            "Key skills: Analytical thinking, current affairs, essay writing, leadership, decision making. "
            "Optional subjects: Public Administration, Sociology, Geography, History, Political Science are popular choices. "
            "Preparation time: Typically 1-3 years of dedicated preparation. "
            "Salary: Rs.56,100-Rs.2,50,000 per month (Level 10-17 of 7th Pay Commission) + perks and prestige."
        )
    },
    {
        "career": "Civil Services",
        "doc": (
            "Civil Services preparation roadmap: "
            "Step 1: Read NCERT books (6th to 12th) for all subjects - this is the non-negotiable foundation. "
            "Step 2: Read The Hindu newspaper daily, make notes on current affairs. "
            "Step 3: Study standard books: Laxmikant (Polity), Bipan Chandra (History), Shankar IAS (Environment). "
            "Step 4: Practise previous year question papers and write mock essays and answers weekly. "
            "Step 5: Choose your optional subject early and master it thoroughly. "
            "Resources: InsightsonIndia, ForumIAS, Vision IAS materials are widely used."
        )
    },
    {
        "career": "Doctor",
        "doc": (
            "Doctor (MBBS/MD) career guide: Medicine is one of the most respected and demanding careers globally. "
            "Education path: Clear NEET-UG -> MBBS (5.5 years including internship) -> NEET-PG -> MD/MS specialisation. "
            "Key skills: Diagnostic reasoning, anatomy and physiology knowledge, patient communication, empathy under pressure. "
            "Specialisations: Surgery, Cardiology, Neurology, Paediatrics, Psychiatry, Orthopaedics, Radiology. "
            "Salary: Rs.8-25 LPA (general), Rs.30-80 LPA for senior specialists in India. Globally $150K-$400K+. "
            "Top medical colleges: AIIMS Delhi, CMC Vellore, JIPMER."
        )
    },
    {
        "career": "Doctor",
        "doc": (
            "Doctor roadmap: "
            "Step 1: Clear NEET-UG with a top percentile - needs 2-3 years of dedicated preparation after Class 10. "
            "Step 2: Complete MBBS - focus on understanding, not just memorising. Clinical rotations are critical. "
            "Step 3: Complete your 1-year compulsory rotating internship across specialties. "
            "Step 4: Clear NEET-PG to pursue MD/MS in your chosen specialisation. "
            "Step 5: Consider super-specialisation (DM/MCh) for cardiology, neurology, surgical subspecialties. "
            "Resources: Harrison's Principles of Internal Medicine, Robbins Pathology, First Aid for USMLE (if targeting USA)."
        )
    },
    {
        "career": "Lawyer",
        "doc": (
            "Lawyer career guide: Law covers corporate, criminal, constitutional, family, and intellectual property domains. "
            "Education: Clear CLAT/AILET -> 5-year integrated BA LLB or 3-year LLB after graduation. "
            "Key skills: Legal research, argumentation, drafting contracts and petitions, negotiation, analytical thinking. "
            "Practice areas: Corporate law (highest paying), criminal law, civil litigation, human rights, IP law. "
            "Salary: Rs.3-10 LPA (junior), Rs.30-200 LPA+ for senior corporate lawyers. "
            "Top law schools: NLSIU Bangalore, NALSAR Hyderabad, NLU Delhi. Top firms: AZB, Cyril Amarchand Mangaldas."
        )
    },
    {
        "career": "Lawyer",
        "doc": (
            "Lawyer roadmap: "
            "Step 1: Clear CLAT for NLU admission - focus on Legal Reasoning, English, GK, Maths, Logical Reasoning. "
            "Step 2: During LLB, participate in moot courts, internships at law firms from 2nd year onwards. "
            "Step 3: Build expertise in one area: corporate transactions, criminal litigation, or IP. "
            "Step 4: Enroll with Bar Council of India after degree completion to practise. "
            "Step 5: Consider LLM abroad (Oxford, Harvard, NUS) for international corporate law careers. "
            "Key skills to develop: Contract drafting, legal research on Manupatra and SCC Online, argumentation."
        )
    },
    {
        "career": "Teacher",
        "doc": (
            "Teacher/Professor career guide: Teaching spans school education, college lecturing, coaching, and online education. "
            "Education: B.Ed (mandatory for school teaching in India) or Masters + NET/SET for college lecturing. "
            "Key skills: Subject mastery, communication, lesson planning, empathy, classroom management, patience. "
            "Paths: Government school teacher (TGT/PGT via state PSC), private school, college lecturer (UGC-NET), EdTech. "
            "Salary: Rs.3-8 LPA government school, Rs.8-25 LPA college professor, Rs.10-50 LPA EdTech/online education. "
            "Emerging opportunity: Online teaching on Unacademy, BYJU's, YouTube is highly lucrative."
        )
    },
    {
        "career": "Teacher",
        "doc": (
            "Teacher roadmap: "
            "Step 1: Complete your undergraduate and postgraduate degree in your chosen subject. "
            "Step 2: Pursue B.Ed (2 years) for school teaching eligibility in India. "
            "Step 3: Clear CTET/STET for government school positions, or UGC-NET for college lectureships. "
            "Step 4: Build communication and content delivery skills - record yourself teaching and review it. "
            "Step 5: Consider building an online presence (YouTube channel, Unacademy profile) for reach and income. "
            "Key traits: Patience, adaptability, love for your subject, and genuine care for student growth."
        )
    },
]

# ─────────────────────────────────────────────────────────────────
# Pre-compute Embeddings
# ─────────────────────────────────────────────────────────────────

doc_texts = [item["doc"] for item in knowledge_base]
doc_embeddings = embedder.encode(doc_texts)
print(f"RAG knowledge base ready: {len(knowledge_base)} documents across 16 careers.")


# ─────────────────────────────────────────────────────────────────
# Retrieval Function
# ─────────────────────────────────────────────────────────────────

def retrieve_context(query, top_k=2, threshold=0.15):
    """
    Retrieve the most relevant career documents for a given query.

    Args:
        query: User's question + career context string
        top_k: Number of documents to return
        threshold: Minimum cosine similarity score

    Returns:
        str: Concatenated relevant document text
    """
    query_embedding = embedder.encode([query])
    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]
    top_indices = np.argsort(similarities)[-top_k:][::-1]

    retrieved = []
    for idx in top_indices:
        if similarities[idx] > threshold:
            retrieved.append(knowledge_base[idx]["doc"])

    return "\n\n".join(retrieved)


# ─────────────────────────────────────────────────────────────────
# Quick test
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n--- Test RAG retrieval ---")
    result = retrieve_context("What courses should I take for AI and machine learning?")
    print(result[:400], "...")
    print("\n--- Test for Cybersecurity ---")
    result2 = retrieve_context("How do I start a career in cybersecurity?")
    print(result2[:400], "...")
