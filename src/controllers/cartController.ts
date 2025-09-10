import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Items from "../models/Items";
import Item_images from "../models/Item_images";
import Cart from "../models/Cart";
import sequelize from "sequelize";
import Order_list from "../models/Order_list";
import Order_list_detail from "../models/Order_list_detail";
import Discount from "../models/Discount";
import { Op } from "sequelize";
import dayjs from "dayjs";

export default class cart {
    public apiResponse = new apiResponse

    unitTest(req: Request, res: Response) {
        try {
            res.send(this.apiResponse.response(true, 'cart unit test'))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

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
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async show(req: Request, res: Response) {
        try {
            const user_id = req.query.user_id
            const date = dayjs().format('YYYY-MM-DD');

            // search all cart items
            const query = await Cart.findAll({
                attributes: ["item_id", [sequelize.literal('count(0)'), 'amount']],
                where: {
                    "user_id": Number(user_id)
                },
                group: "item_id",
                order: [["item_id", "ASC"]]
            })

            // transform data  (item detail and item price times amout to show total price)
            const output = await Promise.all(
                query.map(async (value: any) => {
                    const item: any = await Items.findOne({
                        include: [
                            {
                                model: Item_images,
                                as: "images",
                                attributes: ['path'],
                                where: {
                                    "order": 1
                                },
                                required: false
                            },
                            {
                                model: Discount,
                                as: "discounts",
                                attributes: ['id', 'startAt', 'endAt', 'discountNumber', 'discountPercent'],
                                where: {
                                    startAt: { [Op.lte]: date },
                                    endAt: { [Op.gte]: date },
                                },
                                required: false
                            }
                        ],
                        attributes: ["id", "name", "price", "storage"],
                        where: {
                            "id": value.item_id
                        }
                    });

                    let totalPrice = item.price * value.get('amount')
                    if (item.discounts.length > 0) {
                        if (item.discounts[0].discountNumber !== null) {
                            totalPrice -= (item.discounts[0].discountNumber * value.get('amount'))
                        }

                        if (item.discounts[0].discountPercent !== null) {
                            totalPrice = Math.floor(totalPrice * (1 - item.discounts[0].discountPercent / 100));
                        }
                    }

                    return {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        totalPrice: totalPrice,
                        storage: item.storage,
                        amount: value.get('amount'),
                        discount: item.discounts ?? [],
                        path: process.env.APP_URL + item.images[0].path
                    };
                })
            );

            res.send(this.apiResponse.response(true, output))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
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

        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async destroy(req: Request, res: Response) {
        try {
            const query: any = await Cart.destroy({
                where: {
                    "user_id": req.body.user_id,
                    "item_id": req.body.item_id,
                }
            })

            if (query) {
                res.send(this.apiResponse.response(true, 'delete item from cart successfully'))
            } else {
                res.status(500).send(this.apiResponse.response(false, 'delete item from cart failed'))
            }

        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async submit(req: Request, res: Response) {
        try {
            const body = req.body
            let totalPrice = 0

            // create order list
            const createOrderList: any = await Order_list.create({
                "order_unique_number": body.user_id + '-' + Date.now() + '-' + Math.round(Math.random() * 10000),
                "user_id": body.user_id,
                "condition": 0
            })

            if (createOrderList) {
                const itemPromises = body.item.map(async (index: any, key: any) => {
                    // find item
                    const queryItem = await Items.findOne({
                        attributes: ["id", "name", "price"],
                        where: {
                            "id": index.id
                        }
                    })

                    // check discount
                    const date = dayjs().format('YYYY-MM-DD');
                    const queryDiscount = await Discount.findOne({
                        attributes: ["id", "startAt", "endAt", "discountNumber", "discountPercent"],
                        where: {
                            startAt: { [Op.lte]: date },
                            endAt: { [Op.gte]: date },
                            "item_id": index.id
                        },
                    });

                    if (queryDiscount != null && queryItem != null) {
                        if (queryDiscount.discountNumber !== null && queryDiscount.discountNumber !== undefined) {
                            const price = (Number(queryItem.price) - Number(queryDiscount.discountNumber))
                            totalPrice = totalPrice + (price * index.amount)
                        }

                        if (queryDiscount.discountPercent !== null && queryDiscount.discountPercent !== undefined) {
                            const price = Math.floor(Number(queryItem.price) * (1 - Number(queryDiscount.discountPercent) / 100))
                            totalPrice = totalPrice + (price * index.amount)
                        }
                    }

                    // create order list deatil
                    await Order_list_detail.create({
                        "order_list_id": createOrderList.id,
                        "item_id": index.id,
                        "amount": index.amount
                    })

                    // delete cart item 
                    for (let i = 0; i < index.amount; i++) {
                        // find one
                        const findOneItemFromCart: any = await Cart.findOne({
                            attributes: ["id"],
                            where: {
                                "user_id": body.user_id,
                                "item_id": index.id
                            }
                        })
                        // and delete
                        if (findOneItemFromCart) {
                            await Cart.destroy({
                                where: {
                                    "id": findOneItemFromCart.id
                                }
                            })
                        }
                    }
                })

                // waitting item promise
                await Promise.all(itemPromises);

                // update total price
                const updateOrderList = await Order_list.update(
                    {
                        "total_price": Number(totalPrice)
                    },
                    {
                        where: {
                            "id": Number(createOrderList.id)
                        }
                    })

                res.send(this.apiResponse.response(true, 'create order list successfully'))
            } else {
                res.status(500).send(this.apiResponse.response(false, 'create order list error'))
            }
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }
}