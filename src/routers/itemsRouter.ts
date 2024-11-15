import { Router } from "express";
import items from "../controllers/itemsController"
import { uploadSingleImage, uploadMultipleImages } from "../middlewares/uploadImages";
import { checkToken } from "../middlewares/checkToken";

class itemsRouter {
    public router: Router
    public itmesController: items

    constructor() {
        this.router = Router()
        this.itmesController = new items()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/index/:item_id",
            (req, res) => this.itmesController.index(req, res))
        this.router.post("/store",
            checkToken,
            uploadMultipleImages,
            (req, res) => this.itmesController.store(req, res))
        this.router.post("/update",
            checkToken,
            uploadMultipleImages,
            (req, res) => this.itmesController.update(req, res))
        this.router.get("/show/:id",
            (req, res) => this.itmesController.show(req, res))

    }

}

export default itemsRouter