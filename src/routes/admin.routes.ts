import { Router } from 'express';
import { LedgerController } from '../controllers/Ledger.controller';
import { query } from 'express-validator';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

// Validation pour le paramètre limit
const validateLimit = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
];

/**
 * @swagger
 * /v1/admin/ledger/status:
 *   get:
 *     summary: Obtenir le statut du Ledger
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Statut du Ledger
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: LEDGER_MASTER
 *                     name:
 *                       type: string
 *                       example: HaitiPay Master Ledger
 *                     balance:
 *                       type: number
 *                       example: 1000000000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/ledger/status', LedgerController.getLedgerStatus);

/**
 * @swagger
 * /v1/admin/ledger/transactions:
 *   get:
 *     summary: Historique des transactions du Ledger
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre maximum de transactions à retourner
 *     responses:
 *       200:
 *         description: Liste des transactions du Ledger
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get('/ledger/transactions', validateLimit, LedgerController.getLedgerTransactions);

export default router;
