import { Router } from "express";
import advertisement from "../controllers/advertisementController"
import { uploadSingleImage, uploadMultipleImages } from "../middlewares/uploadImages";
import { checkToken } from "../middlewares/checkToken";

class advertisementRouter {
    public router: Router
    public advertisementController: advertisement

    constructor() {
        this.router = Router()
        this.advertisementController = new advertisement()
        this.routerEnable()
    }

    private routerEnable() {
        this.router.get("/unitTest",
            (req, res) => this.advertisementController.unitTest(req, res))

        this.router.get("/index",
            (req, res) => this.advertisementController.index(req, res))
        this.router.post("/store",
            checkToken,
            uploadSingleImage,
            (req, res) => this.advertisementController.store(req, res))
        this.router.patch("/update",
            checkToken,
            uploadSingleImage,
            (req, res) => this.advertisementController.update(req, res))
        this.router.delete("/delete",
            checkToken,
            (req, res) => this.advertisementController.destroy(req, res))

    }

}

export default advertisementRouter