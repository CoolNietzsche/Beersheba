/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// ── In-Memory / Local JSON Database fallback ────────────────────────────

interface DbSchema {
  users: any[];
  lots: any[];
  offers: any[];
  sampleRequests: any[];
  notifications: any[];
  cuppingScores: any[];
}

const DEFAULT_USERS = [
  {
    id: "user-1",
    email: "admin@bunnabridge.com",
    username: "admin",
    password: "BunnaAdmin2026!",
    role: "admin",
    company_name: "Bunna Bridge Authority",
    is_verified: true,
    first_name: "Admin",
    last_name: "System"
  },
  {
    id: "user-2",
    email: "dawit@addiscoffee.et",
    username: "dawit",
    password: "Bunna2026!",
    role: "exporter",
    company_name: "Addis Coffee Export",
    is_verified: true,
    first_name: "Dawit",
    last_name: "Alemayehu",
    ecta_license_number: "ECTA-EXP-2026-004",
    ecta_license_expiry: "2027-12-31",
    ecta_license_active: true
  },
  {
    id: "user-3",
    email: "sarah@nordicros.de",
    username: "sarah",
    password: "Bunna2026!",
    role: "buyer",
    company_name: "Nordic Roasters",
    is_verified: true,
    first_name: "Sarah",
    last_name: "Lindqvist",
    country: "Sweden"
  },
  {
    id: "user-4",
    email: "abebe@kochere.et",
    username: "abebe",
    password: "Bunna2026!",
    role: "farmer",
    company_name: "Kochere Cooperatives",
    is_verified: true,
    first_name: "Abebe",
    last_name: "Bikila",
    farm_altitude_m: 1950,
    gps_lat: 6.0841,
    gps_lng: 38.2144,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [38.2120, 6.0820],
          [38.2170, 6.0820],
          [38.2170, 6.0860],
          [38.2120, 6.0860],
          [38.2120, 6.0820]
        ]
      ]
    }
  },
  {
    id: "user-5",
    email: "tigist@scaethiopia.et",
    username: "tigist",
    password: "Bunna2026!",
    role: "qgrader",
    company_name: "SCA Ethiopia Certification Unit",
    is_verified: true,
    first_name: "Tigist",
    last_name: "Assefa"
  }
];

