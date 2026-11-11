// Tiny events API + static file server. No packages needed (Node 18+).
// Run: node server.js   then open http://localhost:3000
//
// GET /api/events -> { source: "live" | "fallback", events: [...] }
// It asks Discover East (Anthology Engage) for NSBE's events, and if that
// fails for any reason it serves data/events.json so the site never breaks.

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE = "https://psuharrisburg.campuslabs.com";
const ORG_SLUG = "national-society-of-black-engineers";
const PORT = process.env.PORT || 3000;
const CACHE_MS = 10 * 60 * 1000; // 10 minutes

let cache = { time: 0, payload: null };
let orgId = process.env.NSBE_ORG_ID || null; // can be set manually if lookup fails

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return res.json();
}

async function findOrgId() {
  if (orgId) return orgId;
  const url = `${BASE}/engage/api/discovery/search/organizations?top=10&query=${encodeURIComponent("national society of black engineers")}`;
  const data = await getJson(url);
  const match = (data.value || []).find(o => (o.WebsiteKey || "").toLowerCase() === ORG_SLUG) || (data.value || [])[0];
  if (!match) throw new Error("Organization not found");
  orgId = match.Id;
  return orgId;
}

async function fetchLiveEvents() {
  const id = await findOrgId();
  const params = new URLSearchParams({
    endsAfter: new Date().toISOString(),
    orderByField: "endsOn",
    orderByDirection: "ascending",
    status: "Approved",
    take: "50",
    "organizationIds[0]": String(id)
  });
  const data = await getJson(`${BASE}/engage/api/discovery/event/search?${params}`);
  return (data.value || []).map(e => ({
    id: e.id,
    name: e.name,
    description: e.description || "",
    location: e.location || "",
    startsOn: e.startsOn,
    endsOn: e.endsOn,
    url: `${BASE}/engage/event/${e.id}`
  }));
}

async function getEvents() {
  if (cache.payload && Date.now() - cache.time < CACHE_MS) return cache.payload;
  try {
    const events = await fetchLiveEvents();
    cache = { time: Date.now(), payload: { source: "live", events } };
  } catch (err) {
    console.error("Live fetch failed, using fallback:", err.message);
    const file = path.join(__dirname, "data", "events.json");
    const events = JSON.parse(fs.readFileSync(file, "utf8"));
    return { source: "fallback", events };
  }
  return cache.payload;
}

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

http.createServer(async (req, res) => {
  if (req.url.startsWith("/api/events")) {
    const payload = await getEvents();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(payload));
  }
  const clean = req.url.split("?")[0];
  const file = path.join(__dirname, clean === "/" ? "index.html" : clean);
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, content) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "text/plain" });
    res.end(content);
  });
}).listen(PORT, () => console.log(`NSBE site running at http://localhost:${PORT}`));
