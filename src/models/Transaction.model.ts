import pool from '../config/database.js';
import mysql from 'mysql2';
import { Transaction, TransactionHistoryItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TransactionModel {
    static async create(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
        const id = uuidv4();
        const query = `
            INSERT INTO transactions (
                id, type, from_account_id, to_account_id, 
                amount, fees, description, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.execute(query, [
            id,
            transaction.type,
            transaction.fromAccountId,
            transaction.toAccountId,
            transaction.amount,
            transaction.fees,
            transaction.description || null,
            transaction.status
        ]);

        const created = await this.findById(id);
        if (!created) {
            throw new Error('Failed to create transaction');
        }
        return created;
    }

    static async findById(id: string): Promise<Transaction | null> {
        const query = `
            SELECT 
                id,
                type,
                from_account_id as fromAccountId,
                to_account_id as toAccountId,
                amount,
                fees,
                description,
                status,
                created_at as timestamp
            FROM transactions
            WHERE id = ?
        `;
        
        const [rows] = await pool.execute(query, [id]) as any[];
        if (rows.length === 0) return null;

        return this.mapRowToTransaction(rows[0]);
    }

    static async findByAccountId(
        accountId: string, 
        limit: number = 20
    ): Promise<TransactionHistoryItem[]> {
        const safeLimit = Math.max(1, Math.min(100, parseInt(String(limit)) || 20));
        const escapedAccountId = mysql.escape(accountId);
        const query = `
            SELECT 
                t.id,
                t.type,
                t.from_account_id as fromAccountId,
                t.to_account_id as toAccountId,
                t.amount,
                t.fees,
                t.description,
                t.status,
                t.created_at as timestamp,
                wo.first_name as ownerFirstName,
                wo.last_name as ownerLastName
            FROM transactions t
            LEFT JOIN wallets w ON (t.from_account_id = w.id OR t.to_account_id = w.id)
            LEFT JOIN wallet_owners wo ON w.owner_id = wo.id
            WHERE t.from_account_id = ${escapedAccountId} OR t.to_account_id = ${escapedAccountId}
            ORDER BY t.created_at DESC
            LIMIT ${safeLimit}
        `;
        
        const [rows] = await pool.execute(query) as any[];
        
        return rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            fromAccountId: row.fromAccountId,
            toAccountId: row.toAccountId,
            amount: Number(row.amount),
            fees: Number(row.fees),
            description: row.description,
            status: row.status,
            timestamp: row.timestamp,
            metadata: row.ownerFirstName ? {
                ownerName: `${row.ownerFirstName} ${row.ownerLastName}`
            } : undefined
        }));
    }

    static async findByLedgerAccount(limit: number = 50): Promise<TransactionHistoryItem[]> {
        const safeLimit = Math.max(1, Math.min(100, parseInt(String(limit)) || 50));
        const query = `
            SELECT 
                t.id,
                t.type,
                t.from_account_id as fromAccountId,
                t.to_account_id as toAccountId,
                t.amount,
                t.fees,
                t.description,
                t.status,
                t.created_at as timestamp,
                wo.first_name as ownerFirstName,
                wo.last_name as ownerLastName
            FROM transactions t
            LEFT JOIN wallets w ON (t.from_account_id = w.id OR t.to_account_id = w.id)
            LEFT JOIN wallet_owners wo ON w.owner_id = wo.id
            WHERE t.from_account_id = 'LEDGER_MASTER' OR t.to_account_id = 'LEDGER_MASTER'
            ORDER BY t.created_at DESC
            LIMIT ${safeLimit}
        `;
        
        const [rows] = await pool.execute(query) as any[];
        
        return rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            fromAccountId: row.fromAccountId,
            toAccountId: row.toAccountId,
            amount: Number(row.amount),
            fees: Number(row.fees),
            description: row.description,
            status: row.status,
            timestamp: row.timestamp,
            metadata: row.ownerFirstName ? {
                ownerName: `${row.ownerFirstName} ${row.ownerLastName}`
            } : undefined
        }));
    }

    static async getDailyTransferTotal(walletId: string, date: Date): Promise<number> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const query = `
            SELECT COALESCE(SUM(amount + fees), 0) as total
            FROM transactions
            WHERE from_account_id = ?
            AND type = 'wallet_transfer'
            AND status = 'completed'
            AND DATE(created_at) = DATE(?)
        `;
        
        const [rows] = await pool.execute(query, [walletId, date]) as any[];
        return Number(rows[0]?.total || 0);
    }

    private static mapRowToTransaction(row: any): Transaction {
        return {
            id: row.id,
            type: row.type,
            fromAccountId: row.fromAccountId,
            toAccountId: row.toAccountId,
            amount: Number(row.amount),
            fees: Number(row.fees),
            description: row.description,
            status: row.status,
            timestamp: row.timestamp
        };
    }
}
