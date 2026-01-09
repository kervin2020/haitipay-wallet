import app from './app';
import { testConnection } from './config/database';
import { Logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

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