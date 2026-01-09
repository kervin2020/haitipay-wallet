import pool from '../config/database';
import { LedgerAccount } from '../types';

export class LedgerAccountModel {
    static async findById(id: string): Promise<LedgerAccount | null> {
        const query = `
            SELECT 
                id,
                name,
                balance,
                created_at as createdAt
            FROM ledger_accounts
            WHERE id = ?
        `;
        
        const [rows] = await pool.execute(query, [id]) as any[];
        if (rows.length === 0) return null;

        return {
            id: rows[0].id,
            name: rows[0].name,
            balance: Number(rows[0].balance),
            createdAt: rows[0].createdAt
        };
    }

    static async updateBalance(id: string, newBalance: number): Promise<void> {
        const query = `
            UPDATE ledger_accounts
            SET balance = ?
            WHERE id = ?
        `;
        
        await pool.execute(query, [newBalance, id]);
    }

    static async getMasterAccount(): Promise<LedgerAccount | null> {
        return this.findById('LEDGER_MASTER');
    }
}
