# Changelog - HaitiPay Wallet API

## [1.0.0] - 2025-01-09

### Ajouté
- Système de versioning de l'API (v1)
- Documentation Swagger complète
- Endpoints de base :
  - `POST /api/v1/wallet/create` - Création de wallet
  - `POST /api/v1/wallet/recharge` - Recharge depuis Ledger
  - `GET /api/v1/wallet/{phoneNumber}/profile` - Profil wallet
  - `GET /api/v1/wallet/{phoneNumber}/balance` - Solde wallet
  - `POST /api/v1/wallet/transfer` - Transfert entre wallets
  - `GET /api/v1/wallet/{phoneNumber}/transactions` - Historique
  - `GET /api/v1/admin/ledger/status` - Statut Ledger
  - `GET /api/v1/admin/ledger/transactions` - Historique Ledger
- Authentification via header `x-pin`
- Validation complète des données
- Gestion d'erreur robuste
- Système de double écriture comptable
- Frais de transaction (2%)
- Limite journalière de transfert (100,000 HTG)

### Compatibilité
- Les routes sans version (`/api/wallet/*`) redirigent vers v1 pour compatibilité

---

**Note** : Cette version correspond au test technique initial (5 heures de développement)
