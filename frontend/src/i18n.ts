import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

const i18n = createI18n({
    legacy: false, // Usage with Composition API
    locale: 'zh-TW', // Default locale
    fallbackLocale: 'en',
    messages: {
        en,
        'zh-TW': zhTW
    }
});

export default i18n;
