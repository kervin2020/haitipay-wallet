// Types selon le MCD du test technique

export interface WalletOwner {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string; // Format: +509XXXXXXXX
    dateOfBirth: string; // Format: YYYY-MM-DD
    nationalId: string;
    createdAt?: Date;
}

export interface Wallet {
    id: string; // UUID
    ownerId: string;
    balance: number; // en centimes HTG
    pin: string; // 4 chiffres (non hashé dans l'interface, hashé en DB)
    createdAt?: Date;
    lastActivity?: Date;
    status?: 'active' | 'blocked';
}

export interface LedgerAccount {
    id: string; // "LEDGER_MASTER"
    name: string;
    balance: number; // en centimes HTG
    createdAt?: Date;
}

export type TransactionType = 'wallet_recharge' | 'wallet_transfer' | 'bill_payment' | 'ledger_debit';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
    id: string; // UUID
    type: TransactionType;
    fromAccountId: string;
    toAccountId: string;
    amount: number; // en centimes HTG
    fees: number; // en centimes HTG
    description?: string;
    timestamp?: Date;
    status: TransactionStatus;
}

// Request types
export interface CreateWalletRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationalId: string;
    pin: string;
}

export interface RechargeWalletRequest {
    phoneNumber: string;
    amount: number; // en centimes HTG
}

export interface TransferWalletRequest {
    fromPhone: string;
    toPhone: string;
    amount: number; // en centimes HTG
    description?: string;
}

// Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface WalletResponse {
    id: string;
    balance: number;
    owner: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
    };
}

export interface RechargeResponse {
    walletTransaction: {
        id: string;
        type: TransactionType;
        amount: number;
        metadata?: {
            ownerName: string;
        };
    };
    ledgerTransaction: {
        id: string;
        type: TransactionType;
        amount: number;
    };
    newBalance: number;
    ledgerBalance: number;
}

export interface TransferResponse {
    transaction: {
        id: string;
        type: TransactionType;
        from: string;
        to: string;
        amount: number;
        fees: number;
        description?: string;
    };
    fromNewBalance: number;
    toNewBalance: number;
    ledgerCommission: number;
}

export interface TransactionHistoryItem {
    id: string;
    type: TransactionType;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fees: number;
    description?: string;
    status: TransactionStatus;
    timestamp: Date;
    metadata?: {
        ownerName?: string;
    };
}
