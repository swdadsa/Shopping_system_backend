import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import fs from 'fs';
import path, { resolve } from 'path';
import Items from "../models/Items";
import Item_images from "../models/Item_images";
import Cart from "../models/cart";
import sequelize from "sequelize";

export default class cart {
    public apiResponse = new apiResponse

    async store(req: Request, res: Response) {
        try {
            const amount = req.body.amount

            for (let i = 0; i < amount; i++) {
                await Cart.create({
                    "user_id": req.body.user_id,
                    "item_id": req.body.item_id
                })
            }

            res.send(this.apiResponse.response(true, 'store items to cart successfully'))
        } catch (error: any) {
            res.status(500).send(this.apiResponse.response(false, error.message))
        }
    }

    async show(req: Request, res: Response) {
        try {
            const user_id = req.body.user_id

            // search all cart items
            const query: any = await Cart.findAll({
                attributes: ["item_id", [sequelize.literal('count(0)'), 'amount']],
                where: {
                    "user_id": user_id
                },
                group: "item_id",
                order: [["item_id", "ASC"]]
            })

            // transform data  (item detail and item price times amout to show total price)
            const output = await Promise.all(
                query.map(async (value: any) => {
                    let totalPrice = 'price * ' + value.get('amount');
                    const item: any = await Items.findOne({
                        attributes: ["id", "name", [sequelize.literal(totalPrice), 'totalPrice'], "storage"],
                        where: {
                            "id": value.item_id
                        }
                    });

                    const image: any = await Item_images.findOne({
                        attributes: ['path'],
                        where: {
                            "item_id": item.id,
                            "order": 1
                        }
                    })

                    return {
                        ...item?.toJSON(),
                        amount: value.get('amount'),
                        path: process.env.APP_URL + image.path
                    };
                })
            );

            res.send(this.apiResponse.response(true, output))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async update(req: Request, res: Response) {
        try {
            switch (req.body.movement) {
                case "+":
                    let queryCreate: any = await Cart.create({
                        "user_id": req.body.user_id,
                        "item_id": req.body.item_id
                    })
                    res.send(this.apiResponse.response(true, queryCreate))
                    break
                case "-":
                    let queryFind: any = await Cart.findOne({
                        attributes: ["id"],
                        where: {
                            "user_id": req.body.user_id,
                            "item_id": req.body.item_id
                        }
                    })
                    if (!queryFind) {
                        res.status(500).send(this.apiResponse.response(false, 'item is already clear'))
                    } else {
                        let queryDelete: any = await Cart.destroy({
                            where: {
                                "id": queryFind.id
                            }
                        })
                        res.send(this.apiResponse.response(true, 'delete item successfully'))
                    }

                    break
                default:
                    res.status(500).send(this.apiResponse.response(false, 'bad movement'))
                    break
            }

        } catch (error: any) {
            res.status(500).send(this.apiResponse.response(false, error.message))
        }
    }
}