import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';
import { ResponseUtil } from '../utils/response.js';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Logger.error('Error occurred:', err);

    if (err instanceof AppError) {
        return ResponseUtil.error(
            res,
            err.message,
            err.statusCode,
            process.env.NODE_ENV === 'development' ? err.stack : undefined
        );
    }

    if ((err as any).code === 'ER_DUP_ENTRY') {
        return ResponseUtil.error(res, 'Duplicate entry. Resource already exists.', 409);
    }

    if ((err as any).code === 'ER_NO_REFERENCED_ROW_2') {
        return ResponseUtil.error(res, 'Referenced resource does not exist.', 400);
    }

    return ResponseUtil.serverError(
        res,
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? err.message : undefined
    );
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};