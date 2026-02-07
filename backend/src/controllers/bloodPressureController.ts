import { Request, Response } from 'express';
import { BloodPressureService } from '../services/bloodPressureService';

export class BloodPressureController {

    // Helper to get target user ID. 
    // If ?userId=... is provided, we try to access that user's data (Service will check perm).
    // Otherwise we access our own data.
    private static getTargetUserId(req: Request): string {
        const targetId = (req.query.userId as string) || (req.body && req.body.targetUserId);
        return targetId || req.dbUser.id;
    }

    static async create(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'User not found in DB' });
            const { systolic, diastolic, pulse, recordedAt, targetUserId } = req.body;

            const targetId = targetUserId || req.dbUser.id;

            const record = await BloodPressureService.createRecord(targetId, {
                systolic: Number(systolic),
                diastolic: Number(diastolic),
                pulse: Number(pulse),
                recordedAt: recordedAt ? new Date(recordedAt) : undefined,
            }, req.dbUser.id);
            res.status(201).json(record);
        } catch (error: any) {
            if (error.message.includes("Unauthorized")) return res.status(403).json({ message: error.message });
            res.status(500).json({ error: error.message });
        }
    }

    static async bulkCreate(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'User not found in DB' });
            const { records, targetUserId } = req.body;

            if (!Array.isArray(records)) {
                return res.status(400).json({ message: 'records must be an array' });
            }

            const targetId = targetUserId || req.dbUser.id;

            const formattedRecords = records.map((r: any) => ({
                systolic: Number(r.systolic),
                diastolic: Number(r.diastolic),
                pulse: Number(r.pulse),
                recordedAt: r.recordedAt ? new Date(r.recordedAt) : undefined,
            }));

            const count = await BloodPressureService.createRecords(targetId, formattedRecords, req.dbUser.id);
            res.status(201).json({ count });
        } catch (error: any) {
            if (error.message.includes("Unauthorized")) return res.status(403).json({ message: error.message });
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'User not found in DB' });
            const { id } = req.params;
            const { systolic, diastolic, pulse, recordedAt, targetUserId } = req.body;
            const targetId = targetUserId || req.dbUser.id;

            const record = await BloodPressureService.updateRecord(targetId, id as string, {
                systolic: systolic ? Number(systolic) : undefined,
                diastolic: diastolic ? Number(diastolic) : undefined,
                pulse: pulse ? Number(pulse) : undefined,
                recordedAt: recordedAt ? new Date(recordedAt) : undefined,
            }, req.dbUser.id);
            res.json(record);
        } catch (error: any) {
            if (error.message.includes("Unauthorized")) return res.status(403).json({ message: error.message });
            if (error.message === "Record not found or unauthorized") {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'User not found in DB' });
            const { id } = req.params;
            const targetId = req.query.userId as string || req.dbUser.id;

            await BloodPressureService.deleteRecord(targetId, id as string, req.dbUser.id);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes("Unauthorized")) return res.status(403).json({ message: error.message });
            if (error.message === "Record not found or unauthorized") {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'User not found in DB' });
            const { start, end, page, limit } = req.query;
            const targetId = BloodPressureController.getTargetUserId(req);

            let records;
            if (start && end) {
                records = await BloodPressureService.getRecordsByDateRange(
                    targetId,
                    new Date(start as string),
                    new Date(end as string),
                    req.dbUser.id
                );
            } else if (page && limit) {
                records = await BloodPressureService.getRecordsPaginated(
                    targetId,
                    Number(page),
                    Number(limit),
                    req.dbUser.id
                );
            } else {
                records = await BloodPressureService.getAllRecords(targetId, req.dbUser.id);
            }
            res.json(records);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error.message.includes("Unauthorized")) return res.status(403).json({ message: error.message });
            res.status(500).json({ error: error.message });
        }
    }
}
