import { defineStore } from "pinia";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../services/firebase";
import api from "../services/api";

const firebaseVapidKey = import.meta.env.VITE_VAPID_KEY;
const firebaseInit = import.meta.env.VITE_FIREBASE_INIT;

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    permissionGranted: false,
    fcmToken: null as string | null,
  }),
  actions: {
    async requestPermission() {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          this.permissionGranted = true;

          // Ensure Service Worker is registered
          let registration: ServiceWorkerRegistration | undefined;
          try {
            // Using a specific scope can help debug but usually root is fine
            await navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${encodeURIComponent(firebaseInit)}`);
            registration = await navigator.serviceWorker.ready;
            console.log("Service Worker is ready and active:", registration);
          } catch (err) {
            console.error("Service Worker registration failed:", err);
            alert("Failed to register Service Worker: " + err);
            return;
          }

          const currentToken = await getToken(messaging, {
            vapidKey: firebaseVapidKey,
            serviceWorkerRegistration: registration,
          });

          console.log("FCM Token: ", currentToken);

          if (currentToken) {
            this.fcmToken = currentToken;
            // Send to backend
            try {
              await api.post("/settings/device", {
                token: currentToken,
                platform: "web",
              });
              console.log("FCM Token registered with backend");
              alert("Notifications Enabled!");
            } catch (backendErr: any) {
              console.error("Backend registration failed:", backendErr);
              // Backend might reject if subscription fails
              alert("Backend registration failed: " + (backendErr.response?.data?.error || backendErr.message));
              // Should we delete the token locally? Maybe not, retries might work?
              // But if backend says "invalid token", we should probably delete it.
            }
          } else {
            console.log("No registration token available.");
          }
        } else {
          console.log("Unable to get permission to notify.");
          alert("Permission denied or dismissed.");
        }
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        alert("Notification Error: " + error);
      }
    },

    async disableNotifications() {
      try {
        let token = this.fcmToken;
        // 1. Try to get token if we don't have it in state
        if (!token) {
          const registration = await navigator.serviceWorker.getRegistration(`/firebase-messaging-sw.js?config=${encodeURIComponent(firebaseInit)}`);
          if (registration) {
            token = await getToken(messaging, { vapidKey: firebaseVapidKey, serviceWorkerRegistration: registration });
          }
        }

        if (token) {
          // 2. Unregister from Backend
          try {
            await api.delete("/settings/device", { params: { token } });
            console.log("Unregistered from backend");
          } catch (e) {
            console.error("Failed to unregister from backend", e);
            // Verify if we should stop? No, continue to clean up local
          }

          // 3. Delete from Firebase
          // Note: deleteToken needs messaging instance
          // There isn't a direct deleteToken imported from firebase/messaging in the top imports, checking...
          // Actually `getToken` is imported, `deleteToken` is also available in firebase/messaging
          const { deleteToken } = await import("firebase/messaging");
          await deleteToken(messaging);
          console.log("Token deleted from Firebase");
        }

        this.fcmToken = null;
        this.permissionGranted = false; // Or 'default'? Permission state in browser persists, but our logic 'flips' access.

        // Actually, we can't revoke browser permission programmatically.
        // We just stop sending tokens.
        alert("Notifications Disabled");
      } catch (err) {
        console.error("Disable notifications error:", err);
        alert("Error preventing notifications: " + err);
      }
    },

    async checkSubscriptionStatus(): Promise<{
      registered: boolean;
      permission: string;
      token: string | null;
    }> {
      const permission = Notification.permission;
      this.permissionGranted = permission === "granted";

      if (permission !== "granted") {
        return { registered: false, permission, token: null };
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration(
          `/firebase-messaging-sw.js?config=${encodeURIComponent(firebaseInit)}`,
        );
        if (!registration) {
          return { registered: false, permission, token: null };
        }

        const currentToken = await getToken(messaging, {
          vapidKey: firebaseVapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          this.fcmToken = currentToken;

          // Check backend status
          try {
            const res = await api.get("/settings/device-status", {
              params: { token: currentToken },
            });

            if (res.data.registered) {
              return { registered: true, permission, token: currentToken };
            } else {
              // Remediation: Token exists locally but not in backend -> Register it!
              console.log("Remediation: Token exists locally but not in backend. Registering...");
              await api.post("/settings/device", {
                token: currentToken,
                platform: "web",
              });
              return { registered: true, permission, token: currentToken };
            }
          } catch (apiErr) {
            console.error("API check failed", apiErr);
            // If API fails, we assume not registered to be safe? Or registered?
            // If offline, maybe keep as is.
            return { registered: false, permission, token: currentToken };
          }
        }
      } catch (e) {
        console.error("Check subscription error", e);
      }
      return { registered: false, permission, token: null };
    },

    listen() {
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        alert(
          `[Notification] ${payload.notification?.title}: ${payload.notification?.body}`,
        );
      });
    },
  },
});
