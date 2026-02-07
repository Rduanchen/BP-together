import { PrismaClient, NotificationSetting } from '@prisma/client';

const prisma = new PrismaClient();

export class SettingsService {
    static async getSettings(userId: string): Promise<NotificationSetting | null> {
        return prisma.notificationSetting.findUnique({ where: { userId } });
    }

    static async upsertSettings(userId: string, data: Partial<NotificationSetting>): Promise<NotificationSetting> {
        // Determine create vs update data, removing id/userId from data if present to avoid errors
        const { id, userId: _, ...updateData } = data as any;

        return prisma.notificationSetting.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                ...updateData
            },
        });
    }
}
