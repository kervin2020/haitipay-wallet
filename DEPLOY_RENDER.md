# Déploiement sur Render

## Prérequis

1. Compte Render (gratuit disponible)
2. Base de données MySQL (Render propose PostgreSQL par défaut, mais vous pouvez utiliser une base MySQL externe)

## Étapes de Déploiement

### Option 1 : Déploiement avec render.yaml (Recommandé)

1. **Connecter votre repository GitHub/GitLab à Render**
   - Allez sur [render.com](https://render.com)
   - Cliquez sur "New" → "Blueprint"
   - Connectez votre repository

2. **Render détectera automatiquement le fichier `render.yaml`**
   - Le service web sera créé automatiquement
   - La base de données sera créée si configurée

3. **Configurer les variables d'environnement**
   - Dans le dashboard Render, allez dans votre service
   - Section "Environment"
   - Ajoutez les variables suivantes :
     ```
     DB_HOST=<votre_host_mysql>
     DB_PORT=3306
     DB_USER=<votre_user>
     DB_PASSWORD=<votre_password>
     DB_NAME=haitipay_wallet
     NODE_ENV=production
     PORT=10000
     ```

4. **Initialiser la base de données**
   - Une fois le service déployé, exécutez le script SQL :
   ```bash
   mysql -h <host> -u <user> -p < src/database/create-database.sql
   ```

### Option 2 : Déploiement Manuel

1. **Créer un nouveau Web Service**
   - Cliquez sur "New" → "Web Service"
   - Connectez votre repository

2. **Configuration du Build**
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Environment** : `Node`

3. **Variables d'environnement**
   - Ajoutez toutes les variables nécessaires (voir ci-dessus)

4. **Déployer**
   - Cliquez sur "Create Web Service"
   - Render va automatiquement installer les dépendances et builder le projet

## Configuration de la Base de Données

### Option A : MySQL externe
- Utilisez une base MySQL existante (ex: PlanetScale, AWS RDS, etc.)
- Configurez les variables d'environnement avec les credentials

### Option B : PostgreSQL sur Render (nécessite adaptation)
- Render propose PostgreSQL par défaut
- Il faudrait adapter le code pour utiliser PostgreSQL au lieu de MySQL
- Ou utiliser un service MySQL externe

## Scripts de Build

Le projet utilise :
- **Build** : `npm run build` (compile TypeScript)
- **Start** : `npm start` (lance le serveur Node.js)

## Vérification du Déploiement

Une fois déployé, vérifiez :

1. **Health Check** : `https://votre-app.onrender.com/health`
2. **API Info** : `https://votre-app.onrender.com/api/info`
3. **Swagger** : `https://votre-app.onrender.com/api-docs`

## Notes Importantes

- **Port** : Render utilise le port défini par la variable `PORT` (généralement 10000)
- **Timeout** : Les services gratuits peuvent avoir un timeout après inactivité
- **Base de données** : Assurez-vous que votre base MySQL est accessible depuis Render
- **CORS** : Configurez `CORS_ORIGIN` si vous avez un frontend

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que la base de données est accessible depuis Render (whitelist IP si nécessaire)

### Erreur de build
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que `npm run build` fonctionne localement

### Le service ne démarre pas
- Vérifiez les logs dans le dashboard
- Assurez-vous que `npm start` fonctionne localement après `npm run build`
