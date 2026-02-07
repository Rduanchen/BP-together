import admin from "../config/firebase";
import { PrismaClient } from "@prisma/client";
import { ShareService } from "./shareService";

const prisma = new PrismaClient();

export class NotificationService {
  static async subscribeToTopic(tokens: string[], topic: string) {
    if (tokens.length === 0) return;
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      if (response.failureCount > 0) {
        console.error(
          `Failed to subscribe some tokens to ${topic}:`,
          response.errors,
        );
      }
      console.log(`Subscribed ${response.successCount} tokens to ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to ${topic}:`, error);
    }
  }

  static async unsubscribeFromTopic(tokens: string[], topic: string) {
    if (tokens.length === 0) return;
    try {
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokens, topic);
      console.log(`Unsubscribed ${response.successCount} tokens from ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from ${topic}:`, error);
    }
  }

  static async isTokenRegistered(token: string): Promise<boolean> {
    const existing = await prisma.deviceToken.findUnique({
      where: { token },
    });
    return !!existing;
  }

  static async registerToken(userId: string, token: string, platform: string) {
    // 1. Subscribe to own topic first to verify token validity
    const ownTopic = `topic-${userId}`;
    let subscribeSuccess = false;
    try {
      const response = await admin
        .messaging()
        .subscribeToTopic([token], ownTopic);
      if (response.failureCount > 0) {
        console.error(
          `Failed to subscribe token ${token} to ${ownTopic}:`,
          response.errors,
        );
        // If subscription fails (invalid token), do NOT save to DB
        // Also try to delete from DB if it exists (cleanup)
        await prisma.deviceToken.deleteMany({ where: { token } });
        throw new Error("Invalid token or subscription failed");
      }
      subscribeSuccess = true;
      console.log(`Subscribed token to ${ownTopic}`);
    } catch (error) {
      console.error(`Error subscribing to ${ownTopic}:`, error);
      throw error; // Propagate error
    }

    if (!subscribeSuccess) return;

    // 2. Upsert Token only if subscription succeeded
    await prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform },
      create: {
        userId,
        token,
        platform,
      },
    });

    // 3. Subscribe to topics of people I am watching (if enabled)
    const watchingWithNotifs = await prisma.sharedAccess.findMany({
      where: {
        viewerId: userId,
        notificationsEnabled: true,
      },
      select: { sharerId: true },
    });

    const topicsToSubscribe = watchingWithNotifs.map(
      (s) => `topic-${s.sharerId}`,
    );
    // Best effort subscription for other topics
    for (const topic of topicsToSubscribe) {
      await this.subscribeToTopic([token], topic);
    }
  }

  static async unregisterToken(token: string) {
    // 1. Delete from DB
    await prisma.deviceToken.deleteMany({
      where: { token },
    });

    // We can optionally unsubscribe from topics, but deleting from DB is enough to stop our logic from tracking it.
    // However, for completeness and to stop FCM from sending messages if we used direct addressing (which we don't mostly), we could unsubscribe.
    // Since we use topics, unsubscribing is good practice to clean up FCM side.
    // But since we don't track *which* topics a token is subscribed to easily without querying everything, 
    // we might just let FCM handle invalid tokens eventually, or assume the client will also delete token.
    // For now, removing from DB is the critical part for our "State".
  }

  static async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: any,
  ) {
    const message = {
      topic: topic,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    try {
      await admin.messaging().send(message);
      console.log(`Sent message to topic: ${topic}`);
    } catch (error) {
      console.error(`Error sending to topic ${topic}:`, error);
    }
  }

  // Deprecated: sendPush (direct multicast) - kept for reference or legacy, but we switch to topics.

  static async checkThresholdsAndNotify(record: any, settings: any) {
    // We no longer need to find sharers manually. We just send to the topic of the record owner.
    // Anyone subscribed to `topic-<record.userId>` will get it.

    console.log(`Checking thresholds for record ${record.id}`);
    const topic = `topic-${record.userId}`;

    const abnormalFields: string[] = [];

    // Check Systolic
    if (settings.sysHighAlert && record.systolic >= settings.sysHighAlert)
      abnormalFields.push(`收縮壓 (${record.systolic})`);
    else if (settings.sysHighWarn && record.systolic >= settings.sysHighWarn)
      abnormalFields.push(`收縮壓 (${record.systolic})`);

    if (settings.sysLowAlert && record.systolic <= settings.sysLowAlert)
      abnormalFields.push(`收縮壓過低 (${record.systolic})`);
    else if (settings.sysLowWarn && record.systolic <= settings.sysLowWarn)
      abnormalFields.push(`收縮壓過低 (${record.systolic})`);

    // Check Diastolic
    if (settings.diaHighAlert && record.diastolic >= settings.diaHighAlert)
      abnormalFields.push(`舒張壓 (${record.diastolic})`);
    else if (settings.diaHighWarn && record.diastolic >= settings.diaHighWarn)
      abnormalFields.push(`舒張壓 (${record.diastolic})`);

    if (settings.diaLowAlert && record.diastolic <= settings.diaLowAlert)
      abnormalFields.push(`舒張壓過低 (${record.diastolic})`);
    else if (settings.diaLowWarn && record.diastolic <= settings.diaLowWarn)
      abnormalFields.push(`舒張壓過低 (${record.diastolic})`);

    // Check Pulse
    if (settings.pulseHighAlert && record.pulse >= settings.pulseHighAlert)
      abnormalFields.push(`脈搏 (${record.pulse})`);
    else if (settings.pulseHighWarn && record.pulse >= settings.pulseHighWarn)
      abnormalFields.push(`脈搏 (${record.pulse})`);

    if (settings.pulseLowAlert && record.pulse <= settings.pulseLowAlert)
      abnormalFields.push(`脈搏過低 (${record.pulse})`);
    else if (settings.pulseLowWarn && record.pulse <= settings.pulseLowWarn)
      abnormalFields.push(`脈搏過低 (${record.pulse})`);

    if (abnormalFields.length > 0) {
      const userName = record.user?.name || record.user?.email || "使用者";
      const title = "BPTogether 數據異常警告";
      const body = `${userName} 的 ${abnormalFields.join(", ")} 超出安全值\n收縮壓: ${record.systolic}, 舒張壓: ${record.diastolic}, 脈搏: ${record.pulse}`;

      await this.sendToTopic(topic, title, body, {
        recordId: record.id,
        type: "ALERT",
      });
    }
  }
}
