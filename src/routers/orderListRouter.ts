import { Router } from "express";
import orderList from "../controllers/orderListController"
import { checkToken } from "../middlewares/checkToken";

class orderListRouter {
    public router: Router
    public orderListController: orderList

    constructor() {
        this.router = Router()
        this.orderListController = new orderList()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/index/:user_id",
            checkToken,
            (req, res) => this.orderListController.index(req, res))
        this.router.get("/indexDetail/:order_list_id",
            checkToken,
            (req, res) => this.orderListController.indexDetail(req, res))

    }

}

export default orderListRouter