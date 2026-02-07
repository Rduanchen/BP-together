import { Router } from "express";
import { SettingsController } from "../controllers/settingsController";
import { verifyToken } from "../middlewares/auth";

const router = Router();
router.use(verifyToken);

router.get("/", SettingsController.get);
router.put("/", SettingsController.update);
router.post("/device", SettingsController.registerDevice);
router.delete("/device", SettingsController.unregisterDevice);
router.get("/device-status", SettingsController.getDeviceStatus);

export default router;
