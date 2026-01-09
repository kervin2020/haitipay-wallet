import pool from '../config/database';
import { WalletOwner } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WalletOwnerModel {
    static async create(owner: Omit<WalletOwner, 'id' | 'createdAt'>): Promise<WalletOwner> {
        const id = uuidv4();
        const query = `
            INSERT INTO wallet_owners (id, first_name, last_name, phone_number, date_of_birth, national_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await pool.execute(query, [
            id,
            owner.firstName,
            owner.lastName,
            owner.phoneNumber,
            owner.dateOfBirth,
            owner.nationalId
        ]);

        const created = await this.findById(id);
        if (!created) {
            throw new Error('Failed to create wallet owner');
        }
        return created;
    }

    static async findById(id: string): Promise<WalletOwner | null> {
        const query = `
            SELECT 
                id,
                first_name as firstName,
                last_name as lastName,
                phone_number as phoneNumber,
                date_of_birth as dateOfBirth,
                national_id as nationalId,
                created_at as createdAt
            FROM wallet_owners
            WHERE id = ?
        `;
        
        const [rows] = await pool.execute(query, [id]) as any[];
        if (rows.length === 0) return null;

        return this.mapRowToWalletOwner(rows[0]);
    }

    static async findByPhoneNumber(phoneNumber: string): Promise<WalletOwner | null> {
        const query = `
            SELECT 
                id,
                first_name as firstName,
                last_name as lastName,
                phone_number as phoneNumber,
                date_of_birth as dateOfBirth,
                national_id as nationalId,
                created_at as createdAt
            FROM wallet_owners
            WHERE phone_number = ?
        `;
        
        const [rows] = await pool.execute(query, [phoneNumber]) as any[];
        if (rows.length === 0) return null;

        return this.mapRowToWalletOwner(rows[0]);
    }

    private static mapRowToWalletOwner(row: any): WalletOwner {
        return {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            phoneNumber: row.phoneNumber,
            dateOfBirth: row.dateOfBirth.toISOString().split('T')[0], // Format YYYY-MM-DD
            nationalId: row.nationalId,
            createdAt: row.createdAt
        };
    }
}
