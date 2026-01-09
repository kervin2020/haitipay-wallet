import { WalletOwnerModel } from '../models/WalletOwner.model.js';
import { WalletModel } from '../models/Wallet.model.js';
import { CreateWalletRequest, WalletResponse } from '../types';
import { AppError } from '../middlewares/errorHandler.middleware.js';

export class WalletService {
    static validateCreateWallet(data: CreateWalletRequest): void {
        if (!data.firstName || data.firstName.trim().length === 0) {
            throw new AppError('First name is required', 400);
        }
        if (!data.lastName || data.lastName.trim().length === 0) {
            throw new AppError('Last name is required', 400);
        }

        const phoneRegex = /^\+509\d{8}$/;
        if (!phoneRegex.test(data.phoneNumber)) {
            throw new AppError('Phone number must be in format +509XXXXXXXX', 400);
        }
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            if (age - 1 < 16) {
                throw new AppError('User must be at least 16 years old', 400);
            }
        } else {
            if (age < 16) {
                throw new AppError('User must be at least 16 years old', 400);
            }
        }
        const pinRegex = /^\d{4}$/;
        if (!pinRegex.test(data.pin)) {
            throw new AppError('PIN must contain exactly 4 digits', 400);
        }
    }

    static async createWallet(data: CreateWalletRequest): Promise<WalletResponse> {
        this.validateCreateWallet(data);
        const existingOwner = await WalletOwnerModel.findByPhoneNumber(data.phoneNumber);
        if (existingOwner) {
            const existingWallet = await WalletModel.findByOwnerId(existingOwner.id);
            if (existingWallet) {
                throw new AppError('A wallet already exists for this phone number', 409);
            }
        }

        let owner;
        if (existingOwner) {
            owner = existingOwner;
        } else {
            owner = await WalletOwnerModel.create({
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                dateOfBirth: data.dateOfBirth,
                nationalId: data.nationalId
            });
        }

        const wallet = await WalletModel.create({
            ownerId: owner.id,
            balance: 0,
            pin: data.pin,
            status: 'active'
        });

        return {
            id: wallet.id,
            balance: wallet.balance,
            owner: {
                firstName: owner.firstName,
                lastName: owner.lastName,
                phoneNumber: owner.phoneNumber
            }
        };
    }

    static async getWalletProfile(phoneNumber: string): Promise<any> {
        const wallet = await WalletModel.findByPhoneNumber(phoneNumber);
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        const owner = await WalletOwnerModel.findById(wallet.ownerId);
        if (!owner) {
            throw new AppError('Wallet owner not found', 404);
        }

        return {
            id: wallet.id,
            balance: wallet.balance,
            owner: {
                firstName: owner.firstName,
                lastName: owner.lastName,
                phoneNumber: owner.phoneNumber,
                dateOfBirth: owner.dateOfBirth,
                nationalId: owner.nationalId
            },
            createdAt: wallet.createdAt,
            lastActivity: wallet.lastActivity
        };
    }

    static async getWalletBalance(phoneNumber: string): Promise<number> {
        const wallet = await WalletModel.findByPhoneNumber(phoneNumber);
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        return wallet.balance;
    }
}
