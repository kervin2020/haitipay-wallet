-- Script SQL pour créer la base de données HaitiPay Wallet
-- Exécutez ce script avec : mysql -u root -p < src/database/create-database.sql

CREATE DATABASE IF NOT EXISTS haitipay_wallet;
USE haitipay_wallet;

-- Table des propriétaires de wallets
CREATE TABLE IF NOT EXISTS wallet_owners (
  id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des wallets
CREATE TABLE IF NOT EXISTS wallets (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  pin_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP NULL,
  CONSTRAINT fk_wallet_owner
    FOREIGN KEY (owner_id)
    REFERENCES wallet_owners(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table du compte Ledger principal
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  balance BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY,
  type ENUM(
    'wallet_recharge',
    'wallet_transfer',
    'bill_payment',
    'ledger_debit'
  ) NOT NULL,
  from_account_id VARCHAR(50),
  to_account_id VARCHAR(50),
  amount BIGINT NOT NULL,
  fees BIGINT DEFAULT 0,
  description TEXT,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_from_account (from_account_id),
  INDEX idx_to_account (to_account_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Initialiser le compte Ledger Master avec un solde initial de 10,000,000 HTG (1,000,000,000 centimes)
INSERT INTO ledger_accounts (id, name, balance, created_at)
VALUES (
  'LEDGER_MASTER',
  'HaitiPay Master Ledger',
  1000000000,
  NOW()
) ON DUPLICATE KEY UPDATE balance = balance;
