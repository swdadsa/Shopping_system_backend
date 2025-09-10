import { Router } from "express";
import mainTitle from "../controllers/mainTitleController"

class mainTitleRouter {
    public router: Router
    public mainTitleController: mainTitle

    constructor() {
        this.router = Router()
        this.mainTitleController = new mainTitle()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/unitTest",
            (req, res) => this.mainTitleController.unitTest(req, res))

        this.router.get("/index",
            (req, res) => this.mainTitleController.index(req, res))

    }

}

export default mainTitleRouter