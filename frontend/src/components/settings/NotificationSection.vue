<script setup lang="ts">
import { useI18n } from "vue-i18n";

const props = defineProps<{
  isPushEnabled: boolean;
  pushPermissionState: NotificationPermission | "default" | string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  enable: [];
  disable: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {{ t("settings.notifications") }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ t("settings.notificationsDesc") }}
        </p>
      </div>
      <div class="mt-5 md:mt-0 md:col-span-2 space-y-4">
        <button v-if="!props.isPushEnabled" @click="emit('enable')"
          class="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto"
          :disabled="props.pushPermissionState === 'denied' || props.isLoading">
          <svg v-if="props.isLoading" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>
            {{
              props.pushPermissionState === "denied"
                ? t("settings.notificationsBlocked", "Notifications Blocked")
                : props.isLoading
                  ? t("common.pleaseWait", "請稍候")
                  : t("settings.enablePush")
            }}
          </span>
        </button>
        <div v-else class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <span class="text-green-600 font-medium">
            ✓ {{ t("settings.enablePush") }} ({{ t("settings.enabled") }})
          </span>
          <button @click="emit('disable')"
            class="inline-flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded text-sm shadow hover:bg-red-700 disabled:opacity-60"
            :disabled="props.isLoading">
            <svg v-if="props.isLoading" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>{{ props.isLoading ? t("common.pleaseWait", "請稍候") : t("settings.disablePush") }}</span>
          </button>
        </div>
        <p v-if="props.pushPermissionState === 'denied'" class="text-sm text-red-600 mt-2">
          {{ t('settings.enableNotificationHint', '請在瀏覽器設定中開啟通知權限') }}
        </p>
      </div>
    </div>
  </section>
</template>
