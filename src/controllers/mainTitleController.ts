import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Main_title from "../models/Main_titles";

export default class mainTitle {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const query = await Main_title.findAll({
                attributes: ["id", "name"]
            })
            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }

    }
}