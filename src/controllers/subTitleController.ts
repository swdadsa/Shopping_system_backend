import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Sub_title from "../models/Sub_titles";
import Main_titles from "../models/Main_titles";

export default class subTitle {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const query: any = await Sub_title.findAll({
                attributes: ["id", "main_title_id", "name"]
            })
            res.send(this.apiResponse.response(true, query))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async indexWithMainTitle(req: Request, res: Response) {
        try {
            Main_titles.hasMany(Sub_title, {
                foreignKey: "main_title_id"
            })

            const query: any = await Main_titles.findAll({
                include: {
                    model: Sub_title,
                    attributes: ['id', 'main_title_id', 'name'],
                    separate: true, // This allows ordering on the included model
                    order: [["id", "ASC"]] // Specify the order for Sub_title model here
                },
                attributes: ["id", "name"]
            })
            res.send(this.apiResponse.response(true, query))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }
}