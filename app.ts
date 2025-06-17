// app.ts
import express, { Express } from 'express'
import { defaultRoute } from './src/routers/router'
import helmet from "helmet";
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from "redis";

dotenv.config();

const port = process.env.SERVER_PORT;
const app: Express = express();

// 設定cors和helmet
app.use(cors());
app.use(helmet());

// 建立 Redis client 並連線
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect()
    .then(() => console.log('Redis connected'))
    .catch((err) => {
        console.error('Redis connection error:', err);
        process.exit(1);
    });

// 儲存 Redis client 到 app.locals
app.locals.redis = redisClient;

// 使用 API 路由
app.use("/api", defaultRoute);

// 圖片服務
app.use("/images", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
}, express.static(__dirname + '/src/images'));

// 啟動 Server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
