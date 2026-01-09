import { Router, Request, Response } from 'express';
import walletRoutes from './wallet.routes';
import adminRoutes from './admin.routes';

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

const v1Router = Router();

v1Router.use('/wallet', walletRoutes);
v1Router.use('/admin', adminRoutes);

router.use('/v1', v1Router);

router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);

export default router;