# BP Together 血壓好朋友
<div align="center">
 <img src="./public/logo.png" width="360" />
</div>



![logo](./public/logo.png)

[English](#Features) | [繁體中文](#血壓好幫手)


The frontend application for the Blood Pressure Monitor system. Built with Vue 3, Vite, TailwindCSS, and Firebase.

## Features

- **Modern UI**: Clean and responsive design using TailwindCSS.
- **Data Visualization**: Charts and records for blood pressure history.
- **PWA Capabilities**: (Optional) Service Worker support for installable app feel (if enabled).
- **Push Notifications**: Integrated with Firebase Cloud Messaging (FCM).
- **Internationalization**: Support for Multiple languages (e.g., zh-TW).
- **Terms & Privacy**: Built-in modal for user agreements.


<div align="center">
  <img src="https://github.com/user-attachments/assets/cf7bacfc-31bf-45f4-9548-29a0054f74fa" width="360" />
  <img src="https://github.com/user-attachments/assets/1e523454-8994-45a3-84c1-a7b5fe7aa4b9" width="360" />
</div>



## Prerequisites

- Node.js (v18+)
- Backend service running (local or remote)

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**

   Create a `.env` file in the root directory. You can use the example below:

   ```bash
   # Connect to your backend API
   VITE_API_URL=http://localhost:3000

   # Firebase Push Certificate Key (Web Push Certificate from Firebase Console -> Project Settings -> Cloud Messaging)
   VITE_VAPID_KEY=your_vapid_key_string

   # Firebase Client Config (JSON string)
   # Get this from Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration (Config, not CDN)
   VITE_FIREBASE_INIT='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}'
   ```

   > **Important**:
   > Ensure `VITE_FIREBASE_INIT` is valid JSON format compressed into a single line string.

3. **Run Development Server**

   ```bash
   npm run dev
   ```

   The app will start at `http://localhost:5173` (by default).

## Deployment

### Deploy to Vercel / Netlify / Static Hosting

1.  Build the project:
    ```bash
    npm run build
    ```
    This generates a `dist` folder containing the static assets.

2.  Deploy the `dist` folder to your hosting provider.

3.  **Environment Variables**:
    Ensure you set the same environment variables (`VITE_API_URL`, `VITE_VAPID_KEY`, `VITE_FIREBASE_INIT`) in your hosting provider's dashboard.

## Contribution

We welcome contributions! Please follow these steps:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.



# 血壓好幫手

這是一個血壓監測系統的前端應用程式。使用 Vue 3、Vite、TailwindCSS 和 Firebase 建置。

## 功能

- **現代 UI**: 使用 TailwindCSS 建立乾淨且響應式的設計。
- **資料視覺化**: 顯示血壓歷史記錄的圖表和記錄。
- **PWA 功能**: (可選) Service Worker 支援，提供可安裝的應用程式體驗 (如果已啟用)。
- **推播通知**: 與 Firebase Cloud Messaging (FCM) 整合。
- **國際化**: 支援多種語言 (例如 zh-TW)。
- **條款與隱私**: 內建使用者協議 Modal。

## 先決條件

- Node.js (v18+)
- 後端服務正在執行 (本機或遠端)

## 設定

1. **安裝相依套件**

   ```bash
   npm install
   ```

2. **環境變數**

   在根目錄建立一個 `.env` 檔案。您可以使用以下範例：

   ```bash
   # 連線到您的後端 API
   VITE_API_URL=http://localhost:3000

   # Firebase 推播憑證金鑰 (從 Firebase Console -> 專案設定 -> Cloud Messaging 取得 Web Push 憑證)
   VITE_VAPID_KEY=your_vapid_key_string

   # Firebase 用戶端設定 (JSON 字串)
   # 從 Firebase Console -> 專案設定 -> 一般 -> 您的應用程式 -> SDK 設定與配置 (Config，不是 CDN) 取得
   VITE_FIREBASE_INIT='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}'
   ```

   > **重要**:
   > 請確保 `VITE_FIREBASE_INIT` 是有效的 JSON 格式並壓縮成單行字串。

3. **執行開發伺服器**

   ```bash
   npm run dev
   ```

   應用程式將在 `http://localhost:5173` (預設) 啟動。

## 部署

### 部署到 Vercel / Netlify / 靜態主機

1.  建置專案：
    ```bash
    npm run build
    ```
    這將產生一個包含靜態資產的 `dist` 資料夾。

2.  將 `dist` 資料夾部署到您的主機提供者。

3.  **環境變數**:
    請確保在主機提供者的儀表板中設定相同的環境變數 (`VITE_API_URL`, `VITE_VAPID_KEY`, `VITE_FIREBASE_INIT`)。

## 貢獻

歡迎貢獻！請遵循以下步驟：

1.  Fork 專案。
2.  建立您的功能分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的變更 (`git commit -m 'Add some AmazingFeature'`)。
4.  推送到分支 (`git push origin feature/AmazingFeature`)。
5.  開啟 Pull Request。

