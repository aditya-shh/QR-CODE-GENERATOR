import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security: Disable X-Powered-By header to obscure server technology
app.disable('x-powered-by');

// Security: Enforce HTTP security headers with Helmet
// Configured to support AI Studio preview iframe, QR canvas blob URLs, and external social avatars
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: false, // Allows iframe embedding for preview environments
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https:', 'data:', 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'", '*'],
      },
    },
  })
);

// Security: Limit request payload sizes to 100kb to mitigate DoS / memory exhaustion
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Security: Rate limiting to protect API endpoints against abuse and brute force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', apiLimiter);

// Stricter rate limit for creation/mutation endpoints
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 creations per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for creating cards. Please wait a moment.' },
});

// Safe identifier validation regex (alphanumeric, underscores, hyphens, max 64 chars)
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

// =========================================================================
// SHARED PERSISTENT STORAGE: NEON POSTGRESQL + LOCAL SYNC ENGINE
// =========================================================================
const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const QR_FILE = path.join(DATA_DIR, 'qr_codes.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let profilesStore: Record<string, any> = {};
let qrStore: Record<string, any> = {};

// Load profiles from disk cache safely
if (fs.existsSync(PROFILES_FILE)) {
  try {
    const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
    profilesStore = JSON.parse(raw);
  } catch (err) {
    console.error('Error loading profiles from disk:', err);
    profilesStore = {};
  }
}

// Load QR codes from disk cache safely
if (fs.existsSync(QR_FILE)) {
  try {
    const raw = fs.readFileSync(QR_FILE, 'utf-8');
    qrStore = JSON.parse(raw);
  } catch (err) {
    console.error('Error loading QR codes from disk:', err);
    qrStore = {};
  }
}

// PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
let pool: pg.Pool | null = null;
let isPostgresConnected = false;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.query('SELECT NOW()')
      .then(async () => {
        isPostgresConnected = true;
        console.log('✓ Successfully connected to Neon PostgreSQL database!');
        await pool?.query(`
          CREATE TABLE IF NOT EXISTS profiles (
            id VARCHAR(255) PRIMARY KEY,
            data JSONB NOT NULL,
            created_at BIGINT,
            updated_at BIGINT
          );
        `);
        await pool?.query(`
          CREATE TABLE IF NOT EXISTS qr_codes (
            id VARCHAR(255) PRIMARY KEY,
            profile_id VARCHAR(255),
            text TEXT NOT NULL,
            template_id VARCHAR(64),
            config JSONB NOT NULL,
            created_at BIGINT
          );
        `);

        // Seed default profile if not in database
        const defaultProfile = profilesStore['alex-morgan-lead'] || {
          id: 'alex-morgan-lead',
          fullName: 'Alex Morgan',
          phoneNumber: '+1 (555) 019-2834',
          jobTitle: 'Creative Director & Full-Stack Engineer',
          company: 'Shape Studio Inc.',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
          bannerColor: '#8B80E8',
          themeId: 'soft-lavender',
          qrMode: 'interactive',
          fields: [
            {
              id: 'f_email',
              key: 'email',
              label: 'Email',
              category: 'Contact',
              type: 'email',
              value: 'alex.morgan@shapestudio.com',
              isVisible: true,
            },
            {
              id: 'f_instagram',
              key: 'instagram',
              label: 'Instagram',
              category: 'Social Media',
              type: 'url',
              value: '@alexmorgan.design',
              isVisible: true,
            },
            {
              id: 'f_github',
              key: 'github',
              label: 'GitHub',
              category: 'Social Media',
              type: 'url',
              value: 'alex-morgan',
              isVisible: true,
            },
            {
              id: 'f_linkedin',
              key: 'linkedin',
              label: 'LinkedIn',
              category: 'Social Media',
              type: 'url',
              value: 'alex-morgan-design',
              isVisible: true,
            },
            {
              id: 'f_website',
              key: 'website',
              label: 'Portfolio Website',
              category: 'Contact',
              type: 'url',
              value: 'https://alexmorgan.design',
              isVisible: true,
            },
            {
              id: 'f_whatsapp',
              key: 'whatsapp',
              label: 'WhatsApp',
              category: 'Contact',
              type: 'phone',
              value: '+15550192834',
              isVisible: true,
            },
          ],
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now(),
        };

        const res = await pool?.query('SELECT COUNT(*) FROM profiles WHERE id = $1', ['alex-morgan-lead']);
        if (res && parseInt(res.rows[0].count, 10) === 0) {
          await pool?.query(
            'INSERT INTO profiles (id, data, created_at, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [defaultProfile.id, JSON.stringify(defaultProfile), defaultProfile.createdAt, defaultProfile.updatedAt]
          );
          console.log('✓ Seeded default profile into Neon PostgreSQL.');
        }

        // Also ensure default profile exists in local cache
        profilesStore['alex-morgan-lead'] = defaultProfile;
        persistProfiles();
      })
      .catch((err) => {
        console.warn('PostgreSQL connection check note:', err.message);
        isPostgresConnected = false;
      });

    pool.on('error', (err) => {
      console.warn('PostgreSQL pool background notification:', err.message);
    });
  } catch (err: any) {
    console.warn('Error setting up PostgreSQL pool:', err.message);
    isPostgresConnected = false;
  }
}

