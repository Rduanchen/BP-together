import { Router } from 'express';
import recordRoutes from './recordRoutes';
import settingsRoutes from './settingsRoutes';
import shareRoutes from './shareRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/records', recordRoutes);
router.use('/settings', settingsRoutes);
router.use('/share', shareRoutes);
router.use('/users', userRoutes);

router.get('/', (req, res) => {
    res.send('API is running');
});

export default router;
