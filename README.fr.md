<div align="center">

# Email Tracking Domain

**Proxy inverse de domaine de suivi d'email en un clic — ouvertures, clics et pièces jointes sur votre propre domaine**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/suxuemi/email-track-domain/main/.github/badges/i18n.json&style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Site officiel** : [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | **Français** | [Deutsch](README.de.md) | [Español](README.es.md) | [Português](README.pt.md) | [📋 Changelog](CHANGELOG.md)

</div>

---

## ⚡ Trois étapes

### 1️⃣ Cliquer sur un bouton Deploy (choisir une plateforme)

| Plateforme | Déploiement en un clic | Idéal pour |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS déjà sur Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | Ne pas déplacer le DNS, CNAME de tout fournisseur |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Comme Vercel |
| **Deno Deploy** | [→ Guide d'installation](deno-deploy/README.fr.md) | Préférer l'écosystème Deno |

> 💡 **Hésitation ? → Utilisez Vercel** (tout DNS + le plus simple)

### 2️⃣ Lier votre propre domaine

Après le déploiement, pointez votre sous-domaine (par ex. `track.yourdomain.com`) vers le projet déployé.

→ **[Configuration du domaine personnalisé](custom-domain.fr.md)** (couvre les quatre plateformes)

### 3️⃣ Ajouter le domaine dans le **[backend laifa.xin]**

Ouvrir le **[backend laifa.xin]** → ajouter un domaine de suivi → saisir `track.yourdomain.com` → cliquer sur vérifier → ✓

Après vérification, tous les liens de suivi dans vos emails utiliseront ce domaine — plus professionnel et meilleur score anti-spam.

---

## Types de suivi pris en charge

| Type | Mécanisme |
|---|---|
| 📧 Suivi des ouvertures | Pixel transparent 1×1 |
| 🔗 Suivi des clics | Redirection 302 |
| 📎 Suivi des téléchargements de pièces jointes | Proxy inverse du flux de fichier |

Les trois fonctionnent sans configuration supplémentaire.

---

## Configuration (laisser par défaut généralement)

| Variable | Défaut | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Nom d'hôte du backend de suivi |
| `BACKEND_PROTOCOL` | `http:` | Protocole backend (deux-points requis) |
| `REDIRECT_TARGET` | `https://www.google.com` | Cible pour les requêtes rejetées |

L'UI de déploiement de chaque plateforme vous permet de confirmer ou modifier ces trois valeurs. Les défauts conviennent dans la plupart des cas.

---

## License

MIT — voir [LICENSE](LICENSE).

---

## Contacter l'auteur

- 🌐 Site officiel : [laifa.xin](https://laifa.xin)
- 💬 WeChat (merci d'ajouter « email track » en remarque) :

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat de l'auteur" width="240">

---

## 🔧 Détails techniques

Logique de filtrage en quatre niveaux, anti-scanner Microsoft Defender SafeLinks, flux de mise à jour des plages IP, développement local, organisation du code source, etc. → **[`docs/architecture.fr.md`](docs/architecture.fr.md)**

## Crédits

Dérivé de l'infrastructure de suivi d'emails de [laifa.xin](https://laifa.xin), publié en open source pour permettre aux utilisateurs de déployer leur propre domaine de suivi dédié.
