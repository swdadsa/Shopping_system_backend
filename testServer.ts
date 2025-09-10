import express, { Express } from 'express';
import { defaultRoute } from './src/routers/router';
import helmet from "helmet";
import dotenv from 'dotenv';
import cors from 'cors';
import { initRedis } from './src/middlewares/redisClient';

dotenv.config();

const app: Express = express();


// 使用 API 路由
app.use("/api", defaultRoute);


export default app;  // export 出去，給測試用
