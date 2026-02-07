import { Router } from 'express';
import { ShareController } from '../controllers/shareController';
import { verifyToken } from '../middlewares/auth';

const router = Router();
router.use(verifyToken);

router.post('/generate', ShareController.generate);
router.post('/redeem', ShareController.redeem);
router.get('/shared-with-me', ShareController.listSharedWithMe);
router.get('/shared-by-me', ShareController.listSharedByMe);
router.delete('/:otherId', ShareController.remove);
router.put('/:otherId/notifications', ShareController.toggleNotification);

export default router;
