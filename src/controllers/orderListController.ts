import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Order_list from "../models/Order_list";
import Order_list_detail from "../models/Order_list_detail";
import Item_images from "../models/Item_images";


export default class orderList {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const query: any = await Order_list.findAll({
                attributes: ["id", "order_unique_number", "condition", "total_price"],
                where: {
                    "user_id": req.params.user_id
                }
            })
            res.send(this.apiResponse.response(true, query))
        } catch (error: any) {
            res.status(500).send(this.apiResponse.response(false, error.message))
        }
    }

    async indexDetail(req: Request, res: Response) {
        try {

            Order_list_detail.hasMany(Item_images, { foreignKey: "item_id" })

            const queryFindOrderListDetail: any = await Order_list_detail.findAll({
                include: {
                    model: Item_images,
                    attributes: ["path"],
                    where: {
                        "order": 1
                    }
                },
                attributes: ["id", "order_list_id", "item_id", "amount"],
                where: {
                    "order_list_id": req.params.order_list_id
                }
            })

            const transPath: any = queryFindOrderListDetail.map((index: any, key: any) => {
                const path = index.Item_images.map((innerIndex: any, innerKey: any) => {
                    return process.env.APP_URL + innerIndex.path
                })

                return {
                    ...index?.toJSON(),
                    Item_images: path[0]
                }
            })

            const queryTotalPrice: any = await Order_list.findOne({
                attributes: ["total_price"],
                where: {
                    "id": req.params.order_list_id
                }
            })

            const output = {
                "items": transPath,
                "totalPrice": queryTotalPrice.total_price
            }

            res.send(this.apiResponse.response(true, output))
        } catch (error: any) {
            res.status(500).send(this.apiResponse.response(false, error.message))
        }
    }
}