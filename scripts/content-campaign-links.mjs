const SITE_ORIGIN = 'https://cooldrivepro.com';

function normalizePathname(pathname) {
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

export function normalizeHttpsUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') return null;
    return `${parsed.origin}${normalizePathname(parsed.pathname)}`;
  } catch {
    return null;
  }
}

export function classifyCampaignLink(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return { kind: 'invalid', error: 'link URL is empty' };
  if (raw.startsWith('//') || raw.startsWith('/\\') || /^\/(?:%2f|%5c)/i.test(raw) || raw.includes('\\')) {
    return { kind: 'invalid', error: 'protocol-relative and backslash URLs are not allowed' };
  }
  if (raw.startsWith('/')) {
    const parsed = new URL(raw, SITE_ORIGIN);
    if (parsed.origin !== SITE_ORIGIN) return { kind: 'invalid', error: 'internal link resolves outside cooldrivepro.com' };
    return { kind: 'internal', path: normalizePathname(parsed.pathname) };
  }
  if (raw.startsWith('./') || raw.startsWith('../') || raw.startsWith('#') || raw.startsWith('?')) {
    return { kind: 'invalid', error: 'relative link must use an absolute site path' };
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { kind: 'invalid', error: 'link URL must be an absolute HTTPS URL or an absolute site path' };
  }
  if (parsed.protocol !== 'https:') return { kind: 'invalid', error: 'external link URL must use HTTPS' };
  if (parsed.origin === SITE_ORIGIN) return { kind: 'internal', path: normalizePathname(parsed.pathname) };
  return { kind: 'external', url: `${parsed.origin}${normalizePathname(parsed.pathname)}` };
}

export function campaignInternalPath(value) {
  const link = classifyCampaignLink(value);
  return link.kind === 'internal' ? link.path : null;
}