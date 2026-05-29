# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: This changelog is maintained in English only. Other documentation
> (README, custom-domain guide, platform-specific READMEs) is translated into
> 8 languages, but per-language changelogs would be 8× maintenance burden for
> low-value content.

## [Unreleased]

## [1.0.0] - 2026-05-29

Initial release.

### Added

- **One-click deployment for 4 platforms**: Cloudflare Workers, Vercel, Netlify, Deno Deploy
- **Four-stage request filtering**:
  - L0: extension blocklist (`.php`, `.aspx`) → 302 to google.com
  - L1: path allowlist (tracking-specific routes + root static files) → 302 on miss
  - L2: anti-Microsoft Defender SafeLinks scanner detection
  - L3: reverse proxy to backend
- **Dual L2 implementation**:
  - Cloudflare: native ASN 8075 (MICROSOFT-CORP-MSN-AS-BLOCK) detection
  - Vercel / Netlify / Deno Deploy: Microsoft IPv4 range matching (EOP outbound + Microsoft 365 + MS Corp historical ranges)
- **Source-of-truth IP range list** at `shared/microsoft-ranges.js` with CIDR matching utilities
- **Configurable backend** via environment variables:
  - `BACKEND_HOST` (default: `cf-track.laifa.xin`)
  - `BACKEND_PROTOCOL` (default: `http:`)
  - `REDIRECT_TARGET` (default: `https://www.google.com`)
- **Attachment download tracking** via existing `/att/` and `/attachment/` path prefixes — zero additional configuration
- **Custom domain binding guides** for all 4 platforms (`docs/custom-domain.md`)
- **8-language documentation**: 简体中文 (default), 繁體中文, English, 日本語, Français, Deutsch, Español, Português
- **Centered README header** with shields.io badges, official website link, and language switcher
- **Author contact section** with website ([laifa.xin](https://laifa.xin)) and WeChat QR

### Fixed

- **Corrected original source comment** about ASN 8075: it is MICROSOFT-CORP-MSN-AS-BLOCK (Microsoft), not Google as the original comment claimed
- **Terminology consistency**: changed "bandwidth" / 带宽 / 帯域 / bande passante / Bandbreite to "traffic" / 流量 / 転送量 / trafic / Traffic across 6 languages for monthly quota descriptions (bandwidth = rate, traffic = volume)

### Internal

- Private repository `tony-claude-rules` for centralized Claude Code instruction files (symlinked into projects, gitignored from public repos)
