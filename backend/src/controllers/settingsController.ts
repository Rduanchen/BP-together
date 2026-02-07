import { Request, Response } from "express";
import { SettingsService } from "../services/settingsService";
import { NotificationService } from "../services/notificationService";

export class SettingsController {
  static async get(req: Request, res: Response) {
    try {
      if (!req.dbUser) return res.status(401).json({ message: "Unauthorized" });
      const settings = await SettingsService.getSettings(req.dbUser.id);
      res.json(settings || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.dbUser) return res.status(401).json({ message: "Unauthorized" });
      const settings = await SettingsService.upsertSettings(
        req.dbUser.id,
        req.body,
      );
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async registerDevice(req: Request, res: Response) {
    try {
      if (!req.dbUser) return res.status(401).json({ message: "Unauthorized" });
      const { token, platform } = req.body;
      await NotificationService.registerToken(
        req.dbUser.id,
        token,
        platform || "web",
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDeviceStatus(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token is required" });
      }
      // We can optionally check if token belongs to user, but token is unique, giving status is harmless?
      // Actually nice to know if it's registered at all.
      const registered = await NotificationService.isTokenRegistered(token);
      res.json({ registered });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async unregisterDevice(req: Request, res: Response) {
    try {
      if (!req.dbUser) return res.status(401).json({ message: "Unauthorized" });
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token is required" });
      }
      await NotificationService.unregisterToken(token);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
