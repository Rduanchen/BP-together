import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
    static async deleteAccount(req: Request, res: Response) {
        try {
            if (!req.dbUser) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const { id, firebaseUid } = req.dbUser;
            await UserService.deleteUser(id, firebaseUid);

            res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting account:', error);
            res.status(500).json({ message: 'Failed to delete account', error: error.message });
        }
    }

    static async acceptTerms(req: Request, res: Response) {
        try {
            if (!req.dbUser) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const updatedUser = await UserService.acceptTerms(req.dbUser.id);
            res.status(200).json(updatedUser);
        } catch (error: any) {
            console.error('Error accepting terms:', error);
            res.status(500).json({ message: 'Failed to accept terms', error: error.message });
        }
    }

    static async getMe(req: Request, res: Response) {
        try {
            if (!req.dbUser) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            res.status(200).json(req.dbUser);
        } catch (error: any) {
            res.status(500).json({ message: 'Failed to fetch user', error: error.message });
        }
    }
}
