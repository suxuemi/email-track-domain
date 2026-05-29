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
 * ASN 8075 = MICROSOFT-CORP-MSN-AS-BLOCK，Surface Pro 是微软设备。
 * 微软的反钓鱼系统会自动 GET 邮件里的链接预扫描，命中会污染打开率/点击率统计。
 * 让这种指纹组合的请求看到 google.com 而不是真实的追踪后端。
 *
 * 注：本检测不针对 Gmail / Google Safe Browsing（ASN 15169），如需可自行扩展。
 */
function isMicrosoftScanner(request) {
  const cf = request.cf || {};
  const referer = request.headers.get('referer') || '';
  const model = request.headers.get('sec-ch-ua-model') || '';
  return cf.asn === 8075 && referer === '' && model === 'Surface Pro';
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
