# Déploiement Vercel

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · **Français** · [Deutsch](README.de.md)

Filtrage à quatre niveaux complet. L'anti-scanner L2 Microsoft Defender SafeLinks utilise la correspondance de plages IP au lieu de la détection ASN native de CF — précision légèrement inférieure (les plages IP doivent être rafraîchies tous les quelques mois), mais suffisant.

## Déploiement en un clic

Voir le bouton à la racine du dépôt [README.fr.md](../README.fr.md).

## Configuration

| Variable | Valeur par défaut | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Nom d'hôte du backend de suivi |
| `BACKEND_PROTOCOL` | `http:` | Protocole backend, deux-points requis (`http:` ou `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Cible de redirection pour les requêtes rejetées |

Après le déploiement, modifier dans Vercel Dashboard → Project → Settings → Environment Variables.

## Domaine personnalisé

Après le déploiement, allez dans Vercel Dashboard → Project → Settings → Domains, ajoutez votre domaine et suivez les instructions pour ajouter un CNAME `track → cname.vercel-dns.com` chez votre fournisseur DNS. Voir [docs/custom-domain.fr.md](../docs/custom-domain.fr.md).

## Différences par rapport au Cloudflare Worker

| | Cloudflare | Vercel |
|---|---|---|
| Filtrage de chemins L0/L1 | ✓ | ✓ |
| Méthode de détection L2 | **ASN 8075 natif** (haute précision) | **Correspondance de plages IP** (moyenne) |
| Mise à jour des plages IP L2 ? | Non | Tous les 3-6 mois |
| Proxy inverse L3 | ✓ | ✓ |
| Flexibilité DNS | DNS hébergé chez CF requis | Tout DNS via CNAME |

Les plages IP se trouvent dans la constante `MICROSOFT_IPV4_RANGES` de [`api/track.js`](api/track.js) ; mettre à jour selon les commentaires de [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js).
