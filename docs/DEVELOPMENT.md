# Development setup

## Requirements

Node.js 20+ and npm.

## Run the prototype

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Use the demo role selector on `/login` to explore citizen and officer workspaces. Records are fictional and service actions are local UI demonstrations.

## Build

```bash
npm run build
npm run preview
```

`VITE_API_BASE_URL`, `VITE_MAP_TILE_URL` and `VITE_CLOUDINARY_CLOUD_NAME` are blank placeholders in `.env.example`. Never put credentials in browser environment variables. The map uses OpenStreetMap's public tile URL by default; choose and configure an appropriate production provider and attribution policy before deployment.
