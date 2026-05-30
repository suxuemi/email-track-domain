# Déploiement Cloudflare Workers

La plateforme avec la **plus haute précision d'anti-scanner L2** parmi les quatre (utilise la détection native ASN 8075 pour identifier le scanner Microsoft Defender SafeLinks).

## Déploiement en un clic

Bouton sur la page d'accueil → [Démarrage rapide →](/fr/quick-start#_1-cliquer-sur-un-bouton-deploy-choisir-une-plateforme)

## Configuration

| Variable | Défaut | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Nom d'hôte du backend de suivi |
| `BACKEND_PROTOCOL` | `http:` | Protocole backend (deux-points requis) |
| `REDIRECT_TARGET` | `https://www.google.com` | Cible de redirection pour les requêtes rejetées |

Après le déploiement, modifier dans **Workers Dashboard → Settings → Variables**. Ou modifier la section `vars` de [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) puis redéployer.

## Domaine personnalisé

Voir [Lier un domaine personnalisé](/fr/custom-domain#cloudflare-worker).

## Différences avec les autres plateformes

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| Méthode de détection L2 | **ASN 8075 natif** (haute précision) | Correspondance de plages IP (moyenne) |
| Mise à jour des plages IP L2 nécessaire? | Non | Tous les 3-6 mois |
| Flexibilité DNS | DNS hébergé chez CF | Tout DNS via CNAME |
| Palier gratuit | 100K req/jour | 100 Go de trafic/mois (V, N) ou 1M req/mois (Deno) |
| Runtime | V8 isolate | V8 isolate / Deno |

**Idéal pour**: DNS déjà sur Cloudflare, besoin de la meilleure précision anti-scanner (par ex. marketing email B2B haute valeur).

**À éviter si**: vous ne voulez pas migrer le DNS → utilisez Vercel / Netlify à la place.
