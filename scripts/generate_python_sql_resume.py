from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PDF_PATH = OUT_DIR / "Jeya_Saravanan_Python_SQL_Resume.pdf"
ANALYSIS_PATH = OUT_DIR / "Jeya_Saravanan_Python_SQL_Resume_Analysis.md"

GITHUB_URL = "https://github.com/Jeyasaravanan18"
LINKEDIN_URL = "https://www.linkedin.com/in/jeya-saravanan-87ab47286/"
PORTFOLIO_URL = "https://portfolio-alpha-brown-44.vercel.app/"
LOGISTICS_URL = "https://github.com/Jeyasaravanan18/Logistics_Disruption_Intelligence_Agent"
CAIRA_URL = "https://github.com/Jeyasaravanan18/c-aira-incident-assistant"


def register_verdana() -> None:
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Verdana", str(font_dir / "verdana.ttf")))
    pdfmetrics.registerFont(TTFont("Verdana-Bold", str(font_dir / "verdanab.ttf")))


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text.replace("&", "&amp;"), style)


def bullet(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(f"• {text}".replace("&", "&amp;"), style)


def section(story: list, title: str, style: ParagraphStyle) -> None:
    story.append(Spacer(1, 4.5))
    story.append(p(title, style))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.45,
            color=colors.HexColor("#b8b8b8"),
            spaceBefore=0,
            spaceAfter=4.6,
        )
    )