const DEFAULT_LOTS = [
  {
    id: "lot-1",
    lot_id: "YRG-2025-0847",
    name: "Kochere Washed G1",
    status: "listed",
    region: "yirgacheffe",
    altitude_m: 1980,
    processing: "washed",
    grade: "G1",
    varietal: "Ethiopian Heirloom",
    kebele: "Kochere",
    washing_station: "Chelelektu Station",
    sca_score: 87.5,
    flavor_notes: "Jasmine, bergamot, sweet lemon, black tea clarity",
    volume_kg: "19200",
    price_per_kg: "6.50",
    deforestation_free: true,
    gps_verified: true,
    eudr_dds_ready: true,
    phyto_cert_uploaded: true,
    ecta_license_active: true,
    nbe_fx_declared: true,
    cta_floor_met: true,
    green_passport_ready: true,
    export_ready: true,
    harvest_date: "2025-11-15",
    created_at: "2025-11-20T08:00:00Z",
    q_grader_name: "Tigist Assefa",
    q_grader_cert_id: "Q-GRADER-9481",
    cupping_date: "2025-12-05",
    gps_lat: 6.0841,
    gps_lng: 38.2144,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [38.2120, 6.0820],
          [38.2170, 6.0820],
          [38.2170, 6.0860],
          [38.2120, 6.0860],
          [38.2120, 6.0820]
        ]
      ]
    },
    flavor_tags: ["Floral", "Citrus", "Bergamot", "Honey"],
    farm_photos: ["/assets/hero.png"],
    available_qty_kg: "19200",
    fob_price_usd: "6.50",
    min_order_kg: "1000",
    delivery_window: "Jan - Feb 2026",
    lot_type: "spot",
    is_organic: true,
    is_fair_trade: true,
    is_rainforest_alliance: false,
    tasting_notes: "Exquisite yirgacheffe clean cup with punchy floral notes.",
    farm_story: "Grown by Abede Bikila's family coop in Kochere, Yirgacheffe at extremely high altitude.",
    compliance_score: 100,
    is_eudr_ready: true,
    latest_sca_score: 87.5,
    exporter_name: "Dawit Alemayehu",
    exporter_company: "Addis Coffee Export",
    cupping_scores: [
      {
        id: "cup-1",
        grader_name: "Tigist Assefa",
        status: "confirmed",
        total_score: 87.5,
        fragrance_aroma: 8.75,
        flavor: 8.5,
        aftertaste: 8.5,
        acidity: 8.75,
        body: 8.5,
        balance: 8.5,
        uniformity: 10,
        clean_cup: 10,
        sweetness: 10,
        overall: 8.5,
        defects: 0,
        flavor_notes: "Sensational honey suckle and lemon drops",
        cupping_date: "2025-12-05"
      }
    ],
    sample_requests_count: 0,
    offers_count: 0
  },
  {
    id: "lot-2",
    lot_id: "GJI-2025-0391",
    name: "Hambela Washed G1",
    status: "contracted",
    region: "guji",
    altitude_m: 2020,
    processing: "washed",
    grade: "G1",
    varietal: "Ethiopian Heirloom",
    kebele: "Hambela",
    washing_station: "Hambela Wamela Station",
    sca_score: 88.0,
    flavor_notes: "Rose petals, peach, wild strawberry, sugarcane",
    volume_kg: "12000",
    price_per_kg: "7.20",
    deforestation_free: true,
    gps_verified: true,
    eudr_dds_ready: true,
    phyto_cert_uploaded: true,
    ecta_license_active: true,
    nbe_fx_declared: true,
    cta_floor_met: true,
    green_passport_ready: true,
    export_ready: true,
    harvest_date: "2025-12-01",
    created_at: "2025-12-05T10:00:00Z",
    q_grader_name: "Tigist Assefa",
    q_grader_cert_id: "Q-GRADER-9481",
    cupping_date: "2025-12-20",
    gps_lat: 5.9224,
    gps_lng: 38.4891,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [38.4850, 5.9180],
          [38.4940, 5.9180],
          [38.4940, 5.9270],
          [38.4850, 5.9270],
          [38.4850, 5.9180]
        ]
      ]
    },
    flavor_tags: ["Berry", "Peach", "Floral", "Sweet"],
    farm_photos: ["/assets/hero.png"],
    available_qty_kg: "12000",
    fob_price_usd: "7.20",
    min_order_kg: "2000",
    delivery_window: "Feb 2026",
    lot_type: "spot",
    is_organic: true,
    is_fair_trade: true,
    is_rainforest_alliance: true,
    tasting_notes: "Incredible floral complexity, lingering stone fruit.",
    farm_story: "From Hambela Wamela estate employing over 40 women. Focused on biodynamic soil nutrition.",
    compliance_score: 100,
    is_eudr_ready: true,
    latest_sca_score: 88.0,
    exporter_name: "Dawit Alemayehu",
    exporter_company: "Addis Coffee Export",
    cupping_scores: [
      {
        id: "cup-2",
        grader_name: "Tigist Assefa",
        status: "confirmed",
        total_score: 88.0,
        fragrance_aroma: 9,
        flavor: 8.75,
        aftertaste: 8.5,
        acidity: 8.75,
        body: 8.5,
        balance: 8.75,
        uniformity: 10,
        clean_cup: 10,
        sweetness: 10,
        overall: 8.75,
        defects: 0,
        flavor_notes: "Vibrant nectarine and rose aroma",
        cupping_date: "2025-12-20"
      }
    ],
    sample_requests_count: 1,
    offers_count: 1
  },
  {
    id: "lot-3",
    lot_id: "HRR-2025-0055",
    name: "Harrar Longberry Natural",
    status: "exported",
    region: "harrar",
    altitude_m: 1850,
    processing: "natural",
    grade: "G1",
    varietal: "Harrar Cultivar",
    kebele: "Bedesa",
    washing_station: "Bedesa Community Dry Bed",
    sca_score: 86.5,
    flavor_notes: "Blueberry jam, baking cocoa, dark rum, heavy body",
    volume_kg: "18000",
    price_per_kg: "5.80",
    deforestation_free: true,
    gps_verified: true,
    eudr_dds_ready: true,
    phyto_cert_uploaded: true,
    ecta_license_active: true,
    nbe_fx_declared: true,
    cta_floor_met: true,
    green_passport_ready: true,
    export_ready: true,
    harvest_date: "2025-10-20",
    created_at: "2025-11-01T09:00:00Z",
    q_grader_name: "Tigist Assefa",
    q_grader_cert_id: "Q-GRADER-9481",
    cupping_date: "2025-11-15",
    gps_lat: 9.3111,
    gps_lng: 42.1283,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [42.1220, 9.3080],
          [42.1330, 9.3080],
          [42.1330, 9.3160],
          [42.1220, 9.3160],
          [42.1220, 9.3080]
        ]
      ]
    },
    flavor_tags: ["Fruity", "Blueberry", "Chocolate", "Bold"],
    farm_photos: ["/assets/hero.png"],
    available_qty_kg: "0",
    fob_price_usd: "5.80",
    min_order_kg: "5000",
    delivery_window: "Jan 2026",
    lot_type: "spot",
    is_organic: false,
    is_fair_trade: false,
    is_rainforest_alliance: false,
    tasting_notes: "Classic big-berry Harrar cup with a dry liqueur-like heavy structure.",
    farm_story: "Sun-dried natural lots from old heirloom trees in Bedesa, Eastern Highlands.",
    compliance_score: 100,
    is_eudr_ready: true,
    latest_sca_score: 86.5,
    exporter_name: "Dawit Alemayehu",
    exporter_company: "Addis Coffee Export"
  },
  {
    id: "lot-4",
    lot_id: "SDM-2025-0213",
    name: "Bensa Natural G1",
    status: "draft",
    region: "sidama",
    altitude_m: 1920,
    processing: "natural",
    grade: "G1",
    varietal: "Sidamo Local Type",
    kebele: "Bensa",
    washing_station: "Bensa Dry Station",
    sca_score: 84.0,
    flavor_notes: "Ripe cherry, plum, honey sweetness",
    volume_kg: "8500",
    price_per_kg: "4.90",
    deforestation_free: false,
    gps_verified: true,
    eudr_dds_ready: false,
    phyto_cert_uploaded: true,
    ecta_license_active: true,
    nbe_fx_declared: false,
    cta_floor_met: false,
    green_passport_ready: false,
    export_ready: false,
    harvest_date: "2025-12-10",
    created_at: "2025-12-15T11:00:00Z",
    q_grader_name: "Tigist Assefa",
    q_grader_cert_id: "Q-GRADER-9481",
    cupping_date: "2025-12-28",
    gps_lat: 6.5512,
    gps_lng: 38.6221,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [38.6180, 6.5470],
          [38.6260, 6.5470],
          [38.6260, 6.5540],
          [38.6180, 6.5540],
          [38.6180, 6.5470]
        ]
      ]
    },
    flavor_tags: ["Sweet", "Fruity", "Honey"],
    farm_photos: ["/assets/hero.png"],
    available_qty_kg: "8500",
    fob_price_usd: "4.90",
    min_order_kg: "500",
    delivery_window: "Feb - Mar 2026",
    lot_type: "spot",
    is_organic: false,
    is_fair_trade: false,
    is_rainforest_alliance: false,
    tasting_notes: "Sweet ripe cherry natural processing note.",
    farm_story: "Aleta mountain range, smallholders family lots blended in Bensa center.",
    compliance_score: 55,
    is_eudr_ready: false,
    latest_sca_score: 84.0,
    exporter_name: "Dawit Alemayehu",
    exporter_company: "Addis Coffee Export"
  }
];

