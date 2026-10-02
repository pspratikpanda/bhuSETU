# bhuSETU — Step 6: Cloud Infrastructure, Security Hardening & CI/CD

## 🔁 Deployment & Security Status: ✅ STEP 6 COMPLETE — ALL SUB-TASKS DONE

```
Sub-task 6.1 — Multi-stage Backend Dockerfile           : DONE ✅
Sub-task 6.2 — Multi-stage Frontend Dockerfile          : DONE ✅
Sub-task 6.3 — Nginx SPA routing & API/WS reverse proxy  : DONE ✅
Sub-task 6.4 — Docker Compose container orchestration    : DONE ✅
Sub-task 6.5 — Backend Helmet security headers          : DONE ✅
Sub-task 6.6 — API Rate limiting middleware (express)   : DONE ✅
Sub-task 6.7 — GitHub Actions CI/CD Pipeline workflow   : DONE ✅
Sub-task 6.8 — Production deployment documentation      : DONE ✅
```

---

## 1. Containerization Architecture

### Multi-Stage Frontend Container (`frontend/Dockerfile`)
- Uses Node.js 20 Alpine for Vite production bundling (`npm run build`).
- Serves static assets using high-performance `nginx:alpine`.
- Configures clean SPA route fallback via `nginx.conf` (`try_files $uri $uri/ /index.html`).
- Sets up reverse proxying for REST API (`/api/`) and WebSocket connections (`/socket.io/`).

### Multi-Stage Backend Container (`backend/Dockerfile`)
- Uses Node.js 20 Alpine runtime.
- Executes under a non-root system user (`bhusetu`).
- Exposes port 5000 with Docker healthchecks querying `GET /api/v1/health`.
- Persists file-backed database to a Docker volume mount (`bhusetu-data`).

### Container Orchestration (`docker-compose.yml`)
```bash
# Build and run the entire bhuSETU stack in production mode:
docker compose up --build -d
```
- **Backend Service**: Port `5000`
- **Frontend Service**: Port `8080` (Proxies requests to backend via bridge network `bhusetu-network`)

---

## 2. Security Hardening Measures

1. **HTTP Security Headers**: Installed and configured `helmet` in `backend/src/server.js` enforcing `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
2. **DDoS & Brute-Force Rate Limiting**: Implemented `express-rate-limit` restricting requests to 300 per 15-minute window per IP for `/api/` routes.
3. **Non-Root Execution**: Backend Docker image runs under isolated unprivileged user `bhusetu`.
4. **Clean Asset Caching**: Configured 30-day static asset browser caching headers in Nginx.

---

## 3. Continuous Integration & CD Workflow

- Added GitHub Actions pipeline `.github/workflows/ci.yml`.
- Automates code checkout, dependency installation, Vite frontend build verification, backend seed testing, and Docker image build tests on every push/PR.
