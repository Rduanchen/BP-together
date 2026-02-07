import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class CronService {
    static init() {
        // Run every 30 minutes
        cron.schedule('*/30 * * * *', async () => {
            console.log('Running 30-min Cron Job...');
            await this.cleanupShareCodes();
            await this.checkReminders();
        });
        console.log('Cron Service Initialized (*/30 * * * *)');
    }

    private static async cleanupShareCodes() {
        try {
            const now = new Date();
            const { count } = await prisma.shareCode.deleteMany({
                where: {
                    expiresAt: { lt: now },
                },
            });
            console.log(`Cleanup: Deleted ${count} expired share codes.`);
        } catch (error) {
            console.error('Error cleaning up share codes:', error);
        }
    }

    private static async checkReminders() {
        try {
            const now = new Date();
            // Format current time as HH:MM
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeString = `${hours}:${minutes}`;

            // Since we run every 30 mins, we check if current time matches reminderTime
            // We assume reminderTime is stored as "HH:MM".
            // Users can only set HH:00 or HH:30 ideally, but strict equality works if cron runs exactly then.
            // To be safe with cron execution time slightly drifting, maybe we check a range?
            // But node-cron usually hits the minute.

            const usersToRemind = await prisma.notificationSetting.findMany({
                where: {
                    reminderEnabled: true,
                    reminderTime: currentTimeString,
                },
                include: { user: true }
            });

            console.log(`Checking reminders for ${currentTimeString}. Found ${usersToRemind.length} settings.`);

            for (const setting of usersToRemind) {
                // Check if user has recorded enough today
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const count = await prisma.bloodPressureRecord.count({
                    where: {
                        userId: setting.userId,
                        recordedAt: {
                            gte: startOfDay,
                        },
                    },
                });

                if (count < setting.dailyTarget) {
                    // Send Reminder to Topic (User + Sharers)
                    const topic = `topic-${setting.userId}`;
                    await NotificationService.sendToTopic(
                        topic,
                        "Measurements Reminder",
                        `You have recorded ${count}/${setting.dailyTarget} measurements today. Please record now!`,
                        { type: 'REMINDER' }
                    );
                }
            }

        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    }
}
