import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Order_list from "../models/Order_list";
import Order_list_detail from "../models/Order_list_detail";
import Item_images from "../models/Item_images";
import Item from "../models/Items";
import { Op } from "sequelize";
import Discount from "../models/Discount";


export default class orderList {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const query = await Order_list.findAll({
                attributes: ["id", "order_unique_number", "condition", "total_price"],
                where: {
                    "user_id": Number(req.query.user_id)
                }
            })
            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async indexDetail(req: Request, res: Response) {
        try {
            const queryFindOrderListDetail = await Order_list_detail.findAll({
                include: [
                    {
                        model: Item,
                        as: "item",
                        attributes: ["id", "name", "price"],
                        include: [
                            {
                                model: Item_images,
                                as: "images",
                                attributes: ["path"],
                                where: {
                                    "order": 1
                                }
                            }
                        ]
                    }],
                attributes: ["id", "order_list_id", "item_id", "amount", "createdAt"],
                where: {
                    "order_list_id": Number(req.query.order_list_id)
                }
            })
            const transPath = await Promise.all(
                queryFindOrderListDetail.map(async (index: any, key: any) => {
                    const images = index.item?.images ?? [];
                    const path = images.map((img: any) => process.env.APP_URL + img.path);

                    const item = index.item ?? {};
                    const price = item.price ?? 0;
                    const name = item.name ?? '';

                    const queryDiscount = await Discount.findAll({
                        attributes: ["discountNumber", "discountPercent"],
                        where: {
                            "startAt": { [Op.lte]: index.createdAt },
                            "endAt": { [Op.gte]: index.createdAt },
                            "item_id": index.item_id
                        }
                    })

                    return {
                        id: index.id,
                        order_list_id: index.order_list_id,
                        item_id: index.item_id,
                        amount: index.amount,
                        price: price,
                        name: name,
                        Item_images: path[0] ?? null,
                        discount: queryDiscount ?? []
                    }
                })
            );

            const queryTotalPrice = await Order_list.findOne({
                attributes: ["total_price"],
                where: {
                    "id": Number(req.query.order_list_id)
                }
            })

            const output = {
                "items": transPath,
                "totalPrice": queryTotalPrice?.total_price
            }

            res.send(this.apiResponse.response(true, output))
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async changeCondition(req: Request, res: Response) {
        try {
            const queryFindOrderList = await Order_list.findOne({
                where: {
                    "id": req.body.order_list_id
                }
            })

            if (!queryFindOrderList) {
                res.status(500).send(this.apiResponse.response(false, "order list not found"))
            } else {
                await queryFindOrderList.update({
                    "condition": req.body.condition
                })

                res.send(this.apiResponse.response(true, 'update order list condition successfully'))
            }
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }
}