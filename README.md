# HaitiPay Wallet API

API REST pour le système de portefeuille électronique HaitiPay avec double écriture comptable.

## Technologies

- Node.js + TypeScript
- Express.js
- MySQL
- bcrypt (hashage PIN)

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer `.env` :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=haitipay_wallet
PORT=3000
```

3. Créer la base de données :
```bash
mysql -u root -p < src/database/create-database.sql
```

4. Démarrer le serveur :
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Documentation API

Documentation Swagger disponible à : `http://localhost:3000/api-docs`

## Endpoints Principaux

### Créer un wallet
```bash
POST /api/v1/wallet/create
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "+50912345678",
  "dateOfBirth": "2000-01-15",
  "nationalId": "1234567890",
  "pin": "1234"
}
```

### Recharger un wallet
```bash
POST /api/v1/wallet/recharge
Content-Type: application/json

{
  "phoneNumber": "+50912345678",
  "amount": 10000
}
```

### Consulter le solde
```bash
GET /api/v1/wallet/+50912345678/balance
x-pin: 1234
```

### Transférer entre wallets
```bash
POST /api/v1/wallet/transfer
x-pin: 1234
Content-Type: application/json

{
  "fromPhone": "+50912345678",
  "toPhone": "+50987654321",
  "amount": 5000,
  "description": "Transfert"
}
```

### Historique des transactions
```bash
GET /api/v1/wallet/+50912345678/transactions?limit=20
x-pin: 1234
```

### Statut du Ledger
```bash
GET /api/v1/admin/ledger/status
```

## Notes

- Montants en centimes HTG
- PIN hashé avec bcrypt
- Double écriture comptable pour toutes les transactions
- Transactions SQL atomiques

## Structure

```
src/
├── controllers/    # Contrôleurs HTTP
├── services/       # Logique métier
├── models/         # Accès base de données
├── routes/         # Définition des routes
├── middlewares/    # Authentification, validation, erreurs
└── database/       # Scripts SQL
```

## Tests

Scripts de test disponibles :
- `test-api.js` - Tests Node.js
- `test-api.sh` - Tests bash

```bash
node test-api.js
```
# haitipay-wallet
