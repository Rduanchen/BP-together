<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
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
  <div class="h-screen bg-gray-100 flex flex-col">
    <Navbar />
    <main
      class="flex-1 flex flex-col max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 sm:py-3 overflow-hidden"
    >
      <div
        v-if="authStore.targetUserId"
        class="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2 flex-shrink-0"
      >
        <div class="flex">
          <div class="ml-2">
            <p class="text-sm sm:text-base font-bold text-yellow-700">
              {{ t("home.recordingForElse") }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-lg shadow-xl p-3 sm:p-4 flex-1 flex flex-col overflow-auto"
      >
        <h1
          class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center flex-shrink-0"
        >
          {{ t("home.newRecord") }}
        </h1>

        <div class="space-y-3 sm:space-y-4 flex-1 flex flex-col">
          <div class="flex-shrink-0">
            <label
              class="block text-base sm:text-lg font-bold text-gray-800 mb-1"
              >{{ t("recordForm.date") }}</label
            >
            <input
              type="datetime-local"
              v-model="form.recordedAt"
              autofocus
              :disabled="isSubmitting"
              class="mt-1 block w-full border-2 sm:border-3 border-indigo-400 rounded-lg shadow-md text-base sm:text-lg p-2 sm:p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div class="flex-shrink-0">
            <label
              class="block text-base sm:text-lg font-bold text-gray-800 mb-1"
              >{{ t("recordForm.systolic") }}</label
            >
            <input
              type="number"
              v-model="form.systolic"
              :disabled="isSubmitting"
              class="mt-1 block w-full border-2 sm:border-3 border-indigo-400 rounded-lg shadow-md text-lg sm:text-xl p-2 sm:p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div class="flex-shrink-0">
            <label
              class="block text-base sm:text-lg font-bold text-gray-800 mb-1"
              >{{ t("recordForm.diastolic") }}</label
            >
            <input
              type="number"
              v-model="form.diastolic"
              :disabled="isSubmitting"
              class="mt-1 block w-full border-2 sm:border-3 border-indigo-400 rounded-lg shadow-md text-lg sm:text-xl p-2 sm:p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div class="flex-shrink-0">
            <label
              class="block text-base sm:text-lg font-bold text-gray-800 mb-1"
              >{{ t("recordForm.pulse") }}</label
            >
            <input
              type="number"
              v-model="form.pulse"
              :disabled="isSubmitting"
              class="mt-1 block w-full border-2 sm:border-3 border-indigo-400 rounded-lg shadow-md text-lg sm:text-xl p-2 sm:p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div class="pt-2 sm:pt-3 space-y-2 sm:space-y-3 flex-shrink-0">
            <button
              @click="save"
              :disabled="isSubmitting"
              class="w-full bg-indigo-600 text-white text-lg sm:text-xl font-bold py-2 sm:py-3 rounded-lg hover:bg-indigo-700 shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {{
                isSubmitting
                  ? t("home.saving", "儲存中...")
                  : t("home.saveRecord")
              }}
            </button>
            <button
              @click="router.push('/history')"
              :disabled="isSubmitting"
              class="w-full bg-gray-600 text-white text-lg sm:text-xl font-bold py-2 sm:py-3 rounded-lg hover:bg-gray-700 shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {{ t("home.viewHistory") }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
