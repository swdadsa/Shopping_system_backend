import { Request, Response, Router } from "express";
import account from "../controllers/accountController"
import { validateSignIn, validateSignUp, validateDeleteAccount } from "../middlewares/validationMiddleware/accountValidator";

class accountRouter {
    public router: Router
    public accountController: account

    constructor() {
        this.router = Router()
        this.accountController = new account()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.post("/signIn",
            validateSignIn,
            (req, res) => this.accountController.signIn(req, res))
        this.router.post("/signUp",
            validateSignUp,
            (req, res) => this.accountController.signUp(req, res))
        this.router.post("/signOut", (req, res) => this.accountController.signOut(req, res))
        this.router.post("/checkToken", (req, res) => this.accountController.checkToken(req, res))
        this.router.delete("/deleteAccount",
            validateDeleteAccount,
            (req, res) => this.accountController.deleteAccount(req, res))
    }

}

export default accountRouter