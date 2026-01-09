import { Router } from 'express';
import { WalletController } from '../controllers/Wallet.controller';
import { authenticatePin } from '../middlewares/auth.middleware';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const validateCreateWallet = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
    body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+509\d{8}$/).withMessage('Phone number must be in format +509XXXXXXXX'),
    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Date of birth must be in format YYYY-MM-DD'),
    body('nationalId')
        .trim()
        .notEmpty().withMessage('National ID is required'),
    body('pin')
        .notEmpty().withMessage('PIN is required')
        .matches(/^\d{4}$/).withMessage('PIN must contain exactly 4 digits'),
    validate
];

const validateRecharge = [
    body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+509\d{8}$/).withMessage('Phone number must be in format +509XXXXXXXX'),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isInt({ min: 50 * 100, max: 50000 * 100 }).withMessage('Amount must be between 50 and 50,000 HTG (in centimes)'),
    validate
];

const validateTransfer = [
    body('fromPhone')
        .trim()
        .notEmpty().withMessage('From phone number is required')
        .matches(/^\+509\d{8}$/).withMessage('From phone number must be in format +509XXXXXXXX'),
    body('toPhone')
        .trim()
        .notEmpty().withMessage('To phone number is required')
        .matches(/^\+509\d{8}$/).withMessage('To phone number must be in format +509XXXXXXXX')
        .custom((value, { req }) => {
            if (value === req.body.fromPhone) {
                throw new Error('Cannot transfer to the same phone number');
            }
            return true;
        }),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isInt({ min: 10 * 100, max: 25000 * 100 }).withMessage('Amount must be between 10 and 25,000 HTG (in centimes)'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Description too long'),
    validate
];

const validatePhoneNumber = [
    param('phoneNumber')
        .matches(/^\+509\d{8}$/).withMessage('Phone number must be in format +509XXXXXXXX'),
    validate
];

/**
 * @swagger
 * /v1/wallet/create:
 *   post:
 *     summary: Créer un nouveau wallet
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWalletRequest'
 *     responses:
 *       201:
 *         description: Wallet créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', validateCreateWallet, WalletController.createWallet);

/**
 * @swagger
 * /v1/wallet/recharge:
 *   post:
 *     summary: Recharger un wallet depuis le Ledger
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RechargeRequest'
 *     responses:
 *       200:
 *         description: Recharge effectuée avec succès
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
 *                     walletTransaction:
 *                       type: object
 *                     ledgerTransaction:
 *                       type: object
 *                     newBalance:
 *                       type: number
 *                     ledgerBalance:
 *                       type: number
 *       400:
 *         description: Erreur de validation ou fonds insuffisants
 *       404:
 *         description: Wallet non trouvé
 */
router.post('/recharge', validateRecharge, WalletController.rechargeWallet);

/**
 * @swagger
 * /v1/wallet/{phoneNumber}/profile:
 *   get:
 *     summary: Consulter le profil d'un wallet
 *     tags: [Wallet]
 *     security:
 *       - PinAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+509\d{8}$'
 *         example: '+50912345678'
 *     responses:
 *       200:
 *         description: Profil du wallet
 *       401:
 *         description: Non autorisé (PIN incorrect ou wallet non trouvé)
 *       404:
 *         description: Wallet non trouvé
 */
router.get('/:phoneNumber/profile', validatePhoneNumber, authenticatePin, WalletController.getWalletProfile);

/**
 * @swagger
 * /v1/wallet/{phoneNumber}/balance:
 *   get:
 *     summary: Obtenir le solde d'un wallet
 *     tags: [Wallet]
 *     security:
 *       - PinAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+509\d{8}$'
 *         example: '+50912345678'
 *     responses:
 *       200:
 *         description: Solde du wallet
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
 *                     balance:
 *                       type: number
 *                       example: 5000
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Wallet non trouvé
 */
router.get('/:phoneNumber/balance', validatePhoneNumber, authenticatePin, WalletController.getWalletBalance);

/**
 * @swagger
 * /v1/wallet/transfer:
 *   post:
 *     summary: Transfert entre deux wallets
 *     tags: [Wallet]
 *     security:
 *       - PinAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferRequest'
 *     responses:
 *       200:
 *         description: Transfert effectué avec succès
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
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     fromNewBalance:
 *                       type: number
 *                     toNewBalance:
 *                       type: number
 *                     ledgerCommission:
 *                       type: number
 *       400:
 *         description: Erreur de validation, solde insuffisant ou limite dépassée
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Wallet non trouvé
 */
router.post('/transfer', validateTransfer, authenticatePin, WalletController.transferWallet);

/**
 * @swagger
 * /v1/wallet/{phoneNumber}/transactions:
 *   get:
 *     summary: Historique des transactions d'un wallet
 *     tags: [Wallet]
 *     security:
 *       - PinAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+509\d{8}$'
 *         example: '+50912345678'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre maximum de transactions à retourner
 *     responses:
 *       200:
 *         description: Liste des transactions
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
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Wallet non trouvé
 */
router.get('/:phoneNumber/transactions', validatePhoneNumber, authenticatePin, WalletController.getWalletTransactions);

export default router;
