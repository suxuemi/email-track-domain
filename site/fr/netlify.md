# Déploiement Netlify

DNS quelconque via CNAME + Edge Function en Deno runtime. Au même niveau que Vercel ; choisissez selon les préférences de votre équipe.

## Déploiement en un clic

Bouton sur la page d'accueil → [Démarrage rapide →](/fr/quick-start#_1-cliquer-sur-un-bouton-deploy-choisir-une-plateforme)

## Configuration

| Variable | Défaut | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Nom d'hôte du backend de suivi |
| `BACKEND_PROTOCOL` | `http:` | Protocole backend (deux-points requis) |
| `REDIRECT_TARGET` | `https://www.google.com` | Cible de redirection pour les requêtes rejetées |

Après le déploiement, modifier dans **Netlify Dashboard → Site Settings → Environment Variables**.

## Domaine personnalisé

Voir [Lier un domaine personnalisé](/fr/custom-domain#netlify).

## Différences avec Cloudflare

| | Cloudflare | Netlify |
|---|---|---|
| Filtrage de chemins L0/L1 | ✓ | ✓ |
| Méthode de détection L2 | **ASN 8075 natif** (haute précision) | **Correspondance de plages IP** (moyenne) |
| Mise à jour des plages IP L2 nécessaire? | Non | Tous les 3-6 mois |
| Proxy inverse L3 | ✓ | ✓ |
| Flexibilité DNS | DNS hébergé chez CF | **Tout DNS via CNAME** |
| Runtime | V8 isolate | Deno |

**Idéal pour**: DNS pas sur Cloudflare, ne pas vouloir migrer, configuration par CNAME.

**Vercel ou Netlify?**: Les fonctionnalités sont presque équivalentes — choisissez le tableau de bord que votre équipe préfère.

Les plages IP sont dans la constante `MICROSOFT_IPV4_RANGES` de [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js) ; voir [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js) pour la mise à jour.
