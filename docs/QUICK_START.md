# 🚀 Démarrage Rapide

## ⚠️ Erreur Actuelle : "Unknown database 'haitipay_wallet'"

Cette erreur signifie que la base de données n'a pas encore été créée. Suivez ces étapes :

## 📋 Étapes Rapides

### 1. Créer le fichier `.env`

Créez un fichier `.env` à la racine du projet :

```bash
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=haitipay_wallet
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
EOF
```

**Remplacez `votre_mot_de_passe` par votre mot de passe MySQL.**

### 2. Créer la base de données

**Option A : Script automatique (recommandé)**
```bash
./creer-base-de-donnees.sh
```

**Option B : Commande manuelle**
```bash
mysql -u root -p < src/database/create-database.sql
```

Vous serez invité à entrer votre mot de passe MySQL.

### 3. Vérifier que tout fonctionne

```bash
npm run dev
```

Vous devriez voir :
```
✅ Database connected successfully
🚀 Server is running on port 3000
📡 API available at http://localhost:3000/api
```

## ✅ Vérification

Testez que le serveur fonctionne :

```bash
curl http://localhost:3000/health
```

Vous devriez recevoir une réponse JSON avec `"success": true`.

## 🎯 Prochaines Étapes

Une fois le serveur démarré, vous pouvez :

1. **Tester les APIs** : Suivez `INSTRUCTIONS_TEST.md`
2. **Lire la documentation** : Consultez `README.md`
3. **Comprendre le projet** : Lisez `GUIDE_PROJET.md`

## 🔧 Dépannage

### MySQL n'est pas démarré
```bash
# macOS avec Homebrew
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Mot de passe incorrect
- Vérifiez le fichier `.env`
- Vérifiez que vous pouvez vous connecter : `mysql -u root -p`

### Port déjà utilisé
Changez le port dans `.env` :
```env
PORT=3001
```

---

**Une fois la base créée, le serveur devrait démarrer sans problème ! 🎉**
