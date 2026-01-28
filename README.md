# ADS Studio | Unified Design Suite

ADS Studio is a high-performance, AI-driven marketing design suite designed for senior engineers and creative directors. It consolidates brand identity, process visualization, and promotional campaign creation into a single, cohesive workspace powered by the latest Gemini AI models.

## 🚀 Core Engines

### 1. Mark Engine (Identity Synthesis)
Synthesize professional brand marks and logos using advanced vector-style generation.
- **Style Archetypes:** Choose from Minimalist, Vintage, 3D Isometric, and Corporate.
- **Brand Context:** Input industry and vision to get tailored results.
- **Export Ready:** One-click download for high-resolution brand assets.

### 2. Blueprint Engine (Process Architecture)
Transform raw data, project notes, or documentation into stunning architectural visualizations.
- **Diverse Aesthetics:** 
  - *Organic Blueprint:* Smooth, curved paths for fluid workflows.
  - *Cyber Workflow:* Grid-based, tech-heavy schematic with terminal-style logs.
  - *Clean Architecture:* Minimalist box-and-line layouts for enterprise clarity.
  - *Hand-Drawn Schematic:* Sketchy, whiteboard-style organic mapping.
- **Data Ingestion:** Upload `.txt`, `.md`, or provide URLs to generate complex process maps.
- **PNG Export:** High-resolution capture of your generated architecture.

### 3. Promo Engine (Campaign Studio)
Create production-grade advertising flyers and social media content.
- **Visual Intelligence:** Upload reference images (logos/brand assets) to steer the aesthetic direction.
- **Platform Optimized:** Tailored layouts for Instagram (Post/Story), YouTube, and Facebook.
- **Aesthetic Flexibility:** Select from Neo-Brutalism, Glassmorphism, Retro-Future, and more.

## 🛠 Technical Architecture

- **Frontend:** React 19 (ES6 Modules)
- **Styling:** Tailwind CSS (Dark Mode first)
- **AI Core:** Google Gemini SDK (`@google/genai`)
  - `gemini-3-flash-preview` for high-speed logic and text refinement.
  - `gemini-2.5-flash-image` for high-fidelity visual asset generation.
- **Persistence:** Local Storage API for project history and session recovery.

## 📦 Project Persistence & Saving

The "Save" function captures the entire state of your active workspace:
- **Automatic History:** Your last 10 projects are stored locally.
- **State Recovery:** Clicking a historical project restores the prompt, style selection, and generated assets.
- **Naming:** Custom naming conventions for easy organization.

## 🔧 Setup

1. Ensure the `API_KEY` is configured in the environment.
2. The application uses ESM imports via `esm.sh` for a zero-build-step local environment.
3. Access the **Settings** module to manage LLM endpoints and creativity parameters.

---
*Created by Afflicted.ai @2026*.