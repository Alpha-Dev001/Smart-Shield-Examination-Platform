import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        const adapter = new PrismaPg({
            connectionString: databaseUrl,
        });

        super({
            adapter,
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}