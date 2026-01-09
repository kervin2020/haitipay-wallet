// Script de test complet pour toutes les APIs HaitiPay Wallet
const BASE_URL = 'http://localhost:3000/api/v1';
const PHONE1 = '+50912345678';
const PHONE2 = '+50987654321';
const PIN = '1234';

let wallet1Id = null;
let wallet2Id = null;
let errors = [];
let successes = [];

async function testEndpoint(name, testFn) {
    try {
        console.log(`\n🧪 Test: ${name}`);
        const result = await testFn();
        console.log(`✅ ${name} - SUCCESS`);
        successes.push(name);
        return result;
    } catch (error) {
        console.log(`❌ ${name} - FAILED: ${error.message}`);
        errors.push({ name, error: error.message });
        return null;
    }
}

async function testAPI() {
    console.log('🚀 Test complet des APIs HaitiPay Wallet');
    console.log('========================================\n');

    // Test 1: Health check
    await testEndpoint('Health Check', async () => {
        const res = await fetch('http://localhost:3000/health');
        const data = await res.json();
        if (!data.success) throw new Error('Health check failed');
        return data;
    });

    // Test 2: Swagger docs
    await testEndpoint('Swagger Documentation', async () => {
        const res = await fetch('http://localhost:3000/api-docs/');
        if (res.status !== 200) throw new Error('Swagger docs not accessible');
        return true;
    });

    // Test 3: Créer Wallet 1
    const wallet1 = await testEndpoint('Créer Wallet 1', async () => {
        const res = await fetch(`${BASE_URL}/wallet/create`, {
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
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to create wallet');
        wallet1Id = data.data?.wallet?.id;
        return data;
    });

    // Test 4: Créer Wallet 2
    const wallet2 = await testEndpoint('Créer Wallet 2', async () => {
        const res = await fetch(`${BASE_URL}/wallet/create`, {
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
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to create wallet');
        wallet2Id = data.data?.wallet?.id;
        return data;
    });

    // Test 5: Recharger Wallet 1
    await testEndpoint('Recharger Wallet 1', async () => {
        const res = await fetch(`${BASE_URL}/wallet/recharge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: PHONE1,
                amount: 5000
            })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to recharge');
        if (!data.data?.newBalance) throw new Error('Balance not updated');
        return data;
    });

    // Test 6: Consulter profil (avec PIN)
    await testEndpoint('Consulter Profil (avec PIN)', async () => {
        const res = await fetch(`${BASE_URL}/wallet/${PHONE1}/profile`, {
            headers: { 'x-pin': PIN }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to get profile');
        return data;
    });

    // Test 7: Consulter profil (PIN incorrect) - Test gestion d'erreur
    await testEndpoint('Consulter Profil (PIN incorrect) - Erreur attendue', async () => {
        const res = await fetch(`${BASE_URL}/wallet/${PHONE1}/profile`, {
            headers: { 'x-pin': '9999' }
        });
        const data = await res.json();
        if (res.status !== 401 || data.success) {
            throw new Error('Should return 401 for invalid PIN');
        }
        return data;
    });

    // Test 8: Consulter solde
    await testEndpoint('Consulter Solde', async () => {
        const res = await fetch(`${BASE_URL}/wallet/${PHONE1}/balance`, {
            headers: { 'x-pin': PIN }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to get balance');
        return data;
    });

    // Test 9: Transfert Wallet 1 -> Wallet 2
    await testEndpoint('Transfert Wallet 1 -> Wallet 2', async () => {
        const res = await fetch(`${BASE_URL}/wallet/transfer`, {
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
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to transfer');
        return data;
    });

    // Test 10: Transfert avec solde insuffisant - Test gestion d'erreur
    await testEndpoint('Transfert solde insuffisant - Erreur attendue', async () => {
        const res = await fetch(`${BASE_URL}/wallet/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-pin': PIN
            },
            body: JSON.stringify({
                fromPhone: PHONE1,
                toPhone: PHONE2,
                amount: 100000000, // Montant énorme
                description: 'Test solde insuffisant'
            })
        });
        const data = await res.json();
        if (res.status !== 400 || data.success) {
            throw new Error('Should return 400 for insufficient balance');
        }
        return data;
    });

    // Test 11: Historique transactions
    await testEndpoint('Historique Transactions', async () => {
        const res = await fetch(`${BASE_URL}/wallet/${PHONE1}/transactions?limit=10`, {
            headers: { 'x-pin': PIN }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to get transactions');
        return data;
    });

    // Test 12: Statut Ledger
    await testEndpoint('Statut Ledger', async () => {
        const res = await fetch(`${BASE_URL}/admin/ledger/status`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to get ledger status');
        return data;
    });

    // Test 13: Historique Ledger
    await testEndpoint('Historique Ledger', async () => {
        const res = await fetch(`${BASE_URL}/admin/ledger/transactions?limit=10`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to get ledger transactions');
        return data;
    });

    // Test 14: Validation - Format téléphone invalide
    await testEndpoint('Validation téléphone invalide - Erreur attendue', async () => {
        const res = await fetch(`${BASE_URL}/wallet/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '50912345678', // Format invalide (manque +)
                dateOfBirth: '1990-01-01',
                nationalId: '999-999-999-99',
                pin: '1234'
            })
        });
        const data = await res.json();
        if (res.status !== 400 || data.success) {
            throw new Error('Should return 400 for invalid phone format');
        }
        return data;
    });

    // Test 15: Validation - PIN invalide
    await testEndpoint('Validation PIN invalide - Erreur attendue', async () => {
        const res = await fetch(`${BASE_URL}/wallet/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '+50999999999',
                dateOfBirth: '1990-01-01',
                nationalId: '999-999-999-99',
                pin: '123' // PIN trop court
            })
        });
        const data = await res.json();
        if (res.status !== 400 || data.success) {
            throw new Error('Should return 400 for invalid PIN');
        }
        return data;
    });

    // Test 16: Route 404
    await testEndpoint('Route 404 - Erreur attendue', async () => {
        const res = await fetch(`${BASE_URL}/route-inexistante`);
        const data = await res.json();
        if (res.status !== 404 || data.success) {
            throw new Error('Should return 404 for non-existent route');
        }
        return data;
    });

    // Résumé
    console.log('\n\n📊 RÉSUMÉ DES TESTS');
    console.log('====================');
    console.log(`✅ Tests réussis: ${successes.length}`);
    console.log(`❌ Tests échoués: ${errors.length}`);
    console.log(`📈 Taux de réussite: ${((successes.length / (successes.length + errors.length)) * 100).toFixed(1)}%`);

    if (errors.length > 0) {
        console.log('\n❌ Erreurs:');
        errors.forEach(({ name, error }) => {
            console.log(`  - ${name}: ${error}`);
        });
    }

    if (errors.length === 0) {
        console.log('\n🎉 Tous les tests sont passés avec succès !');
    } else {
        console.log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
        process.exit(1);
    }
}

// Vérifier que le serveur est démarré
fetch('http://localhost:3000/health')
    .then(() => testAPI())
    .catch((error) => {
        console.error('❌ Le serveur n\'est pas démarré. Lancez d\'abord: npm run dev');
        process.exit(1);
    });
