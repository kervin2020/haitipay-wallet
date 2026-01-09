import { Request, Response } from 'express';
import { WalletService } from '../services/Wallet.service.js';
import { TransactionService } from '../services/Transaction.service.js';
import { ResponseUtil } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.middleware.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class WalletController {
    static createWallet = asyncHandler(async (req: Request, res: Response) => {
        const wallet = await WalletService.createWallet(req.body);
        return ResponseUtil.success(res, { wallet }, 'Wallet created successfully', 201);
    });

    static rechargeWallet = asyncHandler(async (req: Request, res: Response) => {
        const result = await TransactionService.rechargeWallet(req.body);
        return ResponseUtil.success(res, result, 'Wallet recharged successfully');
    });

    static getWalletProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const profile = await WalletService.getWalletProfile(req.params.phoneNumber);
        return ResponseUtil.success(res, profile, 'Wallet profile retrieved successfully');
    });

    static getWalletBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const balance = await WalletService.getWalletBalance(req.params.phoneNumber);
        return ResponseUtil.success(res, { balance }, 'Balance retrieved successfully');
    });

    static transferWallet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        if (!req.walletId) {
            return ResponseUtil.error(res, 'Wallet ID not found in request', 400);
        }

        const result = await TransactionService.transferBetweenWallets(req.body, req.walletId);
        return ResponseUtil.success(res, result, 'Transfer completed successfully');
    });

    static getWalletTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 20;
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return ResponseUtil.error(res, 'Limit must be between 1 and 100', 400);
        }
        const transactions = await TransactionService.getWalletTransactionHistory(
            req.params.phoneNumber,
            limit
        );
        return ResponseUtil.success(res, transactions, 'Transactions retrieved successfully');
    });
}
