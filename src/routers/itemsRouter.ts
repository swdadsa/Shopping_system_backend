import { Router } from "express";
import items from "../controllers/itemsController"
import { uploadSingleImage, uploadMultipleImages } from "../middlewares/uploadImages";
import { checkToken } from "../middlewares/checkToken";
import { validateItemIndex, validateItemShow, validateItemStore, validateItemUpdate } from "../middlewares/validationMiddleware/itemValidator";

class itemsRouter {
    public router: Router
    public itmesController: items

    constructor() {
        this.router = Router()
        this.itmesController = new items()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/index",
            validateItemIndex,
            (req, res) => this.itmesController.index(req, res))
        this.router.post("/store",
            checkToken,
            uploadMultipleImages,
            validateItemStore,
            (req, res) => this.itmesController.store(req, res))
        this.router.post("/update",
            checkToken,
            uploadMultipleImages,
            validateItemUpdate,
            (req, res) => this.itmesController.update(req, res))
        this.router.get("/show",
            validateItemShow,
            (req, res) => this.itmesController.show(req, res))

    }

}

export default itemsRouter