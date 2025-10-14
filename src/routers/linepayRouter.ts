import { Router } from "express";
import linePayRequest from "../controllers/linePayController"

class linepayRouter {
    public router: Router
    public linePayController: linePayRequest

    constructor() {
        this.router = Router()
        this.linePayController = new linePayRequest()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.post("/request",
            (req, res) => this.linePayController.sendingRequest(req, res))
        this.router.get("/confirm",
            (req, res) => this.linePayController.confirm(req, res))
        this.router.get("/check",
            (req, res) => this.linePayController.check(req, res))
        this.router.get("/cancel",
            (req, res) => { res.send("已取消付款") })

    }

}

export default linepayRouter