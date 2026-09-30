import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'db.json');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const defaultData = {
  users: [],
  parcels: [],
  ownership_history: [],
  mutation_applications: [],
  documents: [],
  conflicts: [],
  notifications: [],
  audit_logs: []
};

function readDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function initDatabase() {
  const db = readDB();
  writeDB(db);
  console.log('✅ File-backed Database initialized successfully at backend/data/db.json');
}

export const db = {
  getCollection(name) {
    const data = readDB();
    return data[name] || [];
  },
  saveCollection(name, items) {
    const data = readDB();
    data[name] = items;
    writeDB(data);
  },
  insert(name, item) {
    const items = this.getCollection(name);
    items.push(item);
    this.saveCollection(name, items);
    return item;
  },
  update(name, predicate, updates) {
    const items = this.getCollection(name);
    const index = items.findIndex(predicate);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.saveCollection(name, items);
      return items[index];
    }
    return null;
  },
  findOne(name, predicate) {
    const items = this.getCollection(name);
    return items.find(predicate) || null;
  },
  findMany(name, predicate) {
    const items = this.getCollection(name);
    return predicate ? items.filter(predicate) : items;
  }
};
