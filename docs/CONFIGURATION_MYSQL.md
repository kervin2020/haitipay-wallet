# Configuration MySQL - Mot de passe Root

## 🔑 Mot de passe par défaut MySQL Root

Le mot de passe par défaut dépend de votre méthode d'installation :

### Installation via Homebrew (macOS)
**Par défaut, il n'y a souvent PAS de mot de passe** (mot de passe vide).

Essayez de vous connecter sans mot de passe :
```bash
mysql -u root
```

Si ça fonctionne, vous pouvez :
1. Soit continuer sans mot de passe (dans `.env` laissez `DB_PASSWORD=` vide)
2. Soit définir un mot de passe (voir ci-dessous)

### Installation standard
- Le mot de passe peut avoir été défini lors de l'installation
- Il peut être stocké dans un fichier de configuration
- Il peut être demandé lors de la première connexion

## 🔍 Comment vérifier votre mot de passe

### Test 1 : Sans mot de passe
```bash
mysql -u root
```
Si ça fonctionne → pas de mot de passe

### Test 2 : Avec mot de passe
```bash
mysql -u root -p
```
Entrez votre mot de passe si vous en avez un.

## 🔧 Définir ou réinitialiser le mot de passe Root

### Option 1 : Définir un nouveau mot de passe (si pas de mot de passe)
```bash
mysql -u root
```

Puis dans MySQL :
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'votre_nouveau_mot_de_passe';
FLUSH PRIVILEGES;
EXIT;
```

### Option 2 : Réinitialiser le mot de passe (si oublié)

**Étape 1 : Arrêter MySQL**
```bash
# macOS avec Homebrew
brew services stop mysql

# Linux
sudo systemctl stop mysql
```

**Étape 2 : Démarrer MySQL en mode safe**
```bash
# macOS
mysqld_safe --skip-grant-tables &

# Linux
sudo mysqld_safe --skip-grant-tables &
```

**Étape 3 : Se connecter sans mot de passe**
```bash
mysql -u root
```

**Étape 4 : Réinitialiser le mot de passe**
```sql
USE mysql;
UPDATE user SET authentication_string=PASSWORD('nouveau_mot_de_passe') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

**Étape 5 : Redémarrer MySQL normalement**
```bash
# macOS
brew services restart mysql

# Linux
sudo systemctl restart mysql
```

## 📝 Configuration dans le projet

Une fois que vous connaissez votre mot de passe (ou si vous n'en avez pas), configurez le fichier `.env` :

### Si pas de mot de passe :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=haitipay_wallet
```

### Si vous avez un mot de passe :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_ici
DB_NAME=haitipay_wallet
```

## ✅ Test de connexion

Testez votre connexion :
```bash
mysql -u root -p
# Entrez votre mot de passe (ou appuyez sur Entrée si pas de mot de passe)
```

Si vous arrivez à la ligne de commande MySQL (`mysql>`), la connexion fonctionne !

## 🚀 Créer la base de données

Une fois la connexion vérifiée :

**Sans mot de passe :**
```bash
mysql -u root < src/database/create-database.sql
```

**Avec mot de passe :**
```bash
mysql -u root -p < src/database/create-database.sql
```

Ou utilisez le script automatique :
```bash
./creer-base-de-donnees.sh
```

## 💡 Astuce

Si vous n'avez pas de mot de passe et que vous voulez en définir un pour la sécurité :

1. Connectez-vous : `mysql -u root`
2. Définissez le mot de passe (voir Option 1 ci-dessus)
3. Mettez à jour votre fichier `.env` avec le nouveau mot de passe

---

**Une fois la connexion MySQL fonctionnelle, vous pourrez créer la base de données et démarrer le serveur ! 🎉**
