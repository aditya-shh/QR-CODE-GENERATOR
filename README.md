# Shape QR — Digital vCard & QR Code Studio

> **"One Card. Every Connection."**  
> *Create your personalized digital card, share everything that matters, and connect instantly with one QR code.*

Shape QR is a full-stack digital business card platform and QR code design studio. It allows professionals, creators, and teams to build a clean, mobile-optimized digital vCard in under 60 seconds, encode it into a customizable QR code, and host a public profile page with live clickable social media links, one-tap calling, direct emailing, and offline contact downloads (`.vcf`).

The application is completely **self-contained** with no external database dependencies required.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start: Local Setup](#-quick-start-local-setup)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone or Download](#2-clone-or-download)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Environment Configuration](#4-environment-configuration)
  - [5. Run Development Server](#5-run-development-server)
  - [6. Build and Run Production Server](#6-build-and-run-production-server)
- [How to Use Shape QR (Step-by-Step)](#-how-to-use-shape-qr-step-by-step)
  - [Step 1: Create Your Digital Card](#step-1-create-your-digital-card)
  - [Step 2: Add Social & Professional Links](#step-2-add-social--professional-links)
  - [Step 3: Select a Card Theme](#step-3-select-a-card-theme)
  - [Step 4: Generate & Customize Your QR Code](#step-4-generate--customize-your-qr-code)
  - [Step 5: View & Share the Public Profile](#step-5-view--share-the-public-profile)
  - [Step 6: Download .vcf Contact](#step-6-download-vcf-contact)
- [Local Data Persistence](#-local-data-persistence)
- [REST API Reference & cURL Examples](#-rest-api-reference--curl-examples)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Security Hardening](#-security-hardening)
- [Project Structure](#-project-structure)

---

## ✨ Features

### 1. Minimalist Digital vCard Creator
- **Frictionless Inputs**: Only **Full Name** and **Phone Number** are required upfront.
- **"+ Add More Details" Modal**: Searchable catalog of 20+ suggested and custom fields:
  - **Social Media**: Instagram, LinkedIn, GitHub, X (Twitter), Facebook, YouTube, TikTok, WhatsApp, Telegram, Discord, Threads, Snapchat, Pinterest.
  - **Contact & Communication**: Email, Secondary Phone, WhatsApp Direct Chat, Website, Portfolio, Address.
  - **Professional Info**: Job Title, Company, Business Website, Work Email, Office Address.
  - **Custom Fields**: Custom Link, Custom Text, Custom Email, Custom Phone.
- **Intelligent Handle Resolution**: Type `@username` (or `linkedin.com/in/user`) and Shape QR automatically constructs the valid, safe target URL.
- **Customizable & Removable**: Reorder, rename, toggle visibility, or delete any field at any time.

### 2. Beautiful Mobile Profile (`/card/:id`)
- **Direct Public URL**: Instant public web access via `https://your-domain.com/card/<unique-id>`.
- **Zero Login Required**: Scanners on any smartphone (iOS, Android) open the card directly in Safari, Chrome, or any mobile browser without signing in or creating an account.
- **Verified Platform Badging**: Clean typography, avatar image preview, and customizable banner colors.
- **Clickable Brand Logos**: Official SVG icons for social media platforms with auto-formatted handles.
- **1-Tap Direct Actions**:
  - 📞 **Call Now**: Direct `tel:` link opening the phone dialer.
  - 💬 **WhatsApp**: Opens direct WhatsApp conversation.
  - ✉️ **Send Email**: Immediate `mailto:` email composer.
  - 🌐 **Visit Website**: Opens portfolio or company URL in browser.
  - 💾 **Save Contact**: Direct RFC 2426 `.vcf` download that imports into iOS Contacts or Android Google Contacts.
  - 🔗 **Share Profile**: Native Web Share API with instant clipboard fallback.
- **Designer Card Themes**: Minimal White, Soft Lavender, Elegant Black, Warm Beige, Ocean Blue, and Soft Skeuomorphic.

### 3. QR Code Studio
- **Dual QR Modes**:
  - **Mode A – Interactive Public Card (Default)**: Encodes your absolute public production HTTPS URL (never `localhost`!) so any smartphone anywhere opens your live, clickable digital card.
  - **Mode B – Direct vCard (Offline)**: Encodes full RFC 2426 contact data directly into the QR matrix for offline scanning without internet.
- **Customizable Shapes & Styles**: Hearts, rounded frames, sleek dots, gradient fills, and custom center icons.
- **High-Resolution Exports**: Download as crisp vector SVG or high-DPI PNG.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion
- **Backend**: Node.js, Express.js, TypeScript (`tsx`)
- **Shared Database**: PostgreSQL (Neon Serverless Pooler) with JSONB documents, connection pooling, and automatic table creation
- **Local Cache Fallback**: Synchronized local persistent store (`./data/profiles.json` and `./data/qr_codes.json`)
- **Security**: Helmet (Content Security Policy, no-sniff), Express Rate Limit, strict input regex sanitization
- **QR Engine**: `qrcode`, SVG & HTML5 Canvas renderer, `jsQR` validation

---

## 🚀 Quick Start: Local Setup

### 1. Prerequisites
Ensure you have the following installed on your local computer:
- **Node.js**: `v18.0.0` or higher (recommended: `v20.x` or `v22.x`)
  ```bash
  node -v
  ```
- **npm**: `v9.0.0` or higher (bundled with Node.js)
  ```bash
  npm -v
  ```

### 2. Clone or Download
Clone the repository to your local machine:
```bash
git clone https://github.com/your-username/shape-qr.git
cd shape-qr
```

### 3. Install Dependencies
Install all required frontend and backend packages:
```bash
npm install
```

### 4. Environment Configuration
Shape QR includes support for Neon PostgreSQL for shared cross-device persistence:
```bash
cp .env.example .env
```

Configure your `.env` variables:
```ini
PORT=3000
NODE_ENV=development

# Shared PostgreSQL database (Required for cross-device persistence across serverless container restarts)
DATABASE_URL=postgresql://username:password@ep-your-cluster.neon.tech/neondb?sslmode=require

# Public Accessible Production Base URL for QR Codes (Cross-Device Access)
# Set this to your deployed domain so QR codes encode a permanent public HTTPS URL
VITE_PUBLIC_APP_URL=https://your-domain.com
```

### 5. Run Development Server
Start the unified full-stack server (runs Express backend + Vite frontend concurrently on port 3000):
```bash
npm run dev
```

Once started, open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

### 6. Build and Run Production Server
To compile the TypeScript bundle and run the hardened production server:
```bash
# Build the optimized production bundle into /dist
npm run build

# Start the Node production server
npm start
```

---

## 📖 How to Use Shape QR (Step-by-Step)

### Step 1: Create Your Digital Card
1. Click **Create My Card** or navigate to the **Digital vCard** tab from the top navigation.
2. Fill in the two primary required fields:
   - **Full Name** (e.g., `Alex Morgan`)
   - **Phone Number** (e.g., `+1 (555) 019-2834`)
3. Optionally enter your **Job Title**, **Company**, or avatar URL.

### Step 2: Add Social & Professional Links
1. Click the **+ Add More Details** button below the core fields.
2. Use the search bar to find platforms (e.g., *Instagram, LinkedIn, GitHub, WhatsApp, Website*).
3. Select an item or choose **+ Create Custom Field**.
4. Enter your username or link (e.g., `@alexmorgan` or `https://alexmorgan.design`).
   - *Note*: Shape QR automatically formats handles into complete, valid URLs!
5. Use the eye icon to show/hide fields, or the trash icon to remove unwanted entries.

### Step 3: Select a Card Theme
In the **Card Theme** selector, choose from curated themes:
- **Soft Lavender**: Modern pastel aesthetic with soft shadows.
- **Minimal White**: Clean monochrome layout for modern professionals.
- **Elegant Black**: High-contrast dark mode for sleek portfolios.
- **Ocean Blue / Warm Beige**: Warm earthy or fresh tech-inspired tones.

### Step 4: Generate & Customize Your QR Code
1. Click **Generate QR Code** or navigate to the **QR Studio**.
2. Select your desired mode:
   - **Interactive Card Link** (Recommended): Encodes your public card link (`http://localhost:3000/card/<your-id>`).
   - **Direct vCard (Offline)**: Encodes full contact details directly into the QR matrix.
3. Choose a template style (Heart shape, Rounded badges, Minimalist squares, etc.).
4. Download your QR code as **PNG** or **SVG**.

### Step 5: View & Share the Public Profile
1. Click **Preview Digital Card** or **Open Public Card Link**.
2. The browser navigates to `/card/:id` (e.g., `http://localhost:3000/card/alex-morgan-lead`).
3. Recipients who scan your QR code or open the link can:
   - Click any social icon to visit your profile.
   - Click **Call** to dial directly.
   - Click **Share** to copy the URL or trigger their device's native share sheet.

### Step 6: Download .vcf Contact
1. On the digital card page, click **Save Contact**.
2. A standardized `.vcf` (vCard 3.0) file downloads immediately to the device.
3. On smartphones, opening the downloaded `.vcf` prompts iOS or Android to save all details directly to the device's address book.

---

## 💾 Local Data Persistence

Shape QR does not require external database servers, database credentials, or cloud hosting:
- All profiles and QR configurations are stored locally inside the `./data/` folder:
  - `./data/profiles.json`: Stores all created digital vCards.
  - `./data/qr_codes.json`: Stores customized QR configurations.
- Profile changes are automatically persisted to disk atomically.
- A default verified profile (`alex-morgan-lead`) is pre-seeded for immediate local testing.

---

## 📡 REST API Reference & cURL Examples

You can interact directly with the local API using `curl` or any API client (Postman, Bruno, Thunder Client).

### 1. Health Check
```bash
curl -s http://localhost:3000/api/health
```
**Response:**
```json
{
  "status": "ok",
  "brand": "Shape QR",
  "storage": "Self-Contained Persistent Store",
  "profilesCount": 2,
  "timestamp": 1793618869428
}
```

### 2. Fetch a Card Profile by ID
```bash
curl -s http://localhost:3000/api/profiles/alex-morgan-lead
```

### 3. Create a New Profile
```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Connor",
    "phoneNumber": "+1 (555) 234-5678",
    "jobTitle": "Security Engineer",
    "company": "Cyberdyne Systems",
    "fields": [
      {
        "id": "f_1",
        "key": "github",
        "label": "GitHub",
        "category": "Social Media",
        "type": "url",
        "value": "sarahconnor",
        "isVisible": true
      },
      {
        "id": "f_2",
        "key": "email",
        "label": "Email",
        "category": "Contact",
        "type": "email",
        "value": "sarah@example.com",
        "isVisible": true
      }
    ]
  }'
```

### 4. Download `.vcf` Contact File
```bash
curl -sI http://localhost:3000/api/profiles/alex-morgan-lead/vcf
```
**Headers:**
```http
HTTP/1.1 200 OK
Content-Type: text/vcard; charset=utf-8
Content-Disposition: attachment; filename="alex-morgan-lead.vcf"
```

---

## ❓ Troubleshooting & FAQs

### Q: Port 3000 is already in use by another application.
Set a custom port before starting:
```bash
PORT=3005 npm run dev
```
Then visit `http://localhost:3005`.

### Q: How do I reset or clear saved local cards?
Delete or empty `./data/profiles.json` and `./data/qr_codes.json`:
```bash
# Clear data files (the app will automatically regenerate the demo profile)
rm -rf data/*.json
```
Also clear your browser's `localStorage` via DevTools > Application > Local Storage > Clear.

### Q: Does Shape QR work completely offline?
Yes! In "Direct vCard" mode, the QR code contains the full contact payload directly within the code pixels. Recipients can scan it with their phone camera with zero internet connection.

### Q: Where are files downloaded?
When you click **Download PNG**, **Download SVG**, or **Save Contact (.vcf)**, the files are downloaded directly into your browser's default downloads directory.

---

## 🔒 Security Hardening

Shape QR follows OWASP security best practices:
1. **HTTP Security Headers via Helmet**: Enforces `X-Content-Type-Options: nosniff`, Content Security Policy (CSP), and cross-origin resource isolation.
2. **Rate Limiting**: Protected by `express-rate-limit` against flood attacks and resource exhaustion.
3. **Payload Cap**: Body parser strictly enforces a `100kb` request ceiling.
4. **Input Sanitization**: Slugs and IDs must match `/^[a-zA-Z0-9_-]{1,64}$/`. Path traversal sequences (`../`) are blocked.
5. **XSS Protection**: Link normalizers block `javascript:`, `data:`, `vbscript:`, and `blob:` pseudo-protocols, only allowing safe protocols (`https:`, `http:`, `mailto:`, `tel:`).
6. **No Leaked Stack Traces**: Centralized error middleware ensures clients only receive standardized, safe error responses.

---

## 📁 Project Structure

```text
├── server.ts                    # Hardened full-stack Express server & API routes
├── index.html                   # HTML entry point with meta tags & typography
├── package.json                 # Project dependencies & npm scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler configuration
├── .env.example                 # Environment variable template
├── data/                        # Local persistent data directory
│   ├── profiles.json            # Stored digital vCard profiles
│   └── qr_codes.json            # Stored QR code configurations
└── src/
    ├── main.tsx                 # React application root
    ├── App.tsx                  # Client router (Home, Studio, vCard, /card/:id view)
    ├── index.css                # Tailwind CSS styling & tactile design tokens
    ├── types/
    │   ├── qr.ts                # TypeScript types for QR codes & templates
    │   └── vcard.ts             # TypeScript types for vCard profiles & fields
    ├── utils/
    │   ├── profileStorage.ts    # Profile persistence, ID generator, and API client
    │   ├── socialIcons.tsx      # Platform icons, brand colors & URL sanitizers
    │   ├── qrGenerator.ts       # QR matrix engine and SVG/PNG exporter
    │   └── vcardFormatter.ts    # RFC 2426 vCard 3.0 builder & file downloader
    └── components/
        ├── Navigation.tsx       # Top navbar with view switcher & brand identity
        ├── HeroSection.tsx      # Landing hero with quick CTA
        ├── VCardStudio.tsx      # Interactive card builder with "+ Add More Details"
        ├── AddFieldModal.tsx    # Searchable catalog for social & custom fields
        ├── DigitalCardView.tsx  # Standalone mobile profile view for /card/:id
        ├── QREditor.tsx         # QR design customization controls & exports
        ├── FunQRCodeRenderer.tsx# Live QR preview renderer (Canvas & SVG)
        ├── TemplateGallery.tsx  # Preset styles & curated QR shapes
        └── Footer.tsx           # Footer with links & developer signature
```

---

## 📄 License

MIT License. Designed and built with ❤️ for fast, seamless digital connections.
