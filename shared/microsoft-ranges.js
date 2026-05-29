/**
 * Microsoft 邮件扫描器 IP 段（source of truth）
 *
 * 用途：在不支持 ASN 检测的边缘平台（Vercel / Netlify / Deno Deploy）上，
 *      用 IP 段匹配代替 ASN 8075 检测，实现 L2 反 Microsoft Defender SafeLinks 扫描器。
 *
 * 更新建议：每 3-6 个月同步一次。数据源：
 *   - Office 365 IP 范围 JSON: https://endpoints.office.com/endpoints/worldwide?clientrequestid=<uuid>
 *   - Microsoft 365 文档: https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges
 *   - ASN 8075 BGP 公告: https://bgpview.io/asn/8075
 *
 * ⚠️ 这个文件是 source of truth — 更新后必须同步以下文件中的 MICROSOFT_IPV4_RANGES：
 *   - src/index.js                          (Cloudflare Worker)
 *   - vercel/api/track.js                   (Vercel Edge Function)
 *   - netlify/edge-functions/track.js       (Netlify Edge Function)
 *   - deno-deploy/main.js                   (Deno Deploy)
 *
 * 精度策略（避免过宽误伤）：
 *   - EOP outbound 段 = 主要 SafeLinks 扫描器来源，必收
 *   - Microsoft 365 services 段 = Office 服务，收
 *   - Microsoft Corp 历史段 = 公司内网/工程师，收（量小）
 *   - 不收宽 Azure 段（13.64-/11, 20.0-/8 等）— 这些段里跑客户 VM，会误伤真实用户
 */

export const MICROSOFT_IPV4_RANGES = [
  // === Exchange Online Protection (EOP) outbound — 主要 SafeLinks 扫描器来源 ===
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

  // === Microsoft Corp ASN 8075 历史段 ===
  '131.107.0.0/16',
  '157.55.0.0/16',
  '157.56.0.0/14',     // 157.56.0.0 - 157.59.255.255
  '167.220.0.0/16',
  '204.79.197.0/24',
  '207.46.0.0/16',
];

/**
 * IPv4 转 32 位整数（无符号）
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
 * 判断 IPv4 是否落在 CIDR 段内
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
 * 判断 IP 是否在 Microsoft 已知段内（仅 IPv4，IPv6 一律返回 false）
 *
 * 注：MS SafeLinks 扫描器目前几乎全部使用 IPv4，IPv6 暂不支持。
 *     如未来发现 IPv6 扫描，再扩展 MICROSOFT_IPV6_RANGES 与匹配函数。
 */
export function isMicrosoftIP(ip) {
  if (!ip) return false;
  if (ip.includes(':')) return false;
  return MICROSOFT_IPV4_RANGES.some((cidr) => isIPv4InCIDR(ip, cidr));
}
