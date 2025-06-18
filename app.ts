// app.ts
import express, { Express } from 'express'
import { defaultRoute } from './src/routers/router'
import helmet from "helmet";
import dotenv from 'dotenv';
import cors from 'cors';
import { initRedis } from './src/middlewares/redisClient';

dotenv.config();

const port = process.env.SERVER_PORT;
const app: Express = express();

// 設定cors和helmet
app.use(cors());
app.use(helmet());

// 建立 Redis client 並連線
initRedis(app);

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
