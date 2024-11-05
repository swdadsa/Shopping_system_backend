import { Request, Response, Router } from "express";
import account from "../controllers/accountController"

class accoutRouter {
    public router: Router
    public accountController: account

    constructor() {
        this.router = Router()
        this.accountController = new account()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.post("/signIn", (req, res) => this.accountController.signIn(req, res))
        this.router.post("/signUp", (req, res) => this.accountController.signUp(req, res))
        this.router.post("/checkToken", (req, res) => this.accountController.checkToken(req, res))
    }

}

export default accoutRouter