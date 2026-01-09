import { Router, Request, Response } from 'express';
import walletRoutes from './wallet.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'HaitiPay Wallet API',
        version: '1.0.0',
        endpoints: {
            v1: '/api/v1',
            documentation: '/api-docs',
            health: '/health',
            info: '/api/info'
        },
        availableVersions: ['v1']
    });
});

const v1Info = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'HaitiPay Wallet API v1',
        version: '1.0.0',
        endpoints: {
            wallet: {
                create: 'POST /api/v1/wallet/create',
                recharge: 'POST /api/v1/wallet/recharge',
                profile: 'GET /api/v1/wallet/profile/:phoneNumber',
                balance: 'GET /api/v1/wallet/balance/:phoneNumber',
                transfer: 'POST /api/v1/wallet/transfer',
                transactions: 'GET /api/v1/wallet/transactions/:phoneNumber'
            },
            admin: {
                ledgerStatus: 'GET /api/v1/admin/ledger/status',
                ledgerTransactions: 'GET /api/v1/admin/ledger/transactions'
            },
            documentation: '/api-docs'
        }
    });
};

const v1Router = Router();

router.get('/v1', v1Info);
v1Router.get('/', v1Info);

v1Router.use('/wallet', walletRoutes);
v1Router.use('/admin', adminRoutes);

router.use('/v1', v1Router);

router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);

export default router;