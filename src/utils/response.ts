import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
    static success<T>(
        res: Response,
        data: T,
        message: string = 'Success',
        statusCode: number = 200
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data
        };
        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        message: string = 'Error',
        statusCode: number = 400,
        error?: string
    ): Response {
        const response: ApiResponse = {
            success: false,
            message,
            error
        };
        return res.status(statusCode).json(response);
    }

    static created<T>(
        res: Response,
        data: T,
        message: string = 'Resource created successfully'
    ): Response {
        return this.success(res, data, message, 201);
    }

    static notFound(
        res: Response,
        message: string = 'Resource not found'
    ): Response {
        return this.error(res, message, 404);
    }

    static unauthorized(
        res: Response,
        message: string = 'Unauthorized'
    ): Response {
        return this.error(res, message, 401);
    }

    static forbidden(
        res: Response,
        message: string = 'Forbidden'
    ): Response {
        return this.error(res, message, 403);
    }

    static serverError(
        res: Response,
        message: string = 'Internal server error',
        error?: string
    ): Response {
        return this.error(res, message, 500, error);
    }
}