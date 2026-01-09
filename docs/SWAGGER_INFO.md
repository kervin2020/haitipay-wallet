# 📚 Documentation Swagger

## Accès à la Documentation

Une fois le serveur démarré, accédez à la documentation Swagger à l'adresse :

**http://localhost:3000/api-docs**

## Fonctionnalités

La documentation Swagger inclut :

- ✅ **Tous les endpoints** documentés
- ✅ **Schémas de requête/réponse** détaillés
- ✅ **Exemples** pour chaque endpoint
- ✅ **Authentification** documentée (header x-pin)
- ✅ **Codes de réponse** (200, 400, 401, 404, etc.)
- ✅ **Validation** des paramètres
- ✅ **Test interactif** des endpoints directement depuis l'interface

## Endpoints Documentés

### Wallet
- `POST /api/wallet/create` - Créer un wallet
- `POST /api/wallet/recharge` - Recharger un wallet
- `GET /api/wallet/{phoneNumber}/profile` - Profil (nécessite PIN)
- `GET /api/wallet/{phoneNumber}/balance` - Solde (nécessite PIN)
- `POST /api/wallet/transfer` - Transfert (nécessite PIN)
- `GET /api/wallet/{phoneNumber}/transactions` - Historique (nécessite PIN)

### Admin
- `GET /api/admin/ledger/status` - Statut du Ledger
- `GET /api/admin/ledger/transactions` - Historique du Ledger

## Utilisation

1. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Ouvrir dans le navigateur** :
   ```
   http://localhost:3000/api-docs
   ```

3. **Tester les endpoints** :
   - Cliquez sur un endpoint pour voir les détails
   - Cliquez sur "Try it out"
   - Remplissez les paramètres
   - Cliquez sur "Execute"
   - Voir la réponse

## Authentification

Pour les endpoints nécessitant un PIN :
1. Cliquez sur le bouton "Authorize" en haut à droite
2. Entrez le PIN dans le champ "x-pin"
3. Cliquez sur "Authorize"
4. Tous les endpoints protégés utiliseront ce PIN

## Exemples

### Créer un Wallet
```json
{
  "firstName": "Jean",
  "lastName": "Baptiste",
  "phoneNumber": "+50912345678",
  "dateOfBirth": "1990-05-15",
  "nationalId": "001-234-567-89",
  "pin": "1234"
}
```

### Recharger un Wallet
```json
{
  "phoneNumber": "+50912345678",
  "amount": 5000
}
```

### Transfert
```json
{
  "fromPhone": "+50912345678",
  "toPhone": "+50987654321",
  "amount": 1000,
  "description": "Remboursement"
}
```

---

**La documentation Swagger est mise à jour automatiquement avec le code ! 🎉**
