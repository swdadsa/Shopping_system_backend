import { Router } from "express";
import orderList from "../controllers/orderListController"
import { checkToken } from "../middlewares/checkToken";
import { validateOrderListChangeCondition, validateOrderListIndex, validateOrderListIndexDetail } from "../middlewares/validationMiddleware/orderListValidator";

class orderListRouter {
    public router: Router
    public orderListController: orderList

    constructor() {
        this.router = Router()
        this.orderListController = new orderList()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/unitTest",
            (req, res) => this.orderListController.unitTest(req, res))

        this.router.get("/index",
            checkToken,
            validateOrderListIndex,
            (req, res) => this.orderListController.index(req, res))
        this.router.get("/indexDetail",
            checkToken,
            validateOrderListIndexDetail,
            (req, res) => this.orderListController.indexDetail(req, res))
        this.router.patch("/changeCondition",
            checkToken,
            validateOrderListChangeCondition,
            (req, res) => this.orderListController.changeCondition(req, res))

    }

}

export default orderListRouter