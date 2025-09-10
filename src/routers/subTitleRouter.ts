import { Router } from "express";
import subTitle from "../controllers/subTitleController"

class subTitleRouter {
    public router: Router
    public subTitleController: subTitle

    constructor() {
        this.router = Router()
        this.subTitleController = new subTitle()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/unitTest",
            (req, res) => this.subTitleController.unitTest(req, res))

        this.router.get("/index",
            (req, res) => this.subTitleController.index(req, res))
        this.router.get("/indexWithMainTitle",
            (req, res) => this.subTitleController.indexWithMainTitle(req, res))

    }

}

export default subTitleRouter