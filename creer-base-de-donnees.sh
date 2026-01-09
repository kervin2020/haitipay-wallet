#!/bin/bash

# Script pour créer la base de données HaitiPay Wallet
# Usage: ./creer-base-de-donnees.sh

echo "🗄️  Création de la base de données HaitiPay Wallet..."
echo ""

# Vérifier si MySQL est accessible
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

# Demander les informations de connexion
read -p "Nom d'utilisateur MySQL (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Mot de passe MySQL: " DB_PASSWORD
echo ""

# Créer la base de données
echo "📦 Création de la base de données et des tables..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" < src/database/create-database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Base de données créée avec succès !"
    echo ""
    echo "Vérification des tables créées..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE haitipay_wallet; SHOW TABLES;"
    echo ""
    echo "Vérification du Ledger..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE haitipay_wallet; SELECT id, name, balance FROM ledger_accounts;"
    echo ""
    echo "🎉 Tout est prêt ! Vous pouvez maintenant lancer le serveur avec: npm run dev"
else
    echo ""
    echo "❌ Erreur lors de la création de la base de données"
    echo "Vérifiez vos identifiants MySQL et que MySQL est démarré"
    exit 1
fi
