import { defineConfig, type DefaultTheme } from 'vitepress';

const REPO_URL = 'https://github.com/suxuemi/email-track-domain';

interface LocaleStrings {
  description: string;
  nav: { architecture: string; customDomain: string };
  sidebar: {
    gettingStarted: string;
    home: string;
    quickStart: string;
    customDomain: string;
    platforms: string;
    cloudflare: string;
    vercel: string;
    netlify: string;
    denoDeploy: string;
    technical: string;
    architecture: string;
  };
}

const STRINGS: Record<string, LocaleStrings> = {
  'zh-CN': {
    description: '邮件追踪域名一键部署 — 专属域名下的打开 / 点击 / 附件追踪反代',
    nav: { architecture: '架构', customDomain: '绑定域名' },
    sidebar: {
      gettingStarted: '入门', home: '首页', quickStart: '快速开始', customDomain: '绑定自定义域名',
      platforms: '平台部署', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: '技术', architecture: '架构与技术参考',
    },
  },
  'zh-TW': {
    description: '郵件追蹤網域一鍵部署 — 專屬網域下的開信 / 點擊 / 附件追蹤反向代理',
    nav: { architecture: '架構', customDomain: '綁定網域' },
    sidebar: {
      gettingStarted: '入門', home: '首頁', quickStart: '快速開始', customDomain: '綁定自訂網域',
      platforms: '平台部署', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: '技術', architecture: '架構與技術參考',
    },
  },
  en: {
    description: 'One-click email tracking domain reverse proxy — opens, clicks & attachments on your own domain',
    nav: { architecture: 'Architecture', customDomain: 'Custom Domain' },
    sidebar: {
      gettingStarted: 'Getting Started', home: 'Home', quickStart: 'Quick Start', customDomain: 'Bind a Custom Domain',
      platforms: 'Platforms', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: 'Technical', architecture: 'Architecture & Reference',
    },
  },
  ja: {
    description: 'メール追跡ドメインのワンクリックデプロイ — 専用ドメインでの開封 / クリック / 添付追跡',
    nav: { architecture: 'アーキテクチャ', customDomain: 'カスタムドメイン' },
    sidebar: {
      gettingStarted: 'はじめに', home: 'ホーム', quickStart: 'クイックスタート', customDomain: 'カスタムドメインのバインド',
      platforms: 'プラットフォーム', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: '技術詳細', architecture: 'アーキテクチャと技術リファレンス',
    },
  },
  fr: {
    description: 'Proxy inverse de domaine de suivi d\'email en un clic — ouvertures, clics et pièces jointes',
    nav: { architecture: 'Architecture', customDomain: 'Domaine personnalisé' },
    sidebar: {
      gettingStarted: 'Démarrage', home: 'Accueil', quickStart: 'Démarrage rapide', customDomain: 'Lier un domaine personnalisé',
      platforms: 'Plateformes', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: 'Technique', architecture: 'Architecture et référence',
    },
  },
  de: {
    description: 'Ein-Klick-Reverse-Proxy für E-Mail-Tracking-Domain — Öffnungen, Klicks und Anhänge',
    nav: { architecture: 'Architektur', customDomain: 'Eigene Domain' },
    sidebar: {
      gettingStarted: 'Erste Schritte', home: 'Startseite', quickStart: 'Schnellstart', customDomain: 'Eigene Domain binden',
      platforms: 'Plattformen', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: 'Technisch', architecture: 'Architektur und Referenz',
    },
  },
  es: {
    description: 'Proxy inverso de dominio de seguimiento de email en un clic — aperturas, clics y adjuntos',
    nav: { architecture: 'Arquitectura', customDomain: 'Dominio personalizado' },
    sidebar: {
      gettingStarted: 'Inicio', home: 'Inicio', quickStart: 'Inicio rápido', customDomain: 'Vincular dominio personalizado',
      platforms: 'Plataformas', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: 'Técnico', architecture: 'Arquitectura y referencia',
    },
  },
  pt: {
    description: 'Proxy reverso de domínio de rastreamento de email em um clique — aberturas, cliques e anexos',
    nav: { architecture: 'Arquitetura', customDomain: 'Domínio personalizado' },
    sidebar: {
      gettingStarted: 'Começar', home: 'Início', quickStart: 'Início rápido', customDomain: 'Vincular domínio personalizado',
      platforms: 'Plataformas', cloudflare: 'Cloudflare Workers', vercel: 'Vercel', netlify: 'Netlify', denoDeploy: 'Deno Deploy',
      technical: 'Técnico', architecture: 'Arquitetura e referência',
    },
  },
};

const themeForLocale = (lang: string, base: string): DefaultTheme.Config => {
  const s = STRINGS[lang];
  return {
    nav: [
      { text: s.nav.architecture, link: `${base}architecture` },
      { text: s.nav.customDomain, link: `${base}custom-domain` },
    ],
    sidebar: [
      {
        text: s.sidebar.gettingStarted,
        items: [
          { text: s.sidebar.home, link: `${base}` },
          { text: s.sidebar.quickStart, link: `${base}quick-start` },
          { text: s.sidebar.customDomain, link: `${base}custom-domain` },
        ],
      },
      {
        text: s.sidebar.platforms,
        items: [
          { text: s.sidebar.cloudflare, link: `${base}cloudflare` },
          { text: s.sidebar.vercel, link: `${base}vercel` },
          { text: s.sidebar.netlify, link: `${base}netlify` },
          { text: s.sidebar.denoDeploy, link: `${base}deno-deploy` },
        ],
      },
      {
        text: s.sidebar.technical,
        items: [
          { text: s.sidebar.architecture, link: `${base}architecture` },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: REPO_URL }],
  };
};

export default defineConfig({
  title: 'Email Tracking Domain',
  description: STRINGS['zh-CN'].description,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  themeConfig: {
    search: { provider: 'local' },
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: STRINGS['zh-CN'].description,
      themeConfig: themeForLocale('zh-CN', '/'),
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      description: STRINGS['zh-TW'].description,
      themeConfig: themeForLocale('zh-TW', '/zh-TW/'),
    },
    en: {
      label: 'English',
      lang: 'en',
      description: STRINGS.en.description,
      themeConfig: themeForLocale('en', '/en/'),
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      description: STRINGS.ja.description,
      themeConfig: themeForLocale('ja', '/ja/'),
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      description: STRINGS.fr.description,
      themeConfig: themeForLocale('fr', '/fr/'),
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      description: STRINGS.de.description,
      themeConfig: themeForLocale('de', '/de/'),
    },
    es: {
      label: 'Español',
      lang: 'es',
      description: STRINGS.es.description,
      themeConfig: themeForLocale('es', '/es/'),
    },
    pt: {
      label: 'Português',
      lang: 'pt',
      description: STRINGS.pt.description,
      themeConfig: themeForLocale('pt', '/pt/'),
    },
  },
});
