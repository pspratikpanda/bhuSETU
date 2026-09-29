# Bhu Setu — National Integrated Land Governance Platform

**SIH-26014 · Connecting Land, People & Governance**

Bhu Setu is a frontend-first prototype for bringing land records, parcel maps, department verification, citizen applications and risk indicators into one ULPIN-centric experience. This repository provides the React interface, fictional demo data, mock-backed service boundaries and implementation plans for the future services. It does not provide production authentication, backend APIs, an AI service or a database.

## Prototype capabilities

- Citizen and government officer workspaces with role-based demo navigation.
- ULPIN and location search, parcel map, land intelligence profiles, ownership and RoR views.
- Mutation application and officer review journeys, document verification, grievances and disputes.
- AI-assisted risk indicators, department conflict review, notifications and analytics.
- Responsive layouts and reusable interface components.

All names, parcel identifiers, metrics and records shown in the prototype are fictional. Risk indicators are informational prototype content, not legal determinations.

## Technology

React, JavaScript/JSX, Vite, Tailwind CSS, React Router, React Leaflet/Leaflet, Recharts, Lucide React, Axios and React Hook Form. The future backend is planned with Node.js, Express, JWT, PostgreSQL/PostGIS and Socket.IO. A separate Python/FastAPI service may provide OCR and analytical capabilities later.

## Architecture and repository structure

```text
frontend/       Vite application, components, pages, demo data and services
backend/        Planned Express API boundary (documentation only)
ai-service/     Planned Python/FastAPI AI boundary (documentation only)
database/       Planned PostgreSQL/PostGIS schema notes (documentation only)
gis/            Planned GIS data and integration notes
docs/           Architecture, API, data, GIS, AI and contribution plans
```

UI pages call service modules; service modules currently return local mock data and isolate the future API integration point. Mock records live under `frontend/src/data`. This is JavaScript-only: React components use `.jsx`, modules use `.js`; no TypeScript configuration or source files are used.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. The demo can also be built with `npm run build` and previewed with `npm run preview`.

## Environment variables

See `frontend/.env.example`. Values are blank placeholders; do not commit secrets. `VITE_API_BASE_URL` will be used when a real API is available, `VITE_MAP_TILE_URL` can configure a tile provider, and `VITE_CLOUDINARY_CLOUD_NAME` is a future upload integration setting.

## Development workflow

Work in `frontend/src`; keep data access in `services/`, demo records in `data/`, and reusable presentation in `components/`. Add routes through the central router and keep citizen/officer navigation consistent. Run `npm run build` before sharing a change. Keep UI language clear that mock behavior and AI results are demonstrations.

Suggested branching: `main` for stable demos, short-lived `feature/<area>` branches, and pull requests with screenshots or route notes for UI changes. Coordinate API contracts in `docs/API.md` before backend integration.

## Integration plans

- **API:** Future endpoints are marked `PROPOSED API` in `docs/API.md`; none are currently implemented.
- **Database:** PostgreSQL/PostGIS entities and relationships are outlined in `docs/DATABASE.md` and `database/README.md`.
- **GIS:** GeoJSON prototype parcels are local. Production boundary validation, tile sources and GIS APIs are future work described in `docs/GIS.md`.
- **AI:** OCR, extraction and anomaly scoring are future capabilities; the interface uses labeled fictional examples. See `docs/AI.md`.
- **Deployment:** Build the static frontend and host it behind the selected deployment platform; configure API and tile URLs at deploy time. Add backend/AI services separately when they exist.

## Future scope

Connect verified department data, real identity and JWT authorization, auditable workflows, PostGIS boundary services, document storage and review, consent-aware notifications, and validated AI-assisted checks. Every production integration requires security, accessibility, privacy and operational review.

## Contributors

SIH student team — add team member names and roles here.