def build_resume() -> None:
    register_verdana()
    styles = getSampleStyleSheet()

    base = ParagraphStyle(
        "Base",
        parent=styles["Normal"],
        fontName="Verdana",
        fontSize=10.0,
        leading=12.25,
        textColor=colors.black,
        spaceAfter=0,
    )
    name = ParagraphStyle(
        "Name",
        parent=base,
        fontName="Verdana-Bold",
        fontSize=16,
        leading=17.2,
        alignment=0,
        spaceAfter=0,
    )
    contact = ParagraphStyle(
        "Contact",
        parent=base,
        fontSize=8.45,
        leading=9.8,
        alignment=0,
        spaceAfter=0.5,
    )
    heading = ParagraphStyle(
        "Heading",
        parent=base,
        fontName="Verdana-Bold",
        fontSize=10.2,
        leading=11.2,
        spaceBefore=0,
        spaceAfter=0,
        borderWidth=0,
        borderPadding=0,
        textTransform="uppercase",
    )
    role = ParagraphStyle(
        "Role",
        parent=base,
        fontName="Verdana-Bold",
        fontSize=9.55,
        leading=11.75,
        spaceBefore=0,
    )
    small = ParagraphStyle(
        "Small",
        parent=base,
        fontSize=9.2,
        leading=11.25,
        textColor=colors.HexColor("#222222"),
    )
    bstyle = ParagraphStyle(
        "Bullet",
        parent=base,
        leftIndent=7,
        firstLineIndent=-6,
        fontSize=9.2,
        leading=11.45,
        spaceAfter=1.25,
    )
    skill_label = ParagraphStyle(
        "SkillLabel",
        parent=small,
        fontName="Verdana-Bold",
        leftIndent=0,
    )
    meta = ParagraphStyle(
        "Meta",
        parent=small,
        fontSize=8.75,
        leading=10.75,
        textColor=colors.HexColor("#111111"),
    )

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=0.58 * inch,
        leftMargin=0.58 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.42 * inch,
        title="Jeya Saravanan R - Python SQL Resume",
        author="Jeya Saravanan R",
    )

    story = []
    story.append(p("Jeya Saravanan R", name))
    story.append(p("Python + SQL Developer | Flask | Django | SQL | REST APIs | Docker | AWS", contact))
    story.append(
        p(
            "sarjeya18@gmail.com | +91 93455 02563 | Tamil Nadu, India | "
            f"<link href='{GITHUB_URL}' color='black'>github.com/Jeyasaravanan18</link> | "
            f"<link href='{LINKEDIN_URL}' color='black'>LinkedIn</link> | "
            f"<link href='{PORTFOLIO_URL}' color='black'>Portfolio</link>",
            contact,
        )
    )

    section(story, "PROFESSIONAL SUMMARY", heading)
    story.append(
        p(
            "Backend-focused software engineer targeting Python + SQL roles, with hands-on experience building REST APIs, database-backed services, AI-assisted workflows, and containerized applications. Skilled in Python, SQL, Flask, Django, FastAPI, PostgreSQL, MySQL, Redis, Docker, AWS, API testing, and backend system design. Strong foundation in DBMS, data structures, algorithms, Linux, Git, authentication, and production-style API development.",
            base,
        )
    )

    section(story, "TECHNICAL SKILLS", heading)
    skills = [
        ("Languages", "Python, SQL, JavaScript, Java, C++, HTML, CSS"),
        ("Python Frameworks", "Flask, Django, FastAPI, Streamlit, Pydantic"),
        ("Databases", "PostgreSQL, MySQL, SQLite, MongoDB, SQLAlchemy, database design, indexing, query optimization"),
        ("Backend and APIs", "REST APIs, WebSockets, JWT authentication, RBAC, API testing, Postman, input validation"),
        ("Cloud and DevOps", "AWS, AWS Bedrock, Docker, Docker Compose, Redis, Celery, GitHub Actions, CI/CD, Linux"),
        ("Python Libraries", "Pandas, FAISS, Requests, Boto3, NumPy, python-dotenv"),
        ("Tools and Methods", "Git, GitHub, Swagger/OpenAPI, Nginx, Agile/Scrum, debugging, code review"),
    ]
    for label, value in skills:
        story.append(p(f"<b>{label}:</b> {value}", small))

    section(story, "EXPERIENCE", heading)
    story.append(p("Web Development Intern - Prodigy Infotech (Virtual Program)", role))
    story.append(p("Jun 2025 - Jul 2025 | React.js, Node.js, Express.js, MongoDB, REST APIs, Postman", meta))
    story.append(
        bullet(
            "Integrated REST APIs, tested endpoints in Postman, and resolved 15+ UI/backend defects across React, Node.js, Express.js, and MongoDB features.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Designed MongoDB schemas for 3 core data models with indexing considerations, improving query response time by approximately 25% in project testing.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Built 8+ reusable React components and improved responsive layouts across 10+ pages while collaborating in an Agile-style virtual program.",
            bstyle,
        )
    )

    section(story, "PROJECTS", heading)
    story.append(
        p(
            f"Logistics Disruption Intelligence Agent | <link href='{LOGISTICS_URL}' color='black'>GitHub</link>",
            role,
        )
    )
    story.append(p("Python · FastAPI · PostgreSQL · SQLAlchemy · Redis · Celery · Docker Compose · WebSockets · REST APIs", meta))
    story.append(
        bullet(
            "Engineered FastAPI backend exposing shipment, disruption, and risk-analysis APIs with async SQLAlchemy sessions, PostgreSQL Docker service, and SQLite local fallback.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Designed shipment data model with indexed primary keys, seeded 15 route records, and built query functions for paginated shipment lookup and ID-based retrieval.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Implemented 4-agent pipeline for weather/news collection, disruption analysis, Haversine route-risk scoring, and AI recommendations with Redis result caching.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Containerized API, workers, PostgreSQL, Redis, and dashboard with Docker Compose; added WebSocket risk updates through Redis pub/sub and OpenAPI docs.",
            bstyle,
        )
    )

    story.append(
        p(
            f"C-AIRA Incident Response Assistant | <link href='{CAIRA_URL}' color='black'>GitHub</link>",
            role,
        )
    )
    story.append(p("Python · AWS Bedrock · Streamlit · Pandas · FAISS · Boto3 · GitHub Status API · RAG", meta))
    story.append(
        bullet(
            "Built a Python RAG assistant that retrieves incident reports, runbooks, logs, and CSV analytics before generating AWS Bedrock responses with source attribution.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Developed Pandas analytics over 136 incident records, including severity distribution, monthly trends, weighted average resolution time, and similar-incident search.",
            bstyle,
        )
    )
    story.append(
        bullet(
            "Integrated GitHub Status API and Streamlit dashboards for live operations visibility, query history, response metrics, and incident insight reporting.",
            bstyle,
        )
    )

    section(story, "EDUCATION", heading)
    story.append(
        p(
            "<b>B.E. Computer Science and Engineering - National Engineering College, Kovilpatti</b>",
            base,
        )
    )
    story.append(
        p(
            "2023 - 2027 | GPA: 7.69 | Relevant coursework: Data Structures and Algorithms, DBMS, Software Engineering, Cloud Computing, Operating Systems, Computer Networks, OOP",
            meta,
        )
    )

    section(story, "CERTIFICATIONS", heading)
    story.append(
        bullet("Oracle Cloud Infrastructure Foundations - Oracle (2025)", bstyle)
    )
    story.append(
        bullet("MongoDB Basics - MongoDB University (2025)", bstyle)
    )
    story.append(
        bullet("AWS Solutions Architecture Job Simulation - Forage (2025)", bstyle)
    )

    doc.build(story)


