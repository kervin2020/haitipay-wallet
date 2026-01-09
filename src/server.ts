import app from './app.js';
import { testConnection } from './config/database.js';
import { Logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

if (!process.env.DB_HOST || !process.env.DB_NAME) {
    Logger.error('Missing required environment variables: DB_HOST, DB_NAME');
    process.exit(1);
}

testConnection()
    .then(() => {
        app.listen(PORT, () => {
            Logger.info(`Server is running on port ${PORT}`);
            Logger.info(`API available at http://localhost:${PORT}/api/v1`);
            Logger.info(`Documentation: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((error) => {
        Logger.error('Failed to start server:', error);
        process.exit(1);
    });