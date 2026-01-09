# Guide Complet du Projet HaitiPay Wallet

## 📋 Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture et structure](#architecture)
3. [Modélisation des données](#modélisation)
4. [Implémentation étape par étape](#implémentation)
5. [Détails techniques](#détails-techniques)
6. [Décisions de conception](#décisions)
7. [Points d'attention et difficultés rencontrées](#difficultés)

---

## Vue d'ensemble du projet {#vue-densemble}

### Objectif
Développer un système de portefeuille électronique (e-wallet) permettant :
- La création de wallets personnels
- Le rechargement depuis un compte principal (Ledger)
- Les transferts entre wallets
- La consultation de soldes et historiques
- Un système de double écriture comptable

### Technologies choisies
- **Node.js avec TypeScript** : Pour la robustesse et le typage
- **Express.js** : Framework web minimaliste et performant
- **MySQL** : Base de données relationnelle pour l'intégrité des données
- **bcrypt** : Sécurisation des PINs
- **express-validator** : Validation des données d'entrée

---

## Architecture et structure {#architecture}

### Structure des dossiers

```
haitipay-wallet/
├── src/
│   ├── config/          # Configuration (base de données)
│   ├── controllers/     # Contrôleurs (logique HTTP)
│   ├── database/         # Migrations et seeds SQL
│   ├── middlewares/      # Middlewares (auth, validation, erreurs)
│   ├── models/           # Modèles de données (accès DB)
│   ├── routes/           # Définition des routes
│   ├── services/         # Logique métier
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires (logger, response)
│   ├── app.ts            # Configuration Express
│   └── server.ts         # Point d'entrée
├── dist/                 # Code compilé
├── package.json
├── tsconfig.json
└── README.md
```

### Pattern architectural : MVC + Services

**Modèles (Models)** : Accès direct à la base de données
- `WalletOwner.model.ts` : Gestion des propriétaires
- `Wallet.model.ts` : Gestion des wallets
- `LedgerAccount.model.ts` : Gestion du compte principal
- `Transaction.model.ts` : Gestion des transactions

**Services** : Logique métier pure
- `Wallet.service.ts` : Création, validation, consultation
- `Transaction.service.ts` : Recharge, transfert, historique
- `Ledger.service.ts` : Consultation du Ledger

**Contrôleurs** : Gestion des requêtes HTTP
- `Wallet.controller.ts` : Endpoints wallet
- `Ledger.controller.ts` : Endpoints admin

**Routes** : Définition des endpoints
- `wallet.routes.ts` : Routes publiques et authentifiées
- `admin.routes.ts` : Routes administratives

---

## Modélisation des données {#modélisation}

### Analyse du MCD (Modèle Conceptuel de Données)

Le MCD fourni définit 4 entités principales :

1. **WalletOwner** : Propriétaire d'un wallet
   - Informations personnelles (nom, téléphone, date de naissance, ID national)
   - Un propriétaire = un wallet maximum

2. **Wallet** : Portefeuille électronique
   - Solde en centimes HTG
   - PIN sécurisé (hashé)
   - Statut (actif/bloqué)
   - Relation 1-1 avec WalletOwner

3. **LedgerAccount** : Compte principal
   - Compte unique "LEDGER_MASTER"
   - Solde de réserve
   - Source des recharges

4. **Transaction** : Enregistrement des opérations
   - Types : recharge, transfert, paiement, débit Ledger
   - Double écriture (from/to)
   - Statut (pending/completed/failed)

### Schéma de base de données

```sql
wallet_owners (id, first_name, last_name, phone_number, date_of_birth, national_id)
    ↓ (1-1)
wallets (id, owner_id, balance, pin_hash, status, created_at, last_activity)
    ↓ (1-N)
transactions (id, type, from_account_id, to_account_id, amount, fees, status)
    ↑
ledger_accounts (id, name, balance)
```

### Décisions de modélisation

1. **Montants en centimes** : Tous les montants stockés en centimes HTG pour éviter les problèmes de précision des nombres flottants
2. **PIN hashé** : Utilisation de bcrypt avec 10 rounds de salage
3. **UUID pour IDs** : Génération d'UUIDs pour les wallets et transactions
4. **Index sur transactions** : Index sur from_account_id, to_account_id, created_at pour optimiser les requêtes

---

## Implémentation étape par étape {#implémentation}

### Étape 1 : Configuration de base

**Objectif** : Mettre en place l'environnement de développement

1. **Initialisation du projet**
   ```bash
   npm init -y
   npm install express mysql2 bcrypt express-validator cors helmet dotenv uuid
   npm install -D typescript @types/node @types/express @types/bcrypt ts-node nodemon
   ```

2. **Configuration TypeScript** (`tsconfig.json`)
   - Module ESNext pour compatibilité avec `"type": "module"`
   - Target ES2020
   - Strict mode activé

3. **Configuration de la base de données** (`src/config/database.ts`)
   - Pool de connexions MySQL
   - Fonction `executeTransaction` pour garantir l'atomicité
   - Fonction `testConnection` pour vérifier la connexion au démarrage

### Étape 2 : Création des types TypeScript

**Objectif** : Définir les interfaces selon le MCD

**Fichier** : `src/types/index.ts`

Définition de :
- Interfaces pour chaque entité (WalletOwner, Wallet, LedgerAccount, Transaction)
- Types pour les requêtes (CreateWalletRequest, RechargeWalletRequest, etc.)
- Types pour les réponses (WalletResponse, RechargeResponse, etc.)
- Enums pour TransactionType et TransactionStatus

**Raison** : Le typage fort permet de détecter les erreurs à la compilation et améliore l'autocomplétion.

### Étape 3 : Création des modèles

**Objectif** : Implémenter l'accès à la base de données

**Approche** : Pattern Repository simplifié

**Exemple avec WalletOwner.model.ts** :
```typescript
static async create(owner: Omit<WalletOwner, 'id' | 'createdAt'>): Promise<WalletOwner> {
    const id = uuidv4();
    // Insertion en DB
    await pool.execute(query, [id, ...]);
    // Récupération de l'entité créée
    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create');
    return created;
}
```

**Points clés** :
- Méthodes statiques pour éviter l'instanciation
- Mapping des noms de colonnes DB vers camelCase TypeScript
- Gestion des erreurs avec vérification après création

### Étape 4 : Migration SQL

**Objectif** : Créer le schéma de base de données

**Fichier** : `src/database/migrations/init.sql`

**Décisions** :
- Utilisation de `CHAR(36)` pour les UUIDs
- `BIGINT` pour les montants (centimes)
- `ENUM` pour les types et statuts
- Index sur les colonnes fréquemment interrogées
- Foreign keys avec `ON DELETE CASCADE`

**Seed initial** : `src/database/seeds/ledger.sql`
- Création du compte LEDGER_MASTER avec 10,000,000 HTG (1,000,000,000 centimes)

### Étape 5 : Services métier

**Objectif** : Implémenter la logique métier

#### WalletService

**Fonctionnalités** :
1. `validateCreateWallet()` : Validation des règles métier
   - Format téléphone haïtien (+509XXXXXXXX)
   - Âge minimum 16 ans
   - PIN 4 chiffres exactement
   - Unicité du numéro de téléphone

2. `createWallet()` : Création d'un wallet
   - Vérification de l'unicité
   - Création du propriétaire si nécessaire
   - Création du wallet avec PIN hashé

3. `getWalletProfile()` : Consultation du profil
4. `getWalletBalance()` : Consultation du solde

#### TransactionService

**Fonctionnalités** :
1. `rechargeWallet()` : Recharge depuis le Ledger
   - Validation du montant (50-50,000 HTG)
   - Calcul des frais (2%)
   - Vérification du solde Ledger
   - Transaction atomique :
     - Création transaction recharge
     - Création transaction débit Ledger
     - Mise à jour solde wallet
     - Mise à jour solde Ledger

2. `transferBetweenWallets()` : Transfert entre wallets
   - Validation du montant (10-25,000 HTG)
   - Calcul des frais (2%)
   - Vérification solde suffisant
   - Vérification limite journalière (100,000 HTG)
   - Transaction atomique :
     - Création transaction transfert
     - Débit wallet émetteur (montant + frais)
     - Crédit wallet récepteur (montant seulement)
     - Crédit frais au Ledger

3. `getWalletTransactionHistory()` : Historique des transactions

**Points techniques** :
- Utilisation de `executeTransaction()` pour garantir l'atomicité
- Tous les montants en centimes
- Les frais sont reversés au Ledger comme revenu

#### LedgerService

**Fonctionnalités** :
1. `getLedgerStatus()` : Statut actuel
2. `getLedgerTransactionHistory()` : Historique

### Étape 6 : Middleware d'authentification

**Objectif** : Sécuriser les endpoints sensibles

**Fichier** : `src/middlewares/auth.middleware.ts`

**Fonctionnement** :
1. Extraction du PIN depuis le header `x-pin`
2. Extraction du numéro de téléphone (params ou body)
3. Recherche du wallet par téléphone
4. Vérification que le wallet est actif
5. Vérification du PIN avec bcrypt
6. Ajout de `walletId` et `phoneNumber` à la requête

**Utilisation** :
```typescript
router.get('/:phoneNumber/profile', authenticatePin, controller.getProfile);
```

### Étape 7 : Validation des données

**Objectif** : Valider les données d'entrée avant traitement

**Fichier** : `src/middlewares/validation.middleware.ts`

**Utilisation d'express-validator** :
- Validation du format téléphone
- Validation des montants (min/max)
- Validation du format date
- Validation du PIN (4 chiffres)

**Exemple** :
```typescript
const validateCreateWallet = [
    body('phoneNumber')
        .matches(/^\+509\d{8}$/)
        .withMessage('Phone number must be in format +509XXXXXXXX'),
    // ...
    validate
];
```

### Étape 8 : Contrôleurs

**Objectif** : Gérer les requêtes HTTP

**Pattern** : Méthodes statiques dans des classes

**Exemple** :
```typescript
static createWallet = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await WalletService.createWallet(req.body);
    return ResponseUtil.success(res, { wallet }, 'Wallet created', 201);
});
```

**Points** :
- Utilisation de `asyncHandler` pour capturer les erreurs
- Utilisation de `ResponseUtil` pour standardiser les réponses
- Pas de logique métier dans les contrôleurs

### Étape 9 : Routes

**Objectif** : Définir les endpoints

**Structure** :
- `/api/wallet/*` : Routes wallet
- `/api/admin/*` : Routes admin

**Exemple** :
```typescript
router.post('/create', validateCreateWallet, WalletController.createWallet);
router.get('/:phoneNumber/profile', validatePhoneNumber, authenticatePin, WalletController.getWalletProfile);
```

**Ordre important** :
1. Validation
2. Authentification (si nécessaire)
3. Contrôleur

### Étape 10 : Gestion des erreurs

**Objectif** : Centraliser la gestion des erreurs

**Fichier** : `src/middlewares/errorHandler.middleware.ts`

**Classe AppError** : Erreurs personnalisées avec code de statut

**Middleware global** :
- Capture des erreurs async
- Gestion des erreurs MySQL (duplicate entry, foreign key)
- Réponses standardisées

### Étape 11 : Configuration Express

**Fichier** : `src/app.ts`

**Middlewares** :
- `helmet` : Sécurité HTTP
- `cors` : Gestion CORS
- `express.json()` : Parsing JSON
- Logger des requêtes
- Routes API
- Gestionnaire d'erreurs global

### Étape 12 : Point d'entrée

**Fichier** : `src/server.ts`

**Fonctionnalités** :
- Test de connexion DB au démarrage
- Démarrage du serveur Express
- Gestion des erreurs de démarrage

---

## Détails techniques {#détails-techniques}

### Système de double écriture comptable

Chaque transaction financière crée un enregistrement dans la table `transactions` avec :
- `from_account_id` : Compte débité
- `to_account_id` : Compte crédité
- `amount` : Montant
- `fees` : Frais (si applicable)

**Exemple de recharge** :
1. Transaction `wallet_recharge` : LEDGER_MASTER → WALLET_123 (5000 centimes)
2. Transaction `ledger_debit` : LEDGER_MASTER → LEDGER_MASTER (5100 centimes = 5000 + 100 frais)

**Exemple de transfert** :
1. Transaction `wallet_transfer` : WALLET_123 → WALLET_456 (1000 centimes, frais 20)
2. WALLET_123 débité de 1020 centimes
3. WALLET_456 crédité de 1000 centimes
4. LEDGER_MASTER crédité de 20 centimes (frais)

### Gestion des transactions SQL

**Fonction `executeTransaction()`** :
```typescript
export const executeTransaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
```

**Utilisation** : Toutes les opérations financières utilisent cette fonction pour garantir l'atomicité.

### Sécurisation des PINs

**Hashage avec bcrypt** :
```typescript
const pinHash = await bcrypt.hash(pin, 10);
```

**Vérification** :
```typescript
const isValid = await bcrypt.compare(pin, storedHash);
```

**Raison** : Les PINs ne sont jamais stockés en clair.

### Validation des règles métier

**Création de wallet** :
- Format téléphone : Regex `/^\+509\d{8}$/`
- Âge minimum : Calcul à partir de la date de naissance
- Unicité téléphone : Vérification en DB avant création

**Recharge** :
- Montant : 50-50,000 HTG (5000-5000000 centimes)
- Solde Ledger suffisant : Vérification avant débit

**Transfert** :
- Montant : 10-25,000 HTG (1000-2500000 centimes)
- Solde suffisant : Montant + frais
- Limite journalière : 100,000 HTG par wallet
- Wallets différents : Vérification fromPhone ≠ toPhone

---

## Décisions de conception {#décisions}

### 1. Pourquoi TypeScript ?

- **Typage fort** : Détection d'erreurs à la compilation
- **Autocomplétion** : Meilleure expérience de développement
- **Maintenabilité** : Code plus facile à maintenir

### 2. Pourquoi des montants en centimes ?

- **Précision** : Évite les problèmes de nombres flottants
- **Performance** : Calculs entiers plus rapides
- **Standard** : Pratique courante dans les systèmes financiers

### 3. Pourquoi des transactions SQL ?

- **Atomicité** : Soit tout réussit, soit tout échoue
- **Intégrité** : Garantit la cohérence des données
- **Sécurité** : Évite les états incohérents en cas d'erreur

### 4. Pourquoi séparer Services et Contrôleurs ?

- **Séparation des responsabilités** : Contrôleurs = HTTP, Services = Métier
- **Réutilisabilité** : Services utilisables ailleurs (CLI, jobs, etc.)
- **Testabilité** : Services testables sans HTTP

### 5. Pourquoi un middleware d'authentification personnalisé ?

- **Simplicité** : Pas besoin de JWT pour un PIN
- **Flexibilité** : Vérification directe en DB
- **Sécurité** : PIN hashé, wallet vérifié

---

## Points d'attention et difficultés rencontrées {#difficultés}

### 1. Configuration TypeScript avec modules ES

**Problème** : Conflit entre `"type": "module"` dans package.json et `"module": "commonjs"` dans tsconfig.json

**Solution** : Utiliser `"module": "ESNext"` dans tsconfig.json et `--loader ts-node/esm` pour l'exécution

### 2. Gestion des transactions asynchrones

**Problème** : Besoin de garantir l'atomicité des opérations financières

**Solution** : Fonction `executeTransaction()` avec begin/commit/rollback

### 3. Calcul des frais et mise à jour des soldes

**Problème** : S'assurer que les frais sont correctement calculés et reversés

**Solution** : 
- Calcul explicite des frais (2%)
- Crédit des frais au Ledger lors des transferts
- Pour les recharges, les frais restent dans le Ledger (débit total = montant + frais, mais seul le montant est débité du solde)

### 4. Validation de l'âge minimum

**Problème** : Calculer correctement l'âge à partir de la date de naissance

**Solution** : Comparaison des dates avec prise en compte du mois et du jour

### 5. Limite journalière de transfert

**Problème** : Calculer le total des transferts d'un wallet dans la journée

**Solution** : Requête SQL avec filtre sur la date (startOfDay à endOfDay)

### 6. Mapping DB ↔ TypeScript

**Problème** : Noms de colonnes en snake_case vs camelCase TypeScript

**Solution** : Utilisation d'alias SQL (`first_name as firstName`) et mapping dans les modèles

---

## Tests et validation

### Tests manuels recommandés

1. **Création de wallet** : Vérifier validation format téléphone, âge, PIN
2. **Recharge** : Vérifier calcul des frais, mise à jour des soldes
3. **Transfert** : Vérifier frais, limite journalière, solde suffisant
4. **Authentification** : Vérifier rejet avec PIN incorrect
5. **Historique** : Vérifier tri par date décroissante

### Scripts de test

- `test-api.sh` : Script bash pour tester tous les endpoints
- `test-api.js` : Script Node.js pour tests automatisés

---

## Conclusion

Ce projet implémente un système de wallet électronique complet avec :
- ✅ Architecture propre et maintenable
- ✅ Sécurité (PIN hashé, validation)
- ✅ Intégrité des données (transactions SQL)
- ✅ Double écriture comptable
- ✅ Gestion des erreurs robuste
- ✅ API REST bien structurée

Le code suit les bonnes pratiques de développement et respecte toutes les spécifications du test technique.
