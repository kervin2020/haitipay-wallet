#!/bin/bash

# Script de test pour toutes les APIs HaitiPay Wallet
# Ce script teste tous les endpoints de l'API

BASE_URL="http://localhost:3000/api/v1"
PHONE1="+50912345678"
PHONE2="+50987654321"
PIN="1234"

echo "🧪 Test des APIs HaitiPay Wallet"
echo "================================"
echo ""

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
    fi
    echo ""
}

# 1. Test de santé
echo "1. Test de santé..."
curl -s http://localhost:3000/health | jq '.' || echo "Serveur non démarré"
echo ""

# 2. Créer Wallet 1
echo "2. Création du Wallet 1..."
RESPONSE1=$(curl -s -X POST "$BASE_URL/wallet/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Jean\",
    \"lastName\": \"Baptiste\",
    \"phoneNumber\": \"$PHONE1\",
    \"dateOfBirth\": \"1990-05-15\",
    \"nationalId\": \"001-234-567-89\",
    \"pin\": \"$PIN\"
  }")
echo "$RESPONSE1" | jq '.'
WALLET1_ID=$(echo "$RESPONSE1" | jq -r '.data.wallet.id')
print_result $? "Wallet 1 créé"
echo ""

# 3. Créer Wallet 2
echo "3. Création du Wallet 2..."
RESPONSE2=$(curl -s -X POST "$BASE_URL/wallet/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Marie\",
    \"lastName\": \"Dupont\",
    \"phoneNumber\": \"$PHONE2\",
    \"dateOfBirth\": \"1992-08-20\",
    \"nationalId\": \"002-345-678-90\",
    \"pin\": \"$PIN\"
  }")
echo "$RESPONSE2" | jq '.'
print_result $? "Wallet 2 créé"
echo ""

# 4. Recharger Wallet 1
echo "4. Recharge du Wallet 1 (5000 centimes = 50 HTG)..."
RESPONSE3=$(curl -s -X POST "$BASE_URL/wallet/recharge" \
  -H "Content-Type: application/json" \
  -d "{
    \"phoneNumber\": \"$PHONE1\",
    \"amount\": 5000
  }")
echo "$RESPONSE3" | jq '.'
print_result $? "Wallet 1 rechargé"
echo ""

# 5. Consulter le profil du Wallet 1
echo "5. Consultation du profil du Wallet 1..."
RESPONSE4=$(curl -s -X GET "$BASE_URL/wallet/$PHONE1/profile" \
  -H "x-pin: $PIN")
echo "$RESPONSE4" | jq '.'
print_result $? "Profil consulté"
echo ""

# 6. Consulter le solde du Wallet 1
echo "6. Consultation du solde du Wallet 1..."
RESPONSE5=$(curl -s -X GET "$BASE_URL/wallet/$PHONE1/balance" \
  -H "x-pin: $PIN")
echo "$RESPONSE5" | jq '.'
print_result $? "Solde consulté"
echo ""

# 7. Transfert Wallet 1 -> Wallet 2
echo "7. Transfert de Wallet 1 vers Wallet 2 (1000 centimes = 10 HTG)..."
RESPONSE6=$(curl -s -X POST "$BASE_URL/wallet/transfer" \
  -H "Content-Type: application/json" \
  -H "x-pin: $PIN" \
  -d "{
    \"fromPhone\": \"$PHONE1\",
    \"toPhone\": \"$PHONE2\",
    \"amount\": 1000,
    \"description\": \"Test de transfert\"
  }")
echo "$RESPONSE6" | jq '.'
print_result $? "Transfert effectué"
echo ""

# 8. Historique des transactions Wallet 1
echo "8. Historique des transactions du Wallet 1..."
RESPONSE7=$(curl -s -X GET "$BASE_URL/wallet/$PHONE1/transactions?limit=10" \
  -H "x-pin: $PIN")
echo "$RESPONSE7" | jq '.'
print_result $? "Historique consulté"
echo ""

# 9. Statut du Ledger
echo "9. Statut du Ledger..."
RESPONSE8=$(curl -s -X GET "$BASE_URL/admin/ledger/status")
echo "$RESPONSE8" | jq '.'
print_result $? "Statut du Ledger consulté"
echo ""

# 10. Historique du Ledger
echo "10. Historique du Ledger..."
RESPONSE9=$(curl -s -X GET "$BASE_URL/admin/ledger/transactions?limit=10")
echo "$RESPONSE9" | jq '.'
print_result $? "Historique du Ledger consulté"
echo ""

echo "✅ Tests terminés !"