function persistProfiles() {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profilesStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write profiles to disk:', err);
  }
}

function persistQRCodes() {
  try {
    fs.writeFileSync(QR_FILE, JSON.stringify(qrStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write QR codes to disk:', err);
  }
}

// Sanitization helper
function sanitizeString(str: any, maxLen: number = 200): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, maxLen);
}

// =========================================================================
// API ROUTES
// =========================================================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let count = Object.keys(profilesStore).length;
  let dbStatus = 'Local File Store';

  if (pool) {
    try {
      const dbRes = await pool.query('SELECT COUNT(*) FROM profiles');
      count = parseInt(dbRes.rows[0].count, 10);
      dbStatus = 'Neon PostgreSQL (Connected)';
    } catch {
      dbStatus = isPostgresConnected ? 'Neon PostgreSQL' : 'Local File Store Fallback';
    }
  }

  res.json({
    status: 'ok',
    brand: 'Shape QR',
    storage: dbStatus,
    profilesCount: count,
    timestamp: Date.now(),
  });
});

// Get profile by ID (Public cross-device access - NO LOGIN REQUIRED)
app.get('/api/profiles/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || !SAFE_ID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid profile identifier format' });
  }

  // 1. Try PostgreSQL first for cross-device shared persistence
  if (pool) {
    try {
      const dbRes = await pool.query('SELECT data FROM profiles WHERE id = $1', [id]);
      if (dbRes.rows.length > 0) {
        const profile = dbRes.rows[0].data;
        // Sync to local cache
        profilesStore[id] = profile;
        return res.json(profile);
      }
    } catch (err: any) {
      console.warn('Postgres read error, checking local store:', err.message);
    }
  }

  // 2. Fallback to local memory / file store
  const profile = profilesStore[id];
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(profile);
});

// Create or update a profile
app.post('/api/profiles', createLimiter, async (req, res) => {
  const profile = req.body;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return res.status(400).json({ error: 'Invalid profile payload structure' });
  }

  const fullName = sanitizeString(profile.fullName, 100);
  const phoneNumber = sanitizeString(profile.phoneNumber, 40);

  if (!fullName) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Determine or sanitize unique profile ID
  let id = typeof profile.id === 'string' ? profile.id.trim() : '';
  if (!id || !SAFE_ID_REGEX.test(id)) {
    const slug = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 16);
    const rand = Math.random().toString(36).substring(2, 7);
    id = slug ? `${slug}-${rand}` : `card-${rand}`;
  }

  // Validate and sanitize optional fields
  const rawFields = Array.isArray(profile.fields) ? profile.fields.slice(0, 50) : [];
  const sanitizedFields = rawFields.map((f: any, idx: number) => ({
    id: sanitizeString(f.id, 40) || `f_${idx}_${Date.now()}`,
    key: sanitizeString(f.key, 40),
    label: sanitizeString(f.label, 60),
    category: sanitizeString(f.category, 40) || 'Other',
    type: ['url', 'text', 'email', 'phone'].includes(f.type) ? f.type : 'text',
    value: sanitizeString(f.value, 500),
    isVisible: Boolean(f.isVisible),
  }));

  const updatedProfile = {
    id,
    fullName,
    phoneNumber,
    jobTitle: sanitizeString(profile.jobTitle, 100),
    company: sanitizeString(profile.company, 100),
    avatarUrl: typeof profile.avatarUrl === 'string' ? sanitizeString(profile.avatarUrl, 500) : null,
    bannerColor: sanitizeString(profile.bannerColor, 30) || '#8B80E8',
    themeId: sanitizeString(profile.themeId, 40) || 'soft-lavender',
    qrMode: sanitizeString(profile.qrMode, 30) || 'interactive',
    fields: sanitizedFields,
    updatedAt: Date.now(),
    createdAt: typeof profile.createdAt === 'number' ? profile.createdAt : Date.now(),
  };

  // 1. Write to PostgreSQL shared database
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO profiles (id, data, created_at, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id)
         DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
        [id, JSON.stringify(updatedProfile), updatedProfile.createdAt, updatedProfile.updatedAt]
      );
    } catch (err: any) {
      console.warn('Postgres write warning, saving to local store:', err.message);
    }
  }

  // 2. Write to local cache
  profilesStore[id] = updatedProfile;
  persistProfiles();

  res.json({ success: true, profile: updatedProfile });
});

