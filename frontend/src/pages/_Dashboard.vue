<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

interface Record {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  recordedAt: string;
}

const records = ref<Record[]>([]);
const loading = ref(true);

const fetchRecords = async () => {
  try {
    const res = await api.get('/records');
    records.value = res.data;
  } catch (error) {
    console.error('Failed to fetch records', error);
  } finally {
    loading.value = false;
  }
};

const deleteRecord = async (id: string) => {
    if(!confirm('Are you sure?')) return;
    try {
        await api.delete(`/records/${id}`);
        records.value = records.value.filter(r => r.id !== id);
    } catch (error) {
        console.error('Failed to delete', error);
    }
}

// Form logic
const showModal = ref(false);
const isEditing = ref(false);
const form = ref({
    id: '',
    systolic: 120,
    diastolic: 80,
    pulse: 70,
    recordedAt: new Date().toISOString().slice(0, 16)
});

const openCreateModal = () => {
    isEditing.value = false;
    form.value = {
        id: '',
        systolic: 120,
        diastolic: 80,
        pulse: 70,
        recordedAt: new Date().toISOString().slice(0, 16)
    };
    showModal.value = true;
};

const openEditModal = (record: Record) => {
    isEditing.value = true;
    form.value = {
        id: record.id,
        systolic: record.systolic,
        diastolic: record.diastolic,
        pulse: record.pulse,
        recordedAt: new Date(record.recordedAt).toISOString().slice(0, 16)
    };
    showModal.value = true;
};

const handleSubmit = async () => {
    try {
        const payload = {
            systolic: Number(form.value.systolic),
            diastolic: Number(form.value.diastolic),
            pulse: Number(form.value.pulse),
            recordedAt: new Date(form.value.recordedAt)
        };

        if (isEditing.value) {
            await api.put(`/records/${form.value.id}`, payload);
        } else {
            await api.post('/records', payload);
        }
        showModal.value = false;
        fetchRecords();
    } catch (error) {
        console.error("Save failed", error);
    }
};

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-4">
             <h1 class="text-2xl font-semibold text-gray-900">Your Records</h1>
             <button @click="openCreateModal" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Record</button>
        </div>
        <div v-if="loading" class="text-center">Loading...</div>
        
        <div v-else class="flex flex-col">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Systolic</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diastolic</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulse</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="record in records" :key="record.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ new Date(record.recordedAt).toLocaleString() }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.systolic }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.diastolic }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.pulse }}</td>
                       <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button @click="openEditModal(record)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                        <button @click="deleteRecord(record.id)" class="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showModal = false"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">{{ isEditing ? 'Edit Record' : 'Add Record' }}</h3>
                            <div class="mt-2 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Recorded At</label>
                                    <input type="datetime-local" v-model="form.recordedAt" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                </div>
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Systolic</label>
                                        <input type="number" v-model="form.systolic" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Diastolic</label>
                                        <input type="number" v-model="form.diastolic" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Pulse</label>
                                        <input type="number" v-model="form.pulse" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" @click="handleSubmit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                    <button type="button" @click="showModal = false" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
