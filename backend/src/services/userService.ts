import { PrismaClient, User } from '@prisma/client';
import admin from '../config/firebase';

const prisma = new PrismaClient();

export class UserService {
    static async findOrCreateUser(firebaseUid: string, email: string, name?: string): Promise<User> {
        const user = await prisma.user.upsert({
            where: { firebaseUid },
            update: {
                email,
                name: name || undefined,
            },
            create: {
                firebaseUid,
                email,
                name,
            },
        });
        return user;
    }

    static async getUserById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    static async deleteUser(userId: string, firebaseUid: string): Promise<void> {
        // 1. Delete from DB (Transaction)
        await prisma.$transaction([
            prisma.bloodPressureRecord.deleteMany({ where: { userId } }),
            prisma.notificationSetting.deleteMany({ where: { userId } }),
            prisma.deviceToken.deleteMany({ where: { userId } }),
            prisma.shareCode.deleteMany({ where: { userId } }),
            // SharedAccess: delete where this user is sharer OR viewer
            prisma.sharedAccess.deleteMany({
                where: {
                    OR: [
                        { sharerId: userId },
                        { viewerId: userId }
                    ]
                }
            }),
            prisma.user.delete({ where: { id: userId } })
        ]);

        // 2. Delete from Firebase
        try {
            await admin.auth().deleteUser(firebaseUid);
        } catch (error) {
            console.error("Error deleting firebase user:", error);
            // We don't throw here strictly because DB is already gone, partial success is better than failure loop
        }
    }

    static async acceptTerms(userId: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { termsAcceptedAt: new Date() }
        });
    }
}
