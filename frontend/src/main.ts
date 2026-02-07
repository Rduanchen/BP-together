import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia();
app.use(pinia)
app.use(router)

import i18n from './i18n';
app.use(i18n);

import { useAuthStore } from './stores/auth';
const authStore = useAuthStore(pinia);
authStore.initAuth().then(() => {
    app.mount('#app')
});
