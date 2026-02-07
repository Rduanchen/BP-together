import * as admin from 'firebase-admin';

// 不要在此處直接 parse，改放在一個 function 裡或檢查時再做
const initializeFirebase = () => {
    if (admin.apps.length) return admin;

    const rawData = process.env.FIREBASE_ACCOUNT;

    if (!rawData) {
        console.error('❌ 錯誤：找不到環境變數 FIREBASE_ACCOUNT');
        return null;
    }

    try {
        const serviceAccount = JSON.parse(rawData);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin 成功初始化');
    } catch (error) {
        console.error('❌ Firebase 解析或初始化失敗:', (error as Error).message);
    }
    return admin;
};

// 執行初始化
initializeFirebase();

export default admin;