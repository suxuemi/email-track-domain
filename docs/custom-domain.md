# 绑定自定义域名

部署完成后，需要把你的域名指向 Worker / Vercel 项目，邮件追踪链接才会用你自己的域名。

---

## Cloudflare Worker

> 前提：你的域名已经在 Cloudflare 上托管（DNS 在 Cloudflare）。

### 方式 A：Workers Routes（推荐 — 子域名整体接管）

适合：用一个子域名（如 `track.yourdomain.com`）专门给追踪用。

1. 进 Cloudflare Dashboard → 选你的域名
2. 左侧 **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track`（或你想要的子域名）
   - IPv6 address: `100::`（占位地址，Worker 会接管所有请求）
   - Proxy status: **Proxied**（橙色云朵必须开）
3. 左侧 **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: 选择刚部署的 `email-track-domain`
4. 几分钟内生效。访问 `https://track.yourdomain.com/r/test` 测试是否打到你的后端。

### 方式 B：Worker Custom Domain（更简单）

适合：Workers 项目直接绑定域名（Cloudflare 自动配 DNS 和 SSL）。

1. 进 Workers Dashboard → 选 `email-track-domain` Worker
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. 输入 `track.yourdomain.com`，确认
4. Cloudflare 会自动建 DNS 记录 + 签 SSL 证书

差异：方式 A 灵活（可以路由部分路径），方式 B 直接绑域名（更省事）。普通用户用 B。

---

## Vercel

1. 进 Vercel Dashboard → 选项目 → **Settings** → **Domains**
2. 输入 `track.yourdomain.com`，Add
3. Vercel 会告诉你需要在 DNS 服务商处加一条 CNAME 记录，类似：
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. 加完 DNS 等几分钟，Vercel 自动签 SSL 证书

---

## 验证

部署 + 绑定完成后，浏览器访问：

| URL | 期望行为 |
|---|---|
| `https://track.yourdomain.com/` | 302 跳转到 google.com（根目录不在白名单） |
| `https://track.yourdomain.com/test.php` | 302 跳转到 google.com（黑名单扩展名） |
| `https://track.yourdomain.com/r/abc123` | 转发到你的后端（白名单路径） |
| `https://track.yourdomain.com/favicon.ico` | 转发到你的后端（白名单根文件） |

如果第三条返回 502 "Backend fetch failed"，说明你的后端 `BACKEND_HOST` 配置不对或后端不通。

---

## 在邮件中使用

把邮件里原本指向 `cf-track.laifa.xin` 的追踪链接全部替换成 `track.yourdomain.com` 即可。例如：

```
原：http://cf-track.laifa.xin/r/abc123
改：https://track.yourdomain.com/r/abc123
```

打开率/点击率统计依然走你原来的后端，但收件人看到的是你自己的域名 — 更专业，反垃圾邮件得分也更高。
