<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const isOpen = ref(false); // Mobile menu state
const sharedAccounts = ref<{ id: string, name: string }[]>([]);

const fetchSharedAccounts = async () => {
  try {
    const res = await api.get('/share/shared-with-me');
    sharedAccounts.value = res.data.map((item: any) => ({
      id: item.sharer.id,
      name: item.sharer.name || item.sharer.email
    }));
  } catch (e) { console.error(e) }
}

onMounted(() => {
  fetchSharedAccounts();
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const switchAccount = (event: any) => {
  const val = event.target.value;
  if (val === 'ME') {
    authStore.targetUserId = null;
  } else {
    authStore.targetUserId = val;
  }
}

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'zh-TW' : 'en';
};
</script>

<template>
  <nav class="bg-indigo-600 shadow-lg transition-colors duration-500"
    :class="{ 'bg-yellow-600': authStore.targetUserId }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <router-link to="/" class="text-white font-bold text-xl flex items-center">
              <img src="/icon.png" alt="Logo" class="h-8 w-8 mr-2">
              {{ t('navbar.title') }}
            </router-link>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link to="/" class="text-white hover:bg-indigo-500 px-3 py-2 rounded-md font-medium">{{
                t('navbar.dashboard') }}</router-link>
              <router-link to="/history" class="text-white hover:bg-indigo-500 px-3 py-2 rounded-md font-medium">{{
                t('navbar.history') }}</router-link>
              <router-link to="/settings" class="text-white hover:bg-indigo-500 px-3 py-2 rounded-md font-medium">{{
                t('navbar.settings') }}</router-link>
            </div>
          </div>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <!-- Language Switcher -->
          <button @click="toggleLanguage" class="text-white hover:text-indigo-200 text-sm">
            {{ locale === 'en' ? '中' : 'En' }}
          </button>

          <!-- Account Switcher -->
          <div class="relative">
            <select @change="switchAccount"
              class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm">
              <option value="ME">My Data</option>
              <option v-for="acc in sharedAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>

          <div class="ml-4 flex items-center md:ml-6">
            <span class="text-white mr-4 text-sm">{{ authStore.user?.displayName }}</span>
            <button @click="handleLogout"
              class="bg-indigo-800 p-1 px-3 rounded-full text-white text-xs hover:bg-indigo-900">
              {{ t('navbar.logout') }}
            </button>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="-mr-2 flex md:hidden">
          <button @click="isOpen = !isOpen" type="button"
            class="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            aria-controls="mobile-menu" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div class="md:hidden" id="mobile-menu" v-show="isOpen">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link to="/" class="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">{{
          t('navbar.dashboard') }}</router-link>
        <router-link to="/history"
          class="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">{{ t('navbar.history')
          }}</router-link>
        <router-link to="/settings"
          class="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">{{
            t('navbar.settings') }}</router-link>
      </div>
      <div class="pt-4 pb-4 border-t border-indigo-700">
        <div class="flex items-center px-5">
          <div class="ml-3">
            <div class="text-base font-medium leading-none text-white">{{ authStore.user?.displayName }}</div>
            <div class="text-sm font-medium leading-none text-gray-300 mt-1">{{ authStore.user?.email }}</div>
          </div>
          <button @click="toggleLanguage"
            class="ml-auto bg-indigo-600 flex-shrink-0 p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none ring-1 ring-white">
            {{ locale === 'en' ? '中' : 'En' }}
          </button>
        </div>
        <div class="mt-3 px-2 space-y-1">
          <div class="px-3">
            <select @change="switchAccount"
              class="block w-full bg-white border border-gray-400 px-4 py-2 rounded shadow text-sm">
              <option value="ME">My Data</option>
              <option v-for="acc in sharedAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>
          <button @click="handleLogout"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500">{{
              t('navbar.logout') }}</button>
        </div>
      </div>
    </div>
  </nav>
</template>
