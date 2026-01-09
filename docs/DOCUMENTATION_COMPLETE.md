# Documentation Complète - HaitiPay Wallet

## 📚 Table des Matières

1. [Présentation du Projet](#présentation)
2. [Architecture Technique](#architecture)
3. [Guide d'Implémentation Détaillé](#implémentation)
4. [Explication des Choix Techniques](#choix-techniques)
5. [Réponses aux Questions Probables](#questions)
6. [Guide de Défense du Projet](#défense)

---

## Présentation du Projet {#présentation}

### Contexte

Le projet HaitiPay Wallet est un système de portefeuille électronique développé dans le cadre d'un test technique. Il permet de gérer des wallets électroniques avec un système de double écriture comptable, similaire aux systèmes FinTech réels.

### Objectifs

- Créer un système sécurisé de gestion de wallets
- Implémenter un système de rechargement depuis un compte principal (Ledger)
- Permettre les transferts entre wallets avec gestion des frais
- Assurer la traçabilité complète via un historique des transactions
- Respecter les règles métier strictes (validation, limites, sécurité)

---

## Architecture Technique {#architecture}

### Stack Technologique

**Backend** :
- Node.js v18+ avec TypeScript
- Express.js pour le framework web
- MySQL 8.0 pour la base de données
- bcrypt pour le hashage des PINs
- express-validator pour la validation

**Architecture** : Pattern MVC + Services

```
┌─────────────┐
│   Routes    │ ← Définition des endpoints
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │ ← Gestion des requêtes HTTP
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │ ← Logique métier
└──────┬──────┘
       │
┌──────▼──────┐
│   Models    │ ← Accès à la base de données
└──────┬──────┘
       │
┌──────▼──────┐
│     MySQL   │
└─────────────┘
```

### Structure du Projet

```
src/
├── config/          Configuration (DB)
├── controllers/     Gestion HTTP
├── database/         Migrations SQL
├── middlewares/      Auth, validation, erreurs
├── models/          Accès DB (Repository pattern)
├── routes/           Définition des routes
├── services/         Logique métier
├── types/            Types TypeScript
└── utils/            Utilitaires
```

---

## Guide d'Implémentation Détaillé {#implémentation}

### Phase 1 : Analyse et Planification

**Ce que j'ai fait** :
1. Analyse du MCD fourni
2. Identification des 4 entités principales (WalletOwner, Wallet, LedgerAccount, Transaction)
3. Définition des règles métier à implémenter
4. Choix de l'architecture (MVC + Services)

**Pourquoi cette approche** :
- Séparation claire des responsabilités
- Code maintenable et testable
- Respect des principes SOLID

### Phase 2 : Configuration de Base

**Étapes réalisées** :

1. **Initialisation du projet**
   ```bash
   npm init -y
   npm install express mysql2 bcrypt express-validator cors helmet dotenv uuid
   npm install -D typescript @types/node @types/express ts-node nodemon
   ```

2. **Configuration TypeScript** (`tsconfig.json`)
   - Module ESNext (compatible avec `"type": "module"`)
   - Target ES2020
   - Strict mode activé pour la sécurité

3. **Configuration de la base de données** (`src/config/database.ts`)
   - Pool de connexions MySQL (10 connexions max)
   - Fonction `executeTransaction()` pour l'atomicité
   - Test de connexion au démarrage

**Décision importante** : Utilisation d'un pool de connexions pour optimiser les performances et éviter la surcharge.

### Phase 3 : Modélisation des Données

**Création du schéma SQL** (`src/database/migrations/init.sql`)

**Choix de conception** :

1. **UUIDs pour les IDs** : `CHAR(36)` pour wallets et transactions
   - Raison : Évite les collisions, sécurisé, pas de séquence à gérer

2. **Montants en centimes** : `BIGINT` au lieu de `DECIMAL`
   - Raison : Évite les problèmes de précision des flottants
   - Exemple : 50 HTG = 5000 centimes

3. **PIN hashé** : `VARCHAR(255)` pour stocker le hash bcrypt
   - Raison : Sécurité, jamais de PIN en clair

4. **Index sur transactions** :
   - `from_account_id`, `to_account_id`, `created_at`
   - Raison : Optimisation des requêtes d'historique

5. **Foreign keys avec CASCADE** :
   - Suppression d'un owner supprime son wallet
   - Raison : Intégrité référentielle

### Phase 4 : Implémentation des Modèles

**Pattern Repository simplifié**

Chaque modèle expose des méthodes statiques :
- `create()` : Création d'une entité
- `findById()` : Recherche par ID
- `findByPhoneNumber()` : Recherche par téléphone (pour Wallet)
- Méthodes spécifiques selon les besoins

**Exemple WalletOwner.model.ts** :
```typescript
static async create(owner: Omit<WalletOwner, 'id' | 'createdAt'>): Promise<WalletOwner> {
    const id = uuidv4();
    await pool.execute(query, [id, ...]);
    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create');
    return created;
}
```

**Points clés** :
- Mapping automatique snake_case → camelCase
- Gestion des erreurs avec vérification après création
- Pas d'instanciation nécessaire (méthodes statiques)

### Phase 5 : Services Métier

#### WalletService

**Fonctionnalités** :

1. **validateCreateWallet()** : Validation des règles
   - Format téléphone : Regex `/^\+509\d{8}$/`
   - Âge minimum : Calcul depuis date de naissance
   - PIN : Exactement 4 chiffres
   - Unicité téléphone : Vérification en DB

2. **createWallet()** :
   - Vérifie l'unicité du téléphone
   - Crée le propriétaire si nécessaire
   - Hash le PIN avec bcrypt (10 rounds)
   - Crée le wallet avec solde à 0

**Logique de validation de l'âge** :
```typescript
const birthDate = new Date(data.dateOfBirth);
const today = new Date();
const age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();

// Vérifier si l'anniversaire est passé cette année
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    if (age - 1 < 16) throw new AppError('User must be at least 16 years old', 400);
} else {
    if (age < 16) throw new AppError('User must be at least 16 years old', 400);
}
```

#### TransactionService

**Fonctionnalités principales** :

1. **rechargeWallet()** : Recharge depuis le Ledger
   - Validation montant (50-50,000 HTG)
   - Calcul frais (2% du montant)
   - Vérification solde Ledger suffisant
   - Transaction atomique :
     ```
     1. Créer transaction wallet_recharge (Ledger → Wallet)
     2. Créer transaction ledger_debit (Ledger → Ledger, montant + frais)
     3. Mettre à jour solde wallet (+ montant)
     4. Mettre à jour solde Ledger (- montant, frais restent)
     ```

2. **transferBetweenWallets()** : Transfert entre wallets
   - Validation montant (10-25,000 HTG)
   - Calcul frais (2% du montant)
   - Vérification solde suffisant (montant + frais)
   - Vérification limite journalière (100,000 HTG)
   - Transaction atomique :
     ```
     1. Créer transaction wallet_transfer
     2. Débiter wallet émetteur (montant + frais)
     3. Créditer wallet récepteur (montant seulement)
     4. Créditer Ledger (frais comme commission)
     ```

**Gestion de la limite journalière** :
```typescript
const dailyTotal = await TransactionModel.getDailyTransferTotal(walletId, today);
if (dailyTotal + totalDebit > DAILY_TRANSFER_LIMIT) {
    throw new AppError('Daily transfer limit exceeded', 400);
}
```

**Requête SQL pour calculer le total journalier** :
```sql
SELECT COALESCE(SUM(amount + fees), 0) as total
FROM transactions
WHERE from_account_id = ?
AND type = 'wallet_transfer'
AND status = 'completed'
AND created_at >= ? -- startOfDay
AND created_at <= ? -- endOfDay
```

### Phase 6 : Authentification et Sécurité

**Middleware d'authentification** (`src/middlewares/auth.middleware.ts`)

**Fonctionnement** :
1. Extraction du PIN depuis header `x-pin`
2. Extraction du numéro de téléphone (params ou body)
3. Recherche du wallet par téléphone
4. Vérification statut actif
5. Vérification PIN avec bcrypt.compare()
6. Ajout de `walletId` à la requête pour usage ultérieur

**Pourquoi cette approche** :
- Simple et efficace pour un PIN
- Pas besoin de JWT pour ce cas d'usage
- Vérification directe en base de données

**Sécurité du PIN** :
- Hashage avec bcrypt (10 rounds)
- Comparaison avec `bcrypt.compare()` (timing-safe)
- PIN jamais stocké en clair

### Phase 7 : Validation des Données

**express-validator** pour la validation

**Exemple de validation** :
```typescript
const validateCreateWallet = [
    body('phoneNumber')
        .matches(/^\+509\d{8}$/)
        .withMessage('Phone number must be in format +509XXXXXXXX'),
    body('pin')
        .matches(/^\d{4}$/)
        .withMessage('PIN must contain exactly 4 digits'),
    validate
];
```

**Avantages** :
- Validation avant traitement
- Messages d'erreur clairs
- Réduction de la charge sur les services

### Phase 8 : Gestion des Erreurs

**Classe AppError personnalisée** :
```typescript
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}
```

**Middleware global** :
- Capture des erreurs async via `asyncHandler`
- Gestion des erreurs MySQL (duplicate entry, foreign key)
- Réponses standardisées
- Stack trace en développement seulement

### Phase 9 : Double Écriture Comptable

**Principe** : Chaque transaction financière crée un enregistrement avec from/to

**Exemple de recharge** :
```
Transaction 1:
- type: wallet_recharge
- from: LEDGER_MASTER
- to: WALLET_123
- amount: 5000
- fees: 0

Transaction 2:
- type: ledger_debit
- from: LEDGER_MASTER
- to: LEDGER_MASTER
- amount: 5100 (5000 + 100 frais)
- fees: 0
```

**Exemple de transfert** :
```
Transaction:
- type: wallet_transfer
- from: WALLET_123
- to: WALLET_456
- amount: 1000
- fees: 20 (2%)
```

**Avantages** :
- Traçabilité complète
- Audit facile
- Détection d'anomalies possible

---

## Explication des Choix Techniques {#choix-techniques}

### Pourquoi TypeScript ?

1. **Typage fort** : Détection d'erreurs à la compilation
2. **Autocomplétion** : Meilleure productivité
3. **Maintenabilité** : Code plus lisible et documenté
4. **Refactoring** : Plus sûr grâce au typage

### Pourquoi montants en centimes ?

1. **Précision** : Évite les erreurs de calcul avec les flottants
   - Exemple : 0.1 + 0.2 = 0.30000000000000004 en JavaScript
   - Avec centimes : 10 + 20 = 30 (toujours exact)

2. **Performance** : Calculs entiers plus rapides
3. **Standard** : Pratique courante dans les systèmes financiers

### Pourquoi transactions SQL ?

1. **Atomicité** : Soit tout réussit, soit tout échoue
2. **Intégrité** : Garantit la cohérence des données
3. **Sécurité** : Évite les états incohérents en cas d'erreur

**Exemple de problème évité** :
```
Sans transaction :
1. Débiter wallet A ✅
2. Erreur réseau ❌
3. Créditer wallet B ❌
→ Wallet A débité mais B pas crédité (incohérence)
```

### Pourquoi séparer Services et Contrôleurs ?

1. **Séparation des responsabilités** :
   - Contrôleurs : Gestion HTTP (req/res)
   - Services : Logique métier pure

2. **Réutilisabilité** : Services utilisables ailleurs (CLI, jobs, tests)

3. **Testabilité** : Services testables sans HTTP

### Pourquoi middleware d'authentification personnalisé ?

1. **Simplicité** : Pas besoin de JWT pour un PIN
2. **Flexibilité** : Vérification directe en DB
3. **Sécurité** : PIN hashé, wallet vérifié

---

## Réponses aux Questions Probables {#questions}

### Q1 : Pourquoi avez-vous choisi cette architecture ?

**Réponse** : J'ai choisi une architecture MVC + Services pour :
- Séparer clairement les responsabilités
- Faciliter la maintenance et les tests
- Respecter les principes SOLID
- Permettre une évolution future (ajout de nouvelles fonctionnalités)

### Q2 : Comment gérez-vous la sécurité des PINs ?

**Réponse** : 
- Hashage avec bcrypt (10 rounds de salage)
- PIN jamais stocké en clair
- Comparaison avec `bcrypt.compare()` (timing-safe pour éviter les attaques)
- Validation du format (4 chiffres exactement)

### Q3 : Comment garantissez-vous l'intégrité des transactions financières ?

**Réponse** :
- Utilisation de transactions SQL (`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`)
- Toutes les opérations financières dans une seule transaction
- En cas d'erreur, rollback automatique
- Double écriture comptable pour la traçabilité

### Q4 : Pourquoi les montants sont en centimes ?

**Réponse** :
- Évite les problèmes de précision des nombres flottants
- Standard dans les systèmes financiers
- Calculs entiers plus rapides et fiables
- Exemple : 50 HTG = 5000 centimes

### Q5 : Comment calculez-vous la limite journalière ?

**Réponse** :
- Requête SQL qui somme tous les transferts du wallet dans la journée
- Filtre sur `created_at` entre startOfDay et endOfDay
- Vérification avant chaque transfert
- Limite : 100,000 HTG (10,000,000 centimes) par wallet par jour

### Q6 : Comment gérez-vous les frais de transaction ?

**Réponse** :
- Frais de 2% calculés sur le montant
- Pour les recharges : frais débités du Ledger mais restent dans le Ledger (revenu)
- Pour les transferts : frais débités du wallet émetteur et crédités au Ledger (commission)
- Tous les frais sont enregistrés dans la table transactions

### Q7 : Que se passe-t-il si le Ledger n'a pas assez de fonds ?

**Réponse** :
- Vérification du solde avant chaque recharge
- Calcul du montant total nécessaire (montant + frais)
- Si solde insuffisant, erreur 400 avec message clair
- Transaction annulée avant même de commencer

### Q8 : Comment testez-vous votre code ?

**Réponse** :
- Tests manuels avec curl et scripts automatisés
- Vérification de chaque endpoint
- Tests de validation (formats incorrects)
- Tests de sécurité (PIN incorrect, etc.)
- Vérification de l'intégrité des données après chaque opération

### Q9 : Quelles sont les difficultés rencontrées ?

**Réponse** :
1. **Configuration TypeScript avec modules ES** : Résolu en utilisant ESNext et ts-node/esm
2. **Gestion de l'atomicité** : Résolu avec transactions SQL
3. **Calcul de l'âge** : Prise en compte du mois et jour pour un calcul précis
4. **Mapping DB ↔ TypeScript** : Utilisation d'alias SQL et mapping dans les modèles

### Q10 : Comment pourriez-vous améliorer ce projet ?

**Réponse** :
- Ajouter des tests unitaires et d'intégration (Jest)
- Implémenter un système de logs plus robuste (Winston)
- Ajouter de la documentation API (Swagger/OpenAPI)
- Implémenter un système de cache (Redis) pour les requêtes fréquentes
- Ajouter un système de rate limiting
- Implémenter des webhooks pour les notifications
- Ajouter un système de backup automatique

---

## Guide de Défense du Projet {#défense}

### Structure de présentation

1. **Introduction** (2 min)
   - Présentation du projet
   - Objectifs et contexte

2. **Architecture** (3 min)
   - Structure du projet
   - Choix techniques
   - Pattern utilisé

3. **Fonctionnalités principales** (5 min)
   - Création de wallet
   - Recharge
   - Transfert
   - Historique

4. **Sécurité et intégrité** (3 min)
   - Hashage des PINs
   - Transactions SQL
   - Validation des données

5. **Défis et solutions** (2 min)
   - Difficultés rencontrées
   - Solutions apportées

6. **Questions** (5 min)

### Points à mettre en avant

✅ **Architecture propre** : MVC + Services, séparation des responsabilités
✅ **Sécurité** : PIN hashé, validation stricte, transactions SQL
✅ **Intégrité** : Double écriture comptable, atomicité garantie
✅ **Code maintenable** : TypeScript, structure claire, commentaires
✅ **Respect des spécifications** : Toutes les fonctionnalités implémentées

### Phrases clés à retenir

- "J'ai choisi une architecture MVC + Services pour séparer clairement les responsabilités"
- "Tous les montants sont stockés en centimes pour éviter les problèmes de précision"
- "J'utilise des transactions SQL pour garantir l'atomicité des opérations financières"
- "Les PINs sont hashés avec bcrypt et jamais stockés en clair"
- "J'ai implémenté un système de double écriture comptable pour la traçabilité complète"

### Si vous ne savez pas répondre

- "C'est une excellente question, je n'ai pas encore approfondi ce point mais je serais ravi d'en discuter"
- "Je pourrais améliorer cela en [suggestion]"
- "C'est un point que j'aimerais explorer davantage"

---

## Conclusion

Ce projet démontre :
- ✅ Maîtrise de Node.js/TypeScript
- ✅ Compréhension des systèmes FinTech
- ✅ Capacité à implémenter des règles métier complexes
- ✅ Attention à la sécurité et à l'intégrité des données
- ✅ Code propre et maintenable

**Temps de développement estimé** : 4-5 heures
**Lignes de code** : ~2000 lignes
**Endpoints implémentés** : 8
**Fonctionnalités** : 100% des spécifications