const DEFAULT_OFFERS = [
  {
    id: "offer-1",
    lot: "lot-2",
    lot_name: "Hambela Washed G1",
    lot_id_display: "GJI-2025-0391",
    lot_region: "guji",
    lot_fob_price: "7.20",
    buyer: "user-3",
    buyer_email: "sarah@nordicros.de",
    buyer_name: "Sarah Lindqvist",
    buyer_company: "Nordic Roasters",
    quantity_kg: "5000",
    price_per_kg_usd: "7.10",
    delivery_window: "Feb 2026",
    notes: "Offering 7.10 FOB for 5,000kg. Hope we can close this lot!",
    status: "pending",
    counter_price: null,
    counter_qty: null,
    exporter_notes: "",
    created_at: "2025-12-10T14:22:00Z",
    updated_at: "2025-12-10T14:22:00Z"
  }
];

const DEFAULT_SAMPLE_REQUESTS = [
  {
    id: "sample-1",
    lot: "lot-2",
    lot_name: "Hambela Washed G1",
    lot_ref: "GJI-2025-0391",
    lot_region: "guji",
    buyer: "user-3",
    buyer_name: "Sarah Lindqvist",
    buyer_email: "sarah@nordicros.de",
    buyer_company: "Nordic Roasters",
    status: "pending",
    quantity_g: 200,
    message: "Interested in the high altitude floral profile of this Hambela lot.",
    response: "",
    shipping_address: "Storgatan 12, 114 44 Stockholm, Sweden",
    tracking_number: "",
    created_at: "2025-12-06T15:30:00Z",
    updated_at: "2025-12-06T15:30:00Z"
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    notification_type: "lot_status",
    title: "Lot Listed Successfully",
    message: "Kochere Washed G1 (YRG-2025-0847) has passed compliance gates and is listed on the marketplace.",
    link: "/lots/lot-1",
    is_read: false,
    created_at: "2025-12-05T08:30:00Z"
  }
];

