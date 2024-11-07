import express, { Express, Router } from "express";
import accountRouter from "./accountRouter";

const defaultRoute = Router();
const classAccountRouter = new accountRouter()

defaultRoute.use("/account", express.json(), classAccountRouter.router)


export { defaultRoute };