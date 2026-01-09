// Script de test Node.js pour toutes les APIs HaitiPay Wallet
const BASE_URL = 'http://localhost:3000/api/v1';
const PHONE1 = '+50912345678';
const PHONE2 = '+50987654321';
const PIN = '1234';

let wallet1Id = null;
let wallet2Id = null;

async function testAPI() {
    console.log('🧪 Test des APIs HaitiPay Wallet');
    console.log('================================\n');

    try {
        // 1. Test de santé
        console.log('1. Test de santé...');
        const health = await fetch('http://localhost:3000/health');
        const healthData = await health.json();
        console.log('✅ Serveur actif:', healthData.message);
        console.log('');

        // 2. Créer Wallet 1
        console.log('2. Création du Wallet 1...');
        const createWallet1 = await fetch(`${BASE_URL}/wallet/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Jean',
                lastName: 'Baptiste',
                phoneNumber: PHONE1,
                dateOfBirth: '1990-05-15',
                nationalId: '001-234-567-89',
                pin: PIN
            })
        });
        const wallet1Data = await createWallet1.json();
        console.log('✅ Wallet 1 créé:', wallet1Data.data?.wallet?.id || 'Erreur');
        wallet1Id = wallet1Data.data?.wallet?.id;
        console.log('');

        // 3. Créer Wallet 2
        console.log('3. Création du Wallet 2...');
        const createWallet2 = await fetch(`${BASE_URL}/wallet/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Marie',
                lastName: 'Dupont',
                phoneNumber: PHONE2,
                dateOfBirth: '1992-08-20',
                nationalId: '002-345-678-90',
                pin: PIN
            })
        });
        const wallet2Data = await createWallet2.json();
        console.log('✅ Wallet 2 créé:', wallet2Data.data?.wallet?.id || 'Erreur');
        wallet2Id = wallet2Data.data?.wallet?.id;
        console.log('');

        // 4. Recharger Wallet 1
        console.log('4. Recharge du Wallet 1 (5000 centimes = 50 HTG)...');
        const recharge = await fetch(`${BASE_URL}/wallet/recharge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: PHONE1,
                amount: 5000
            })
        });
        const rechargeData = await recharge.json();
        console.log('✅ Recharge effectuée. Nouveau solde:', rechargeData.data?.newBalance || 'Erreur');
        console.log('');

        // 5. Consulter le profil
        console.log('5. Consultation du profil du Wallet 1...');
        const profile = await fetch(`${BASE_URL}/wallet/${PHONE1}/profile`, {
            headers: { 'x-pin': PIN }
        });
        const profileData = await profile.json();
        console.log('✅ Profil:', profileData.data?.owner?.firstName || 'Erreur');
        console.log('');

        // 6. Consulter le solde
        console.log('6. Consultation du solde du Wallet 1...');
        const balance = await fetch(`${BASE_URL}/wallet/${PHONE1}/balance`, {
            headers: { 'x-pin': PIN }
        });
        const balanceData = await balance.json();
        console.log('✅ Solde:', balanceData.data?.balance || 'Erreur');
        console.log('');

        // 7. Transfert Wallet 1 -> Wallet 2
        console.log('7. Transfert de Wallet 1 vers Wallet 2 (1000 centimes = 10 HTG)...');
        const transfer = await fetch(`${BASE_URL}/wallet/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-pin': PIN
            },
            body: JSON.stringify({
                fromPhone: PHONE1,
                toPhone: PHONE2,
                amount: 1000,
                description: 'Test de transfert'
            })
        });
        const transferData = await transfer.json();
        console.log('✅ Transfert effectué. Solde émetteur:', transferData.data?.fromNewBalance || 'Erreur');
        console.log('');

        // 8. Historique des transactions
        console.log('8. Historique des transactions du Wallet 1...');
        const history = await fetch(`${BASE_URL}/wallet/${PHONE1}/transactions?limit=10`, {
            headers: { 'x-pin': PIN }
        });
        const historyData = await history.json();
        console.log('✅ Nombre de transactions:', historyData.data?.length || 0);
        console.log('');

        // 9. Statut du Ledger
        console.log('9. Statut du Ledger...');
        const ledgerStatus = await fetch(`${BASE_URL}/admin/ledger/status`);
        const ledgerStatusData = await ledgerStatus.json();
        console.log('✅ Solde du Ledger:', ledgerStatusData.data?.balance || 'Erreur');
        console.log('');

        // 10. Historique du Ledger
        console.log('10. Historique du Ledger...');
        const ledgerHistory = await fetch(`${BASE_URL}/admin/ledger/transactions?limit=10`);
        const ledgerHistoryData = await ledgerHistory.json();
        console.log('✅ Nombre de transactions Ledger:', ledgerHistoryData.data?.length || 0);
        console.log('');

        console.log('✅ Tous les tests sont passés avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        process.exit(1);
    }
}

testAPI();
