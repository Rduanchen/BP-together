import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging"; // 用這個，不要用 /sw

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_INIT);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
export const googleProvider = new GoogleAuthProvider();