// Download .vcf contact file with sanitized headers
app.get('/api/profiles/:id/vcf', async (req, res) => {
  const { id } = req.params;

  if (!id || !SAFE_ID_REGEX.test(id)) {
    return res.status(400).send('Invalid profile identifier');
  }

  let profile = profilesStore[id];

  if (!profile && pool) {
    try {
      const dbRes = await pool.query('SELECT data FROM profiles WHERE id = $1', [id]);
      if (dbRes.rows.length > 0) {
        profile = dbRes.rows[0].data;
        profilesStore[id] = profile;
      }
    } catch (err: any) {
      console.warn('Postgres vcf lookup error:', err.message);
    }
  }

  if (!profile) {
    return res.status(404).send('Profile not found');
  }

  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  const cleanName = sanitizeString(profile.fullName || 'Contact', 100);
  const nameParts = cleanName.split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || '';
  lines.push(`N:${lastName.replace(/;/g, ' ')};${firstName.replace(/;/g, ' ')};;;`);
  lines.push(`FN:${cleanName}`);

  if (profile.company) lines.push(`ORG:${sanitizeString(profile.company, 100).replace(/;/g, ' ')}`);
  if (profile.jobTitle) lines.push(`TITLE:${sanitizeString(profile.jobTitle, 100).replace(/;/g, ' ')}`);
  if (profile.phoneNumber) {
    const cleanDigits = profile.phoneNumber.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanDigits || profile.phoneNumber}`);
  }

  const visibleFields = Array.isArray(profile.fields)
    ? profile.fields.filter((f: any) => f.isVisible && f.value?.trim())
    : [];

  for (const field of visibleFields) {
    const val = sanitizeString(field.value, 500);
    if (!val) continue;

    if (field.key === 'email' || field.type === 'email') {
      lines.push(`EMAIL;TYPE=INTERNET:${val.replace(/^mailto:/i, '')}`);
    } else if (field.key === 'website' || field.type === 'url') {
      lines.push(`URL:${val}`);
    } else if (field.key === 'address' || field.key === 'office_address') {
      lines.push(`ADR;TYPE=WORK:;;${val.replace(/;/g, ' ')};;;;`);
    } else if (field.key === 'secondary_phone') {
      lines.push(`TEL;TYPE=WORK,VOICE:${val.replace(/[^\d+]/g, '') || val}`);
    } else {
      lines.push(`X-SOCIALPROFILE;type=${field.key}:${val}`);
    }
  }

  lines.push('END:VCARD');
  const vcfString = lines.join('\r\n');

  // Security: Sanitize filename to prevent HTTP Response Splitting / Header Injection
  const safeFilename = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.vcf"`);
  res.send(vcfString);
});

// Save QR code configuration
app.post('/api/qr', createLimiter, async (req, res) => {
  const { id, profileId, text, templateId, config } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Valid QR text or URL is required' });
  }

  const safeText = sanitizeString(text, 2048);
  const qrId = id && SAFE_ID_REGEX.test(id) ? id : `qr-${Math.random().toString(36).substring(2, 9)}`;
  const safeTemplate = sanitizeString(templateId, 32) || 'heart';
  const createdAt = Date.now();

  const entry = {
    id: qrId,
    profileId: profileId && SAFE_ID_REGEX.test(profileId) ? profileId : null,
    text: safeText,
    templateId: safeTemplate,
    config: typeof config === 'object' && config !== null ? config : {},
    createdAt,
  };

  // Write to PostgreSQL if configured
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO qr_codes (id, profile_id, text, template_id, config, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id)
         DO UPDATE SET text = EXCLUDED.text, template_id = EXCLUDED.template_id, config = EXCLUDED.config`,
        [qrId, entry.profileId, safeText, safeTemplate, JSON.stringify(entry.config), createdAt]
      );
    } catch (err: any) {
      console.warn('Postgres qr save warning:', err.message);
    }
  }

  qrStore[qrId] = entry;
  persistQRCodes();

  res.json({ success: true, id: qrId });
});

// Get QR code configuration
app.get('/api/qr/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || !SAFE_ID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid QR identifier format' });
  }

  if (pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM qr_codes WHERE id = $1', [id]);
      if (dbRes.rows.length > 0) {
        const row = dbRes.rows[0];
        return res.json({
          id: row.id,
          profileId: row.profile_id,
          text: row.text,
          templateId: row.template_id,
          config: row.config,
          createdAt: row.created_at,
        });
      }
    } catch (err: any) {
      console.warn('Postgres qr read warning:', err.message);
    }
  }

  const entry = qrStore[id];
  if (!entry) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  res.json(entry);
});

// Catch-all for undefined API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Security: Central error handler preventing internal stack trace disclosure
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err?.message || 'Unknown error');
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// =========================================================================
// VITE DEV SERVER OR STATIC PRODUCTION SERVE
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shape QR hardened server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
