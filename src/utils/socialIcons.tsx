import React from 'react';
import { VCardField, FieldCategory } from '../types/vcard';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Building,
  User,
  Calendar,
  FileText,
  Link as LinkIcon,
  MessageCircle,
} from 'lucide-react';

/**
 * Strictly sanitizes and normalizes input values for links and social media.
 * Blocks all script execution vectors (javascript:, data:, vbscript:, file:, blob:)
 * and ensures only safe protocols (https, http, mailto, tel) are produced.
 */
export function normalizeFieldValue(key: string, value: string): string {
  if (!value || typeof value !== 'string') return '';

  // Strip control characters, zero-width characters, and whitespace
  // eslint-disable-next-line no-control-regex
  const sanitized = value.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '').trim();
  if (!sanitized) return '';

  // Detect and reject any dangerous URI schemes (even if URL encoded or spaced)
  const lowerNoSpace = sanitized.toLowerCase().replace(/[\s\r\n\t]/g, '');
  if (
    lowerNoSpace.startsWith('javascript:') ||
    lowerNoSpace.startsWith('data:') ||
    lowerNoSpace.startsWith('vbscript:') ||
    lowerNoSpace.startsWith('file:') ||
    lowerNoSpace.startsWith('blob:') ||
    lowerNoSpace.includes('script:')
  ) {
    return '#';
  }

  // Helper to extract clean username (alphanumeric, dot, underscore, hyphen)
  const extractCleanHandle = (v: string): string => {
    const handle = v.replace(/^[@/]+/, '').trim();
    // If it's a full URL, strip leading domain
    const match = handle.match(/(?:(?:instagram|github|linkedin|x|twitter|facebook|threads|telegram|tiktok|snapchat|pinterest)\.com\/|t\.me\/)?([a-zA-Z0-9._-]+)/i);
    return match && match[1] ? match[1] : handle.replace(/[^a-zA-Z0-9._-]/g, '');
  };

  switch (key) {
    case 'instagram':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://instagram.com/${extractCleanHandle(sanitized)}`;

    case 'github':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://github.com/${extractCleanHandle(sanitized)}`;

    case 'linkedin':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://www.linkedin.com/in/${extractCleanHandle(sanitized)}`;

    case 'x':
    case 'twitter':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://x.com/${extractCleanHandle(sanitized)}`;

    case 'facebook':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://www.facebook.com/${extractCleanHandle(sanitized)}`;

    case 'youtube': {
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      const clean = extractCleanHandle(sanitized);
      return `https://youtube.com/@${clean}`;
    }

    case 'tiktok': {
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://www.tiktok.com/@${extractCleanHandle(sanitized)}`;
    }

    case 'whatsapp': {
      const digitsOnly = sanitized.replace(/[^\d+]/g, '');
      const cleanDigits = digitsOnly.startsWith('+') ? digitsOnly.slice(1) : digitsOnly;
      return cleanDigits ? `https://wa.me/${cleanDigits}` : '#';
    }

    case 'threads':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://www.threads.net/@${extractCleanHandle(sanitized)}`;

    case 'telegram':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://t.me/${extractCleanHandle(sanitized)}`;

    case 'discord':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return sanitized;

    case 'snapchat':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://www.snapchat.com/add/${extractCleanHandle(sanitized)}`;

    case 'pinterest':
      if (/^https?:\/\//i.test(sanitized)) return sanitized;
      return `https://www.pinterest.com/${extractCleanHandle(sanitized)}`;

    case 'email':
    case 'work_email': {
      const cleanEmail = sanitized.replace(/^mailto:/i, '').trim();
      return cleanEmail ? `mailto:${cleanEmail}` : '#';
    }

    case 'phone':
    case 'secondary_phone': {
      const cleanPhone = sanitized.replace(/^tel:/i, '').replace(/[^\d+]/g, '');
      return cleanPhone ? `tel:${cleanPhone}` : '#';
    }

    case 'website':
    case 'business_website':
    case 'portfolio':
    case 'custom_url': {
      if (!/^https?:\/\//i.test(sanitized)) {
        return `https://${sanitized}`;
      }
      return sanitized;
    }

    default:
      if (/^https?:\/\//i.test(sanitized)) {
        return sanitized;
      }
      return sanitized;
  }
}

