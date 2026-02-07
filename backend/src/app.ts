import express from 'express';
import cors from 'cors';
import helmet, { crossOriginEmbedderPolicy, crossOriginOpenerPolicy } from 'helmet';
import path from 'path';
import routes from './routes';
const app = express();
const isProd = process.env.NODE_ENV === 'production';

// --- 安全性與跨域設定 ---

const helmetConfig = {
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "connect-src": [
                "'self'",
                "http://localhost:*",
                "ws://localhost:*",
                "https://identitytoolkit.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://*.googleapis.com",
                "https://*.gstatic.com"
            ],
            "script-src": [
                "'self'",
                "https://apis.google.com",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://accounts.google.com",
                "'unsafe-inline'"
            ],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "data:", "blob:"],
            "frame-src": [
                "'self'",
                "https://accounts.google.com",
                "https://*.firebaseapp.com",
                "https://*.web.app",
                "https://*.google.com"
            ],
        },
    },
};

if (isProd) {
    app.use(cors());
    app.use(helmet(helmetConfig));
} else {
    app.use(cors({
        origin: true, // 開發環境允許所有來源或指定 http://localhost:5173
        credentials: true,
    }));
    app.use(helmet(helmetConfig));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 路由設定 ---

// 1. API 路由
app.use('/api', routes);

// 2. 健康檢查
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', mode: process.env.NODE_ENV });
});



const staticPath = path.join(__dirname, '../../frontend/dist');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));


app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});


export default app;