// Initialize DB from db.json if present
function loadDb(): DbSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch {
      // Fallback
    }
  }
  const db = {
    users: DEFAULT_USERS,
    lots: DEFAULT_LOTS,
    offers: DEFAULT_OFFERS,
    sampleRequests: DEFAULT_SAMPLE_REQUESTS,
    notifications: DEFAULT_NOTIFICATIONS,
    cuppingScores: []
  };
  saveDb(db);
  return db;
}

function saveDb(db: DbSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

let db = loadDb();

// ── Authentication Middleware utilities ──────────────────────────────

function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Authentication credentials were not provided." });
  }
  const token = authHeader.split(" ")[1];
  const email = Buffer.from(token, "base64").toString("utf8"); // Cheat token
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ detail: "Token is invalid or expired." });
  }
  (req as any).user = user;
  next();
}

// ── API ROUTES ─────────────────────────────────────────────────────────

// Auth Endpoints
app.post("/api/auth/token/", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ detail: "No active account found with the given credentials" });
  }
  // Create simple base64 token
  const access = Buffer.from(user.email).toString("base64");
  const refresh = Buffer.from(user.email + "_refresh").toString("base64");
  
  res.json({
    access,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      company_name: user.company_name,
      is_verified: true,
      first_name: user.first_name,
      last_name: user.last_name,
      ecta_license_number: user.ecta_license_number || null,
      ecta_license_expiry: user.ecta_license_expiry || null
    }
  });
});

app.post("/api/auth/token/refresh/", (req, res) => {
  const { refresh } = req.body;
  const emailWithRefresh = Buffer.from(refresh || "", "base64").toString("utf8");
  const email = emailWithRefresh.replace("_refresh", "");
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ detail: "Refresh token is invalid or expired" });
  }
  const access = Buffer.from(user.email).toString("base64");
  res.json({ access });
});

app.post("/api/v1/auth/register/", (req, res) => {
  const { email, username, password, role, company_name, first_name, last_name, phone, country } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (db.users.some(u => u.email === email)) {
    return res.status(400).json({ detail: "User with this email already exists." });
  }
  const newUser = {
    id: `user-${db.users.length + 1}`,
    email,
    username: username || email.split("@")[0],
    password,
    role,
    company_name: company_name || "Self-Employed",
    is_verified: true,
    first_name: first_name || "",
    last_name: last_name || "",
    country: country || "Ethiopia",
    ecta_license_number: role === "exporter" ? `ECTA-EXP-2026-0${10 + db.users.length}` : null,
    ecta_license_expiry: role === "exporter" ? "2027-12-31" : null,
    ecta_license_active: role === "exporter" ? true : false,
    farm_altitude_m: role === "farmer" ? 2000 : null
  };
  db.users.push(newUser);
  saveDb(db);

  // Return standard auth response
  const access = Buffer.from(newUser.email).toString("base64");
  const refresh = Buffer.from(newUser.email + "_refresh").toString("base64");
  res.json({
    access,
    refresh,
    user: newUser
  });
});

app.get("/api/v1/auth/me/", authenticateUser, (req, res) => {
  res.json((req as any).user);
});

// Notifications Endpoints
app.get("/api/v1/notifications/", authenticateUser, (req, res) => {
  res.json(db.notifications);
});

app.get("/api/v1/notifications/unread-count/", authenticateUser, (req, res) => {
  const count = db.notifications.filter(n => !n.is_read).length;
  res.json({ count });
});

