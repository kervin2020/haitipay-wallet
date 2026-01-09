import pool from '../config/database';
import { Wallet } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export class WalletModel {
    static async create(wallet: Omit<Wallet, 'id' | 'createdAt' | 'lastActivity'>): Promise<Wallet> {
        const id = uuidv4();
        const pinHash = await bcrypt.hash(wallet.pin, 10);
        
        const query = `
            INSERT INTO wallets (id, owner_id, balance, pin_hash, status)
            VALUES (?, ?, ?, ?, 'active')
        `;
        
        await pool.execute(query, [
            id,
            wallet.ownerId,
            wallet.balance || 0,
            pinHash
        ]);

        const created = await this.findById(id);
        if (!created) {
            throw new Error('Failed to create wallet');
        }
        return created;
    }

    static async findById(id: string): Promise<Wallet | null> {
        const query = `
            SELECT 
                id,
                owner_id as ownerId,
                balance,
                pin_hash as pinHash,
                status,
                created_at as createdAt,
                last_activity as lastActivity
            FROM wallets
            WHERE id = ?
        `;
        
        const [rows] = await pool.execute(query, [id]) as any[];
        if (rows.length === 0) return null;

        return this.mapRowToWallet(rows[0]);
    }

    static async findByOwnerId(ownerId: string): Promise<Wallet | null> {
        const query = `
            SELECT 
                id,
                owner_id as ownerId,
                balance,
                pin_hash as pinHash,
                status,
                created_at as createdAt,
                last_activity as lastActivity
            FROM wallets
            WHERE owner_id = ?
        `;
        
        const [rows] = await pool.execute(query, [ownerId]) as any[];
        if (rows.length === 0) return null;

        return this.mapRowToWallet(rows[0]);
    }

    static async findByPhoneNumber(phoneNumber: string): Promise<Wallet | null> {
        const query = `
            SELECT 
                w.id,
                w.owner_id as ownerId,
                w.balance,
                w.pin_hash as pinHash,
                w.status,
                w.created_at as createdAt,
                w.last_activity as lastActivity
            FROM wallets w
            INNER JOIN wallet_owners wo ON w.owner_id = wo.id
            WHERE wo.phone_number = ?
        `;
        
        const [rows] = await pool.execute(query, [phoneNumber]) as any[];
        if (rows.length === 0) return null;

        return this.mapRowToWallet(rows[0]);
    }

    static async updateBalance(id: string, newBalance: number): Promise<void> {
        const query = `
            UPDATE wallets
            SET balance = ?, last_activity = NOW()
            WHERE id = ?
        `;
        
        await pool.execute(query, [newBalance, id]);
    }

    static async verifyPin(walletId: string, pin: string): Promise<boolean> {
        const wallet = await this.findById(walletId);
        if (!wallet) return false;

        const query = `SELECT pin_hash FROM wallets WHERE id = ?`;
        const [rows] = await pool.execute(query, [walletId]) as any[];
        
        if (rows.length === 0) return false;
        
        return await bcrypt.compare(pin, rows[0].pin_hash);
    }

    private static mapRowToWallet(row: any): Wallet {
        return {
            id: row.id,
            ownerId: row.ownerId,
            balance: Number(row.balance),
            pin: '', // Ne jamais retourner le PIN
            createdAt: row.createdAt,
            lastActivity: row.lastActivity,
            status: row.status
        };
    }
}
