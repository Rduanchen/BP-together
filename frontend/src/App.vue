<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "./stores/auth";
import TermsModal from "./components/TermsModal.vue";

const authStore = useAuthStore();
const showTerms = ref(false);

watch(() => [authStore.user, authStore.isAuthReady], () => {
  if (authStore.user && !authStore.user.termsAcceptedAt) {
    showTerms.value = true;
  } else {
    showTerms.value = false;
  }
}, { immediate: true });
</script>

<template>
  <router-view />
  <TermsModal :show="showTerms" :force-accept="true" @close="showTerms = false" />
</template>
