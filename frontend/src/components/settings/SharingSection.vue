<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type {
  ShareCode,
  ShareRole,
  SharedByMeItem,
  SharedWithMeItem,
} from "../../types/settings";

const inputCode = defineModel<string>("inputCode", { required: true });

const props = defineProps<{
  generatedCode: ShareCode | null;
  sharedByMe: SharedByMeItem[];
  sharedWithMe: SharedWithMeItem[];
  isRedeeming: boolean;
  isGeneratingRole: ShareRole | null;
  removingAccessId: string | null;
  togglingNotifId: string | null;
}>();

const emit = defineEmits<{
  generate: [role: ShareRole];
  redeem: [];
  remove: [id: string];
  toggle: [sharerId: string, currentState: boolean];
  copy: [code: string];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {{ t("settings.sharing") }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ t("settings.sharingDesc") }}
        </p>
      </div>
      <div class="mt-5 md:mt-0 md:col-span-2 space-y-6">
        <div class="bg-gray-50 p-4 rounded">
          <h4 class="text-md font-medium text-gray-900">
            {{ t("settings.shareMyData") }}
          </h4>
          <div class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-2">
            <button @click="emit('generate', 'VIEWER')"
              class="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-60"
              :disabled="props.isGeneratingRole !== null">
              <span v-if="props.isGeneratingRole === 'VIEWER'" class="inline-flex items-center justify-center">
                <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {{ t('common.generating', '產生中...') }}
              </span>
              <span v-else>{{ t("settings.generateViewer") }}</span>
            </button>
            <button @click="emit('generate', 'EDITOR')"
              class="flex-1 bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-60"
              :disabled="props.isGeneratingRole !== null">
              <span v-if="props.isGeneratingRole === 'EDITOR'" class="inline-flex items-center justify-center">
                <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {{ t('common.generating', '產生中...') }}
              </span>
              <span v-else>{{ t("settings.generateEditor") }}</span>
            </button>
          </div>
          <div v-if="props.generatedCode"
            class="mt-4 p-2 bg-white border border-green-200 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <span class="text-2xl font-mono font-bold text-gray-800">{{ props.generatedCode.code }}</span>
              <span class="text-xs text-gray-500 ml-2">({{ props.generatedCode.role }}) {{ t("settings.expiresIn") }}</span>
            </div>
            <button @click="emit('copy', props.generatedCode?.code || '')"
              class="text-indigo-600 text-sm w-full sm:w-auto text-left sm:text-right">
              {{ t("settings.copy") }}
            </button>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded">
          <h4 class="text-md font-medium text-gray-900">
            {{ t("settings.addSomeone") }}
          </h4>
          <div class="flex flex-col sm:flex-row mt-2 space-y-2 sm:space-y-0 sm:space-x-2">
            <input v-model="inputCode" :placeholder="t('settings.enterCode')"
              class="flex-1 p-2 border border-gray-300 rounded" />
            <button @click="emit('redeem')"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              :disabled="props.isRedeeming || !inputCode">
              <span v-if="props.isRedeeming" class="inline-flex items-center">
                <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {{ t('common.pleaseWait', '請稍候') }}
              </span>
              <span v-else>{{ t("settings.add") }}</span>
            </button>
          </div>
        </div>

        <div>
          <h4 class="text-md font-medium text-gray-900 mb-2">
            {{ t("settings.viewingMe") }}
          </h4>
          <ul class="divide-y divide-gray-200">
            <li v-for="item in props.sharedByMe" :key="item.viewer.id" class="py-2 flex justify-between items-center">
              <span class="text-sm text-gray-700">{{ item.viewer.name || item.viewer.email }} ({{ item.role }})</span>
              <button @click="emit('remove', item.viewer.id)"
                class="text-red-600 text-sm disabled:opacity-60"
                :disabled="props.removingAccessId === item.viewer.id">
                <span v-if="props.removingAccessId === item.viewer.id" class="inline-flex items-center">
                  <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {{ t('common.removing', '移除中...') }}
                </span>
                <span v-else>{{ t("settings.remove") }}</span>
              </button>
            </li>
          </ul>
          <p v-if="props.sharedByMe.length === 0" class="text-xs text-gray-500">
            {{ t("settings.noOne") }}
          </p>
        </div>

        <div>
          <h4 class="text-md font-medium text-gray-900 mb-2">
            {{ t("settings.iCanView") }}
          </h4>
          <ul class="divide-y divide-gray-200">
            <li v-for="item in props.sharedWithMe" :key="item.sharer.id" class="py-2 flex justify-between items-center">
              <span class="text-sm text-gray-700">{{ item.sharer.name || item.sharer.email }} ({{ item.role }})</span>
              <div class="flex items-center space-x-2">
                <button @click="emit('toggle', item.sharer.id, item.notificationsEnabled)"
                  class="text-xs px-2 py-1 rounded disabled:opacity-60"
                  :class="item.notificationsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'"
                  :disabled="props.togglingNotifId === item.sharer.id">
                  <span v-if="props.togglingNotifId === item.sharer.id" class="inline-flex items-center">
                    <svg class="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {{ t('common.updating', '更新中...') }}
                  </span>
                  <span v-else>
                    {{ item.notificationsEnabled ? t("settings.notifOn") : t("settings.notifOff") }}
                  </span>
                </button>
                <button @click="emit('remove', item.sharer.id)"
                  class="text-red-600 text-sm disabled:opacity-60"
                  :disabled="props.removingAccessId === item.sharer.id">
                  <span v-if="props.removingAccessId === item.sharer.id" class="inline-flex items-center">
                    <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {{ t('common.removing', '移除中...') }}
                  </span>
                  <span v-else>{{ t("settings.remove") }}</span>
                </button>
              </div>
            </li>
          </ul>
          <p v-if="props.sharedWithMe.length === 0" class="text-xs text-gray-500">
            {{ t("settings.noOne") }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
