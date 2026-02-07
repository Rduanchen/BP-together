<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import Navbar from "../components/Navbar.vue";
import TermsModal from "../components/TermsModal.vue";
import NotificationSection from "../components/settings/NotificationSection.vue";
import ThresholdSection from "../components/settings/ThresholdSection.vue";
import SharingSection from "../components/settings/SharingSection.vue";
import DangerZoneCard from "../components/settings/DangerZoneCard.vue";

import api from "../services/api";
import { useNotificationStore } from "../stores/notification";
import { useAuthStore } from "../stores/auth";
import type {
  SettingsForm,
  ShareCode,
  SharedWithMeItem,
  SharedByMeItem,
  ShareRole,
} from "../types/settings";

const { t } = useI18n();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();

const isPushEnabled = ref(false);
const pushPermissionState = ref<NotificationPermission | "default">("default");
const activeMode = ref<"ALERT" | "WARN">("ALERT");
const showTerms = ref(false);

const settings = ref<SettingsForm>({ reminderEnabled: false, dailyTarget: 1 });
const generatedCode = ref<ShareCode | null>(null);
const sharedWithMe = ref<SharedWithMeItem[]>([]);
const sharedByMe = ref<SharedByMeItem[]>([]);
const inputCode = ref("");

const isSettingsSaving = ref(false);
const isGeneratingRole = ref<ShareRole | null>(null);
const isRedeeming = ref(false);
const removingAccessId = ref<string | null>(null);
const togglingNotifId = ref<string | null>(null);
const isPushLoading = ref(false);
const isDeletingAccount = ref(false);

const checkPushStatus = async () => {
  const tokenStatus = await notificationStore.checkSubscriptionStatus();
  isPushEnabled.value = tokenStatus.registered;
  pushPermissionState.value = (tokenStatus.permission || "default") as NotificationPermission | "default";
};

const fetchSettings = async () => {
  try {
    const res = await api.get("/settings");
    if (res.data) settings.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const fetchSharing = async () => {
  try {
    const resMe = await api.get("/share/shared-with-me");
    sharedWithMe.value = resMe.data;
    const resBy = await api.get("/share/shared-by-me");
    sharedByMe.value = resBy.data;
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  await Promise.all([fetchSettings(), fetchSharing()]);
  await checkPushStatus();
});

const saveSettings = async () => {
  if (isSettingsSaving.value) return;
  if (!confirm(t("common.save") + "?")) return;

  isSettingsSaving.value = true;
  try {
    await api.put("/settings", settings.value);
    alert(t("common.updated"));
  } catch (e) {
    alert("Failed to save");
  } finally {
    isSettingsSaving.value = false;
  }
};

const generateCode = async (role: ShareRole) => {
  if (isGeneratingRole.value) return;
  isGeneratingRole.value = role;
  try {
    const res = await api.post("/share/generate", { role });
    generatedCode.value = res.data;
  } catch (e) {
    alert("Error generating code");
  } finally {
    isGeneratingRole.value = null;
  }
};

const redeemCode = async () => {
  if (isRedeeming.value) return;
  try {
    isRedeeming.value = true;
    await api.post("/share/redeem", { code: inputCode.value });
    alert(t("common.created"));
    inputCode.value = "";
    await fetchSharing();
  } catch (e: any) {
    alert(e.response?.data?.error || "Failed to redeem");
  } finally {
    isRedeeming.value = false;
  }
};

const removeAccess = async (id: string) => {
  if (removingAccessId.value) return;
  if (!confirm(t("settings.remove") + "?")) return;

  removingAccessId.value = id;
  try {
    await api.delete(`/share/${id}`);
    await fetchSharing();
  } catch (e) {
    alert("Failed to remove");
  } finally {
    removingAccessId.value = null;
  }
};

const toggleNotifications = async (sharerId: string, currentState: boolean) => {
  if (togglingNotifId.value) return;
  togglingNotifId.value = sharerId;
  try {
    await api.put(`/share/${sharerId}/notifications`, {
      enabled: !currentState,
    });
    await fetchSharing();
  } catch (e) {
    alert("Failed to toggle notifications");
  } finally {
    togglingNotifId.value = null;
  }
};

const handleEnablePush = async () => {
  if (pushPermissionState.value === "denied") {
    alert(
      "Please enable notifications in your browser settings and reload the page.",
    );
    return;
  }
  if (isPushLoading.value) return;
  isPushLoading.value = true;
  try {
    await notificationStore.requestPermission();
    await checkPushStatus();
  } finally {
    isPushLoading.value = false;
  }
};

const handleDisablePush = async () => {
  if (isPushLoading.value) return;
  if (
    !confirm(
      t("settings.disablePushConfirm") ||
        "Are you sure you want to disable notifications?",
    )
  )
    return;
  isPushLoading.value = true;
  try {
    await notificationStore.disableNotifications();
    await checkPushStatus();
  } finally {
    isPushLoading.value = false;
  }
};

const copyToClipboard = async (text: string) => {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  alert(t("common.copied") || "Copied!");
};

const deleteAccount = async () => {
  if (isDeletingAccount.value) return;
  if (!confirm(t("settings.deleteAccountConfirm"))) return;

  const email = authStore.user?.email;
  const confirmation = prompt(`Please type your email (${email}) to confirm deletion:`);
  if (confirmation !== email) {
    alert("Email does not match. Deletion cancelled.");
    return;
  }

  isDeletingAccount.value = true;
  try {
    await api.delete("/users");
    await authStore.logout();
    alert(t("settings.accountDeleted"));
    router.push("/login");
  } catch (e: any) {
    alert(e.response?.data?.message || "Failed to delete account");
  } finally {
    isDeletingAccount.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <main class="space-y-4 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <NotificationSection :is-push-enabled="isPushEnabled" :push-permission-state="pushPermissionState"
        :is-loading="isPushLoading" @enable="handleEnablePush" @disable="handleDisablePush" />

      <ThresholdSection v-model:settings="settings" v-model:active-mode="activeMode" :is-saving="isSettingsSaving"
        @save="saveSettings" />

      <SharingSection v-model:input-code="inputCode" :generated-code="generatedCode" :shared-by-me="sharedByMe"
        :shared-with-me="sharedWithMe" :is-redeeming="isRedeeming" :is-generating-role="isGeneratingRole"
        :removing-access-id="removingAccessId" :toggling-notif-id="togglingNotifId" @generate="generateCode"
        @redeem="redeemCode" @remove="removeAccess" @toggle="toggleNotifications"
        @copy="copyToClipboard" />

      <DangerZoneCard :is-deleting="isDeletingAccount" @delete="deleteAccount" />

      <div class="text-center mt-6 mb-8">
        <button @click="showTerms = true" class="text-sm text-gray-500 hover:text-gray-700 underline">
          {{ t('common.termsOfService') }}
        </button>
      </div>
    </main>
  </div>

  <TermsModal :show="showTerms" :force-accept="false" @close="showTerms = false" />
</template>
