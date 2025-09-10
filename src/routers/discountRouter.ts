import { Router } from "express";
import discount from "../controllers/discountController"
import { checkToken } from "../middlewares/checkToken";
import {
    validateIndex
} from "../middlewares/validationMiddleware/discountValidator";

class discountRouter {
    public router: Router
    public discountController: discount

    constructor() {
        this.router = Router()
        this.discountController = new discount()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/unitTest",
            (req, res) => this.discountController.unitTest(req, res))

        this.router.get("/index",
            validateIndex,
            (req, res) => this.discountController.index(req, res))
        this.router.get("/show",
            (req, res) => this.discountController.show(req, res))
        this.router.post("/store",
            checkToken,
            (req, res) => this.discountController.store(req, res))
        this.router.delete("/deleteDiscount",
            checkToken,
            (req, res) => this.discountController.destroy(req, res))

    }

}

export default discountRouter