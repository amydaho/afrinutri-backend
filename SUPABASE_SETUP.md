# Configuration Supabase pour AfriNutri

## Migrations à exécuter

Pour activer toutes les fonctionnalités, vous devez exécuter les migrations SQL dans votre projet Supabase.

### Étape 1 : Accéder à Supabase SQL Editor

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet AfriNutri
3. Cliquez sur "SQL Editor" dans le menu de gauche

### Étape 2 : Exécuter les migrations

#### Migration 1 : Schéma initial (`001_initial_schema.sql`)

Cette migration crée les tables de base :
- `users` : Utilisateurs de l'application
- `meals` : Repas enregistrés
- `ingredients` : Ingrédients des repas
- `nutrition_logs` : Logs nutritionnels quotidiens
- `food_scans` : Scans de nourriture avec analyse IA

**Fichier** : `supabase/migrations/001_initial_schema.sql`

Copiez et exécutez le contenu de ce fichier dans le SQL Editor.

#### Migration 2 : Cache nutritionnel (`002_nutrition_cache.sql`)

Cette migration crée :
- `nutrition_cache` : Cache des données nutritionnelles vérifiées
- Index pour recherche rapide
- Fonction pour incrémenter le compteur d'utilisation

**Fichier** : `supabase/migrations/002_nutrition_cache.sql`

Copiez et exécutez le contenu de ce fichier dans le SQL Editor.

### Étape 3 : Vérifier les tables

Après avoir exécuté les migrations, vérifiez que les tables ont été créées :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Vous devriez voir :
- users
- meals
- ingredients
- nutrition_logs
- food_scans
- nutrition_cache

## Variables d'environnement Vercel

Assurez-vous que ces variables sont configurées dans Vercel :

1. `SUPABASE_URL` : URL de votre projet Supabase
2. `SUPABASE_ANON_KEY` : Clé anonyme (publique)
3. `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (privée, pour le backend)
4. `GOOGLE_GENERATIVE_AI_API_KEY` : Clé API Google Gemini
5. `FRONTEND_URL` : https://afrinutri-frontend1.vercel.app

## Fonctionnalités activées

Une fois les migrations exécutées :

✅ **Persistance des scans** : Les analyses sont sauvegardées dans `food_scans`
✅ **Cache nutritionnel** : Les données nutritionnelles sont mises en cache pour réutilisation
✅ **Recherche de plats similaires** : Recherche dans l'historique des scans
✅ **Données enrichies** : Utilisation d'Open Food Facts API + cache Supabase
✅ **Optimisation** : Les requêtes API externes sont minimisées grâce au cache

## Architecture du système

```
Scan photo → Analyse IA (Gemini)
           ↓
    Recherche nutritionnelle
           ↓
    1. Check cache Supabase
    2. Si absent → Open Food Facts API
    3. Sauvegarder dans cache
           ↓
    Données enrichies + Sauvegarde dans food_scans
           ↓
    Retour au frontend
```

## Maintenance

### Vérifier les données en cache

```sql
SELECT food_name, times_used, data_source, verified
FROM nutrition_cache
ORDER BY times_used DESC
LIMIT 20;
```

### Marquer des données comme vérifiées

```sql
UPDATE nutrition_cache
SET verified = true
WHERE food_name_normalized = 'attieke';
```

### Nettoyer le cache (données peu utilisées)

```sql
DELETE FROM nutrition_cache
WHERE times_used < 2 
AND created_at < NOW() - INTERVAL '30 days';
```
