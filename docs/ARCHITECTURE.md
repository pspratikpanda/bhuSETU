# Architecture

## Current frontend

The Vite application uses React with JavaScript/JSX. `App.jsx` declares React Router routes, layouts in `components/layout` provide navigation and the service pages in `pages` compose reusable UI from `components`. Fictional local records live in `frontend/src/data`; pages should call modules in `frontend/src/services` rather than embed records. `services/api/client.js` configures the future Axios client but does not contact a running API. Demo sign-in role selection and status actions are explicitly local prototype behavior.

## Planned system boundaries

The future Express API owns authorization, workflow transitions, records and audit history. PostgreSQL/PostGIS stores authoritative records and spatial geometry. A separately deployed FastAPI service may provide AI-assisted extraction and indicators. The frontend consumes documented API contracts and displays source and review status.

## Data flow

Citizen or officer UI → frontend service module → planned authenticated API → domain service → PostgreSQL/PostGIS or authorized external department integration. AI tasks are requested through a backend-controlled service boundary; the browser does not hold model keys. Notifications can later arrive through an authenticated Socket.IO connection.

Nothing after the frontend mock-data boundary is implemented in this repository yet.
