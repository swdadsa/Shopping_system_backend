import { Router } from "express";
import cart from "../controllers/cartController"
import { checkToken } from "../middlewares/checkToken";
import {
    validateCartDelete,
    validateCartShow,
    validateCartStore,
    validateCartSubmit,
    validateCartUpdate
} from "../middlewares/validationMiddleware/cartValidator";

class cartRouter {
    public router: Router
    public cartController: cart

    constructor() {
        this.router = Router()
        this.cartController = new cart()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/unitTest",
            (req, res) => this.cartController.unitTest(req, res))

        this.router.post("/store",
            checkToken,
            validateCartStore,
            (req, res) => this.cartController.store(req, res))
        this.router.get("/show",
            checkToken,
            validateCartShow,
            (req, res) => this.cartController.show(req, res))
        this.router.patch("/update",
            checkToken,
            validateCartUpdate,
            (req, res) => this.cartController.update(req, res))
        this.router.delete("/delete",
            checkToken,
            validateCartDelete,
            (req, res) => this.cartController.destroy(req, res))
        this.router.post("/submit",
            checkToken,
            validateCartSubmit,
            (req, res) => this.cartController.submit(req, res))
    }

}

export default cartRouter