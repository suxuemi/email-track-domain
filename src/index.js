/**
 * Email Tracking Domain - Cloudflare Worker
 *
 * Four-stage filtering reverse proxy for email tracking:
 *   L0  Extension blocklist (.php / .aspx → 302)
 *   L1  Path allowlist (tracking paths + static files, miss → 302)
 *   L2  Anti-Microsoft email scanner fingerprint (ASN 8075 + Surface Pro + empty Referer → 302)
 *   L3  Reverse proxy to tracking backend (env.BACKEND_HOST)
 *
 * L0/L1/L2 hits all redirect to google.com to avoid exposing the backend.
 *
 * Configuration (vars in wrangler.jsonc or Dashboard):
 *   BACKEND_HOST       Tracking backend hostname, default cf-track.laifa.xin
 *   BACKEND_PROTOCOL   Backend protocol, default http: (change to https: if backend is HTTPS)
 *   REDIRECT_TARGET    Where to send rejected requests, default https://www.google.com
 */

const BLOCKED_EXTENSIONS = ['.php', '.aspx'];

const ALLOWED_PATH_PREFIXES = [
  '/center/', '/r/', '/l/', '/a/',
  '/att/', '/attachment/', '/id/', '/img/',
  '/link/', '/s-tj/', '/test/', '/track/',
];

const ALLOWED_ROOT_FILE_EXTENSIONS = ['.txt', '.png', '.ico', '.jpg'];

// Microsoft email scanner IP ranges (IPv4, used as fallback when ASN is unavailable)
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

/**
 * Anti-Microsoft Defender SafeLinks / Outlook link pre-scan.
 *
 * Header fingerprint: empty Referer + Sec-CH-UA-Model="Surface Pro"
 * Network fingerprint: CF-native ASN 8075 (MICROSOFT-CORP-MSN-AS-BLOCK); fall back to IP-range match.
 *
 * Note: this check does not cover Gmail / Google Safe Browsing (ASN 15169); extend if needed.
 */
function isMicrosoftScanner(request) {
  const referer = request.headers.get('referer') || '';
  const model = request.headers.get('sec-ch-ua-model') || '';
  if (referer !== '' || model !== 'Surface Pro') return false;

  const cf = request.cf || {};
  if (cf.asn === 8075) return true;

  // ASN unavailable (local dev / unusual path) — fall back to IP-range match
  const ip = request.headers.get('cf-connecting-ip');
  return isMicrosoftIP(ip);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const redirectTarget = env.REDIRECT_TARGET || 'https://www.google.com';

    if (!isPathAllowed(url.pathname)) {
      return redirect(redirectTarget);
    }

    if (isMicrosoftScanner(request)) {
      return redirect(redirectTarget);
    }

    const backendHost = env.BACKEND_HOST || 'cf-track.laifa.xin';
    const backendProtocol = env.BACKEND_PROTOCOL || 'http:';

    const backendUrl = new URL(request.url);
    backendUrl.hostname = backendHost;
    backendUrl.protocol = backendProtocol;

    try {
      return await fetch(new Request(backendUrl.toString(), request));
    } catch (error) {
      console.error('Backend fetch failed:', error);
      return new Response('Backend fetch failed', { status: 502 });
    }
  },
};
