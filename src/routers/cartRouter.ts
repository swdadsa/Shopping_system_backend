import { Router } from "express";
import cart from "../controllers/cartController"
import { checkToken } from "../middlewares/checkToken";

class cartRouter {
    public router: Router
    public cartController: cart

    constructor() {
        this.router = Router()
        this.cartController = new cart()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.post("/store",
            checkToken,
            (req, res) => this.cartController.store(req, res))
        this.router.get("/show",
            checkToken,
            (req, res) => this.cartController.show(req, res))
        this.router.patch("/update",
            checkToken,
            (req, res) => this.cartController.update(req, res))
        this.router.delete("/delete",
            checkToken,
            (req, res) => this.cartController.destroy(req, res))
    }

}

export default cartRouter