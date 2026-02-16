# Déploiement Backend sur Vercel

Ce guide vous explique comment déployer le backend NestJS sur Vercel.

## Prérequis

- Compte Vercel (gratuit sur [vercel.com](https://vercel.com))
- Vercel CLI installé (optionnel) : `npm install -g vercel`
- Projet Supabase configuré
- Clé API OpenAI

## Méthode 1 : Déploiement via Vercel Dashboard (Recommandé)

### 1. Préparer le projet

Le projet est déjà configuré avec :
- ✅ `vercel.json` - Configuration Vercel
- ✅ `.vercelignore` - Fichiers à ignorer
- ✅ Scripts de build dans `package.json`

### 2. Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New Project"**
3. Importez votre repository Git (GitHub, GitLab, Bitbucket)
4. Sélectionnez le dossier `backend`

### 3. Configurer le projet

Dans les paramètres du projet Vercel :

**Root Directory** : `backend`

**Build & Development Settings** :
- Build Command : `npm run build`
- Output Directory : `dist`
- Install Command : `npm install`

**Environment Variables** (très important !) :

Ajoutez les variables suivantes dans **Settings > Environment Variables** :

```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
OPENAI_API_KEY=sk-proj-votre_cle_openai
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://votre-frontend.vercel.app
```

### 4. Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le build se termine (2-3 minutes)
3. Votre API sera disponible sur : `https://votre-backend.vercel.app`

## Méthode 2 : Déploiement via CLI

### 1. Installer Vercel CLI

```bash
npm install -g vercel
```

### 2. Se connecter

```bash
vercel login
```

### 3. Déployer

Depuis le dossier `backend` :

```bash
cd backend
vercel
```

Suivez les instructions :
- Set up and deploy? **Y**
- Which scope? Sélectionnez votre compte
- Link to existing project? **N** (pour un nouveau projet)
- What's your project's name? `afrinutri-backend` (ou autre nom)
- In which directory is your code located? `./`

### 4. Configurer les variables d'environnement

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NODE_ENV
vercel env add FRONTEND_URL
```

Pour chaque variable, entrez la valeur et sélectionnez les environnements (Production, Preview, Development).

### 5. Redéployer avec les variables

```bash
vercel --prod
```

## Vérification du déploiement

### 1. Tester l'API

```bash
curl https://votre-backend.vercel.app
```

Vous devriez recevoir une réponse du serveur.

### 2. Tester un endpoint

```bash
curl https://votre-backend.vercel.app/ai/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

## Configuration du Frontend

Une fois le backend déployé, mettez à jour votre frontend :

1. Créez `.env.local` dans le dossier `frontend` :

```env
NEXT_PUBLIC_API_URL=https://votre-backend.vercel.app
```

2. Redéployez le frontend

## Endpoints disponibles

Votre API backend sera accessible sur :

- `GET /` - Health check
- `POST /ai/generate` - Génération de texte AI
- `POST /ai/analyze-nutrition` - Analyse nutritionnelle d'image
- `POST /nutrition/meals` - Créer un repas
- `POST /nutrition/meals/:mealId/ingredients` - Ajouter un ingrédient
- `GET /nutrition/meals` - Récupérer les repas
- `GET /nutrition/summary` - Résumé nutritionnel
- `PUT /nutrition/summary` - Mettre à jour le log
- `POST /nutrition/analyze-food` - Analyser une image de nourriture

## Logs et Monitoring

### Voir les logs en temps réel

Via Dashboard :
1. Allez dans votre projet sur Vercel
2. Cliquez sur l'onglet **"Deployments"**
3. Sélectionnez un déploiement
4. Cliquez sur **"View Function Logs"**

Via CLI :
```bash
vercel logs
```

## Troubleshooting

### Erreur : "Missing Supabase configuration"

- Vérifiez que toutes les variables d'environnement sont bien configurées
- Redéployez après avoir ajouté les variables

### Erreur : Build failed

- Vérifiez que `npm run build` fonctionne localement
- Vérifiez les logs de build sur Vercel

### Erreur : CORS

- Vérifiez que `FRONTEND_URL` est correctement configuré
- Le backend est configuré pour accepter les requêtes CORS

### Timeout errors

- Les fonctions Vercel ont un timeout de 10s (plan gratuit) ou 60s (plan pro)
- Pour les requêtes AI longues, envisagez d'utiliser le streaming

## Mise à jour du déploiement

### Via Git (automatique)

Chaque push sur votre branche principale déclenchera automatiquement un nouveau déploiement.

### Via CLI

```bash
vercel --prod
```

## Domaine personnalisé (Optionnel)

1. Allez dans **Settings > Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

## Coûts

- **Plan Hobby (Gratuit)** :
  - Déploiements illimités
  - 100 GB de bande passante/mois
  - Timeout de 10s par fonction
  
- **Plan Pro** :
  - Timeout de 60s
  - Plus de bande passante
  - Support prioritaire

**Note** : Les coûts OpenAI sont séparés et dépendent de votre utilisation de l'API.

## Support

- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
- Support Vercel : [vercel.com/support](https://vercel.com/support)
