<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { SettingsForm } from "../../types/settings";

const settings = defineModel<SettingsForm>("settings", { required: true });
const activeMode = defineModel<"ALERT" | "WARN">("activeMode", { required: true });
const props = defineProps<{ isSaving: boolean }>();
const emit = defineEmits<{ save: [] }>();
const { t } = useI18n();
</script>

<template>
  <section class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {{ t("settings.thresholds") }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ t("settings.thresholdsDesc") }}
        </p>
      </div>
      <div class="mt-5 md:mt-0 md:col-span-2 grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <div class="flex justify-center mb-6">
            <div class="bg-gray-100 p-1 rounded-lg inline-flex">
              <button @click="activeMode = 'ALERT'" type="button"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                :class="activeMode === 'ALERT' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'">
                {{ t('settings.alertMode') }}
              </button>
              <button @click="activeMode = 'WARN'" type="button"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                :class="activeMode === 'WARN' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'">
                {{ t('settings.warnMode') }}
              </button>
            </div>
          </div>

          <div class="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p class="text-sm text-yellow-700">
              {{ t('settings.medicalDisclaimer') }}
            </p>
          </div>
        </div>

        <template v-if="activeMode === 'ALERT'">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.sysHighAlert") }}</label>
            <input type="number" v-model.number="settings.sysHighAlert"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.sysLowAlert") }}</label>
            <input type="number" v-model.number="settings.sysLowAlert"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.diaHighAlert") }}</label>
            <input type="number" v-model.number="settings.diaHighAlert"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.diaLowAlert") }}</label>
            <input type="number" v-model.number="settings.diaLowAlert"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.pulseHighAlert") }}</label>
            <input type="number" v-model.number="settings.pulseHighAlert"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.pulseLowAlert") }}</label>
            <input type="number" v-model.number="settings.pulseLowAlert"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-sm font-medium text-red-700">{{ t("settings.sysHighWarn") }}</label>
            <input type="number" v-model.number="settings.sysHighWarn"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-red-700">{{ t("settings.sysLowWarn") }}</label>
            <input type="number" v-model.number="settings.sysLowWarn"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-red-700">{{ t("settings.diaHighWarn") }}</label>
            <input type="number" v-model.number="settings.diaHighWarn"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-red-700">{{ t("settings.diaLowWarn") }}</label>
            <input type="number" v-model.number="settings.diaLowWarn"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-red-700">{{ t("settings.pulseHighWarn") }}</label>
            <input type="number" v-model.number="settings.pulseHighWarn"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-red-700">{{ t("settings.pulseLowWarn") }}</label>
            <input type="number" v-model.number="settings.pulseLowWarn"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </template>

        <div class="col-span-2 border-t pt-4 space-y-4">
          <div>
            <h4 class="text-md font-medium text-gray-900">
              {{ t("settings.reminders") }}
            </h4>
            <div class="flex items-center mt-2">
              <input type="checkbox" v-model="settings.reminderEnabled"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label class="ml-2 block text-sm text-gray-900">
                {{ t("settings.enableReminder") }}
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.time") }}</label>
            <input type="time" v-model="settings.reminderTime"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("settings.dailyTarget") }}</label>
            <input type="number" v-model.number="settings.dailyTarget"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>

        <div class="col-span-2 flex justify-end">
          <button @click="emit('save')" :disabled="props.isSaving"
            class="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-60">
            <svg v-if="props.isSaving" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>{{ props.isSaving ? t('common.saving', '儲存中...') : t("settings.saveSettings") }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
