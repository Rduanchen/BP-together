# BP-together (Blood Pressure Together)

[English](#english) | [繁體中文](#繁體中文)  


## <a id="english"></a>English

### Introduction
**BP-together** is a blood pressure recording and sharing platform designed for families. We aim to make it easy for the elderly to record their blood pressure data and for family members to stay informed about their health status in real-time.

### Features
- **👨‍👩‍👧‍👦 Family Notifications**: Automatically notify family members after an elder records their blood pressure.
- **👴 Elderly-Friendly Interface**: Designed with a simple, large-font interface for intuitive and burden-free operation.
- **📊 Data Sharing**: Easily share historical blood pressure trends with family or doctors via a simple code mechanism.
- **📈 Trend Analysis**: Automatically generates blood pressure trend charts for at-a-glance health insights.

### Installation

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) Database

#### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/Rduanchen/BP-together.git
   cd BP-together
   ```

2. **Install Dependencies**
   The project includes both frontend and backend. Run the following command in the root directory to install all dependencies:
   ```bash
   npm install
   # This will automatically install packages for both frontend and backend directories
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env` and fill in the required information:
   ```bash
   cp .env.example .env
   # Setup backend env if needed
   cp backend/.env.example backend/.env
   ```

### Firebase Setup
This project uses Firebase for Authentication and Push Notifications. You need to obtain the following credentials for your `.env` file:

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Enable Authentication**: Enable "Email/Password" or "Google" sign-in in the "Authentication" section.
3. **Get Firebase Admin SDK (For Backend)**:
   - Go to **Project Settings** > **Service accounts**.
   - Click **Generate new private key**.
   - Download the JSON file, minify it to a single line string, and set it as `FIREBASE_ACCOUNT` in `.env`.
4. **Get Firebase Config (For Frontend)**:
   - Go to **Project Settings** > **General**.
   - Add a Web app under "Your apps".
   - Copy the `firebaseConfig` object (JSON format), minify it to a single line string, and set it as `VITE_FIREBASE_INIT` in `.env`.
5. **Get VAPID Key (For Push Notifications)**:
   - Go to **Project Settings** > **Cloud Messaging**.
   - Under "Web configuration", click **Generate key pair**.
   - Copy the key and set it as `VITE_VAPID_KEY` in `.env`.

### Commands

| Command          | Description |
|------------------|-------------|
| `npm run dev` | **Development Mode**: Starts both Frontend (Vite) and Backend (Express) development servers concurrently. |
| `npm run build` | **Build**: Compiles both frontend and backend code to the `dist` directory. |
| `npm run start` | **Start Development**: Starts both Frontend (Vite) and Backend (Express) development servers concurrently. |
| `npm start` | **Start Production**: Runs the compiled backend server (requires build first). |
| `npm run deploy` | **Deploy**: Deploys the compiled frontend and backend code to the server.(npm run build && npm run start) |

### Contribution
We welcome contributions of all forms! If you have great ideas or find a bug, please feel free to:
1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


---

## <a id="繁體中文"></a>繁體中文

### 簡介
**BP-together** 是一個專為家庭設計的血壓記錄與分享平台。我們致力於讓長者能夠輕鬆記錄血壓數據，並讓家人即時掌握長輩的健康狀況。

### 特色功能
- **👨‍👩‍👧‍👦 家人通知**：當長輩測量血壓後，系統可自動通知家屬，讓關心零距離。
- **👴 長者友善介面**：專為長輩設計的簡單、大字體介面，操作直覺無負擔。
- **📊 數據分享**：透過簡單的代碼分享機制，家人或醫生可以輕鬆查看歷史血壓趨勢。
- **📈 圖表分析**：自動生成血壓趨勢圖，健康狀況一目瞭然。

### 安裝指南

#### 前置需求
- [Node.js](https://nodejs.org/) (建議 v18 以上)
- [PostgreSQL](https://www.postgresql.org/) 資料庫

#### 步驟
1. **複製專案**
   ```bash
   git clone https://github.com/Rduanchen/BP-together.git
   cd BP-together
   ```

2. **安裝依賴**
   專案包含前端與後端，請在根目錄執行以下指令一次安裝所有依賴：
   ```bash
   npm install
   # 系統會自動進入 frontend 與 backend 資料夾安裝各自的套件
   ```

3. **設定環境變數**
   請複製 `.env.example` 為 `.env` 並填入相應資料：
   ```bash
   cp .env.example .env
   # 若 backend 資料夾內也有 .env 需求，請同樣設定
   cp backend/.env.example backend/.env 
   ```

### Firebase 設定與資料申請
本專案使用 Firebase 進行身份驗證與推播通知，您需要申請以下資料並填入 `.env`：

1. **建立專案**：前往 [Firebase Console](https://console.firebase.google.com/) 建立新專案。
2. **啟用 Authentication**：在 "Authentication" 中啟用 "Email/Password" 或 "Google" 登入。
3. **取得 Firebase Admin SDK (後端用)**：
   - 進入 **專案設定 (Project Settings)** > **服務帳戶 (Service accounts)**。
   - 點擊 **產生新的私密金鑰 (Generate new private key)**。
   - 下載 JSON 檔案，將其內容壓縮為一行字串，填入 `.env` 的 `FIREBASE_ACCOUNT`。
4. **取得 Firebase Config (前端用)**：
   - 進入 **專案設定 (Project Settings)** > **一般 (General)**。
   - 在 "您的應用程式" 下新增 Web 應用程式。
   - 複製 `firebaseConfig` 物件內容 (JSON 格式)，壓縮為一行字串，填入 `.env` 的 `VITE_FIREBASE_INIT`。
5. **取得 VAPID Key (推播通知用)**：
   - 進入 **專案設定 (Project Settings)** > **雲端通訊 (Cloud Messaging)**。
   - 在 "Web 設定 (Web configuration)" 區塊，點擊 **Generate key pair**。
   - 複製該 Key 填入 `.env` 的 `VITE_VAPID_KEY`。

### 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | **開發模式**：同時啟動前端 (Vite) 與後端 (Express) 開發伺服器。 |
| `npm run build` | **建置專案**：編譯前端與後端程式碼至 `dist` 目錄。 |
| `npm run start` | **開發模式啟動**：同時啟動前端 (Vite) 與後端 (Express) 開發伺服器。 |
| `npm start` | **生產模式啟動**：執行編譯後的後端伺服器 (需先執行 build)。 |
| `npm run deploy` | **部署專案**：執行編譯後的前端與後端程式碼至 `dist` 目錄。 |

### 參與貢獻
我們非常歡迎任何形式的貢獻！如果您有好的想法或發現 Bug，請隨時：
1. Fork 本專案
2. 建立您的 Feature Branch (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到 Branch (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

