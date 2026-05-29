/**
 * Microsoft email scanner IP ranges (source of truth)
 *
 * Purpose: on edge platforms without native ASN detection (Vercel / Netlify /
 * Deno Deploy), use IP-range matching instead of ASN 8075 detection to
 * implement L2 anti-Microsoft Defender SafeLinks scanner detection.
 *
 * Refresh recommendation: every 3-6 months. Data sources:
 *   - Office 365 IP ranges JSON: https://endpoints.office.com/endpoints/worldwide?clientrequestid=<uuid>
 *   - Microsoft 365 docs: https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges
 *   - ASN 8075 BGP announcements: https://bgpview.io/asn/8075
 *
 * ⚠️ This file is the source of truth — after updating, sync MICROSOFT_IPV4_RANGES in:
 *   - src/index.js                          (Cloudflare Worker)
 *   - vercel/api/track.js                   (Vercel Edge Function)
 *   - netlify/edge-functions/track.js       (Netlify Edge Function)
 *   - deno-deploy/main.js                   (Deno Deploy)
 *
 * Precision strategy (avoid overly broad ranges that cause false positives):
 *   - EOP outbound = primary SafeLinks scanner source, must include
 *   - Microsoft 365 services = Office services, include
 *   - Microsoft Corp historical ranges = corporate network / engineers, include (small volume)
 *   - Do NOT include broad Azure ranges (13.64-/11, 20.0-/8, etc.) — those host
 *     customer VMs and would cause false positives against real users
 */

export const MICROSOFT_IPV4_RANGES = [
  // === Exchange Online Protection (EOP) outbound — primary SafeLinks scanner source ===
  '40.92.0.0/15',
  '40.107.0.0/16',
  '52.100.0.0/14',     // 52.100.0.0 - 52.103.255.255
  '104.47.0.0/17',

  // === Microsoft 365 / Office Online ===
  '13.107.6.0/24',
  '13.107.9.0/24',
  '13.107.18.0/24',
  '13.107.42.0/24',
  '13.107.43.0/24',

  // === Microsoft Corp ASN 8075 historical ranges ===
  '131.107.0.0/16',
  '157.55.0.0/16',
  '157.56.0.0/14',     // 157.56.0.0 - 157.59.255.255
  '167.220.0.0/16',
  '204.79.197.0/24',
  '207.46.0.0/16',
];

/**
 * Convert IPv4 to 32-bit unsigned integer.
 */
export function ipv4ToInt(ip) {
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

/**
 * Check whether an IPv4 address falls within a CIDR range.
 */
export function isIPv4InCIDR(ip, cidr) {
  const slash = cidr.indexOf('/');
  if (slash < 0) return false;
  const range = cidr.substring(0, slash);
  const bits = parseInt(cidr.substring(slash + 1), 10);
  if (isNaN(bits) || bits < 0 || bits > 32) return false;
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt === null || rangeInt === null) return false;
  if (bits === 0) return true;
  const mask = (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

/**
 * Check whether an IP is in Microsoft's known ranges (IPv4 only; IPv6 always returns false).
 *
 * Note: MS SafeLinks scanners currently use almost exclusively IPv4, so IPv6 is unsupported.
 *       If IPv6 scanners appear later, extend MICROSOFT_IPV6_RANGES and the matching function.
 */
export function isMicrosoftIP(ip) {
  if (!ip) return false;
  if (ip.includes(':')) return false;
  return MICROSOFT_IPV4_RANGES.some((cidr) => isIPv4InCIDR(ip, cidr));
}
