/**
 * Email Tracking Domain - Cloudflare Worker
 *
 * 四层过滤的邮件追踪域名反向代理：
 *   L0  扩展名黑名单（.php / .aspx → 302）
 *   L1  路径白名单（追踪路径 + 静态文件，未命中 → 302）
 *   L2  反 Microsoft 邮件扫描器指纹（ASN 8075 + Surface Pro + 空 Referer → 302）
 *   L3  反向代理到追踪后端（env.BACKEND_HOST）
 *
 * 命中 L0/L1/L2 都重定向到 google.com，避免暴露后端。
 *
 * 配置（wrangler.jsonc 的 vars 段或 Dashboard）：
 *   BACKEND_HOST       追踪后端主机名，默认 cf-track.laifa.xin
 *   BACKEND_PROTOCOL   后端协议，默认 http:（如后端有 HTTPS 改 https:）
 *   REDIRECT_TARGET    所有拒绝场景的跳转地址，默认 https://www.google.com
 */

const BLOCKED_EXTENSIONS = ['.php', '.aspx'];

const ALLOWED_PATH_PREFIXES = [
  '/center/', '/r/', '/l/', '/a/',
  '/att/', '/attachment/', '/id/', '/img/',
  '/link/', '/s-tj/', '/test/', '/track/',
];

const ALLOWED_ROOT_FILE_EXTENSIONS = ['.txt', '.png', '.ico', '.jpg'];

// Microsoft 邮件扫描器 IP 段（IPv4，仅作为 ASN 检测的兜底）
// Source of truth: shared/microsoft-ranges.js — 同步更新
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
 * 反 Microsoft Defender SafeLinks / Outlook 链接预扫描
 *
 * 头部指纹：Referer 空 + Sec-CH-UA-Model="Surface Pro"
 * 网络指纹：CF 原生 ASN 8075（MICROSOFT-CORP-MSN-AS-BLOCK），兜底用 IP 段匹配
 *
 * 注：不针对 Gmail / Google Safe Browsing（ASN 15169），如需可自行扩展。
 */
function isMicrosoftScanner(request) {
  const referer = request.headers.get('referer') || '';
  const model = request.headers.get('sec-ch-ua-model') || '';
  if (referer !== '' || model !== 'Surface Pro') return false;

  const cf = request.cf || {};
  if (cf.asn === 8075) return true;

  // ASN 拿不到（本地 dev / 异常路径）时用 IP 段兜底
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
