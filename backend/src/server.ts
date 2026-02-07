import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { PrismaClient } from '@prisma/client';
import { CronService } from './services/cronService';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';


const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function main() {
    try {
        console.log('Verifying database connection...');
        await prisma.$connect();
        console.log('Database connected successfully');

        // Start Cron
        CronService.init();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        if (error instanceof PrismaClientInitializationError) {
            console.error('Please make sure your database server is running');
            console.error('Failed to start server:', error);
            process.exit(1);
        }
        else {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}

main();
