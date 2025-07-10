import { Router } from "express";
import account from "../controllers/accountController"
import {
    validateSignIn,
    validateSignUp,
    validateSignOut,
    validateDeleteAccount,
    validateProfiles,
    validateUpdateProfiles,
    validateUpdatePassword
} from "../middlewares/validationMiddleware/accountValidator";
import { checkToken } from "../middlewares/checkToken";
import { checkRole } from "../middlewares/checkRole";

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
        this.router.post("/signOut",
            validateSignOut,
            (req, res) => this.accountController.signOut(req, res))
        this.router.delete("/deleteAccount",
            validateDeleteAccount,
            (req, res) => this.accountController.deleteAccount(req, res))
        this.router.get("/list",
            checkToken,
            checkRole(["manager"]),
            (req, res) => this.accountController.list(req, res))
        this.router.get("/profiles",
            checkToken,
            validateProfiles,
            (req, res) => this.accountController.profiles(req, res))
        this.router.patch("/updateProfiles",
            checkToken,
            validateUpdateProfiles,
            (req, res) => this.accountController.updateProfiles(req, res))
        this.router.patch("/updatePassword",
            checkToken,
            validateUpdatePassword,
            (req, res) => this.accountController.updatePassword(req, res))
        this.router.get("/verifyAccount",
            (req, res) => this.accountController.verifyAccount(req, res))
    }

}

export default accountRouter