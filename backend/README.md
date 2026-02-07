# BP Together 血壓好幫手

[English](#Features) | [中文](#血壓好幫手)


The backend service for the Blood Pressure Monitor application. Built with Express, TypeScript, Prisma (PostgreSQL), and Firebase Admin.

## Features

- **REST API**: Providing endpoints for users, records, sharing features and settings.
- **Database**: PostgreSQL managed via Prisma ORM.
- **Authentication**: Firebase Authentication verification middleware.
- **Notifications**: Firebase Cloud Messaging (FCM) integration for push notifications.
- **Scheduled Tasks**: Cron jobs for reminders and maintenance.

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database (Local or Cloud like Railway/Supabase)
- Firebase Project (Service Account)

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**

   Create a `.env` file in the root directory. You can use the example below:

   ```bash
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/bloodpressure"

   # Firebase Service Account (JSON string)
   # Must include type, project_id, private_key, client_email, etc.
   FIREBASE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
   ```

   > **Important for `FIREBASE_ACCOUNT`**:
   > Since `.env` files don't support multi-line JSON easily, you must condense your `serviceAccountKey.json` into a single line string.
   > Escape any newlines in the private key (`\n`).

3. **Database Migration**

   Sync your database schema with Prisma:

   ```bash
   npx prisma migrate dev
   # OR for production/cloud
   npx prisma db push
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`.

## Deployment

### Deploy to Railway (Recommended)

1.  Connect your GitHub repository to Railway.
2.  Add a PostgreSQL database service.
3.  Set the Environment Variables in Railway:
    -   `DATABASE_URL`: (Railway will often provide this automatically or you link it)
    -   `FIREBASE_ACCOUNT`: Paste the minified JSON string of your service account.
    -   `PORT`: `3000` (or let Railway assign one via `$PORT`).
4.  Build Command: `npm run build`
5.  Start Command: `npm run start`

## Contribution

We welcome contributions! Please follow these steps:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.


# 血壓好幫手

這是一個血壓監測系統的後端應用程式。使用 Express、TypeScript、Prisma (PostgreSQL) 和 Firebase Admin 建置。

## 功能

- **REST API**: 提供使用者、記錄、分享功能和設定的端點。
- **資料庫**: 使用 Prisma ORM 管理 PostgreSQL。
- **身分驗證**: Firebase Authentication 驗證中間件。
- **通知**: Firebase Cloud Messaging (FCM) 整合，用於推播通知。
- **排程任務**: Cron job，用於提醒和維護。

## 先決條件

- Node.js (v18+)
- PostgreSQL 資料庫 (本機或雲端如 Railway/Supabase)
- Firebase 專案 (服務帳號)

## 設定

1. **安裝相依套件**

   ```bash
   npm install
   ```

2. **環境變數**

   在根目錄建立一個 `.env` 檔案。您可以使用以下範例：

   ```bash
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/bloodpressure"

   # Firebase 服務帳號 (JSON 字串)
   # 必須包含 type、project_id、private_key、client_email 等
   FIREBASE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
   ```

   > **重要：`FIREBASE_ACCOUNT`**
   > 由於 `.env` 檔案不支援多行 JSON，您必須將 `serviceAccountKey.json` 壓縮成單行字串。
   > 轉義私鑰中的任何換行符 (`\n`)。

3. **資料庫遷移**

   使用 Prisma 同步您的資料庫結構：

   ```bash
   npx prisma migrate dev
   # 或用於生產/雲端
   npx prisma db push
   ```

4. **執行開發伺服器**

   ```bash
   npm run dev
   ```

   伺服器將在 `http://localhost:3000` 啟動。

## 部署

### 部署到 Railway (推薦)

1.  將您的 GitHub 儲存庫連接到 Railway。
2.  新增一個 PostgreSQL 資料庫服務。
3.  在 Railway 中設定環境變數：
    -   `DATABASE_URL`: (Railway 通常會自動提供或您將其連結)
    -   `FIREBASE_ACCOUNT`: 貼上您的服務帳號的最小化 JSON 字串。
    -   `PORT`: `3000` (或讓 Railway 透過 `$PORT` 分配一個)。
4.  建置指令: `npm run build`
5.  啟動指令: `npm run start`

## Contribution

Welcome contributions! Please follow these steps:

1.  Fork 專案。
2.  建立您的功能分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的變更 (`git commit -m 'Add some AmazingFeature'`)。
4.  推送到分支 (`git push origin feature/AmazingFeature`)。
5.  開啟 Pull Request。

