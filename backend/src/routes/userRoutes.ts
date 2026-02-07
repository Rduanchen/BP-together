import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.delete('/', UserController.deleteAccount);
router.post('/terms', UserController.acceptTerms);
router.get('/me', UserController.getMe);

export default router;
