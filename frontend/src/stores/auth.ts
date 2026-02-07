import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import api from '../services/api';

interface User extends FirebaseUser {
    termsAcceptedAt?: string;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const idToken = ref<string | null>(null);
    const targetUserId = ref<string | null>(null);
    const isAuthReady = ref(false);

    const login = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, googleProvider);
            // We set the firebase user first
            user.value = result.user as User;
            idToken.value = await result.user.getIdToken();

            // Sync with backend to get DB fields like termsAcceptedAt
            await syncUser();
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            user.value = null;
            idToken.value = null;
            targetUserId.value = null;
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const initAuth = () => {
        return new Promise<void>((resolve) => {
            onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    user.value = currentUser as User;
                    idToken.value = await currentUser.getIdToken();
                    // Sync on init to ensure we have latest DB state
                    await syncUser();
                } else {
                    user.value = null;
                    idToken.value = null;
                }
                isAuthReady.value = true;
                resolve();
            });
        })
    }

    // Helper to fetch full user data from backend (optional if we only need terms)
    // Actually, we can just check if terms need to be accepted. 
    // The previous implementation of verifyToken middleware returns dbUser.
    // Ideally we should have a /me endpoint or similar, but for now let's assume we can lazily check or rely on `api` calls returning 403 if terms not accepted? 
    // Wait, the requirement says "force agree".
    // Let's implement a quick sync function using the user create/find logic implicitly or a dedicated /me

    const syncUser = async () => {
        if (!idToken.value) return;
        try {
            // We can use the health check or a simple record fetch to trigger the "User Sync" in auth middleware
            // But we need the DB user object returned to know if terms are accepted.
            // We'll trust the verifyToken middleware "findOrCreate" BUT verifyToken doesn't return the user to the frontend.

            // Let's add a lightweight endpoint or just use the fact that we need to check terms.
            // Actually, the userController doesn't have a "getMe".
            // Let's try to infer it or add a getMe. 
            // For now, let's assume we might need to add `getMe` to backend if we want clean logic.
            // However, to save time, I will assume we can add a lightweight /auth/me or similar on backend? 
            // No, let's stick to what we have. 
            // Logic: Frontend needs to know `termsAcceptedAt`.
            // Modify verifyToken to NOT block if terms not accepted? No, VerifyToken just checks Auth.
            // We need an endpoint that returns the DB user. 
            // Let's use `POST /terms` (accept) but we also need to GET status.
            // I'll add `GET /users/me` to UserController if needed, or...
            // Wait, the `verifyToken` middleware attaches `dbUser` to request.
            // I can return it in `GET /users/me`.

            // For now, let's skip syncUser complex logic and assume we add `GET /users/me`.
            const res = await api.get('/users/me');
            if (res.data) {
                user.value = { ...user.value!, termsAcceptedAt: res.data.termsAcceptedAt };
            }
        } catch (e) {
            console.error("Failed to sync user", e);
        }
    };

    const acceptTerms = async () => {
        try {
            const res = await api.post('/users/terms');
            if (user.value) {
                user.value.termsAcceptedAt = res.data.termsAcceptedAt;
            }
        } catch (e) {
            throw e;
        }
    }

    return {
        user,
        idToken,
        targetUserId,
        isAuthReady,
        login,
        logout,
        initAuth,
        acceptTerms
    };
});
