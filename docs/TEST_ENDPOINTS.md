# 🧪 Guide de Test des Endpoints

## Tests Automatiques

### Script de test complet
```bash
# Démarrer le serveur dans un terminal
npm run dev

# Dans un autre terminal, exécuter les tests
node test-all-endpoints.js
```

Le script teste :
- ✅ Health check
- ✅ Documentation Swagger
- ✅ Création de wallets
- ✅ Recharge
- ✅ Consultation profil/solde
- ✅ Transfert
- ✅ Historique
- ✅ Statut Ledger
- ✅ Gestion d'erreur (PIN incorrect, solde insuffisant, validation)

## Tests Manuels

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Documentation Swagger
Ouvrir dans le navigateur : **http://localhost:3000/api-docs**

### 3. Créer un Wallet
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

### 4. Recharger un Wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet/recharge \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+50912345678",
    "amount": 5000
  }'
```

### 5. Consulter le Profil (avec PIN)
```bash
curl -X GET http://localhost:3000/api/v1/wallet/+50912345678/profile \
  -H "x-pin: 1234"
```

### 6. Consulter le Solde (avec PIN)
```bash
curl -X GET http://localhost:3000/api/v1/wallet/+50912345678/balance \
  -H "x-pin: 1234"
```

### 7. Transfert (avec PIN)
```bash
curl -X POST http://localhost:3000/api/v1/wallet/transfer \
  -H "Content-Type: application/json" \
  -H "x-pin: 1234" \
  -d '{
    "fromPhone": "+50912345678",
    "toPhone": "+50987654321",
    "amount": 1000,
    "description": "Test"
  }'
```

### 8. Historique des Transactions
```bash
curl -X GET "http://localhost:3000/api/wallet/+50912345678/transactions?limit=10" \
  -H "x-pin: 1234"
```

### 9. Statut du Ledger
```bash
curl http://localhost:3000/api/v1/admin/ledger/status
```

### 10. Historique du Ledger
```bash
curl "http://localhost:3000/api/v1/admin/ledger/transactions?limit=10"
```

## Tests de Gestion d'Erreur

### PIN Incorrect (devrait retourner 401)
```bash
curl -X GET http://localhost:3000/api/v1/wallet/+50912345678/balance \
  -H "x-pin: 9999"
```

### Solde Insuffisant (devrait retourner 400)
```bash
curl -X POST http://localhost:3000/api/v1/wallet/transfer \
  -H "Content-Type: application/json" \
  -H "x-pin: 1234" \
  -d '{
    "fromPhone": "+50912345678",
    "toPhone": "+50987654321",
    "amount": 100000000
  }'
```

### Format Téléphone Invalide (devrait retourner 400)
```bash
curl -X POST http://localhost:3000/api/v1/wallet/create \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "50912345678",
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "nationalId": "999-999-999-99",
    "pin": "1234"
  }'
```

### Route Inexistante (devrait retourner 404)
```bash
curl http://localhost:3000/api/v1/route-inexistante
```

## Vérification des Réponses

### Réponse Succès
```json
{
  "success": true,
  "data": { ... }
}
```

### Réponse Erreur
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Checklist de Vérification

- [ ] Health check fonctionne
- [ ] Swagger accessible à /api-docs
- [ ] Création de wallet fonctionne
- [ ] Recharge fonctionne
- [ ] Consultation profil/solde fonctionne (avec PIN)
- [ ] Transfert fonctionne (avec PIN)
- [ ] Historique fonctionne
- [ ] Statut Ledger fonctionne
- [ ] Historique Ledger fonctionne
- [ ] Erreur 401 pour PIN incorrect
- [ ] Erreur 400 pour validation
- [ ] Erreur 404 pour route inexistante
- [ ] Erreur 400 pour solde insuffisant

---

**Tous les tests doivent passer pour valider le projet ! ✅**
