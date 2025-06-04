import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Sub_title from "../models/Sub_titles";
import Main_titles from "../models/Main_titles";

export default class subTitle {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const whereClause: { main_title_id?: number } = {};
            const mainTitleId = req.query.main_title_id;

            // Add a condition for main_title_id if it exists in the request body
            if (typeof mainTitleId === 'string' && !isNaN(Number(mainTitleId))) {
                whereClause.main_title_id = Number(mainTitleId);
            }

            const query = await Sub_title.findAll({
                attributes: ["id", "main_title_id", "name"],
                where: whereClause,
            })

            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async indexWithMainTitle(req: Request, res: Response) {
        try {
            const query = await Main_titles.findAll({
                include: {
                    model: Sub_title,
                    attributes: ['id', 'main_title_id', 'name'],
                    separate: true, // This allows ordering on the included model
                    order: [["id", "ASC"]] // Specify the order for Sub_title model here
                },
                attributes: ["id", "name"]
            })
            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }
}