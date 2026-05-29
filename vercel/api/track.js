/**
 * Email Tracking Domain - Vercel Edge Function
 *
 * Four-stage filtering (L2 uses IP-range matching instead of ASN, since the
 * Vercel Edge Runtime does not expose ASN):
 *   L0  Extension blocklist (.php / .aspx → 302)
 *   L1  Path allowlist (tracking paths + static files → 302 on miss)
 *   L2  Anti-Microsoft email scanner (header fingerprint + IP-range match)
 *   L3  Reverse proxy to BACKEND_HOST
 *
 * Differences from the Cloudflare Worker version:
 *   - L2 uses Microsoft IP-range matching instead of ASN 8075 detection
 *     (slightly lower precision, but covers the main scenarios)
 *   - Otherwise behavior is identical
 */

export const config = { runtime: 'edge' };

const BLOCKED_EXTENSIONS = ['.php', '.aspx'];

const ALLOWED_PATH_PREFIXES = [
  '/center/', '/r/', '/l/', '/a/',
  '/att/', '/attachment/', '/id/', '/img/',
  '/link/', '/s-tj/', '/test/', '/track/',
];

const ALLOWED_ROOT_FILE_EXTENSIONS = ['.txt', '.png', '.ico', '.jpg'];

// Microsoft email scanner IP ranges (IPv4)
// Source of truth: shared/microsoft-ranges.js — keep in sync
const MICROSOFT_IPV4_RANGES = [
  '40.92.0.0/15', '40.107.0.0/16', '52.100.0.0/14', '104.47.0.0/17',
  '13.107.6.0/24', '13.107.9.0/24', '13.107.18.0/24', '13.107.42.0/24', '13.107.43.0/24',
  '131.107.0.0/16', '157.55.0.0/16', '157.56.0.0/14', '167.220.0.0/16',
  '204.79.197.0/24', '207.46.0.0/16',
];

function ipv4ToInt(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const x = parseInt(parts[i], 10);
    if (isNaN(x) || x < 0 || x > 255) return null;
    n = (n << 8) + x;
  }
  return n >>> 0;
}

function isIPv4InCIDR(ip, cidr) {
  const slash = cidr.indexOf('/');
  if (slash < 0) return false;
  const bits = parseInt(cidr.substring(slash + 1), 10);
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(cidr.substring(0, slash));
  if (ipInt === null || rangeInt === null) return false;
  if (bits === 0) return true;
  const mask = (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

function isMicrosoftIP(ip) {
  if (!ip || ip.includes(':')) return false;
  return MICROSOFT_IPV4_RANGES.some((cidr) => isIPv4InCIDR(ip, cidr));
}

function getClientIP(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '';
}

function isMicrosoftScanner(request) {
  const referer = request.headers.get('referer') || '';
  const model = request.headers.get('sec-ch-ua-model') || '';
  if (referer !== '' || model !== 'Surface Pro') return false;
  return isMicrosoftIP(getClientIP(request));
}

function redirect(target) {
  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
}

function isPathAllowed(pathname) {
  const lower = pathname.toLowerCase();

  if (BLOCKED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return false;
  }

  if (ALLOWED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  const isRootFile =
    pathname.startsWith('/') &&
    !pathname.substring(1).includes('/') &&
    pathname.includes('.');
  if (isRootFile) {
    const ext = lower.substring(lower.lastIndexOf('.'));
    if (ALLOWED_ROOT_FILE_EXTENSIONS.includes(ext)) {
      return true;
    }
  }

  return false;
}

export default async function handler(request) {
  const url = new URL(request.url);
  const redirectTarget = process.env.REDIRECT_TARGET || 'https://www.google.com';

  if (!isPathAllowed(url.pathname)) {
    return redirect(redirectTarget);
  }

  if (isMicrosoftScanner(request)) {
    return redirect(redirectTarget);
  }

  const backendHost = process.env.BACKEND_HOST || 'cf-track.laifa.xin';
  const backendProtocol = process.env.BACKEND_PROTOCOL || 'http:';

  const backendUrl = new URL(request.url);
  backendUrl.hostname = backendHost;
  backendUrl.protocol = backendProtocol;

  try {
    return await fetch(new Request(backendUrl.toString(), request));
  } catch (error) {
    console.error('Backend fetch failed:', error);
    return new Response('Backend fetch failed', { status: 502 });
  }
}
