<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import RecordModal from "../components/RecordModal.vue";
import api from "../services/api";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

interface Record {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  recordedAt: string;
}

const records = ref<Record[]>([]);
const loading = ref(false);
const showModal = ref(false);
const editingRecord = ref<Record | null>(null);

const startDate = ref("");
const endDate = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const fetchRecords = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (authStore.targetUserId) {
      params.userId = authStore.targetUserId;
    }
    if (startDate.value && endDate.value) {
      params.start = startDate.value;
      params.end = endDate.value;
    }
    const res = await api.get("/records", { params });
    records.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const deleteRecord = async (id: string) => {
  if (!confirm(t("common.deleteConfirm"))) return;
  try {
    const params: any = {};
    if (authStore.targetUserId) {
      params.userId = authStore.targetUserId;
    }
    // For delete, we might need to pass targetUserId in query if it's a shared record?
    // Backend delete uses query.userId for target permission check.
    await api.delete(`/records/${id}`, { params });
    alert(t("common.deleted"));
    fetchRecords();
  } catch (e: any) {
    alert(e.response?.data?.message || "Failed to delete");
  }
};

const openEditModal = (record: Record) => {
  editingRecord.value = record;
  showModal.value = true;
};

const clearFilter = () => {
  startDate.value = "";
  endDate.value = "";
  fetchRecords();
};

const exportCSV = () => {
  // Date,Systolic,Diastolic,Pulse
  const headers = [
    t("history.date"),
    t("history.systolic"),
    t("history.diastolic"),
    t("history.pulse"),
  ];
  const rows = records.value.map((r) => {
    const d = new Date(r.recordedAt);
    const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return [dateStr, r.systolic, r.diastolic, r.pulse].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `blood_pressure_history_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

const triggerImport = () => {
  fileInput.value?.click();
};

const parseChineseDate = (dateStr: string) => {
  // "2025/04/01 下午06:06"
  const cleanStr = dateStr.replace(/"/g, "").trim();
  const isPM = cleanStr.includes("下午");
  const isAM = cleanStr.includes("上午");
  const timeStr = cleanStr.replace("下午", "").replace("上午", "").trim();

  // Check if standard format (no Chinese AM/PM)
  if (!isPM && !isAM) {
    const d = new Date(cleanStr);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  const parts = timeStr.split(" ");
  if (parts.length < 2) return new Date(cleanStr);

  const datePart = parts[0] ?? "";
  const timePart = parts[1] ?? "";

  const dateParts = datePart.split("/");
  const timeParts = timePart.split(":");

  if (dateParts.length < 3 || timeParts.length < 2) return new Date(cleanStr);

  let hour = parseInt(timeParts[0] ?? "", 10);
  const minute = parseInt(timeParts[1] ?? "", 10);

  if (isNaN(hour) || isNaN(minute)) return new Date(cleanStr);

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  const year = parseInt(dateParts[0] ?? "", 10);
  const month = parseInt(dateParts[1] ?? "", 10);
  const day = parseInt(dateParts[2] ?? "", 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date(cleanStr);

  return new Date(year, month - 1, day, hour, minute);
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = async (e) => {
    const text = e.target?.result as string;
    const lines = text.split("\n");
    // Skip header
    const dataLines = lines.slice(1).filter((l) => l.trim().length > 0);

    const parsedRecords = dataLines
      .map((line) => {
        // Simple split by comma
        const cols = line.split(",");
        if (cols.length < 4) return null;

        // Date, Sys, Dia, Pulse
        const dateStr = cols[0];
        const systolic = parseInt(cols[1] ?? "", 10);
        const diastolic = parseInt(cols[2] ?? "", 10);
        const pulse = parseInt(cols[3] ?? "", 10);

        if (isNaN(systolic) || isNaN(diastolic) || isNaN(pulse)) return null;

        return {
          recordedAt: parseChineseDate(dateStr ?? ""),
          systolic,
          diastolic,
          pulse,
        };
      })
      .filter((r) => r !== null);

    if (parsedRecords.length > 0) {
      try {
        const payload = {
          records: parsedRecords,
          targetUserId: authStore.targetUserId || undefined,
        };
        const res = await api.post("/records/bulk", payload);
        alert(t("common.imported", { count: res.data.count }));
        fetchRecords();
      } catch (err: any) {
        alert(err.response?.data?.message || "Import failed");
      }
    }
    // Reset input
    if (fileInput.value) fileInput.value.value = "";
  };

  reader.readAsText(file);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const handleSave = async (data: any) => {
  try {
    const payload = {
      ...data,
      targetUserId: authStore.targetUserId || undefined,
    };
    if (data.id) {
      await api.put(`/records/${data.id}`, payload);
      alert(t("common.updated"));
    } else {
      // Should not happen in History view usually, but if we reused it for Add
      await api.post("/records", payload);
      alert(t("common.created"));
    }
    showModal.value = false;
    fetchRecords();
  } catch (e: any) {
    alert(e.response?.data?.message || "Failed to save");
  }
};

watch(
  () => authStore.targetUserId,
  () => {
    fetchRecords();
  },
);

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div
        v-if="authStore.targetUserId"
        class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
      >
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              {{ t("history.viewingShared") }}
            </p>
          </div>
        </div>
      </div>

      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ t("history.title") }}
          </h1>
          <button
            @click="router.push('/')"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 shadow-md transform transition hover:scale-105"
          >
            {{ t("history.recordBP") }}
          </button>
        </div>

        <!-- Filter Controls -->
        <div
          class="mb-4 flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg shadow"
        >
          <div class="flex flex-col">
            <label class="text-xs font-medium text-gray-700 mb-1">{{
              t("history.startDate")
            }}</label>
            <input
              type="date"
              v-model="startDate"
              class="border rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-xs font-medium text-gray-700 mb-1">{{
              t("history.endDate")
            }}</label>
            <input
              type="date"
              v-model="endDate"
              class="border rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="fetchRecords"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
            >
              {{ t("history.filter") }}
            </button>
            <button
              @click="clearFilter"
              class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
            >
              {{ t("history.clear") }}
            </button>
          </div>
          <div class="flex gap-2 ml-auto">
            <button
              @click="triggerImport"
              class="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              {{ t("history.import") }}
            </button>
            <button
              @click="exportCSV"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              {{ t("history.export") }}
            </button>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              class="hidden"
              accept=".csv"
            />
          </div>
        </div>

        <div v-if="loading" class="text-center">{{ t("common.loading") }}</div>

        <div v-else class="flex flex-col">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div
              class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8"
            >
              <div
                class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
              >
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {{ t("history.date") }}
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {{ t("history.systolic") }}
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {{ t("history.diastolic") }}
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {{ t("history.pulse") }}
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {{ t("history.actions") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="record in records" :key="record.id">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {{ formatDate(record.recordedAt) }}
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {{ record.systolic }}
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {{ record.diastolic }}
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {{ record.pulse }}
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2"
                      >
                        <button
                          @click="openEditModal(record)"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          {{ t("common.edit") }}
                        </button>
                        <button
                          @click="deleteRecord(record.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          {{ t("common.delete") }}
                        </button>
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

    <RecordModal
      :isOpen="showModal"
      :initialData="editingRecord"
      @close="showModal = false"
      @save="handleSave"
    />
  </div>
</template>
