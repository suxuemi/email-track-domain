# Architecture et référence technique


> Ce document s'adresse aux développeurs / curieux techniques. Si vous voulez juste déployer, suivez les « Trois étapes » dans le [README](../quick-start.md) principal.

---

## À quoi ça sert ?

Votre système de marketing/notification par email intègre des **pixels de suivi** et des **liens de redirection avec ID de clic** dans les emails pour mesurer les taux d'ouverture et de clic. Ces liens pointent vers un backend de suivi (par exemple `cf-track.laifa.xin`).

**Problèmes** :
- Utiliser le domaine du backend directement → volume d'envoi élevé → liste noire des systèmes anti-spam
- Domaine de suivi partagé → les comportements d'autres utilisateurs polluent la réputation de votre domaine
- Microsoft Defender / Outlook récupère automatiquement les liens dans les emails pour pré-analyse → pollue vos statistiques d'ouverture/clic

**Solution apportée par ce Worker** :

Utilisez **votre propre domaine** comme couche de proxy inverse avec un filtrage à quatre niveaux :

```
Le destinataire clique → Votre domaine (track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 blocage .php/.aspx│ → 302 google.com
         │  L1 chemins autorisés │ → 302 google.com
         │  L2 anti-scanner MS  │ → 302 google.com
         │  L3 proxy inverse    │
         └──────────────────────┘
                    ↓
         Backend de suivi réel (cf-track.laifa.xin ou le vôtre)
                    ↓
         Enregistre ouverture/clic + retourne pixel/redirection
```

Le destinataire voit **votre domaine**, mais les données continuent de transiter vers le backend de suivi d'origine.

---

## Filtrage en quatre niveaux

| Niveau | Rôle | Action |
|---|---|---|
| **L0** | Liste noire d'extensions — `.php` / `.aspx` sont des signatures de scanners courants | 302 → google.com |
| **L1** | Liste blanche de chemins — seuls les chemins de suivi (`/r/`, `/track/`, `/img/`, `/att/`, `/attachment/`, etc.) et les fichiers statiques racine (`.png/.ico`, etc.) sont autorisés | Échec → 302 |
| **L2** | Détection d'empreinte du scanner Microsoft Defender SafeLinks (en-têtes + ASN/plages IP) | 302 → google.com |
| **L3** | Proxy inverse vers `BACKEND_HOST`, chemin/paramètres préservés | — |

### Deux implémentations de L2

```
Empreinte d'en-tête (commune à toutes)   Referer vide + Sec-CH-UA-Model="Surface Pro"
Empreinte réseau (selon la plateforme)
  ├─ Cloudflare Worker                   ASN 8075 natif (MICROSOFT-CORP-MSN-AS-BLOCK)
  └─ Vercel/Netlify/Deno                 Correspondance de plages IP (repli)
```

**À propos du repli par plages IP** : Vercel/Netlify/Deno n'ont pas accès à l'ASN, donc nous utilisons des plages IP Microsoft codées en dur (EOP outbound + Microsoft 365 services + plages historiques MS Corp). La précision est légèrement inférieure à l'ASN ; les plages doivent être rafraîchies tous les 3 à 6 mois.

---

## Structure du dépôt

```
.
├── src/index.js                       # Cloudflare Worker (ASN + repli IP)
├── wrangler.jsonc                     # config Cloudflare
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function (IP)
│   ├── vercel.json
│   ├── package.json
│   └── quick-start.md
├── netlify.toml                       # config Netlify
├── netlify/edge-functions/track.js    # Netlify Edge Function (IP)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy (IP)
│   └── quick-start.md
├── shared/microsoft-ranges.js         # plages IP Microsoft (source of truth)
├── public/index.html                  # placeholder Netlify publish
├── docs/
│   ├── custom-domain.md               # guide domaine personnalisé (4 plateformes)
│   └── architecture.md                # ce document
├── CHANGELOG.md                       # historique des versions (anglais)
├── quick-start.md                          # README principal (allégé)
└── LICENSE                            # MIT
```

---

## Développement local

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # local
wrangler deploy   # déployer
```

### Vercel
```bash
cd vercel && npm install -g vercel
vercel dev
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify dev
netlify deploy --prod
```

### Deno Deploy
```bash
cd deno-deploy
deno run --allow-net --allow-env main.js   # sert sur :8000
# Déploiement via intégration GitHub (dash.deno.com/new), pas de CLI nécessaire
```

---

## Modifier la liste blanche de chemins

Pour étendre ou modifier `ALLOWED_PATH_PREFIXES`, il faut synchroniser la constante dans les **quatre** sources :

- `src/index.js` (CF)
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

Après modification, un push déclenche le redéploiement automatique (CF nécessite un `wrangler deploy` manuel).

---

## Mettre à jour les plages IP Microsoft

`shared/microsoft-ranges.js` est la source of truth. Procédure de synchronisation :

1. Récupérer les dernières données depuis [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) ou [bgpview.io/asn/8075](https://bgpview.io/asn/8075)
2. Mettre à jour `MICROSOFT_IPV4_RANGES` dans `shared/microsoft-ranges.js`
3. Répercuter dans la même constante des quatre sources
4. Commit + push

Rafraîchir tous les 3 à 6 mois. La détection ASN de CF n'est pas affectée ; les trois autres plateformes en dépendent.

---

## Comparaison des plateformes

| Plateforme | Anti-scanner L2 | Flexibilité du domaine | Palier gratuit |
|---|---|---|---|
| **Cloudflare Workers** | ASN natif (précision max) | DNS hébergé chez CF | 100K req/jour |
| **Vercel** | Correspondance de plages IP | CNAME tout DNS | 100 Go de trafic/mois |
| **Netlify** | Correspondance de plages IP | CNAME tout DNS | 100 Go de trafic/mois |
| **Deno Deploy** | Correspondance de plages IP | CNAME tout DNS | 1 M req/mois |

---

## Notes

1. **Le backend par défaut est `cf-track.laifa.xin`** — c'est le backend de suivi de l'auteur du template. Vous pouvez :
   - **Garder le défaut** : votre trafic passe par le backend de l'auteur (protocole HTTP par défaut, non chiffré)
   - **Basculer vers le vôtre** : changer `BACKEND_HOST` vers votre backend de suivi
2. **Backend HTTP** : par défaut `BACKEND_PROTOCOL=http:` car le backend de l'auteur utilise HTTP. Si le vôtre est HTTPS, mettez `https:`
3. **Ne placez pas ce domaine sur un site web normal** — la liste blanche est très restrictive ; les requêtes web ordinaires seront redirigées en 302

---

## Automatisation CI (interne au dépôt)

- `.github/workflows/update-i18n-badge.yml` : après push de README*.md, recompute automatiquement le JSON du badge i18n
- Badge `release` du README principal : lit le dernier tag depuis l'API GitHub Releases en direct
- Badge `i18n` du README principal : mode endpoint lisant `.github/badges/i18n.json`
