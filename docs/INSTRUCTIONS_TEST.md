# Instructions pour Tester le Projet

## Prérequis

1. **MySQL installé et démarré**
2. **Node.js v18+ installé**
3. **Variables d'environnement configurées**

## Configuration initiale

### 1. Créer le fichier .env

Créez un fichier `.env` à la racine du projet :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=haitipay_wallet
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer la base de données

**Option A : Avec MySQL en ligne de commande**
```bash
mysql -u root -p < src/database/create-database.sql
```

**Option B : Avec Docker (si docker-compose.yml existe)**
```bash
docker-compose up -d
# Attendre quelques secondes que MySQL démarre
mysql -u root -proot -h 127.0.0.1 -P 3307 < src/database/create-database.sql
```

**Option C : Exécuter manuellement les scripts**
```bash
# Créer la base et les tables
mysql -u root -p < src/database/migrations/init.sql

# Initialiser le Ledger
mysql -u root -p haitipay_wallet < src/database/seeds/ledger.sql
```

### 4. Compiler le projet

```bash
npm run build
```

### 5. Démarrer le serveur

**Mode développement** :
```bash
npm run dev
```

**Mode production** :
```bash
npm start
```

Le serveur devrait démarrer sur `http://localhost:3000`

## Tests des APIs

### Test manuel avec curl

#### 1. Test de santé
```bash
curl http://localhost:3000/health
```

#### 2. Créer un wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet/create \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Baptiste",
    "phoneNumber": "+50912345678",
    "dateOfBirth": "1990-05-15",
    "nationalId": "001-234-567-89",
    "pin": "1234"
  }'
```

#### 3. Recharger un wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet/recharge \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+50912345678",
    "amount": 5000
  }'
```

#### 4. Consulter le profil (nécessite PIN)
```bash
curl -X GET http://localhost:3000/api/v1/wallet/+50912345678/profile \
  -H "x-pin: 1234"
```

#### 5. Consulter le solde (nécessite PIN)
```bash
curl -X GET http://localhost:3000/api/v1/wallet/+50912345678/balance \
  -H "x-pin: 1234"
```

#### 6. Créer un deuxième wallet pour tester le transfert
```bash
curl -X POST http://localhost:3000/api/v1/wallet/create \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Dupont",
    "phoneNumber": "+50987654321",
    "dateOfBirth": "1992-08-20",
    "nationalId": "002-345-678-90",
    "pin": "1234"
  }'
```

#### 7. Transfert entre wallets (nécessite PIN)
```bash
curl -X POST http://localhost:3000/api/v1/wallet/transfer \
  -H "Content-Type: application/json" \
  -H "x-pin: 1234" \
  -d '{
    "fromPhone": "+50912345678",
    "toPhone": "+50987654321",
    "amount": 1000,
    "description": "Test de transfert"
  }'
```

#### 8. Historique des transactions (nécessite PIN)
```bash
curl -X GET "http://localhost:3000/api/v1/wallet/+50912345678/transactions?limit=10" \
  -H "x-pin: 1234"
```

#### 9. Statut du Ledger
```bash
curl -X GET http://localhost:3000/api/v1/admin/ledger/status
```

#### 10. Historique du Ledger
```bash
curl -X GET "http://localhost:3000/api/admin/ledger/transactions?limit=10"
```

### Test automatisé

**Avec le script bash** :
```bash
chmod +x test-api.sh
./test-api.sh
```

**Avec le script Node.js** :
```bash
node test-api.js
```

**Note** : Assurez-vous que `jq` est installé pour le script bash (pour formater le JSON)

## Vérification des fonctionnalités

### ✅ Checklist de test

- [ ] Création de wallet avec validation (format téléphone, âge, PIN)
- [ ] Recharge depuis le Ledger avec calcul des frais
- [ ] Consultation du profil avec authentification PIN
- [ ] Consultation du solde avec authentification PIN
- [ ] Transfert entre wallets avec frais et limite journalière
- [ ] Historique des transactions trié par date
- [ ] Statut et historique du Ledger
- [ ] Gestion des erreurs (PIN incorrect, solde insuffisant, etc.)

### Tests de validation

**Test 1 : Format téléphone invalide**
```bash
curl -X POST http://localhost:3000/api/v1/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "50912345678", ...}'
# Devrait retourner une erreur 400
```

**Test 2 : Âge insuffisant**
```bash
curl -X POST http://localhost:3000/api/v1/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"dateOfBirth": "2010-01-01", ...}'
# Devrait retourner une erreur 400
```

**Test 3 : PIN incorrect**
```bash
curl -X GET http://localhost:3000/api/v1/wallet/+50912345678/balance \
  -H "x-pin: 9999"
# Devrait retourner une erreur 401
```

**Test 4 : Solde insuffisant pour transfert**
```bash
# Créer un wallet avec solde 0
# Essayer de transférer 1000
# Devrait retourner une erreur 400
```

**Test 5 : Montant hors limites**
```bash
# Recharge avec 100 centimes (en dessous de 5000)
# Devrait retourner une erreur 400
```

## Dépannage

### Erreur de connexion à la base de données

- Vérifier que MySQL est démarré : `mysql -u root -p`
- Vérifier les identifiants dans `.env`
- Vérifier que la base `haitipay_wallet` existe

### Erreur 401 Unauthorized

- Vérifier que le header `x-pin` est présent
- Vérifier que le PIN correspond au wallet
- Vérifier que le wallet existe et est actif

### Erreur de compilation TypeScript

```bash
npm run build
# Vérifier les erreurs affichées
```

### Port déjà utilisé

Changer le port dans `.env` :
```env
PORT=3001
```

## Notes importantes

- Tous les montants sont en **centimes HTG**
- Exemple : 5000 centimes = 50 HTG
- Le PIN doit être exactement 4 chiffres
- Le format téléphone doit être : +509XXXXXXXX (8 chiffres après +509)
