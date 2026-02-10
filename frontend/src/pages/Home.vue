<script setup lang="ts">
import { ref } from "vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const authStore = useAuthStore();

// Helper to get local datetime string for input
const getLocalDatetimeString = (date?: string | Date) => {
  const d = date ? new Date(date) : new Date();
  // Offset in minutes
  const offset = d.getTimezoneOffset() * 60000;
  const localISOTime = new Date(d.getTime() - offset)
    .toISOString()
    .slice(0, 16);
  return localISOTime;
};

const form = ref({
  systolic: "",
  diastolic: "",
  pulse: "",
  recordedAt: getLocalDatetimeString(),
});

const isSubmitting = ref(false);

const save = async () => {
  if (!form.value.systolic || !form.value.diastolic || !form.value.pulse)
    return alert(t("home.pleaseFill"));
  if (isSubmitting.value) return; // Prevent double submission

  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      recordedAt: new Date(form.value.recordedAt).toISOString(), // Convert back to UTC ISO for backend
      targetUserId: authStore.targetUserId || undefined,
    };
    await api.post("/records", payload);
    alert(t("home.saved"));
    // Reset
    form.value.systolic = "";
    form.value.diastolic = "";
    form.value.pulse = "";
    // Date stays current
    form.value.recordedAt = getLocalDatetimeString();
  } catch (e: any) {
    alert(e.response?.data?.message || "Failed to save");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <main class="max-w-4xl mx-auto lg:py-3 py-10 px-4 sm:px-6 lg:px-8">
      <div
        v-if="authStore.targetUserId"
        class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8"
      >
        <div class="flex">
          <div class="ml-3">
            <p class="text-lg font-bold text-yellow-700">
              {{ t("home.recordingForElse") }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-xl p-6 sm:p-10">
        <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
          {{ t("home.newRecord") }}
        </h1>

        <div class="space-y-6">
          <div>
            <label class="block text-xl font-bold text-gray-800 mb-2">{{
              t("recordForm.date")
            }}</label>
            <input
              type="datetime-local"
              v-model="form.recordedAt"
              autofocus
              :disabled="isSubmitting"
              class="mt-1 block w-full border-4 border-indigo-400 rounded-lg shadow-md text-2xl p-4 focus:ring-4 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xl font-bold text-gray-800 mb-2">{{
              t("recordForm.systolic")
            }}</label>
            <input
              type="number"
              v-model="form.systolic"
              :disabled="isSubmitting"
              class="mt-1 block w-full border-4 border-indigo-400 rounded-lg shadow-md text-3xl p-5 focus:ring-4 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label class="block text-xl font-bold text-gray-800 mb-2">{{
              t("recordForm.diastolic")
            }}</label>
            <input
              type="number"
              v-model="form.diastolic"
              :disabled="isSubmitting"
              class="mt-1 block w-full border-4 border-indigo-400 rounded-lg shadow-md text-3xl p-5 focus:ring-4 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label class="block text-xl font-bold text-gray-800 mb-2">{{
              t("recordForm.pulse")
            }}</label>
            <input
              type="number"
              v-model="form.pulse"
              :disabled="isSubmitting"
              class="mt-1 block w-full border-4 border-indigo-400 rounded-lg shadow-md text-3xl p-5 focus:ring-4 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div class="pt-6">
            <button
              @click="save"
              :disabled="isSubmitting"
              class="w-full bg-indigo-600 text-white text-2xl font-bold py-4 rounded-lg hover:bg-indigo-700 shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {{
                isSubmitting
                  ? t("home.saving", "儲存中...")
                  : t("home.saveRecord")
              }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