app.post("/api/v1/notifications/read-all/", authenticateUser, (req, res) => {
  db.notifications.forEach(n => n.is_read = true);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/v1/notifications/:id/read/", authenticateUser, (req, res) => {
  const nid = parseInt(req.params.id);
  const notif = db.notifications.find(n => n.id === nid);
  if (notif) {
    notif.is_read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

// Coffee Lots Endpoints
app.get("/api/v1/lots/", (req, res) => {
  const results = db.lots.map(l => {
    // Dynamically update calculations
    const gates = {
      deforestation_free: !!l.deforestation_free,
      gps_verified: !!l.gps_verified,
      eudr_dds_ready: !!l.eudr_dds_ready,
      phyto_cert_uploaded: !!l.phyto_cert_uploaded,
      ecta_license_active: !!l.ecta_license_active,
      nbe_fx_declared: !!l.nbe_fx_declared,
      cta_floor_met: !!l.cta_floor_met
    };
    const validGates = Object.values(gates).filter(Boolean).length;
    const export_ready = validGates === 7;
    const compliance_score = Math.round((validGates / 7) * 100);

    return {
      ...l,
      export_ready,
      compliance_score,
      is_eudr_ready: l.deforestation_free && l.gps_verified && l.eudr_dds_ready,
      green_passport_ready: l.deforestation_free && l.gps_verified
    };
  });

  res.json({
    count: results.length,
    next: null,
    previous: null,
    results
  });
});

app.get("/api/v1/lots/:id/", (req, res) => {
  const lot = db.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ detail: "Coffee lot not found." });

  const gates = {
    deforestation_free: !!lot.deforestation_free,
    gps_verified: !!lot.gps_verified,
    eudr_dds_ready: !!lot.eudr_dds_ready,
    phyto_cert_uploaded: !!lot.phyto_cert_uploaded,
    ecta_license_active: !!lot.ecta_license_active,
    nbe_fx_declared: !!lot.nbe_fx_declared,
    cta_floor_met: !!lot.cta_floor_met
  };
  const validGates = Object.values(gates).filter(Boolean).length;
  
  res.json({
    ...lot,
    export_ready: validGates === 7,
    compliance_score: Math.round((validGates / 7) * 100),
    is_eudr_ready: lot.deforestation_free && lot.gps_verified && lot.eudr_dds_ready,
    green_passport_ready: lot.deforestation_free && lot.gps_verified
  });
});

app.post("/api/v1/lots/", authenticateUser, (req, res) => {
  const data = req.body;
  const regionPrefix = (data.region || "other").substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const serial = Math.floor(Math.random() * 900) + 100;
  const lot_id = `${regionPrefix}-${year}-0${serial}`;

  const newLot = {
    id: `lot-${db.lots.length + 1}`,
    lot_id,
    name: data.name || `Specialty Micro-lot ${lot_id}`,
    status: "draft",
    region: data.region || "yirgacheffe",
    altitude_m: data.altitude_m || 1900,
    processing: data.processing || "washed",
    grade: data.grade || "G1",
    varietal: data.varietal || "Ethiopian Heirloom",
    kebele: data.kebele || "Konga",
    washing_station: data.washing_station || "Konga Cooperative",
    sca_score: null,
    flavor_notes: data.flavor_notes || "Complex fruit, pleasant citric acidity",
    volume_kg: String(data.volume_kg || 5000),
    price_per_kg: String(data.price_per_kg || "5.00"),
    deforestation_free: true,
    gps_verified: false,
    eudr_dds_ready: false,
    phyto_cert_uploaded: false,
    ecta_license_active: true,
    nbe_fx_declared: false,
    cta_floor_met: true,
    harvest_date: data.harvest_date || new Date().toISOString().substring(0, 10),
    created_at: new Date().toISOString(),
    q_grader_name: "",
    q_grader_cert_id: "",
    cupping_date: null,
    gps_lat: null,
    gps_lng: null,
    flavor_tags: data.flavor_tags || ["Fruity"],
    farm_photos: ["/assets/hero.png"],
    available_qty_kg: String(data.volume_kg || 5000),
    fob_price_usd: String(data.price_per_kg || "5.00"),
    min_order_kg: "500",
    delivery_window: "Jan - Apr 2026",
    lot_type: "spot",
    is_organic: false,
    is_fair_trade: false,
    is_rainforest_alliance: false,
    tasting_notes: data.flavor_notes || "Classic profile",
    farm_story: "Grown under agroforestry canopy by local smallholder groups.",
    cupping_scores: [],
    exporter_name: (req as any).user.first_name + " " + (req as any).user.last_name,
    exporter_company: (req as any).user.company_name
  };

  db.lots.push(newLot);
  saveDb(db);
  res.status(201).json(newLot);
});

app.patch("/api/v1/lots/:id/", authenticateUser, (req, res) => {
  const lot = db.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ detail: "Not found" });

  Object.assign(lot, req.body);
  saveDb(db);
  res.json(lot);
});

app.patch("/api/v1/lots/:id/status/", authenticateUser, (req, res) => {
  const lot = db.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ detail: "Not found" });

  lot.status = req.body.status;
  saveDb(db);
  res.json({ lot_id: lot.id, status: lot.status });
});

