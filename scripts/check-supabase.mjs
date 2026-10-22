import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env if present
const envPath = path.resolve(__dirname, "../backend/.env");
let env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
}

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
const base = (process.env.SUPABASE_URL || env.SUPABASE_URL || "https://syxmylidoeantkndstqa.supabase.co") + "/rest/v1";

if (!key) {
  console.log("No Supabase key configured. Set SUPABASE_SERVICE_ROLE_KEY or define it in backend/.env.");
  process.exit(0);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function check() {
  console.log("Connecting to live Supabase project...");
  for (const table of ["profiles", "freelancers", "clients", "invoices", "user_preferences"]) {
    try {
      const res = await fetch(`${base}/${table}?select=*`, { headers });
      const rows = await res.json();
      console.log(`\n=== Table: ${table} (${Array.isArray(rows) ? rows.length : "error"} rows) ===`);
      if (Array.isArray(rows) && rows.length > 0) {
        console.log(JSON.stringify(rows.slice(0, 2), null, 2));
      } else {
        console.log("No rows or empty.");
      }
    } catch (e) {
      console.error(`Error querying ${table}:`, e.message);
    }
  }
}

check().catch(console.error);
