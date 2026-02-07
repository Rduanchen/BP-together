<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    isOpen: boolean;
    initialData?: any;
}>();

const emit = defineEmits(['close', 'save']);

const form = ref({
    id: '',
    systolic: '',
    diastolic: '',
    pulse: '',
    recordedAt: ''
});

// Helper to get local datetime string for input
const getLocalDatetimeString = (date?: string | Date) => {
    const d = date ? new Date(date) : new Date();
    // Offset in minutes
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
};

watch(() => props.isOpen, (val) => {
    if (val) {
        if (props.initialData) {
            form.value = {
                id: props.initialData.id,
                systolic: props.initialData.systolic,
                diastolic: props.initialData.diastolic,
                pulse: props.initialData.pulse,
                recordedAt: getLocalDatetimeString(props.initialData.recordedAt)
            };
        } else {
            // New record - default to now
            form.value = {
                id: '',
                systolic: '',
                diastolic: '',
                pulse: '',
                recordedAt: getLocalDatetimeString()
            };
        }
    }
});

const handleSave = () => {
    if (!form.value.systolic || !form.value.diastolic || !form.value.pulse) {
        alert('Please fill all fields');
        return;
    }
    emit('save', {
        ...form.value,
        recordedAt: new Date(form.value.recordedAt).toISOString()
    });
};
</script>

<template>
  <div v-if="isOpen" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ form.id ? t('common.edit') : t('common.addRecord') }}
              </h3>
              <div class="mt-4 space-y-4">
                  <!-- Fields -->
                  <div>
                      <label class="block text-sm font-medium text-gray-700">{{ t('recordForm.systolic') }}</label>
                      <input type="number" v-model="form.systolic" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border">
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700">{{ t('recordForm.diastolic') }}</label>
                      <input type="number" v-model="form.diastolic" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border">
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700">{{ t('recordForm.pulse') }}</label>
                      <input type="number" v-model="form.pulse" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border">
                  </div>
                   <div>
                      <label class="block text-sm font-medium text-gray-700">{{ t('recordForm.date') }}</label>
                      <input type="datetime-local" v-model="form.recordedAt" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border">
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="handleSave" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
            {{ t('common.save') }}
          </button>
          <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
