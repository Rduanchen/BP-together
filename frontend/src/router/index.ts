import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../pages/Login.vue';
import Home from '../pages/Home.vue';
import History from '../pages/History.vue';
import Settings from '../pages/Settings.vue';

const routes = [
    {
        path: '/login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/history',
        component: History,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        component: Settings,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    // Ensure auth is initialized before checking
    if (!authStore.isAuthReady) {
        await authStore.initAuth();
    }

    if (to.meta.requiresAuth && !authStore.user) {
        next('/login');
    } else if (to.meta.guest && authStore.user) {
        next('/');
    } else {
        next();
    }
});

export default router;
