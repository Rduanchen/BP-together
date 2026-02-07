<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login();
    router.push('/');
  } catch (error) {
    alert('Login failed. Please check your console.');
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <!-- <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          BP Together
        </h2> -->
        <!-- Logo -->
        <img src="/logo.png" alt="Logo" class="mx-auto">
        <p class="text-lg mt-2 text-center text-gray-600">
          {{ $t('login.slogen') }}
        </p>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('login.subtitle') }}
        </p>
      </div>
      <div class="flex justify-center">
        <button @click="handleLogin"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {{ $t('login.googleSignIn') }}
        </button>
      </div>
    </div>
  </div>
</template>
