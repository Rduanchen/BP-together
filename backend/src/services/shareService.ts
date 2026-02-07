import { PrismaClient, ShareCode, SharedAccess, Role } from '@prisma/client';
import crypto from 'crypto';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class ShareService {
    static async generateCode(userId: string, role: Role): Promise<ShareCode> {
        // Generate 6 digit code
        let code: string;
        let exists = true;
        do {
            code = crypto.randomInt(100000, 999999).toString();
            const found = await prisma.shareCode.findUnique({ where: { code } });
            exists = !!found;
        } while (exists);

        // Expire in 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        return prisma.shareCode.create({
            data: {
                code,
                userId,
                role,
                expiresAt,
            },
        });
    }

    static async redeemCode(viewerId: string, code: string): Promise<SharedAccess> {
        const shareCode = await prisma.shareCode.findUnique({
            where: { code },
            include: { user: true }
        });

        if (!shareCode) {
            throw new Error('Invalid code');
        }

        if (shareCode.isUsed) {
            throw new Error('Code already used');
        }

        if (new Date() > shareCode.expiresAt) {
            throw new Error('Code expired');
        }

        if (shareCode.userId === viewerId) {
            throw new Error('Cannot share with yourself');
        }

        // Create Shared Access
        const sharedAccess = await prisma.sharedAccess.upsert({
            where: {
                sharerId_viewerId: {
                    sharerId: shareCode.userId,
                    viewerId: viewerId,
                }
            },
            update: { role: shareCode.role },
            create: {
                sharerId: shareCode.userId,
                viewerId: viewerId,
                role: shareCode.role,
            },
        });

        // Mark code as used
        await prisma.shareCode.update({
            where: { id: shareCode.id },
            data: { isUsed: true },
        });

        // Automatically subscribe viewer's devices to sharer's topic
        const viewerTokens = await prisma.deviceToken.findMany({
            where: { userId: viewerId },
            select: { token: true }
        });
        const tokens = viewerTokens.map(t => t.token);
        await NotificationService.subscribeToTopic(tokens, `topic-${shareCode.userId}`);

        return sharedAccess;
    }

    static async getSharedWithMe(viewerId: string) {
        return prisma.sharedAccess.findMany({
            where: { viewerId },
            include: { sharer: { select: { id: true, name: true, email: true } } }
        });
    }

    static async getSharedByMe(sharerId: string) {
        return prisma.sharedAccess.findMany({
            where: { sharerId },
            include: { viewer: { select: { id: true, name: true, email: true } } }
        });
    }

    static async removeAccess(sharerId: string, viewerId: string) {
        // Unsubscribe from topic before deleting
        const viewerTokens = await prisma.deviceToken.findMany({
            where: { userId: viewerId },
            select: { token: true }
        });
        const tokens = viewerTokens.map(t => t.token);
        await NotificationService.unsubscribeFromTopic(tokens, `topic-${sharerId}`);

        return prisma.sharedAccess.delete({
            where: {
                sharerId_viewerId: {
                    sharerId,
                    viewerId
                }
            }
        });
    }

    static async toggleNotification(viewerId: string, sharerId: string, enabled: boolean) {
        await prisma.sharedAccess.update({
            where: {
                sharerId_viewerId: {
                    sharerId,
                    viewerId
                }
            },
            data: { notificationsEnabled: enabled }
        });

        const viewerTokens = await prisma.deviceToken.findMany({
            where: { userId: viewerId },
            select: { token: true }
        });
        const tokens = viewerTokens.map(t => t.token);

        if (enabled) {
            await NotificationService.subscribeToTopic(tokens, `topic-${sharerId}`);
        } else {
            await NotificationService.unsubscribeFromTopic(tokens, `topic-${sharerId}`);
        }
    }
}
