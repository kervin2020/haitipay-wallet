import { Request, Response, NextFunction } from 'express';
import { WalletModel } from '../models/Wallet.model';
import { ResponseUtil } from '../utils/response';

export interface AuthenticatedRequest extends Request {
    walletId?: string;
    phoneNumber?: string;
}

export const authenticatePin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const pin = req.headers['x-pin'] as string;
        const phoneNumber = req.params.phoneNumber || req.body.fromPhone;

        if (!pin) {
            return ResponseUtil.unauthorized(res, 'PIN is required in x-pin header');
        }

        if (!phoneNumber) {
            return ResponseUtil.error(res, 'Phone number is required', 400);
        }

        const wallet = await WalletModel.findByPhoneNumber(phoneNumber);
        
        if (!wallet) {
            return ResponseUtil.unauthorized(res, 'Wallet not found');
        }

        if (wallet.status !== 'active') {
            return ResponseUtil.unauthorized(res, 'Wallet is not active');
        }

        const isValidPin = await WalletModel.verifyPin(wallet.id, pin);
        
        if (!isValidPin) {
            return ResponseUtil.unauthorized(res, 'Invalid PIN');
        }

        req.walletId = wallet.id;
        req.phoneNumber = phoneNumber;

        next();
    } catch (error) {
        return ResponseUtil.serverError(res, 'Authentication error', (error as Error).message);
    }
};
