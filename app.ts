import express, { Express } from 'express'
import { defaultRoute } from './src/routers/router'
import helmet from "helmet";
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();

const port = process.env.SERVER_PORT;
const app: Express = express();

app.use(cors())
// helmet tool, add security headers
app.use(helmet());
// serve api
app.use("/api", defaultRoute);
// serve image
app.use("/images", express.static(__dirname + '/src/images'));

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
});
