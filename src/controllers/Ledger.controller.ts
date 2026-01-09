import { Request, Response } from 'express';
import { LedgerService } from '../services/Ledger.service.js';
import { ResponseUtil } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.middleware.js';

export class LedgerController {
    static getLedgerStatus = asyncHandler(async (req: Request, res: Response) => {
        const status = await LedgerService.getLedgerStatus();
        return ResponseUtil.success(res, status, 'Ledger status retrieved successfully');
    });

    static getLedgerTransactions = asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 50;
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return ResponseUtil.error(res, 'Limit must be between 1 and 100', 400);
        }
        const transactions = await LedgerService.getLedgerTransactionHistory(limit);
        return ResponseUtil.success(res, transactions, 'Ledger transactions retrieved successfully');
    });
}
