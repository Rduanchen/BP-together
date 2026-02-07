import { Router } from 'express';
import { BloodPressureController } from '../controllers/bloodPressureController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.post('/bulk', BloodPressureController.bulkCreate);
router.post('/', BloodPressureController.create);
router.get('/', BloodPressureController.getAll);
router.put('/:id', BloodPressureController.update);
router.delete('/:id', BloodPressureController.delete);

export default router;
