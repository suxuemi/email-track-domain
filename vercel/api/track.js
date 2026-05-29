/**
 * Email Tracking Domain - Vercel Edge Function（降级版）
 *
 * ⚠️ 与 Cloudflare Worker 版的差异：
 *   - 不支持 L2 反 Microsoft Defender SafeLinks 扫描器检测
 *     原因：Vercel Edge Runtime 不暴露请求 ASN，无法识别微软扫描指纹
 *   - L0/L1/L3 行为完全一致
 *
 * 如果需要完整的反扫描能力，请使用 Cloudflare Worker 版本（仓库根目录）。
 */

export const config = { runtime: 'edge' };

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

export default async function handler(request) {
  const url = new URL(request.url);
  const redirectTarget = process.env.REDIRECT_TARGET || 'https://www.google.com';

  if (!isPathAllowed(url.pathname)) {
    return redirect(redirectTarget);
  }

  // L2 (Microsoft scanner detection) skipped — Vercel 拿不到 ASN

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
