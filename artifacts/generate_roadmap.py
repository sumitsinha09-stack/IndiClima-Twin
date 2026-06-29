import os
from datetime import datetime
from fpdf import FPDF

class RoadmapPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(14, 165, 233) # Sky Blue
        self.cell(0, 10, "CLIMATETWIN INDIA - ARCHITECTURAL BLUEPRINT & ROADMAP", border=0, align="R")
        self.set_draw_color(14, 165, 233)
        self.line(10, 18, 200, 18)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}} | System Architecture Reference Blueprint", border=0, align="C")

def create_roadmap_pdf(output_path: str):
    pdf = RoadmapPDF()
    pdf.alias_nb_pages()
    
    # ─── PAGE 1: TITLE & TECH STACK ──────────────────────────────────────────
    pdf.add_page()
    pdf.set_text_color(51, 65, 85) # Slate-700
    
    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 15, "ClimateTwin India: Architectural Blueprint", ln=True, align="L")
    pdf.set_font("Helvetica", "I", 10)
    pdf.cell(0, 5, "A step-by-step roadmap for manual monorepo development from scratch", ln=True, align="L")
    pdf.ln(8)
    
    # 1. Project Planning & Concept
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "1. Project Planning & Conception", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, 
        "ClimateTwin India is a digital twin command center designed to monitor regional climate data, "
        "model localized risk indices (floods, droughts, heatwaves, and UHI index), and run parametric "
        "simulations for disaster management and Clean Energy forecasting. The codebase is organized "
        "as a type-safe TypeScript/Python monorepo."
    )
    pdf.ln(5)
    
    # 2. Technology Stack
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "2. Tech Stack Selection", ln=True)
    
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(40, 7, "Layer", border=1, fill=True)
    pdf.cell(150, 7, "Technologies Used", border=1, fill=True, ln=True)
    pdf.set_font("Helvetica", "", 9)
    
    tech_stack = [
        ("Monorepo Orchestrator", "PNPM Workspaces (manages dependencies, builds, and library linkings)"),
        ("Database Layer", "PostgreSQL (Relational data storage) + Drizzle ORM (schema/migrations)"),
        ("Backend REST APIs", "Python FastAPI (async routes, Pydantic type safety, fast runtime)"),
        ("Frontend Web App", "React v18 + Vite (fast builder) + TailwindCSS (styling layout)"),
        ("Client Typings", "Orval (Codegen typescript client hooks & zod validators from OpenAPI spec)"),
        ("AI / LLM Integration", "Google Gemini 2.5 Flash API (live telemetry context-aware advice)"),
    ]
    for layer, tech in tech_stack:
        pdf.cell(40, 7, layer, border=1)
        pdf.cell(150, 7, tech, border=1, ln=True)
    pdf.ln(8)

    # 3. End-to-End Data Flow Diagram
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "3. System Architecture & E2E Data Flow", ln=True)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "Data flow pathway:", ln=True)
    
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_fill_color(248, 250, 252)
    flow_diagram = (
        "  [ React UI (Client) ]\n"
        "           |   ^ (TanStack React Query GET / POST)\n"
        "           v   |\n"
        "  [ FastAPI Backend (Python Router) ]\n"
        "           |   ^ (SQLAlchemy AsyncSession)\n"
        "           v   |\n"
        "  [ PostgreSQL Database (Current Telemetry) ]\n"
        "           |\n"
        "           +---> (Gemini API Prompt Injection: Telemetry + User Input)\n"
        "           |\n"
        "           v\n"
        "  [ Generative AI Reply (Dynamic Context-Aware Recommendation) ]"
    )
    pdf.multi_cell(0, 5, flow_diagram, border=1, fill=True)

    # ─── PAGE 2: FOLDER STRUCTURE & DATABASE SCHEMA ──────────────────────────
    pdf.add_page()
    
    # 4. Monorepo Folder Directory Structure
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "4. Workspace Folder Structure Layout", ln=True)
    pdf.set_font("Helvetica", "", 9)
    
    dir_structure = (
        "climatetwin-root/\n"
        "|-- package.json                   # Workspaces settings & root typecheck runner\n"
        "|-- pnpm-workspace.yaml            # Monorepo packages mapping\n"
        "|-- lib/\n"
        "|   |-- api-spec/                  # OpenAPI spec repository (openapi.yaml)\n"
        "|   |-- api-client-react/          # Codegen react-query fetch hooks\n"
        "|   `-- api-zod/                   # Codegen zod validation schemas\n"
        "|-- backend/\n"
        "|   |-- app/\n"
        "|   |   |-- api/endpoints/         # FastAPI endpoint controllers (climate, scenarios, energy)\n"
        "|   |   |-- database/              # PostgreSQL db connection and session helpers\n"
        "|   |   |-- models/                # SQLAlchemy database model models (base.py)\n"
        "|   |   `-- schemas/               # Pydantic schemas validation models\n"
        "|   |-- verify_endpoints.py        # Backend API validation suite\n"
        "|   `-- requirements.txt           # Python dependency file\n"
        "`-- artifacts/\n"
        "    `-- climate-twin/              # Vite + React frontend dashboard web app\n"
        "        |-- src/\n"
        "        |   |-- components/        # Shared components (layout, sidebar, theme-provider)\n"
        "        |   `-- pages/             # Dashboard modules (dashboard, simulator, energy, disasters)\n"
        "        `-- vite.config.ts         # Vite builder config with proxy settings\n"
    )
    pdf.multi_cell(0, 4.5, dir_structure, border=1, fill=True)
    pdf.ln(5)

    # 5. Database Schema & Tables
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "5. Database Schema & Models Configuration", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, 
        "The PostgreSQL instance stores current climate snapshots and command summary stats. "
        "SQLAlchemy schemas map these models to async sessions."
    )
    pdf.ln(3)

    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(50, 7, "Table: climate_snapshots", border=1, fill=True)
    pdf.cell(140, 7, "Fields & Types", border=1, fill=True, ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(50, 7, "id", border=1)
    pdf.cell(140, 7, "Integer, Primary Key (serial)", border=1, ln=True)
    pdf.cell(50, 7, "temperature, humidity", border=1)
    pdf.cell(140, 7, "Float, representing active sensors values", border=1, ln=True)
    pdf.cell(50, 7, "aqi, forest_fire_risk", border=1)
    pdf.cell(140, 7, "Integer indices", border=1, ln=True)
    pdf.cell(50, 7, "recorded_at", border=1)
    pdf.cell(140, 7, "DateTime, defaults to timezone.utc", border=1, ln=True)
    pdf.ln(5)

    # ─── PAGE 3: DEVELOPMENT SEQUENCE ROADMAP ────────────────────────────────
    pdf.add_page()
    
    # 6. Step-by-Step Development Sequence
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "6. Step-by-Step Development Roadmap", ln=True)
    
    roadmap_steps = [
        ("Step 1: Monorepo Bootstrapping", 
         "Initialize PNPM workspaces. Define the root package.json and pnpm-workspace.yaml. "
         "Set up TypeScript configuration files and base path mappings."),
         
        ("Step 2: Database Setup & Seed", 
         "Provision PostgreSQL db. Create database schema tables via Drizzle/SQLAlchemy. "
         "Write and execute seeds script to populate initial regional baseline climate data."),
         
        ("Step 3: OpenAPI Spec Drafting", 
         "Draft openapi.yaml defining all required endpoints (/climate/current, /scenarios/simulate, "
         "/agriculture/chat, /energy/dashboard, /reports/download). Run client codegen compiling React hooks."),
         
        ("Step 4: FastAPI Backend Controllers", 
         "Implement models, schemas, and endpoint routers in Python. Setup async db connection sessions. "
         "Write parametric simulation formulas, AI chatbot controllers, and FPDF PDF reports streams."),
         
        ("Step 5: React Frontend Assembly", 
         "Initialize Vite React app inside workspaces. Create Sidebar layout with router wrapper. "
         "Build individual pages (dashboard, disasters, agriculture, energy, simulator) hooking up React Query."),
         
        ("Step 6: Dark/Light Theme Switching", 
         "Construct stateful ThemeProvider persisting theme (dark/light) in localStorage. "
         "Add class overrides in index.css. Create header toggle switcher button."),
         
        ("Step 7: Global AI Chatbot Integration", 
         "Create global-chatbot.tsx widget. Setup backend router calling Google Gemini API "
         "injecting db telemetry context. Mount widget inside layout container."),
    ]
    
    for title, desc in roadmap_steps:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, f"* {title}", ln=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5, desc)
        pdf.ln(3)

    # ─── PAGE 4: APIS, TESTING, DEPLOYMENT & CHECKLIST ───────────────────────
    pdf.add_page()
    
    # 7. Third-Party API integrations
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "7. API Integrations Specifications", ln=True)
    pdf.set_font("Helvetica", "", 9)
    
    apis_info = [
        ("Google Gemini API", "POST https://generativelanguage.googleapis.com/... Generates telemetry-aware advisory recommendations. Auth via query parameter key."),
        ("Telemetry Sensor API", "GET /api/climate/current. Fetches local PostgreSQL data, applies random jitter to simulate active sensors."),
        ("Reports Downloader", "GET /api/reports/download. Compiles active simulation inputs/outputs into a binary PDF file via FPDF."),
    ]
    for name, spec in apis_info:
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(40, 6, name, border=1)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(150, 6, spec, border=1, ln=True)
    pdf.ln(5)

    # 8. Testing & Deployment Strategy
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "8. Verification, Testing & Deployment", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, 
        "Verification: Run full monorepo typecheck to confirm compilation. Execute verify_endpoints.py to validate API routers.\n"
        "Deployment: Dockerize backend API app. Deploy database on RDS. Build and host React static files on S3/Vercel with Vite proxy configured."
    )
    pdf.ln(5)

    # 9. Complete Checklist from Start to Finish
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "9. End-to-End Development Checklist", ln=True)
    
    checklist_items = [
        "[ ] Stage 1: Setup pnpm-workspace.yaml & root configurations.",
        "[ ] Stage 2: Provision PostgreSQL database and run SQL seed scripts.",
        "[ ] Stage 3: Write openapi.yaml contract and execute client compiler codegen.",
        "[ ] Stage 4: Build FastAPI async routes & setup database models.",
        "[ ] Stage 5: Design Vite+React layout & dashboard modules.",
        "[ ] Stage 6: Integrate FPDF engine to generate binary reports.",
        "[ ] Stage 7: Implement ThemeProvider context & light/dark theme variables.",
        "[ ] Stage 8: Code Gemini API client integration and mount floating chatbot.",
        "[ ] Stage 9: Execute verify_endpoints.py validation suite & compile bundle.",
    ]
    
    pdf.set_fill_color(248, 250, 252)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "Task Checklist Matrix:", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.multi_cell(0, 5.5, "\n".join(checklist_items), border=1, fill=True)

    # Write out file
    pdf.output(output_path)

if __name__ == "__main__":
    out = "/Users/sumitsinha/Documents/IndiClima Twin/artifacts/ClimateTwin_Manual_Build_Roadmap.pdf"
    create_roadmap_pdf(out)
    print("PDF Successfully Generated.")
