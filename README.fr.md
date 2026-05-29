# Email Tracking Domain (Déploiement en un clic)

> Déployez votre propre proxy inverse pour domaine de suivi d'emails en un clic. Servez le suivi des ouvertures/clics sous votre propre domaine et évitez la dégradation de réputation des domaines de suivi partagés.

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · **Français** · [Deutsch](README.de.md)

## Déploiement en un clic (quatre plateformes au choix)

| Plateforme | Bouton | Anti-scanner L2 | Flexibilité DNS |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | ASN natif (précision max) | DNS hébergé chez CF requis |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | Plages IP (moyenne) | Tout DNS via CNAME |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Plages IP (moyenne) | Tout DNS via CNAME |
| **Deno Deploy** | [→ Guide d'installation](deno-deploy/README.md) | Plages IP (moyenne) | Tout DNS via CNAME |

> **Lequel choisir ?**
> - DNS déjà sur Cloudflare → **CF Worker** (anti-scanner le plus précis)
> - Ne souhaite pas migrer le DNS → **Vercel** ou **Netlify** (CNAME depuis n'importe quel fournisseur DNS)
> - Préfère Deno / souhaite conserver la syntaxe Service Worker native → **Deno Deploy**

Après le déploiement, **vous devez impérativement lier un domaine personnalisé** → [docs/custom-domain.md](docs/custom-domain.md)

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
| **L1** | Liste blanche de chemins — seuls les chemins de suivi (`/r/`, `/track/`, `/img/`, etc.) et les fichiers statiques racine (`.png/.ico`, etc.) sont autorisés | Échec → 302 |
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

> Note historique : le commentaire du code source d'origine indiquait que l'ASN 8075 était Google — **c'est faux**. 8075 correspond en réalité à MICROSOFT-CORP-MSN-AS-BLOCK ; Surface Pro est un appareil Microsoft. Ce dépôt corrige le commentaire.

---

## Configuration

| Variable | Valeur par défaut | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Nom d'hôte du backend de suivi réel |
| `BACKEND_PROTOCOL` | `http:` | Protocole backend, deux-points requis (`http:` ou `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Cible de redirection pour les requêtes rejetées |

Où les modifier :
- **Cloudflare** : Workers Dashboard → Settings → Variables ; ou éditer `wrangler.jsonc` et redéployer
- **Vercel** : Project → Settings → Environment Variables
- **Netlify** : Site Settings → Environment Variables
- **Deno Deploy** : Project Settings → Environment Variables

---

## Liaison de domaine personnalisé

Un déploiement est inutile sans liaison de votre propre sous-domaine. Voir **[docs/custom-domain.md](docs/custom-domain.md)** (couvre les quatre plateformes).

---

## Développement local (optionnel)

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

## Structure du dépôt

```
.
├── src/index.js                       # Cloudflare Worker (ASN + repli IP)
├── wrangler.jsonc                     # config Cloudflare
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function (IP)
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # config Netlify
├── netlify/edge-functions/track.js    # Netlify Edge Function (IP)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy (IP)
│   └── README.md
├── shared/microsoft-ranges.js         # plages IP Microsoft (source of truth)
├── public/index.html                  # placeholder Netlify publish
├── docs/custom-domain.md              # guide domaine personnalisé (4 plateformes)
├── README.md                          # ce fichier
└── LICENSE                            # MIT
```

---

## Modifier la liste blanche de chemins

Pour étendre ou modifier la liste blanche de chemins, il faut synchroniser la constante `ALLOWED_PATH_PREFIXES` dans les **quatre** sources :

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

## Notes

1. **Le backend par défaut est `cf-track.laifa.xin`** — c'est le backend de suivi de l'auteur du template. Vous pouvez :
   - **Garder le défaut** : votre trafic passe par le backend de l'auteur (protocole HTTP par défaut, non chiffré)
   - **Basculer vers le vôtre** : changer `BACKEND_HOST` vers votre backend de suivi
2. **Backend HTTP** : par défaut `BACKEND_PROTOCOL=http:` car le backend de l'auteur utilise HTTP. Si le vôtre est HTTPS, mettez `https:`
3. **Ne placez pas ce domaine sur un site web normal** — la liste blanche est très restrictive ; les requêtes web ordinaires seront redirigées en 302
4. **Limites du palier gratuit** :
   - CF Worker : 100 000 requêtes/jour
   - Vercel : 100 Go de trafic/mois
   - Netlify : 100 Go de trafic/mois
   - Deno Deploy : 1 million de requêtes/mois

---

## License

MIT — voir [LICENSE](LICENSE).

---

## Contacter l'auteur

- 🌐 Site officiel : [laifa.xin](https://laifa.xin)
- 💬 WeChat (merci d'ajouter « email track » en remarque) :

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat de l'auteur" width="240">

## Crédits

Dérivé de l'infrastructure de suivi d'emails de [laifa.xin](https://laifa.xin), publié en open source pour permettre aux utilisateurs de déployer leur propre domaine de suivi dédié.
