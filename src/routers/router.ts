import { Router } from "express";
import accountRouter from "./accountRouter";

const defaultRoute = Router();
const classAccountRouter = new accountRouter()

defaultRoute.use("/account", classAccountRouter.router)


export { defaultRoute };