import { TransactionModel } from '../models/Transaction.model';
import { WalletModel } from '../models/Wallet.model';
import { LedgerAccountModel } from '../models/LedgerAccount.model';
import { WalletOwnerModel } from '../models/WalletOwner.model';
import { executeTransaction } from '../config/database';
import { 
    RechargeWalletRequest, 
    TransferWalletRequest, 
    RechargeResponse, 
    TransferResponse 
} from '../types';
import { AppError } from '../middlewares/errorHandler.middleware';

export class TransactionService {
    // Montants en centimes HTG
    private static readonly MIN_RECHARGE = 50 * 100; // 50 HTG
    private static readonly MAX_RECHARGE = 50000 * 100; // 50,000 HTG
    private static readonly MIN_TRANSFER = 10 * 100; // 10 HTG
    private static readonly MAX_TRANSFER = 25000 * 100; // 25,000 HTG
    private static readonly TRANSFER_FEE_PERCENTAGE = 0.02; // 2%
    private static readonly DAILY_TRANSFER_LIMIT = 100000 * 100; // 100,000 HTG par jour

    private static calculateRechargeFee(amount: number): number {
        return Math.round(amount * 0.02);
    }

    private static calculateTransferFee(amount: number): number {
        return Math.round(amount * this.TRANSFER_FEE_PERCENTAGE);
    }

    static async rechargeWallet(data: RechargeWalletRequest): Promise<RechargeResponse> {
        if (data.amount < this.MIN_RECHARGE || data.amount > this.MAX_RECHARGE) {
            throw new AppError(
                `Recharge amount must be between ${this.MIN_RECHARGE / 100} and ${this.MAX_RECHARGE / 100} HTG`,
                400
            );
        }

        const wallet = await WalletModel.findByPhoneNumber(data.phoneNumber);
        if (!wallet || wallet.status !== 'active') {
            throw new AppError('Wallet not found or not active', 404);
        }

        const fees = this.calculateRechargeFee(data.amount);
        const totalDebit = data.amount + fees;
        const ledger = await LedgerAccountModel.getMasterAccount();
        if (!ledger) {
            throw new AppError('Ledger account not found', 500);
        }

        if (ledger.balance < totalDebit) {
            throw new AppError('Insufficient funds in Ledger', 400);
        }

        const owner = await WalletOwnerModel.findById(wallet.ownerId);
        if (!owner) {
            throw new AppError('Wallet owner not found', 404);
        }

        const result = await executeTransaction(async (connection) => {
            const walletTransaction = await TransactionModel.create({
                type: 'wallet_recharge',
                fromAccountId: 'LEDGER_MASTER',
                toAccountId: wallet.id,
                amount: data.amount,
                fees: 0,
                description: `Recharge from Ledger`,
                status: 'completed'
            });

            const ledgerTransaction = await TransactionModel.create({
                type: 'ledger_debit',
                fromAccountId: 'LEDGER_MASTER',
                toAccountId: 'LEDGER_MASTER',
                amount: totalDebit,
                fees: 0,
                description: `Debit for wallet recharge`,
                status: 'completed'
            });

            const newBalance = wallet.balance + data.amount;
            await WalletModel.updateBalance(wallet.id, newBalance);

            const newLedgerBalance = ledger.balance - data.amount;
            await LedgerAccountModel.updateBalance('LEDGER_MASTER', newLedgerBalance);

            return {
                walletTransaction,
                ledgerTransaction,
                newBalance,
                newLedgerBalance
            };
        });

        return {
            walletTransaction: {
                id: result.walletTransaction.id,
                type: result.walletTransaction.type,
                amount: result.walletTransaction.amount,
                metadata: {
                    ownerName: `${owner.firstName} ${owner.lastName}`
                }
            },
            ledgerTransaction: {
                id: result.ledgerTransaction.id,
                type: result.ledgerTransaction.type,
                amount: result.ledgerTransaction.amount
            },
            newBalance: result.newBalance,
            ledgerBalance: result.newLedgerBalance
        };
    }

    static async transferBetweenWallets(
        data: TransferWalletRequest,
        fromWalletId: string
    ): Promise<TransferResponse> {
        if (data.amount < this.MIN_TRANSFER || data.amount > this.MAX_TRANSFER) {
            throw new AppError(
                `Transfer amount must be between ${this.MIN_TRANSFER / 100} and ${this.MAX_TRANSFER / 100} HTG`,
                400
            );
        }

        const fromWallet = await WalletModel.findById(fromWalletId);
        if (!fromWallet || fromWallet.status !== 'active') {
            throw new AppError('Source wallet not found or not active', 404);
        }

        const toWallet = await WalletModel.findByPhoneNumber(data.toPhone);
        if (!toWallet || toWallet.status !== 'active') {
            throw new AppError('Destination wallet not found or not active', 404);
        }

        if (fromWallet.id === toWallet.id) {
            throw new AppError('Cannot transfer to the same wallet', 400);
        }

        const fees = this.calculateTransferFee(data.amount);
        const totalDebit = data.amount + fees;

        if (fromWallet.balance < totalDebit) {
            throw new AppError('Insufficient balance', 400);
        }

        const today = new Date();
        const dailyTotal = await TransactionModel.getDailyTransferTotal(fromWallet.id, today);
        if (dailyTotal + totalDebit > this.DAILY_TRANSFER_LIMIT) {
            throw new AppError('Daily transfer limit exceeded', 400);
        }

        const ledger = await LedgerAccountModel.getMasterAccount();
        if (!ledger) {
            throw new AppError('Ledger account not found', 500);
        }

        const result = await executeTransaction(async (connection) => {
            const transaction = await TransactionModel.create({
                type: 'wallet_transfer',
                fromAccountId: fromWallet.id,
                toAccountId: toWallet.id,
                amount: data.amount,
                fees: fees,
                description: data.description || 'Wallet transfer',
                status: 'completed'
            });

            const fromNewBalance = fromWallet.balance - totalDebit;
            await WalletModel.updateBalance(fromWallet.id, fromNewBalance);

            const toNewBalance = toWallet.balance + data.amount;
            await WalletModel.updateBalance(toWallet.id, toNewBalance);

            const newLedgerBalance = ledger.balance + fees;
            await LedgerAccountModel.updateBalance('LEDGER_MASTER', newLedgerBalance);

            return {
                transaction,
                fromNewBalance,
                toNewBalance,
                ledgerCommission: fees
            };
        });

        return {
            transaction: {
                id: result.transaction.id,
                type: result.transaction.type,
                from: data.fromPhone,
                to: data.toPhone,
                amount: result.transaction.amount,
                fees: result.transaction.fees,
                description: result.transaction.description
            },
            fromNewBalance: result.fromNewBalance,
            toNewBalance: result.toNewBalance,
            ledgerCommission: result.ledgerCommission
        };
    }

    static async getWalletTransactionHistory(
        phoneNumber: string,
        limit: number = 20
    ): Promise<any[]> {
        const wallet = await WalletModel.findByPhoneNumber(phoneNumber);
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        return await TransactionModel.findByAccountId(wallet.id, limit);
    }
}