app.get("/api/v1/lots/:id/compliance-check/", (req, res) => {
  const lot = db.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ detail: "Not found" });

  const gates = {
    deforestation_free: !!lot.deforestation_free,
    gps_verified: !!lot.gps_verified,
    eudr_dds_ready: !!lot.eudr_dds_ready,
    phyto_cert_uploaded: !!lot.phyto_cert_uploaded,
    ecta_license_active: !!lot.ecta_license_active,
    nbe_fx_declared: !!lot.nbe_fx_declared,
    cta_floor_met: !!lot.cta_floor_met
  };

  const failed_gates = Object.entries(gates)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const export_ready = failed_gates.length === 0;

  res.json({
    lot_id: lot.id,
    export_ready,
    green_passport_ready: lot.deforestation_free && lot.gps_verified,
    failed_gates,
    gates,
    deforestation_check: {
      status: lot.deforestation_free ? 'clear' : 'overlap',
      deforestation_free: lot.deforestation_free,
      overlap_count: lot.deforestation_free ? 0 : 4,
      message: lot.deforestation_free 
        ? "Spatial overlap check complete. No intersection with 2020 forest baselines."
        : "Critical Overlap: Dec 2020 forest baselines violate EUDR requirements."
    }
  });
});

app.get("/api/v1/lots/:id/eudr-dds/", (req, res) => {
  // Return dummy PDF document
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=EUDR-DDS-${req.params.id}.pdf`);
  res.send(Buffer.from("Fake PDF core-bytes for EUDR compliance passport", "utf-8"));
});

// Settlement Endpoints
app.post("/api/v1/lots/:id/settlement/", authenticateUser, (req, res) => {
  const { total_usd, nbe_rate } = req.body;
  const rate = nbe_rate || 59.85;
  const total = parseFloat(total_usd) || 10000;
  
  const platform_fee = total * 0.015; // 1.5% platform brokerage
  const net_usd = total - platform_fee;
  
  // NBE 50/50 FX policy
  const usd_retained = net_usd * 0.50;
  const etb_converted = (net_usd * 0.50) * rate;

  res.json({
    lot_id: req.params.id,
    lot_ref: db.lots.find(l => l.id === req.params.id)?.lot_id || "LOT",
    total_usd: total,
    platform_fee,
    net_usd,
    usd_retained,
    etb_converted,
    nbe_rate: rate,
    split_percent: 50,
    calculated_at: new Date().toISOString()
  });
});

// Offers Endpoints
app.get("/api/v1/offers/", authenticateUser, (req, res) => {
  res.json({ results: db.offers });
});

app.post("/api/v1/offers/", authenticateUser, (req, res) => {
  const { lot, quantity_kg, price_per_kg_usd, delivery_window, notes } = req.body;
  const coffeeLot = db.lots.find(l => l.id === lot);
  if (!coffeeLot) return res.status(404).json({ error: "Lot not found" });

  const newOffer = {
    id: `offer-${db.offers.length + 1}`,
    lot,
    lot_name: coffeeLot.name,
    lot_id_display: coffeeLot.lot_id,
    lot_region: coffeeLot.region,
    lot_fob_price: coffeeLot.price_per_kg,
    buyer: (req as any).user.id,
    buyer_email: (req as any).user.email,
    buyer_name: (req as any).user.first_name + " " + (req as any).user.last_name,
    buyer_company: (req as any).user.company_name,
    quantity_kg: String(quantity_kg),
    price_per_kg_usd: String(price_per_kg_usd),
    delivery_window: delivery_window || "Immediate",
    notes: notes || "",
    status: "pending",
    counter_price: null,
    counter_qty: null,
    exporter_notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.offers.push(newOffer);
  db.notifications.push({
    id: db.notifications.length + 1,
    notification_type: "sample_request",
    title: "New Purchase Offer",
    message: `${newOffer.buyer_company} submitted an offer of $${newOffer.price_per_kg_usd}/kg for ${newOffer.lot_name}`,
    link: `/offers`,
    is_read: false,
    created_at: new Date().toISOString()
  });
  saveDb(db);
  res.status(201).json(newOffer);
});

app.post("/api/v1/offers/:id/respond/", authenticateUser, (req, res) => {
  const offer = db.offers.find(o => o.id === req.params.id);
  if (!offer) return res.status(404).json({ error: "Offer not found" });

  const { action, counter_price, counter_qty, exporter_notes } = req.body;
  if (action === "accept") {
    offer.status = "accepted";
    // Mark lot contracted
    const lot = db.lots.find(l => l.id === offer.lot);
    if (lot) lot.status = "contracted";
  } else if (action === "reject") {
    offer.status = "rejected";
  } else if (action === "counter") {
    offer.status = "countered";
    offer.counter_price = String(counter_price);
    offer.counter_qty = String(counter_qty);
  }
  offer.exporter_notes = exporter_notes || "";
  offer.updated_at = new Date().toISOString();

  saveDb(db);
  res.json(offer);
});

app.post("/api/v1/offers/:id/withdraw/", authenticateUser, (req, res) => {
  const offer = db.offers.find(o => o.id === req.params.id);
  if (!offer) return res.status(404).json({ error: "Offer not found" });

  offer.status = "withdrawn";
  offer.updated_at = new Date().toISOString();
  saveDb(db);
  res.json(offer);
});

app.post("/api/v1/offers/:id/accept-counter/", authenticateUser, (req, res) => {
  const offer = db.offers.find(o => o.id === req.params.id);
  if (!offer) return res.status(404).json({ error: "Offer not found" });

  offer.status = "accepted";
  if (offer.counter_price) offer.price_per_kg_usd = offer.counter_price;
  if (offer.counter_qty) offer.quantity_kg = offer.counter_qty;
  
  const lot = db.lots.find(l => l.id === offer.lot);
  if (lot) lot.status = "contracted";

  offer.updated_at = new Date().toISOString();
  saveDb(db);
  res.json(offer);
});

// Sample Requests Endpoints
app.get("/api/v1/sample-requests/", authenticateUser, (req, res) => {
  res.json({ results: db.sampleRequests });
});

app.post("/api/v1/sample-requests/", authenticateUser, (req, res) => {
  const { lot, quantity_g, message, shipping_address } = req.body;
  const coffeeLot = db.lots.find(l => l.id === lot);
  if (!coffeeLot) return res.status(404).json({ error: "Lot not found" });

  const newSR = {
    id: `sample-${db.sampleRequests.length + 1}`,
    lot,
    lot_name: coffeeLot.name,
    lot_ref: coffeeLot.lot_id,
    lot_region: coffeeLot.region,
    buyer: (req as any).user.id,
    buyer_name: (req as any).user.first_name + " " + (req as any).user.last_name,
    buyer_email: (req as any).user.email,
    buyer_company: (req as any).user.company_name,
    status: "pending" as const,
    quantity_g: quantity_g || 200,
    message: message || "",
    response: "",
    shipping_address: shipping_address || "",
    tracking_number: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.sampleRequests.push(newSR);
  db.notifications.push({
    id: db.notifications.length + 1,
    notification_type: "sample_request",
    title: "Sample Request Received",
    message: `Sarah from ${newSR.buyer_company} requested a cupping sample for ${newSR.lot_name}`,
    link: `/samples`,
    is_read: false,
    created_at: new Date().toISOString()
  });
  saveDb(db);
  res.status(201).json(newSR);
});

app.post("/api/v1/sample-requests/:id/respond/", authenticateUser, (req, res) => {
  const sr = db.sampleRequests.find(s => s.id === req.params.id);
  if (!sr) return res.status(404).json({ error: "Sample request not found" });

  const { status, response, tracking_number } = req.body;
  sr.status = status;
  sr.response = response || "";
  if (tracking_number) sr.tracking_number = tracking_number;
  sr.updated_at = new Date().toISOString();

  saveDb(db);
  res.json(sr);
});

// Farmers / Profile Endpoints
app.get("/api/v1/farmers/profile/", authenticateUser, (req, res) => {
  const profile = (req as any).user;
  res.json({
    id: profile.id,
    email: profile.email,
    username: profile.username,
    role: profile.role,
    company_name: profile.company_name,
    first_name: profile.first_name,
    last_name: profile.last_name,
    farm_altitude_m: profile.farm_altitude_m || 1950,
    gps_lat: profile.gps_lat || 6.0841,
    gps_lng: profile.gps_lng || 38.2144,
    boundary: profile.boundary || {
      type: "Polygon",
      coordinates: [
        [
          [38.2120, 6.0820],
          [38.2170, 6.0820],
          [38.2170, 6.0860],
          [38.2120, 6.0860],
          [38.2120, 6.0820]
        ]
      ]
    }
  });
});

app.patch("/api/v1/farmers/profile/", authenticateUser, (req, res) => {
  const profile = (req as any).user;
  const userInDb = db.users.find(u => u.id === profile.id);
  if (userInDb) {
    Object.assign(userInDb, req.body);
    saveDb(db);
  }
  res.json(userInDb);
});

app.get("/api/v1/farmers/lots/", authenticateUser, (req, res) => {
  // Returns lots that the farmer can view or is linked to
  res.json(db.lots);
});

// Boundary captured endpoints
app.post("/api/v1/lots/:id/boundary/", authenticateUser, (req, res) => {
  const lot = db.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ error: "Lot not found" });

  const { boundary, gps_lat, gps_lng, deforestation_free } = req.body;
  
  lot.boundary = boundary;
  lot.gps_lat = gps_lat || (boundary?.coordinates?.[0]?.[0]?.[1] ?? null);
  lot.gps_lng = gps_lng || (boundary?.coordinates?.[0]?.[0]?.[0] ?? null);
  lot.gps_verified = true;
  lot.deforestation_free = (deforestation_free !== undefined) ? deforestation_free : true;
  
  saveDb(db);
  res.json(lot);
});

app.post("/api/v1/lots/:id/boundary-inherit/", authenticateUser, (req, res) => {
  const lot = db.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ error: "Lot not found" });

  // Inherit from abebe (farmer demo user-4)
  const farmer = db.users.find(u => u.role === "farmer");
  if (farmer) {
    lot.boundary = farmer.boundary;
    lot.gps_lat = farmer.gps_lat;
    lot.gps_lng = farmer.gps_lng;
    lot.gps_verified = true;
    lot.deforestation_free = true;
    saveDb(db);
  }
  res.json(lot);
});

// Cupping endpoints
app.get("/api/v1/cupping/", authenticateUser, (req, res) => {
  const scores = db.cuppingScores;
  res.json(scores);
});

app.post("/api/v1/cupping/", authenticateUser, (req, res) => {
  const data = req.body;
  const lot = db.lots.find(l => l.id === data.lot);
  if (!lot) return res.status(404).json({ error: "Lot not found" });

  const newScore = {
    id: `cup-${db.cuppingScores.length + DEFAULT_LOTS.length + 1}`,
    lot: data.lot,
    grader_name: (req as any).user.first_name + " " + (req as any).user.last_name,
    status: "pending",
    total_score: parseFloat(data.total_score) || 85.0,
    fragrance_aroma: parseFloat(data.fragrance_aroma) || 8.0,
    flavor: parseFloat(data.flavor) || 8.0,
    aftertaste: parseFloat(data.aftertaste) || 8.0,
    acidity: parseFloat(data.acidity) || 8.0,
    body: parseFloat(data.body) || 8.0,
    balance: parseFloat(data.balance) || 8.0,
    uniformity: parseFloat(data.uniformity) || 10.0,
    clean_cup: parseFloat(data.clean_cup) || 10.0,
    sweetness: parseFloat(data.sweetness) || 10.0,
    overall: parseFloat(data.overall) || 8.0,
    defects: parseFloat(data.defects) || 0.0,
    flavor_notes: data.flavor_notes || "Pleasant, sweet dynamic coffee profile",
    cupping_date: new Date().toISOString().substring(0, 10)
  };

  db.cuppingScores.push(newScore);
  
  // Attach directly to the lot object
  if (!lot.cupping_scores) lot.cupping_scores = [];
  lot.cupping_scores.push(newScore);
  lot.sca_score = newScore.total_score;
  lot.latest_sca_score = newScore.total_score;
  lot.cupping_date = newScore.cupping_date;
  lot.q_grader_name = newScore.grader_name;
  lot.q_grader_cert_id = "Q-GRADER-6047";

  db.notifications.push({
    id: db.notifications.length + 1,
    notification_type: "lot_status",
    title: "New Cupping Score Submitted",
    message: `${lot.name} was graded ${newScore.total_score} SCA by Q-Grader ${newScore.grader_name}`,
    link: `/lots/${lot.id}`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.status(201).json(newScore);
});

app.post("/api/v1/cupping/:id/confirm/", authenticateUser, (req, res) => {
  // Lock/confirm cupping
  let found = db.cuppingScores.find(c => c.id === req.params.id);
  if (!found) {
    // Check inside lots
    for (const lot of db.lots) {
      if (lot.cupping_scores) {
        const item = lot.cupping_scores.find((c: any) => c.id === req.params.id);
        if (item) {
          found = item;
          break;
        }
      }
    }
  }

  if (found) {
    found.status = "confirmed";
    saveDb(db);
    res.json(found);
  } else {
    res.status(404).json({ error: "Cupping score not found" });
  }
});

// Express Static Serving Client Files in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bunna Bridge fullstack Gateway running on http://localhost:${PORT}`);
  });
}

startServer();