def write_analysis() -> None:
    text = """# Jeya Saravanan R - Python + SQL Resume Analysis

## ATS Score Estimate
Estimated ATS match for fresher Python + SQL / backend roles: 82/100.

The score is strong because the resume now contains Python, SQL, PostgreSQL, MySQL, FastAPI, Flask, REST APIs, SQLAlchemy, Redis, Docker, AWS, Linux, Git, CI/CD, API testing, authentication, database design, indexing, and query optimization keywords. It is held back by limited verified Flask work, limited production SQL depth, and only one clearly SQL-backed public project.

## Optimized Project Bullet Points
Logistics Disruption Intelligence Agent:
- Engineered FastAPI backend exposing shipment, disruption, and risk-analysis APIs with async SQLAlchemy sessions, PostgreSQL Docker service, and SQLite local fallback.
- Designed shipment data model with indexed primary keys, seeded 15 route records, and built query functions for paginated shipment lookup and ID-based retrieval.
- Implemented 4-agent pipeline for weather/news collection, disruption analysis, Haversine route-risk scoring, and AI recommendations with Redis result caching.
- Containerized API, workers, PostgreSQL, Redis, and dashboard with Docker Compose; added WebSocket risk updates through Redis pub/sub and OpenAPI docs.

C-AIRA Incident Response Assistant:
- Built a Python RAG assistant that retrieves incident reports, runbooks, logs, and CSV analytics before generating AWS Bedrock responses with source attribution.
- Developed Pandas analytics over 136 incident records, including severity distribution, monthly trends, weighted average resolution time, and similar-incident search.
- Integrated GitHub Status API and Streamlit dashboards for live operations visibility, query history, response metrics, and incident insight reporting.

## Resume Strengths
- Stronger Python + backend positioning than the original MERN-focused resume.
- Verified GitHub evidence for Python, FastAPI, PostgreSQL, SQLAlchemy, Redis, Docker, AWS Bedrock, Streamlit, Pandas, and API integrations.
- Includes Flask and Django based on stated skill knowledge, while avoiding unsupported claims that these are deployed GitHub projects.
- Recruiter-readable one-page format with no tables, columns, icons, or graphics.
- Strong fresher backend keywords: REST APIs, DBMS, indexing, query optimization, Docker, Redis, Linux, Git, CI/CD, authentication.

## Resume Weaknesses
- Public GitHub has limited verified Flask code; FastAPI is stronger than Flask in the current portfolio.
- Only one public project shows PostgreSQL/SQLAlchemy; SQL credibility would improve with more query-heavy work.
- Current public GitHub has stronger FastAPI evidence than Flask/Django evidence.
- GitHub repos have low stars/forks and limited visible testing/CI evidence.

## Missing Skills For Python + SQL Roles
- Advanced SQL joins, window functions, CTEs, transactions, isolation levels, stored procedures, and query plans.
- Flask with Blueprints, SQLAlchemy ORM, Alembic migrations, authentication, and production deployment.
- PostgreSQL-specific skills: EXPLAIN ANALYZE, indexes, constraints, views, materialized views, JSONB, and connection pooling.
- Unit/integration tests for Python APIs with pytest and test databases.

## Suggested Projects To Build Next
- Flask + PostgreSQL REST API for inventory/order management with JWT, RBAC, Alembic migrations, pytest, Docker, and Swagger docs.
- SQL analytics dashboard using PostgreSQL, complex joins, CTEs, window functions, query optimization, and indexed reporting tables.
- ETL pipeline in Python that ingests CSV/API data into PostgreSQL, validates records, schedules jobs, and exposes analytics APIs.
- Redis-backed rate-limited URL shortener or job queue system using Flask/FastAPI, PostgreSQL, Docker Compose, and CI tests.

## SQL Topics To Improve
- Joins, subqueries, CTEs, window functions, GROUP BY/HAVING, indexing strategy, normalization, constraints, transactions, deadlocks, query optimization, EXPLAIN plans, stored procedures, views, and schema migration.

## GitHub Improvement Suggestions
- Add clean screenshots, architecture diagrams, API examples, and database schema diagrams to READMEs.
- Add pytest/Jest test commands and GitHub Actions badges.
- Add seed data, `.env.example`, Docker quick start, and sample API responses for every backend project.
- Pin the best 3 repos and update the profile bio to say Python + SQL Backend Developer.
- Add a dedicated Flask + PostgreSQL repo because target roles specifically mention Flask.

## Interview Topics Recruiters May Ask
- FastAPI vs Flask, REST API design, status codes, pagination, validation, and OpenAPI docs.
- SQL joins, indexing, query optimization, normalization, transactions, and PostgreSQL vs MySQL.
- SQLAlchemy ORM models, async sessions, migrations, and connection handling.
- Redis caching, pub/sub, Celery background jobs, Docker Compose, and deployment basics.
- JWT authentication, RBAC, API security, rate limiting, and input validation.
- Python data handling with Pandas and RAG architecture tradeoffs.

## Suggestions To Increase Recruiter Shortlisting
- Put Python + SQL in the headline, GitHub bio, LinkedIn headline, and top project names.
- Build and pin one polished Flask + PostgreSQL project within 1-2 weeks.
- Add SQL query examples and database schema screenshots to project READMEs.
- Replace generic frontend-heavy bullets with backend/database impact bullets.
- Apply to Python Developer, Backend Developer, SQL Developer, API Developer, and Junior Software Engineer roles with the same resume base.
"""
    ANALYSIS_PATH.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    build_resume()
    write_analysis()
    print(PDF_PATH)
    print(ANALYSIS_PATH)
