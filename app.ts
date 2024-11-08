import express, { Express } from 'express'
import { defaultRoute } from './src/routers/router'
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.SERVER_PORT; // 使用預設值 80
const app: Express = express();

let Dates = new Date;
app.use("/api", defaultRoute);
console.log(Dates.getFullYear() + '-' + (Dates.getMonth() + 1) + '-' + Dates.getDate() + ' ' + Dates.getHours() + ':' + Dates.getMinutes())

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
});
