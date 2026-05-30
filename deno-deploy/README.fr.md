# Déploiement Deno Deploy

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · **Français** · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

Deno Deploy n'a pas de « bouton de déploiement en un clic » au niveau URL, mais son intégration GitHub est presque équivalente — configurez-la une fois, puis chaque push déploie automatiquement.

## URL du dépôt template

Copiez cette URL dans la console Deno Deploy :

```
https://github.com/suxuemi/email-track-domain
```

## Étapes de déploiement

1. Ouvrez [dash.deno.com/new](https://dash.deno.com/new)
2. Connectez-vous et choisissez **Deploy from GitHub repository**
3. Autorisez Deno Deploy à accéder à votre GitHub (première fois)
4. Sélectionnez le dépôt → collez l'URL ci-dessus
5. Configuration :
   - **Production branch** : `main`
   - **Entry point** : `deno-deploy/main.js`
   - **Install step** : laisser vide
   - **Build step** : laisser vide
6. **Environment Variables** (optionnel, valeurs par défaut fournies) :
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. Cliquez sur **Deploy Project**

Après le déploiement, vous obtiendrez un domaine `<project>.deno.dev`.

## Domaine personnalisé

Project Settings → Domains → Add Domain, suivez les instructions pour ajouter un CNAME. Voir [docs/custom-domain.fr.md](../docs/custom-domain.fr.md#deno-deploy).

## Développement local

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

Sert sur `http://localhost:8000` par défaut. Tester :

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # devrait renvoyer 302
```

## Différences par rapport aux autres plateformes

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| Précision de détection L2 | ASN (haute) | Plages IP (moyenne) | Plages IP (moyenne) | **Plages IP (moyenne)** |
| Syntaxe du code | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| Bouton de déploiement en un clic | Officiel | Officiel | Officiel | **Intégration GitHub (1 étape manuelle)** |
| Palier gratuit | 100K req/jour | 100 Go de trafic | 100 Go de trafic | **1M req/mois** |
| Flexibilité DNS | DNS verrouillé chez CF | Tout DNS via CNAME | Tout DNS via CNAME | **Tout DNS via CNAME** |

Avantages de Deno Deploy :
- Syntaxe **la plus proche du Cloudflare Worker original** (`addEventListener('fetch', ...)` également supporté)
- Palier gratuit le plus généreux (compté par requêtes, pas par trafic)
- Le plus grand nombre de localisations edge mondiales
