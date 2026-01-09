import { LedgerAccountModel } from '../models/LedgerAccount.model.js';
import { TransactionModel } from '../models/Transaction.model.js';

export class LedgerService {
    static async getLedgerStatus(): Promise<any> {
        const ledger = await LedgerAccountModel.getMasterAccount();
        if (!ledger) {
            throw new Error('Ledger account not found');
        }

        return {
            id: ledger.id,
            name: ledger.name,
            balance: ledger.balance,
            createdAt: ledger.createdAt
        };
    }

    static async getLedgerTransactionHistory(limit: number = 50): Promise<any[]> {
        return await TransactionModel.findByLedgerAccount(limit);
    }
}
