# Configuration de la Base de Données

## ⚠️ Erreur : "Unknown database 'haitipay_wallet'"

Cette erreur signifie que la base de données n'a pas encore été créée. Suivez ces étapes :

## 📋 Étapes de Configuration

### 1. Créer le fichier .env

Créez un fichier `.env` à la racine du projet avec :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=haitipay_wallet
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

**Remplacez `votre_mot_de_passe_mysql` par votre mot de passe MySQL réel.**

### 2. Créer la base de données

**Option A : Avec le script SQL complet**
```bash
mysql -u root -p < src/database/create-database.sql
```

**Option B : Avec les scripts séparés**
```bash
# Créer la base et les tables
mysql -u root -p < src/database/migrations/init.sql

# Initialiser le Ledger
mysql -u root -p haitipay_wallet < src/database/seeds/ledger.sql
```

**Option C : Avec Docker (si vous utilisez docker-compose)**
```bash
docker-compose up -d
# Attendre quelques secondes que MySQL démarre
mysql -u root -proot -h 127.0.0.1 -P 3307 < src/database/create-database.sql
```

### 3. Vérifier la création

```bash
mysql -u root -p -e "USE haitipay_wallet; SHOW TABLES;"
```

Vous devriez voir :
- wallet_owners
- wallets
- ledger_accounts
- transactions

### 4. Vérifier le Ledger

```bash
mysql -u root -p -e "USE haitipay_wallet; SELECT * FROM ledger_accounts;"
```

Vous devriez voir le compte LEDGER_MASTER avec un solde de 1000000000 (10,000,000 HTG).

### 5. Redémarrer le serveur

```bash
npm run dev
```

## 🔧 Dépannage

### Erreur : "Access denied for user"

- Vérifiez que le mot de passe dans `.env` est correct
- Vérifiez que l'utilisateur MySQL existe

### Erreur : "Can't connect to MySQL server"

- Vérifiez que MySQL est démarré : `mysql -u root -p`
- Vérifiez le port dans `.env` (3306 par défaut, 3307 pour Docker)

### Erreur : "Table already exists"

- La base existe déjà, c'est normal
- Vous pouvez continuer ou supprimer et recréer :
  ```bash
  mysql -u root -p -e "DROP DATABASE IF EXISTS haitipay_wallet;"
  mysql -u root -p < src/database/create-database.sql
  ```

## ✅ Vérification Finale

Une fois la base créée, le serveur devrait démarrer avec :
```
✅ Database connected successfully
🚀 Server is running on port 3000
📡 API available at http://localhost:3000/api
```
