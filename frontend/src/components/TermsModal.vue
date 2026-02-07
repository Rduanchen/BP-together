<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    forceAccept?: boolean;
    show?: boolean;
}>();

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const { t, locale } = useI18n();

const accept = async () => {
    try {
        await authStore.acceptTerms();
        emit('close');
    } catch (e) {
        alert("Failed to accept terms. Please try again.");
    }
};

const close = () => {
    emit('close');
}

// Hardcoded Terms for now as requested
const termsTitle = "BP Together (血壓好幫手) 服務條款與隱私權保護政策";
const termsContent = `
歡迎下載並使用 BP Together (血壓好幫手)（以下簡稱「本服務」）。本服務是由學生開發者（以下簡稱「開發者」）基於公益目的製作。

當您開始使用本服務時，即視為您已充分閱讀、瞭解並同意接受本服務條款及隱私權保護政策之全部內容。

一、 隱私權保護政策的適用範圍
本政策內容涵蓋本服務在您使用 App 時，所蒐集到的個人識別資料及生理量測紀錄。此政策不適用於本服務以外的相關連結網站，亦不適用於非本服務所委託或參與管理的人員。

二、 個人資料的蒐集、處理及利用方式
蒐集目的：僅供使用者進行個人健康管理（血壓、心率紀錄）及統計分析之公益用途。

資料類別：包括但不限於血壓數值、心率、測量時間及您自願輸入的備註資訊。

利用方式：本服務之後端系統部署於 Railway.com 平台。除非取得您的同意或其他法令之特別規定，本服務絕不會將您的資料用於蒐集目的以外之用途。

三、 資料之保護
加密傳輸：本服務所有資料傳輸均採用 HTTPS (SSL/TLS) 加密技術，確保資料在您的裝置與 Railway 伺服器傳遞過程中的安全性。

安全性措施：資料儲存於受保護的資料庫系統中，並採取技術上之必要措施防止個人資料被竊取、竄改、毀損或洩漏。

免責聲明：本服務為學生公益性質作品，開發者雖盡力維護系統穩定，但對於因第三方平台（如 Railway）故障、硬體毀損、程式錯誤或不可抗力因素導致之資料遺失、損壞，開發者不負法律賠償責任。

四、 網站對外的相關連結
本服務可能包含其他網站或服務的連結。若您經由連結至第三人網站，該網站不適用本服務的隱私權政策，您必須參考該連結網站中的隱私權保護政策。

五、 與第三人共用個人資料之政策
本服務絕不會提供、交換、出租或出售您的個資給任何個人或團體，除非具備法律依據（如法院要求）或為免除您生命、身體之危險。

六、 Cookie 與儲存技術之使用
為了維持服務連線之穩定性與身分驗證，本服務可能會於您的裝置中寫入並讀取 Cookie 或使用本地儲存空間（Local Storage）。這些技術主要用於儲存您的登入狀態或偏好設定。若您拒絕此技術，可能會導致 App 部分功能無法正常執行。

七、 服務終止、資料匯出與政策修正
停止服務權：因本服務屬非營利公益性質，開發者保留隨時修改、暫停或永久終止服務之權利。

資料備份義務：本服務提供資料匯出功能。若開發者決定停止服務，將提前於 App 內公告，使用者應於期限內自行匯出紀錄備份，逾期未備份導致資料刪除者，開發者不負賠償責任。

使用限制：本服務 API 僅供本 App 呼叫，嚴禁任何未經授權之第三方串接或將本服務用於商業營利目的。

條款修正：本政策將因應需求隨時修正，修正後之條款將即時刊登於 App 或官方頁面。

開發者聯絡資訊 chenyouduan@gmail.com
`;
</script>

<template>
    <div v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div class="p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900">{{ termsTitle }}</h3>
            </div>

            <div class="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 leading-relaxed flex-1">
                {{ termsContent }}
            </div>

            <div class="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button v-if="!forceAccept" @click="close"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                    {{ t('common.close') }}
                </button>
                <button v-if="forceAccept" @click="accept"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">
                    {{ t('common.agreeAndContinue') }}
                </button>
            </div>
        </div>
    </div>
</template>
