/**
 * Public URL Resolution Helper
 * Ensures QR codes encode an absolute, publicly accessible HTTPS URL
 * that works from any smartphone or device across the internet.
 *
 * Rules:
 * 1. Never encodes localhost, 127.0.0.1, or local addresses.
 * 2. In Google AI Studio preview, automatically converts private developer
 *    domains (ais-dev-...) into public shared URLs (ais-pre-...) so
 *    recipients can view cards without signing into Google.
 * 3. Supports explicit production domain via VITE_PUBLIC_APP_URL.
 */

const FALLBACK_PUBLIC_DOMAIN =
  'https://ais-pre-dborb4bph3odnqssvpihcu-698355947642.asia-northeast1.run.app';

function isLoopbackAddress(hostOrUrl: string): boolean {
  if (!hostOrUrl) return false;
  const clean = hostOrUrl.toLowerCase();
  return (
    clean.includes('localhost') ||
    clean.includes('127.0.0.1') ||
    clean.includes('0.0.0.0') ||
    clean.includes('::1') ||
    clean.endsWith('.local')
  );
}

/**
 * Returns the public base URL (e.g. "https://your-domain.com")
 */
export function getPublicBaseUrl(): string {
  // 1. Check explicit environment variable (VITE_PUBLIC_APP_URL or VITE_APP_URL)
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL);

  if (envUrl && typeof envUrl === 'string') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.startsWith('http') && !isLoopbackAddress(trimmed)) {
      return trimmed;
    }
  }

  // 2. Check current browser window location
  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;

    // In AI Studio, dev container URL is ais-dev-* which requires Google authentication.
    // The public preview URL is ais-pre-*, which is publicly accessible to ANY device without login.
    if (hostname.startsWith('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }

    // If running on a public hostname (not localhost), use current origin
    if (!isLoopbackAddress(hostname) && origin && origin.startsWith('http')) {
      return origin;
    }
  }

  // 3. Fallback to public production endpoint
  return FALLBACK_PUBLIC_DOMAIN;
}

/**
 * Generates the permanent public digital card URL for a given profile ID.
 * Example: "https://your-domain.com/card/alex-morgan-lead"
 */
export function getPublicCardUrl(profileId: string): string {
  const base = getPublicBaseUrl();
  const safeId = (profileId || 'card').trim();
  return `${base}/card/${encodeURIComponent(safeId)}`;
}
