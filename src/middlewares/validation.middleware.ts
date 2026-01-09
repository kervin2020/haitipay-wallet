import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return ResponseUtil.error(
            res,
            'Validation failed',
            400,
            JSON.stringify(errors.array())
        );
    }

    next();
};

export const validateCreateWallet = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .matches(/^\+?[1-9]\d{7,14}$/).withMessage('Invalid phone format'),

    body('pin')
        .notEmpty().withMessage('PIN is required')
        .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits')
        .isNumeric().withMessage('PIN must contain only numbers'),

    validate
];

export const validateRecharge = [
    body('wallet_id')
        .notEmpty().withMessage('Wallet ID is required')
        .isInt({ min: 1 }).withMessage('Invalid wallet ID'),

    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Description too long'),

    validate
];

export const validateTransfer = [
    body('from_wallet_id')
        .notEmpty().withMessage('From wallet ID is required')
        .isInt({ min: 1 }).withMessage('Invalid from wallet ID'),

    body('to_wallet_id')
        .notEmpty().withMessage('To wallet ID is required')
        .isInt({ min: 1 }).withMessage('Invalid to wallet ID')
        .custom((value, { req }) => value !== req.body.from_wallet_id)
        .withMessage('Cannot transfer to the same wallet'),

    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

    body('pin')
        .notEmpty().withMessage('PIN is required')
        .isLength({ min: 4, max: 6 }).withMessage('Invalid PIN'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Description too long'),

    validate
];