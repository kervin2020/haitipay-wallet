# Guide de Déploiement Simple sur Render

## Étapes Rapides

### 1. Pousser le code sur GitHub

```bash
# Si vous n'avez pas encore de repo GitHub
git init
git add .
git commit -m "Initial commit - HaitiPay Wallet API"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/haitipay-wallet.git
git push -u origin main
```

### 2. Connecter GitHub à Render

1. **Allez sur [render.com](https://render.com)** et créez un compte (gratuit)

2. **Dans le dashboard Render, cliquez sur "New" → "Blueprint"**

3. **Connectez votre compte GitHub**
   - Render vous demandera l'autorisation d'accéder à vos repositories
   - Autorisez l'accès

4. **Sélectionnez votre repository `haitipay-wallet`**

5. **Render détectera automatiquement le fichier `render.yaml`**
   - La configuration sera automatiquement appliquée
   - Le service web sera créé avec les bonnes commandes de build/start

### 3. Configurer les Variables d'Environnement

Une fois le service créé :

1. **Allez dans votre service** (dans le dashboard Render)

2. **Cliquez sur "Environment"** dans le menu de gauche

3. **Ajoutez ces variables** (cliquez sur "Add Environment Variable") :

   ```
   DB_HOST=<votre_host_mysql>
   DB_PORT=3306
   DB_USER=<votre_user_mysql>
   DB_PASSWORD=<votre_password_mysql>
   DB_NAME=haitipay_wallet
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=*
   ```

   **Important** : Remplacez les valeurs entre `< >` par vos vraies credentials MySQL.

### 4. Initialiser la Base de Données

Une fois le service déployé :

1. **Connectez-vous à votre base MySQL** (depuis votre machine ou un client MySQL)

2. **Exécutez le script SQL** :
   ```bash
   mysql -h <DB_HOST> -u <DB_USER> -p < src/database/create-database.sql
   ```

   Ou copiez-collez le contenu de `src/database/create-database.sql` dans votre client MySQL.

### 5. Vérifier le Déploiement

Une fois déployé, votre API sera accessible à :
- **URL** : `https://haitipay-wallet-api.onrender.com` (ou l'URL fournie par Render)
- **Health Check** : `https://votre-url.onrender.com/health`
- **Swagger** : `https://votre-url.onrender.com/api-docs`

## Options de Base de Données MySQL

Puisque Render ne supporte pas MySQL nativement, vous avez plusieurs options :

### Option 1 : PlanetScale (Gratuit)
1. Créez un compte sur [planetscale.com](https://planetscale.com)
2. Créez une base de données
3. Utilisez les credentials fournis dans les variables d'environnement Render

### Option 2 : AWS RDS (Payant mais avec free tier)
1. Créez une instance MySQL sur AWS RDS
2. Utilisez les credentials dans Render

### Option 3 : Railway (Alternative à Render)
1. Railway supporte MySQL nativement
2. Déployez directement avec MySQL inclus

## Déploiement Automatique

Une fois connecté, **chaque push sur GitHub déclenchera automatiquement un nouveau déploiement** sur Render.

## Dépannage

### Le build échoue
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que `npm run build` fonctionne localement

### Erreur de connexion à la base de données
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que votre base MySQL est accessible depuis Internet (whitelist IP si nécessaire)

### Le service ne démarre pas
- Vérifiez les logs dans le dashboard
- Assurez-vous que toutes les variables d'environnement sont définies

## C'est tout !

Une fois connecté, Render gère automatiquement :
- ✅ L'installation des dépendances
- ✅ Le build du projet
- ✅ Le démarrage du serveur
- ✅ Les redéploiements automatiques à chaque push