/**
 * Returns a high-quality, crisp SVG brand logo or icon
 */
export function getPlatformIcon(key: string, className: string = 'w-5 h-5'): React.ReactNode {
  switch (key) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Instagram">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );

    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="GitHub">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="LinkedIn">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );

    case 'x':
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="X">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Facebook">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="WhatsApp">
          <path d="M12.031 0C5.397 0 0 5.397 0 12.031c0 2.12.553 4.188 1.603 6.009L.064 24l6.155-1.614a11.96 11.96 0 005.812 1.488h.005c6.632 0 12.029-5.397 12.029-12.031 0-3.213-1.252-6.234-3.525-8.508C18.265 1.252 15.244 0 12.031 0zm0 21.996h-.004a9.96 9.96 0 01-5.083-1.39l-.365-.216-3.774.99.1-3.676-.238-.378a9.98 9.98 0 01-1.534-5.3c0-5.522 4.492-10.014 10.018-10.014 2.675 0 5.19 1.042 7.081 2.934a9.957 9.957 0 012.933 7.081c0 5.523-4.492 10.015-10.018 10.015zm5.49-7.494c-.301-.15-1.782-.88-2.058-.98-.276-.1-.476-.15-.677.15-.201.301-.777.98-.953 1.18-.175.201-.351.226-.652.075-.301-.151-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.151-.677-1.632-.928-2.235-.245-.588-.493-.508-.677-.518-.175-.009-.376-.011-.577-.011-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.912 1.229 3.113.15.201 2.124 3.243 5.145 4.549.718.311 1.279.497 1.716.636.721.229 1.377.197 1.895.12.577-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.352z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="YouTube">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="TikTok">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c-.01 1.76-.57 3.56-1.72 4.93-1.22 1.45-3 2.37-4.88 2.54-1.93.18-3.93-.37-5.46-1.58-1.55-1.22-2.52-3.05-2.67-5.02-.15-1.95.52-3.96 1.87-5.38 1.34-1.41 3.27-2.19 5.25-2.18.34 0 .69.03 1.03.09v4.08c-.3-.09-.62-.14-.94-.14-1.07-.01-2.13.43-2.85 1.23-.71.79-.98 1.91-.72 2.96.26 1.05 1.09 1.88 2.14 2.14 1.05.26 2.18-.01 2.96-.72.64-.58.98-1.41.98-2.28V.02z" />
        </svg>
      );

    case 'threads':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Threads">
          <path d="M12.186 24C5.467 24 0 18.672 0 12.115 0 5.557 5.467.229 12.186.229c6.643 0 11.895 5.253 11.895 11.886 0 1.14-.145 2.247-.417 3.308-.432 1.688-1.89 2.593-3.488 2.215-1.442-.341-2.128-1.656-1.83-3.153.188-.946.294-1.928.294-2.927 0-4.63-3.238-8.396-7.868-8.396-4.63 0-7.867 3.766-7.867 8.396 0 4.63 3.237 8.396 7.867 8.396 2.175 0 4.093-.787 5.522-2.106.878-.81 2.268-.78 3.109.117.84.897.779 2.327-.14 3.176C17.29 22.95 14.887 24 12.186 24zm-.008-14.877c-2.482 0-4.343 1.96-4.343 4.434 0 2.475 1.861 4.435 4.343 4.435 1.77 0 3.226-1.002 3.931-2.481-1.353-.332-2.348-1.282-2.348-2.616 0-1.716 1.408-2.73 3.267-2.73.473 0 .918.067 1.332.194-.486-1.04-1.536-1.722-2.793-1.722z" />
        </svg>
      );

    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Telegram">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
        </svg>
      );

    case 'discord':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Discord">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );

    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Snapchat">
          <path d="M12.015.003c-3.791 0-6.193 2.766-6.193 5.434 0 .787.218 1.83.479 2.473-.393.131-1.047.393-1.462.698-.568.415-.808.961-.716 1.637.13.917.96 1.332 1.986 1.485.044.24.088.502.088.807 0 .546-.35 1.135-1.026 1.747-.743.677-1.748 1.157-2.927 1.42-.328.065-.546.305-.568.611-.022.306.153.589.437.698 1.463.59 2.927.874 4.347.874.655 0 1.267-.066 1.835-.197.655-.153 1.135-.393 1.507-.633.284-.197.611-.328.961-.328.306 0 .59.109.808.262.59.437 1.442.874 2.468.874 1.004 0 1.856-.437 2.468-.874.218-.153.502-.262.808-.262.35 0 .677.131.961.328.372.24.852.48 1.507.633.568.131 1.18.197 1.835.197 1.42 0 2.884-.284 4.347-.874.284-.109.459-.392.437-.698-.022-.306-.24-.546-.568-.611-1.179-.263-2.184-.743-2.927-1.42-.677-.612-1.026-1.201-1.026-1.747 0-.305.044-.567.088-.807 1.026-.153 1.856-.568 1.986-1.485.088-.676-.148-1.222-.716-1.637-.415-.305-1.069-.567-1.462-.698.261-.643.479-1.686.479-2.473 0-2.668-2.402-5.434-6.193-5.434z" />
        </svg>
      );

    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Pinterest">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.057.24-.19.291-.439.175-1.643-.765-2.671-3.165-2.671-5.094 0-4.148 3.015-7.959 8.694-7.959 4.564 0 8.112 3.253 8.112 7.6 0 4.535-2.859 8.185-6.828 8.185-1.333 0-2.586-.693-3.014-1.512 0 0-.66 2.513-.82 3.128-.298 1.144-1.103 2.578-1.642 3.446 1.228.379 2.537.586 3.896.586 6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      );

    case 'email':
    case 'work_email':
      return <Mail className={className} />;

    case 'phone':
    case 'secondary_phone':
      return <Phone className={className} />;

    case 'website':
    case 'business_website':
    case 'portfolio':
      return <Globe className={className} />;

    case 'address':
    case 'office_address':
      return <MapPin className={className} />;

    case 'job_title':
      return <Briefcase className={className} />;

    case 'company':
      return <Building className={className} />;

    case 'date_of_birth':
      return <Calendar className={className} />;

    case 'personal_note':
      return <FileText className={className} />;

    default:
      return <LinkIcon className={className} />;
  }
}

