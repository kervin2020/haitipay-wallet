import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'HaitiPay Wallet API',
        version: '1.0.0',
        description: 'API REST pour le système de portefeuille électronique HaitiPay',
        contact: {
            name: 'HaitiPay',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'API Base URL',
        },
    ],
    components: {
        securitySchemes: {
            PinAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-pin',
                description: 'PIN du wallet (4 chiffres)',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    message: {
                        type: 'string',
                        example: 'Error message',
                    },
                    error: {
                        type: 'string',
                        example: 'Detailed error information',
                    },
                },
            },
            Wallet: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'WALLET_123',
                    },
                    balance: {
                        type: 'number',
                        example: 0,
                        description: 'Solde en centimes HTG',
                    },
                    owner: {
                        type: 'object',
                        properties: {
                            firstName: {
                                type: 'string',
                                example: 'Jean',
                            },
                            lastName: {
                                type: 'string',
                                example: 'Baptiste',
                            },
                            phoneNumber: {
                                type: 'string',
                                example: '+50912345678',
                            },
                        },
                    },
                },
            },
            CreateWalletRequest: {
                type: 'object',
                required: ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'nationalId', 'pin'],
                properties: {
                    firstName: {
                        type: 'string',
                        example: 'Jean',
                    },
                    lastName: {
                        type: 'string',
                        example: 'Baptiste',
                    },
                    phoneNumber: {
                        type: 'string',
                        pattern: '^\\+509\\d{8}$',
                        example: '+50912345678',
                        description: 'Format: +509XXXXXXXX (8 chiffres)',
                    },
                    dateOfBirth: {
                        type: 'string',
                        format: 'date',
                        example: '1990-05-15',
                        description: 'Format YYYY-MM-DD, utilisateur doit avoir au moins 16 ans',
                    },
                    nationalId: {
                        type: 'string',
                        example: '001-234-567-89',
                    },
                    pin: {
                        type: 'string',
                        pattern: '^\\d{4}$',
                        example: '1234',
                        description: 'Exactement 4 chiffres',
                    },
                },
            },
            RechargeRequest: {
                type: 'object',
                required: ['phoneNumber', 'amount'],
                properties: {
                    phoneNumber: {
                        type: 'string',
                        pattern: '^\\+509\\d{8}$',
                        example: '+50912345678',
                    },
                    amount: {
                        type: 'number',
                        example: 5000,
                        description: 'Montant en centimes HTG (50-50,000 HTG)',
                        minimum: 5000,
                        maximum: 5000000,
                    },
                },
            },
            TransferRequest: {
                type: 'object',
                required: ['fromPhone', 'toPhone', 'amount'],
                properties: {
                    fromPhone: {
                        type: 'string',
                        pattern: '^\\+509\\d{8}$',
                        example: '+50912345678',
                    },
                    toPhone: {
                        type: 'string',
                        pattern: '^\\+509\\d{8}$',
                        example: '+50987654321',
                    },
                    amount: {
                        type: 'number',
                        example: 100000,
                        description: 'Montant en centimes HTG (10-25,000 HTG)',
                        minimum: 1000,
                        maximum: 2500000,
                    },
                    description: {
                        type: 'string',
                        example: 'Remboursement',
                    },
                },
            },
            Transaction: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'TXN_123',
                    },
                    type: {
                        type: 'string',
                        enum: ['wallet_recharge', 'wallet_transfer', 'bill_payment', 'ledger_debit'],
                    },
                    fromAccountId: {
                        type: 'string',
                        example: 'WALLET_123',
                    },
                    toAccountId: {
                        type: 'string',
                        example: 'WALLET_456',
                    },
                    amount: {
                        type: 'number',
                        example: 100000,
                    },
                    fees: {
                        type: 'number',
                        example: 2000,
                    },
                    description: {
                        type: 'string',
                        example: 'Transfert vers Marie',
                    },
                    status: {
                        type: 'string',
                        enum: ['pending', 'completed', 'failed'],
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                    },
                },
            },
        },
    },
};

const options = {
    definition: swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
