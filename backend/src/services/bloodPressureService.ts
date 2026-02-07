import { PrismaClient, BloodPressureRecord, Role } from '@prisma/client';
import { NotificationService } from './notificationService';
import { SettingsService } from './settingsService';
import { ShareService } from './shareService';

const prisma = new PrismaClient();

interface CreateRecordDto {
    systolic: number;
    diastolic: number;
    pulse: number;
    recordedAt?: Date;
}

interface UpdateRecordDto {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    recordedAt?: Date;
}

export class BloodPressureService {
    static async checkPermission(ownerId: string, requesterId: string, requiredRole: Role | null = null) {
        if (ownerId === requesterId) return true;
        const access = await prisma.sharedAccess.findUnique({
            where: { sharerId_viewerId: { sharerId: ownerId, viewerId: requesterId } }
        });
        if (!access) return false;
        if (requiredRole && access.role !== requiredRole && access.role !== Role.EDITOR) return false; // Editor implies Viewer logic for strict checks? No, Role is enum. V != E.
        // If required is EDITOR, role must be EDITOR.
        // If required is VIEWER, role can be VIEWER or EDITOR.
        if (requiredRole === Role.EDITOR && access.role !== Role.EDITOR) return false;
        return true;
    }

    static async createRecord(userId: string, data: CreateRecordDto, requesterId: string): Promise<BloodPressureRecord> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.EDITOR);
        if (!hasPermission) throw new Error("Unauthorized to create record for this user");

        const record = await prisma.bloodPressureRecord.create({
            data: {
                ...data,
                userId,
            },
            include: { user: true }
        });

        // Check Notifications
        const settings = await SettingsService.getSettings(userId);
        console.log(`Checking notifications for record ${record.id}`);
        console.log(`Settings: ${JSON.stringify(settings)}`);
        if (settings) {
            // Check thresholds and notify (Topic based, no need to fetch sharers)
            await NotificationService.checkThresholdsAndNotify(record, settings);
        }

        return record;
    }

    static async createRecords(userId: string, data: CreateRecordDto[], requesterId: string): Promise<number> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.EDITOR);
        if (!hasPermission) throw new Error("Unauthorized to create records for this user");

        const recordsData = data.map(record => ({
            ...record,
            userId,
        }));

        const result = await prisma.bloodPressureRecord.createMany({
            data: recordsData,
        });

        return result.count;
    }

    static async updateRecord(userId: string, recordId: string, data: UpdateRecordDto, requesterId: string): Promise<BloodPressureRecord> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.EDITOR);
        if (!hasPermission) throw new Error("Unauthorized to update record for this user");

        // Ensure the record belongs to the user
        const record = await prisma.bloodPressureRecord.findUnique({
            where: { id: recordId }
        });

        if (!record || record.userId !== userId) {
            throw new Error("Record not found or unauthorized");
        }

        return prisma.bloodPressureRecord.update({
            where: { id: recordId },
            data,
        });
    }

    static async deleteRecord(userId: string, recordId: string, requesterId: string): Promise<BloodPressureRecord> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.EDITOR);
        if (!hasPermission) throw new Error("Unauthorized to delete record for this user");

        // Ensure the record belongs to the user
        const record = await prisma.bloodPressureRecord.findUnique({
            where: { id: recordId }
        });

        if (!record || record.userId !== userId) {
            throw new Error("Record not found or unauthorized");
        }

        return prisma.bloodPressureRecord.delete({
            where: { id: recordId },
        });
    }

    static async getAllRecords(userId: string, requesterId: string): Promise<BloodPressureRecord[]> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.VIEWER);
        if (!hasPermission) throw new Error("Unauthorized to view records for this user");

        return prisma.bloodPressureRecord.findMany({
            where: { userId },
            orderBy: { recordedAt: 'desc' },
        });
    }

    static async getRecordsByDateRange(userId: string, startDate: Date, endDate: Date, requesterId: string): Promise<BloodPressureRecord[]> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.VIEWER);
        if (!hasPermission) throw new Error("Unauthorized to view records for this user");

        return prisma.bloodPressureRecord.findMany({
            where: {
                userId,
                recordedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { recordedAt: 'desc' },
        });
    }

    static async getRecordsPaginated(userId: string, page: number, limit: number, requesterId: string): Promise<BloodPressureRecord[]> {
        const hasPermission = await this.checkPermission(userId, requesterId, Role.VIEWER);
        if (!hasPermission) throw new Error("Unauthorized to view records for this user");

        const skip = (page - 1) * limit;
        return prisma.bloodPressureRecord.findMany({
            where: { userId },
            orderBy: { recordedAt: 'desc' },
            skip,
            take: limit,
        });
    }
}
