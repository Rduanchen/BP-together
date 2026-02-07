import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { UserService } from '../services/userService';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any; // Firebase decoded token
            dbUser?: any; // Database user
        }
    }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Sync user with Database
        if (decodedToken.uid && decodedToken.email) {
            const dbUser = await UserService.findOrCreateUser(
                decodedToken.uid,
                decodedToken.email,
                decodedToken.name
            );
            req.dbUser = dbUser;
        }

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ message: 'Unauthorized' });
    }
};
