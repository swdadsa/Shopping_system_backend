import express, { Express, Router } from "express";
import accountRouter from "./accountRouter";
import mainTitleRouter from "./mainTitleRouter";
import subTitleRouter from "./subTitleRouter";

const defaultRoute = Router();
const classAccountRouter = new accountRouter()
const classmainTitleRouter = new mainTitleRouter()
const classsubTitleRouter = new subTitleRouter()

defaultRoute.use("/account", express.json(), classAccountRouter.router)
defaultRoute.use("/mainTitle", express.json(), classmainTitleRouter.router)
defaultRoute.use("/subTitle", express.json(), classsubTitleRouter.router)


export { defaultRoute };