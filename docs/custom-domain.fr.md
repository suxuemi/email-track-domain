# Lier un domaine personnalisé

**Language**: [简体中文](custom-domain.md) · [繁體中文](custom-domain.zh-TW.md) · [English](custom-domain.en.md) · [日本語](custom-domain.ja.md) · **Français** · [Deutsch](custom-domain.de.md)

Après le déploiement, vous devez pointer votre propre domaine vers la plateforme de déploiement pour que les liens de suivi d'emails utilisent votre propre domaine.

Flexibilité DNS sur les quatre plateformes :

| Plateforme | Exigence DNS | Mode de connexion |
|---|---|---|
| Cloudflare Workers | Toute la zone DNS doit être hébergée chez CF | Niveau NS |
| Vercel | Tout fournisseur DNS | CNAME |
| Netlify | Tout fournisseur DNS | CNAME |
| Deno Deploy | Tout fournisseur DNS | CNAME |

---

## Cloudflare Worker

> Prérequis : votre domaine est déjà hébergé sur Cloudflare (DNS chez Cloudflare).

### Option A : Workers Routes (recommandé — prise en charge complète d'un sous-domaine)

Idéal pour : dédier un sous-domaine (par exemple `track.yourdomain.com`) au suivi.

1. Ouvrez Cloudflare Dashboard → sélectionnez votre domaine
2. Barre latérale gauche **DNS** → **Records** → Add record
   - Type : `AAAA`
   - Name : `track` (ou le sous-domaine de votre choix)
   - IPv6 address : `100::` (adresse placeholder, le Worker traitera toutes les requêtes)
   - Proxy status : **Proxied** (le nuage orange doit être activé)
3. Barre latérale gauche **Workers Routes** → Add route
   - Route : `track.yourdomain.com/*`
   - Worker : sélectionnez le `email-track-domain` que vous venez de déployer
4. Effet en quelques minutes. Visitez `https://track.yourdomain.com/r/test` pour vérifier que la requête atteint votre backend.

### Option B : Worker Custom Domain (plus simple)

Idéal pour : lier directement un projet Workers à un domaine (Cloudflare gère DNS et SSL automatiquement).

1. Ouvrez Workers Dashboard → sélectionnez le Worker `email-track-domain`
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. Entrez `track.yourdomain.com`, confirmez
4. Cloudflare crée automatiquement les enregistrements DNS et délivre un certificat SSL

Différence : l'Option A est flexible (peut router des chemins spécifiques), l'Option B lie le domaine entier (plus simple). La plupart des utilisateurs devraient choisir B.

---

## Vercel

1. Ouvrez Vercel Dashboard → sélectionnez le projet → **Settings** → **Domains**
2. Entrez `track.yourdomain.com`, Add
3. Vercel affichera l'enregistrement DNS à ajouter chez votre fournisseur DNS, similaire à :
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. Après ajout DNS, attendez quelques minutes que Vercel délivre automatiquement le certificat SSL

---

## Netlify

1. Ouvrez Netlify Dashboard → sélectionnez le site → **Domain management** → **Custom domains** → **Add a domain**
2. Entrez `track.yourdomain.com` → **Verify** → **Yes, add domain**
3. Netlify affiche les enregistrements DNS à ajouter chez votre fournisseur DNS :
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. Attendez l'émission du SSL (de quelques minutes à 24 heures)

---

## Deno Deploy <a id="deno-deploy"></a>

1. Ouvrez [dash.deno.com](https://dash.deno.com) → sélectionnez le projet → **Settings** → **Domains** → **Add Domain**
2. Entrez `track.yourdomain.com`, Deno Deploy donne deux enregistrements :
   ```
   Type: A      Name: track  Value: 34.120.54.55   (exemple, utilisez la valeur réelle)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   Ou utilisez CNAME :
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. Ajoutez les enregistrements DNS, puis retournez sur Deno Deploy et cliquez **Verify**
4. SSL délivré automatiquement

---

## Vérification

Après le déploiement et la liaison, visitez dans votre navigateur :

| URL | Comportement attendu |
|---|---|
| `https://track.yourdomain.com/` | Redirection 302 vers google.com (racine non incluse dans la liste blanche) |
| `https://track.yourdomain.com/test.php` | Redirection 302 vers google.com (extension bloquée) |
| `https://track.yourdomain.com/r/abc123` | Transféré vers votre backend (chemin autorisé) |
| `https://track.yourdomain.com/favicon.ico` | Transféré vers votre backend (fichier racine autorisé) |

Si la troisième renvoie 502 « Backend fetch failed », `BACKEND_HOST` est mal configuré ou le backend est inaccessible.

---

## Utilisation dans les emails

Remplacez tous les liens de suivi dans vos emails pointant vers `cf-track.laifa.xin` par `track.yourdomain.com`. Par exemple :

```
Avant : http://cf-track.laifa.xin/r/abc123
Après : https://track.yourdomain.com/r/abc123
```

Les statistiques d'ouverture/clic continuent de transiter vers votre backend d'origine, mais les destinataires voient votre propre domaine — plus professionnel, et améliore votre score anti-spam.
