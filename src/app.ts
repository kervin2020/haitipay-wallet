import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { Logger } from './utils/logger';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
    Logger.info(`${req.method} ${req.path}`);
    next();
});

app.get('/health', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'HaitiPay Wallet API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/info', (req: Request, res: Response) => {
    res.json({
        success: true,
        api: {
            name: 'HaitiPay Wallet API',
            version: '1.0.0',
            description: 'Système de portefeuille électronique',
            endpoints: {
                v1: '/api/v1',
                documentation: '/api-docs'
            }
        }
    });
});

const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HaitiPay Wallet API Documentation'
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.use('/api', routes);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

export default app;