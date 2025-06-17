import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Discount from "../models/Discount";
import { Op } from "sequelize";

export default class discount {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const query = await Discount.findAll(
                {
                    attributes: ["id", "item_id", "discountPercent", "startAt", "endAt"]
                }
            )

            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error: ' + (error instanceof Error ? error.message : String(error))));
        }
    }

    // 以item_id為主鍵查詢
    async show(req: Request, res: Response) {
        try {
            const whereClause: any = {};
            const item_id = req.query.item_id;
            const date = req.query.date;

            if (date) {
                // 讓查詢判斷是否 date 在 startAt 和 endAt 區間內
                whereClause.startAt = { [Op.lte]: new Date(date as string) };
                whereClause.endAt = { [Op.gte]: new Date(date as string) };
            }

            if (item_id) {
                whereClause.item_id = Number(item_id);
            }

            const query = await Discount.findOne({
                where: whereClause
            });

            res.send(this.apiResponse.response(true, query));
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error: ' + (error instanceof Error ? error.message : String(error))));
        }
    }

    // 新增優惠券
    async store(req: Request, res: Response) {
        try {
            const { item_id, discountPercent, startAt, endAt } = req.body
            const query = await Discount.create({
                "item_id": item_id,
                "discountPercent": discountPercent,
                "startAt": startAt,
                "endAt": endAt
            })

            if (query) {
                res.send(this.apiResponse.response(true, 'add discount successfully'))
            } else {
                res.status(500).send(this.apiResponse.response(false, 'add discount failed'))
            }

        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error: ' + (error instanceof Error ? error.message : String(error))));
        }
    }

    // 刪除優惠券
    async destroy(req: Request, res: Response) {
        try {
            const query = await Discount.destroy({
                where: {
                    "id": Number(req.query.id)
                }
            })

            if (query) {
                res.send(this.apiResponse.response(true, 'delete discount successfully'))
            } else {
                res.status(500).send(this.apiResponse.response(false, 'delete discount failed'))
            }
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error: ' + (error instanceof Error ? error.message : String(error))));
        }
    }

}