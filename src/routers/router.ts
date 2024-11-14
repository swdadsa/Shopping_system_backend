import express, { Express, Router } from "express";
import accountRouter from "./accountRouter";
import mainTitleRouter from "./mainTitleRouter";
import subTitleRouter from "./subTitleRouter";
import itemsRouter from "./itemsRouter";
import cartRouter from "./cartRouter";

const defaultRoute = Router();
const classAccountRouter = new accountRouter()
const classmainTitleRouter = new mainTitleRouter()
const classsubTitleRouter = new subTitleRouter()
const classItemsRouter = new itemsRouter()
const classcartRouter = new cartRouter()

defaultRoute.use("/account", express.json(), classAccountRouter.router)
defaultRoute.use("/mainTitle", express.json(), classmainTitleRouter.router)
defaultRoute.use("/subTitle", express.json(), classsubTitleRouter.router)
defaultRoute.use("/items", express.json(), classItemsRouter.router)
defaultRoute.use("/cart", express.json(), classcartRouter.router)


export { defaultRoute };