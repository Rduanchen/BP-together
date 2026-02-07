import { Request, Response } from 'express';
import { ShareService } from '../services/shareService';
import { Role } from '@prisma/client';

export class ShareController {
    static async generate(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'Unauthorized' });
            const { role } = req.body; // 'VIEWER' or 'EDITOR'
            const code = await ShareService.generateCode(req.dbUser.id, role || Role.VIEWER);
            res.json(code);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async redeem(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'Unauthorized' });
            const { code } = req.body;
            const result = await ShareService.redeemCode(req.dbUser.id, code);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listSharedWithMe(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'Unauthorized' });
            const list = await ShareService.getSharedWithMe(req.dbUser.id);
            res.json(list);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async listSharedByMe(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'Unauthorized' });
            const list = await ShareService.getSharedByMe(req.dbUser.id);
            res.json(list);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'Unauthorized' });
            const { otherId } = req.params;

            try {
                await ShareService.removeAccess(req.dbUser.id, otherId as string);
                return res.json({ success: true });
            } catch (e) {
                try {
                    await ShareService.removeAccess(otherId as string, req.dbUser.id);
                    return res.json({ success: true });
                } catch (e2) {
                    throw new Error("Relationship not found");
                }
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async toggleNotification(req: Request, res: Response) {
        try {
            if (!req.dbUser) return res.status(401).json({ message: 'Unauthorized' });
            const { otherId } = req.params;
            const { enabled } = req.body;

            await ShareService.toggleNotification(req.dbUser.id, otherId as string, enabled);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
