<script setup lang="ts">
import { useI18n } from "vue-i18n";

const props = defineProps<{ isDeleting: boolean }>();
const emit = defineEmits<{
  delete: [];
}>();
const { t } = useI18n();
</script>

<template>
  <section class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-red-200">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <h3 class="text-lg font-medium leading-6 text-red-600">
          {{ t("settings.dangerZone") }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ t("settings.deleteAccountDesc") }}
        </p>
      </div>
      <div class="mt-5 md:mt-0 md:col-span-2 flex items-center">
        <button @click="emit('delete')"
          class="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60"
          :disabled="props.isDeleting">
          <svg v-if="props.isDeleting" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>{{ props.isDeleting ? t('common.deleting', '刪除中...') : t("settings.deleteAccount") }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
