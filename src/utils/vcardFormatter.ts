import { VCardProfile, VCardField } from '../types/vcard';
import { normalizeFieldValue } from './socialIcons';

/**
 * Builds a standards-compliant VCF 3.0 string from a VCardProfile
 */
export function buildVcfString(profile: VCardProfile): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  // Name
  const cleanName = (profile.fullName || 'Contact').trim();
  const nameParts = cleanName.split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || '';
  lines.push(`N:${lastName};${firstName};;;`);
  lines.push(`FN:${cleanName}`);

  // Organization and Title
  if (profile.company?.trim()) {
    lines.push(`ORG:${profile.company.trim()}`);
  }
  if (profile.jobTitle?.trim()) {
    lines.push(`TITLE:${profile.jobTitle.trim()}`);
  }

  // Primary Phone (Required permanent field)
  if (profile.phoneNumber?.trim()) {
    const cleanPhone = profile.phoneNumber.trim().replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone || profile.phoneNumber.trim()}`);
  }

  // Optional visible fields
  const visibleFields = profile.fields.filter((f) => f.isVisible && f.value?.trim());

  for (const field of visibleFields) {
    const val = field.value.trim();
    const normalized = normalizeFieldValue(field.key, val);

    switch (field.key) {
      case 'secondary_phone':
        lines.push(`TEL;TYPE=WORK,VOICE:${val.replace(/[^\d+]/g, '') || val}`);
        break;

      case 'email':
      case 'work_email':
        lines.push(`EMAIL;TYPE=INTERNET:${val.replace(/^mailto:/i, '')}`);
        break;

      case 'website':
      case 'business_website':
      case 'portfolio':
      case 'custom_url':
        lines.push(`URL:${normalized}`);
        break;

      case 'address':
      case 'office_address':
        lines.push(`ADR;TYPE=WORK:;;${val.replace(/;/g, ' ')};;;;`);
        break;

      case 'personal_note':
      case 'custom_text':
        lines.push(`NOTE:${val.replace(/\n/g, '\\n')}`);
        break;

      case 'date_of_birth':
        lines.push(`BDAY:${val}`);
        break;

      // Standards-compliant social profiles
      case 'instagram':
      case 'linkedin':
      case 'github':
      case 'x':
      case 'twitter':
      case 'facebook':
      case 'youtube':
      case 'tiktok':
      case 'threads':
      case 'telegram':
      case 'discord':
      case 'whatsapp':
        lines.push(`X-SOCIALPROFILE;type=${field.key}:${normalized}`);
        break;

      default:
        if (field.type === 'url') {
          lines.push(`URL:${normalized}`);
        } else if (field.type === 'email') {
          lines.push(`EMAIL:${val.replace(/^mailto:/i, '')}`);
        } else if (field.type === 'phone') {
          lines.push(`TEL:${val.replace(/[^\d+]/g, '') || val}`);
        } else {
          lines.push(`NOTE;${field.label}:${val}`);
        }
        break;
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the .vcf contact file without opening a new tab
 */
export function downloadVcfFile(profile: VCardProfile, fileName?: string): void {
  const vcfContent = buildVcfString(profile);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeName = (profile.fullName || 'contact')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  link.href = url;
  link.download = fileName || `${safeName || 'contact'}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
