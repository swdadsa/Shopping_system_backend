import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { defaultRoute } from "./src/routers/router";
import { getRedisStub } from "./src/tests/helpers/redisStub";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : undefined });

const app: Express = express();

app.use(cors());
app.use(helmet());

app.locals.redis = getRedisStub();

app.use("/api", defaultRoute);

export default app;