/**
 * Full Catalog of Suggested Fields available in "+ Add Field" modal
 */
export interface SuggestedFieldDefinition {
  key: string;
  label: string;
  category: FieldCategory;
  type: 'url' | 'text' | 'email' | 'phone';
  placeholder: string;
  prefixUrl?: string;
  description: string;
}

export const SUGGESTED_FIELDS_CATALOG: SuggestedFieldDefinition[] = [
  // --- Contact ---
  {
    key: 'email',
    label: 'Email',
    category: 'Contact',
    type: 'email',
    placeholder: 'alex@example.com',
    description: 'Direct email address for one-click mail composer',
  },
  {
    key: 'secondary_phone',
    label: 'Secondary Phone',
    category: 'Contact',
    type: 'phone',
    placeholder: '+1 (555) 987-6543',
    description: 'Work line, mobile, or home telephone',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    category: 'Contact',
    type: 'phone',
    placeholder: '+1 555 123 4567',
    prefixUrl: 'https://wa.me/',
    description: 'Instant WhatsApp direct chat link',
  },
  {
    key: 'website',
    label: 'Website',
    category: 'Contact',
    type: 'url',
    placeholder: 'https://yoursite.com',
    description: 'Personal or brand website',
  },
  {
    key: 'address',
    label: 'Address',
    category: 'Contact',
    type: 'text',
    placeholder: '742 Evergreen Terrace, Springfield',
    description: 'City, mailing address, or studio location',
  },

  // --- Social Media ---
  {
    key: 'instagram',
    label: 'Instagram',
    category: 'Social Media',
    type: 'url',
    placeholder: '@username or profile link',
    prefixUrl: 'https://instagram.com/',
    description: 'Visual feed and reels profile',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    category: 'Social Media',
    type: 'url',
    placeholder: 'username or in/profile',
    prefixUrl: 'https://linkedin.com/in/',
    description: 'Professional career profile and network',
  },
  {
    key: 'github',
    label: 'GitHub',
    category: 'Social Media',
    type: 'url',
    placeholder: 'username or profile link',
    prefixUrl: 'https://github.com/',
    description: 'Open-source code, repos, and developer profile',
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    category: 'Social Media',
    type: 'url',
    placeholder: '@username or profile link',
    prefixUrl: 'https://x.com/',
    description: 'Short-form posts and thoughts',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    category: 'Social Media',
    type: 'url',
    placeholder: 'username or page link',
    prefixUrl: 'https://facebook.com/',
    description: 'Facebook personal profile or public page',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    category: 'Social Media',
    type: 'url',
    placeholder: '@channel or link',
    prefixUrl: 'https://youtube.com/@',
    description: 'Video channel or portfolio reel',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    category: 'Social Media',
    type: 'url',
    placeholder: '@username',
    prefixUrl: 'https://tiktok.com/@',
    description: 'Short-form mobile video profile',
  },
  {
    key: 'threads',
    label: 'Threads',
    category: 'Social Media',
    type: 'url',
    placeholder: '@username',
    prefixUrl: 'https://threads.net/@',
    description: 'Text threads by Instagram',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    category: 'Social Media',
    type: 'url',
    placeholder: 'username',
    prefixUrl: 'https://t.me/',
    description: 'Direct Telegram channel or username',
  },
  {
    key: 'discord',
    label: 'Discord',
    category: 'Social Media',
    type: 'text',
    placeholder: 'username or invite link',
    description: 'Discord handle or community server invite',
  },
  {
    key: 'snapchat',
    label: 'Snapchat',
    category: 'Social Media',
    type: 'url',
    placeholder: 'username',
    prefixUrl: 'https://snapchat.com/add/',
    description: 'Snapchat stories and add friend link',
  },
  {
    key: 'pinterest',
    label: 'Pinterest',
    category: 'Social Media',
    type: 'url',
    placeholder: 'username',
    prefixUrl: 'https://pinterest.com/',
    description: 'Moodboards, design pins, and inspiration',
  },

  // --- Professional ---
  {
    key: 'job_title',
    label: 'Job Title',
    category: 'Professional',
    type: 'text',
    placeholder: 'Creative Director / Senior Software Engineer',
    description: 'Role or headline displayed prominently',
  },
  {
    key: 'company',
    label: 'Company',
    category: 'Professional',
    type: 'text',
    placeholder: 'Acme Studios Inc.',
    description: 'Employer, agency, or startup name',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    category: 'Professional',
    type: 'url',
    placeholder: 'https://portfolio.design',
    description: 'Case studies, work samples, or Behance/Dribbble',
  },
  {
    key: 'business_website',
    label: 'Business Website',
    category: 'Professional',
    type: 'url',
    placeholder: 'https://mycompany.com',
    description: 'Company homepage or storefront',
  },
  {
    key: 'work_email',
    label: 'Work Email',
    category: 'Professional',
    type: 'email',
    placeholder: 'name@company.com',
    description: 'Enterprise or business inquiries email',
  },
  {
    key: 'office_address',
    label: 'Office Address',
    category: 'Professional',
    type: 'text',
    placeholder: 'Suite 400, 100 Innovation Way, San Francisco',
    description: 'Physical company office or headquarters',
  },

  // --- Other ---
  {
    key: 'date_of_birth',
    label: 'Date of Birth',
    category: 'Other',
    type: 'text',
    placeholder: 'October 14, 1996',
    description: 'Birthday or anniversary',
  },
  {
    key: 'personal_note',
    label: 'Personal Note',
    category: 'Other',
    type: 'text',
    placeholder: 'Available for freelance consulting & design mentorship',
    description: 'Short bio, tagline, or mission statement',
  },
  {
    key: 'custom_url',
    label: 'Custom Link',
    category: 'Other',
    type: 'url',
    placeholder: 'https://custom-service.com/user',
    description: 'Any external web address or service',
  },
  {
    key: 'custom_text',
    label: 'Custom Text Field',
    category: 'Other',
    type: 'text',
    placeholder: 'Custom details or notes',
    description: 'Any arbitrary text information',
  },
];
