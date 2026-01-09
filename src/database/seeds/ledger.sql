-- Initialiser le compte Ledger Master avec un solde initial de 10,000,000 HTG (1,000,000,000 centimes)
INSERT INTO ledger_accounts (id, name, balance, created_at)
VALUES (
  'LEDGER_MASTER',
  'HaitiPay Master Ledger',
  1000000000,
  NOW()
) ON DUPLICATE KEY UPDATE balance = balance;
