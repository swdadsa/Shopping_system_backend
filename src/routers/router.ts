import express, { Express, Router } from "express";
import accountRouter from "./accountRouter";
import mainTitleRouter from "./mainTitleRouter";
import subTitleRouter from "./subTitleRouter";
import itemsRouter from "./itemsRouter";
import cartRouter from "./cartRouter";
import orderListRouter from "./orderListRouter";

const defaultRoute = Router();
const classAccountRouter = new accountRouter()
const classMainTitleRouter = new mainTitleRouter()
const classSubTitleRouter = new subTitleRouter()
const classItemsRouter = new itemsRouter()
const classCartRouter = new cartRouter()
const classOrderListRouter = new orderListRouter()

defaultRoute.use("/account", express.json(), classAccountRouter.router)
defaultRoute.use("/mainTitle", express.json(), classMainTitleRouter.router)
defaultRoute.use("/subTitle", express.json(), classSubTitleRouter.router)
defaultRoute.use("/items", express.json(), classItemsRouter.router)
defaultRoute.use("/cart", express.json(), classCartRouter.router)
defaultRoute.use("/orderList", express.json(), classOrderListRouter.router)


export { defaultRoute };