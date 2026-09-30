# bhuSETU — Step 5: Socket.IO WebSocket Engine & Event Bus
## 🔁 AI Resumption Guide
> **If token expired mid-implementation**, read this file top-to-bottom before doing anything.
> Check the `CURRENT STATUS` block, find the first task marked NOT STARTED, and resume from there.
> All file paths, decisions, and context are documented below.

---

## CURRENT STATUS: ✅ STEP 5 COMPLETE — ALL SUB-TASKS DONE

```
Sub-task 5.1 — Install Socket.IO packages             : DONE ✅
Sub-task 5.2 — Upgrade server.js to createServer/io   : DONE ✅
Sub-task 5.3 — Build socketManager.js event bus       : DONE ✅
Sub-task 5.4 — Inject socket.emit into backend routes : DONE ✅
Sub-task 5.5 — Build frontend socketService.js        : DONE ✅
Sub-task 5.6 — Build useSocket React hook             : DONE ✅
Sub-task 5.7 — Wire NotificationsPage to live socket  : DONE ✅
Sub-task 5.8 — Wire Officer dashboard to live socket  : DONE ✅
Sub-task 5.9 — Nav bell badge live unread count       : DONE ✅
Sub-task 5.10 — Update vite.config.js WS proxy       : DONE ✅
Sub-task 5.11 — End-to-end test & verification        : DONE ✅ (Health: UP, websocket: Socket.IO v4 active)
```

VERIFIED: GET /api/v1/health → { status: 'UP', websocket: 'Socket.IO v4 active' }
Server log confirmed: "📡 [Socket.IO] WebSocket Engine initialised and listening."

---

## Architecture Decisions (Read Before Coding)

### Stack Chosen
- Backend: socket.io v4 — NO Redis (no Redis installed; in-process event bus sufficient for dev/single-node)
- Frontend: socket.io-client v4
- Transport: WebSocket with HTTP long-poll fallback
- Auth on Socket: JWT token passed as auth.token in socket handshake, validated on connection event
- No separate port: Socket.IO is mounted on the same Express HTTP server (port 5000). Vite proxy also proxies the /socket.io/ path.

### Canonical Event Names
| Event Name | Direction | Payload | Trigger |
|---|---|---|---|
| notification:new | Server to Client | { id, type, title, message, timestamp, userId? } | Any new notification inserted |
| application:status_changed | Server to Client | { applicationId, status, updatedBy, timestamp } | Officer approves/returns/requests docs |
| conflict:detected | Server to Client | { conflictId, ulpin, severity, description } | New cross-dept conflict flagged |
| officer:queue_updated | Server to Client | { queueLength, newApplicationId } | Citizen submits new mutation application |
| ocr:result_ready | Server to Client | { documentId, extractedData, confidence } | OCR processing completes |
| ping | Client to Server | {} | Keepalive |
| pong | Server to Client | { timestamp } | Keepalive response |

### Room/Channel Strategy
- room:user:{userId} — Private notifications per user
- room:officers — Broadcasts to all officers (queue updates, conflicts)
- room:citizen:{userId} — Citizen-specific application status updates

---

## Files to CREATE (New Files)

| File | Purpose |
|---|---|
| backend/src/socket/socketManager.js | Core Socket.IO setup, JWT auth middleware, room management, event emitter export |
| frontend/src/services/socket/socketService.js | Client-side Socket.IO connection manager, singleton pattern |
| frontend/src/hooks/useSocket.js | React hook wrapping socket events with auto-cleanup |

---

## Files to MODIFY (Existing Files)

| File | What Changes |
|---|---|
| backend/package.json | Add "socket.io": "^4.7.5" to dependencies |
| backend/src/server.js | Wrap express with http.createServer, attach io, import socketManager |
| backend/src/routes/applications.js | Emit application:status_changed + officer:queue_updated after mutations |
| backend/src/routes/notifications.js | Emit notification:new when new notification is created |
| backend/src/routes/ocr.js | Emit ocr:result_ready after OCR completes |
| backend/src/routes/conflicts.js | Emit conflict:detected on new conflict |
| frontend/package.json | Add "socket.io-client": "^4.7.5" to dependencies |
| frontend/vite.config.js | Add /socket.io proxy path with ws: true |
| frontend/src/services/notifications/notificationService.js | Export socket-based live subscription function |
| frontend/src/pages/common/NotificationsPage.jsx | Subscribe to notification:new via useSocket |
| frontend/src/pages/officer/OfficerPages.jsx | Subscribe to application:status_changed, officer:queue_updated |

---

## Sub-task Detail & Implementation Notes

### Sub-task 5.1 — Install Socket.IO Packages
STATUS: NOT STARTED
Commands to run:
  cd e:\web_dev\bhusetu\bhuSETU\backend && npm install socket.io
  cd e:\web_dev\bhusetu\bhuSETU\frontend && npm install socket.io-client
Verify: backend/package.json has "socket.io" and frontend/package.json has "socket.io-client" in dependencies.

---

### Sub-task 5.2 — Upgrade server.js to http.createServer + attach io
STATUS: NOT STARTED
File: backend/src/server.js
Key change: Replace app.listen(PORT, ...) with:
  import { createServer } from 'http';
  import { initSocketManager } from './socket/socketManager.js';
  const httpServer = createServer(app);
  initSocketManager(httpServer);
  httpServer.listen(PORT, () => { ... });
IMPORTANT: app.listen() must be REMOVED — only httpServer.listen() should remain.

---

### Sub-task 5.3 — Build socketManager.js
STATUS: NOT STARTED
File: backend/src/socket/socketManager.js (NEW FILE)
Responsibilities:
  1. Create new Server(httpServer, { cors: { origin: '*' } })
  2. JWT auth middleware on io.use(...) — validates socket.handshake.auth.token
  3. On connection: join user to room:user:{userId} and role-based rooms
  4. Export singleton io and helpers: emitToUser(userId, event, payload), emitToOfficers(event, payload), emitGlobal(event, payload)
  5. Handle ping -> pong keepalive

---

### Sub-task 5.4 — Inject socket.emit into backend routes
STATUS: NOT STARTED
Files: applications.js, notifications.js, ocr.js, conflicts.js
Pattern:
  import { emitToOfficers, emitToUser } from '../socket/socketManager.js';
  // After DB write:
  emitToOfficers('officer:queue_updated', { queueLength, newApplicationId });
  emitToUser(userId, 'notification:new', { ... });

---

### Sub-task 5.5 — Build frontend socketService.js
STATUS: NOT STARTED
File: frontend/src/services/socket/socketService.js (NEW FILE)
Responsibilities:
  1. Singleton socket instance using io('/', { auth: { token: getToken() } })
  2. connect(), disconnect(), on(event, cb), off(event, cb) wrappers
  3. Auto-reconnect (Socket.IO handles natively)
  4. Export getSocket() for hook consumption

---

### Sub-task 5.6 — Build useSocket React hook
STATUS: NOT STARTED
File: frontend/src/hooks/useSocket.js (NEW FILE)
Responsibilities:
  1. Accept eventName and callback params
  2. On mount: socket.on(eventName, callback)
  3. On unmount: socket.off(eventName, callback) — CRITICAL for no memory leaks
  4. Export useSocketStatus() returning connected | disconnected | connecting

---

### Sub-task 5.7 — Wire NotificationsPage to live socket
STATUS: NOT STARTED
File: frontend/src/pages/common/NotificationsPage.jsx
Change: Use useSocket('notification:new', (notif) => setNotifications(prev => [notif, ...prev]))
Result: New notifications prepend in real-time without page reload.

---

### Sub-task 5.8 — Wire Officer dashboard to live socket
STATUS: NOT STARTED
File: frontend/src/pages/officer/OfficerPages.jsx
Changes:
  - useSocket('officer:queue_updated', ...) -> update pending applications count badge
  - useSocket('application:status_changed', ...) -> refresh application list item status inline

---

### Sub-task 5.9 — Nav bell badge live unread count
STATUS: NOT STARTED
Target: Navigation component (find exact file path — likely src/components/layout/ or src/App.jsx)
Change: Maintain live unreadCount state that increments on every notification:new socket event.
Reset to 0 when user navigates to /notifications.

---

### Sub-task 5.10 — Update vite.config.js WS proxy
STATUS: NOT STARTED
File: frontend/vite.config.js
Add to proxy config:
  '/socket.io': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    ws: true,
  }

---

### Sub-task 5.11 — End-to-End Test & Verification
STATUS: NOT STARTED
Manual test checklist:
  [ ] Backend starts without errors after socket.io install
  [ ] Browser console shows Socket connected log
  [ ] Submitting a mutation application triggers officer:queue_updated in officer tab
  [ ] Officer approving application triggers application:status_changed in citizen tab
  [ ] OCR processing emits ocr:result_ready
  [ ] Notification bell badge increments in real-time
  [ ] No memory leaks (navigating away/back does not duplicate event listeners)

---

## Completion Log

| Sub-task | Completed At | Notes |
|---|---|---|
| 5.1 Install packages | — | — |
| 5.2 Upgrade server.js | — | — |
| 5.3 socketManager.js | — | — |
| 5.4 Route emissions | — | — |
| 5.5 socketService.js | — | — |
| 5.6 useSocket hook | — | — |
| 5.7 NotificationsPage | — | — |
| 5.8 Officer dashboard | — | — |
| 5.9 Nav bell badge | — | — |
| 5.10 vite.config.js | — | — |
| 5.11 E2E test | — | — |

---

## Known Risks & Gotchas
1. ESM modules: backend uses "type": "module" in package.json. All imports must use ESM syntax (import/export), NOT CommonJS (require). Socket.IO v4 supports ESM natively.
2. Circular imports: socketManager.js exports io. Routes import from it. Do NOT import routes inside socketManager to avoid circular dependency.
3. JWT validation on socket: Reuse the same JWT utility at backend/src/utils/jwt.js. Read that file before implementing socket auth middleware.
4. Vite HMR conflict: Vite HMR uses WebSockets on the dev server. The /socket.io proxy must target backend (port 5000), not Vite dev server. The config in 5.10 handles this correctly.
5. Frontend token: socketService.js reads JWT from wherever authService.js stores it. Check frontend/src/services/auth/authService.js first before implementing.
