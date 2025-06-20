import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import fs from 'fs';
import path from 'path';
import Items from "../models/Items";
import Item_images from "../models/Item_images";
import { Op } from "sequelize";
import Discount from "../models/Discount";
import { getCache, setCache } from "../utils/redisCache";
import dayjs from "dayjs";

export default class items {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            let CACHE_KEY = "itemController:index";
            const CACHE_TTL = 600; // (10 分鐘)
            const redis = req.app.locals.redis;

            const whereClause: any = {};
            const discountWhereClause: any = {};

            // 如果 query 中有 sub_title_id，加入 where 條件
            if (req.query.sub_title_id) {
                whereClause.sub_title_id = Number(req.query.sub_title_id);
                CACHE_KEY += `:${req.query.sub_title_id}`
            }

            // 如果 query 中有 searchKeyword，加入 name 的模糊搜尋條件
            if (req.query.searchKeyword) {
                const searchKeyword = String(req.query.searchKeyword);
                whereClause.name = {
                    [Op.like]: `%${searchKeyword}%`
                };
                CACHE_KEY += `:${searchKeyword}`
            }

            // 如果有搜尋date 則過濾discount
            if (req.query.date) {
                discountWhereClause.startAt = { [Op.lte]: new Date(req.query.date as string) };
                discountWhereClause.endAt = { [Op.gte]: new Date(req.query.date as string) };
                CACHE_KEY += `:${req.query.date}`
            }

            // 檢查 Redis 是否有快取
            const cached = await getCache(redis, CACHE_KEY);
            if (cached) {
                res.send(this.apiResponse.response(true, cached));
            } else {
                const query = await Items.findAll({
                    include: [
                        {
                            model: Item_images,
                            as: "images",
                            attributes: ['id', 'order', 'path'],
                            where: {
                                order: 1
                            },
                            required: false
                        },
                        {
                            model: Discount,
                            as: "discounts",
                            attributes: ['id', 'item_id', 'startAt', 'endAt', 'discountNumber', 'discountPercent'],
                            where: discountWhereClause,
                            required: false
                        }
                    ],
                    attributes: ["id", "sub_title_id", "name", "price", "storage"],
                    where: whereClause

                });

                // transform
                const transformedData = query.map((item: any) => {
                    const images = item.images ?? [];
                    const fixPath = images.map((values: any) => process.env.APP_URL + values.path);

                    return {
                        ...item.toJSON(),
                        Item_images: fixPath[0] ?? null
                    };
                });
                if (transformedData) {
                    await setCache(redis, CACHE_KEY, transformedData, CACHE_TTL);
                }

                res.send(this.apiResponse.response(true, transformedData));
            }
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error: ' + (error instanceof Error ? error.message : String(error))));
        }
    }



    async store(req: Request, res: Response) {
        try {
            const createItem = await Items.create({
                "sub_title_id": req.body.sub_title_id,
                "name": req.body.name,
                "price": req.body.price,
                "storage": req.body.storage,
                "description": req.body.description
            })

            if (!req.files || !Array.isArray(req.files)) {
                res.status(400).send(this.apiResponse.response(false, 'No image uploaded'));
            }
            const files: any = req.files;
            if (req.files) {
                // Rename each file in `req.files`
                await Promise.all(
                    files.map(async (file: any, index: number) => {
                        const oldPath = file.path;
                        const newFileName = `image_${index + 1}_${Date.now()}${path.extname(file.originalname)}`;
                        const newPath = './src/images/items/' + newFileName;

                        // Rename the file
                        await new Promise((resolve, reject) => {
                            fs.rename(oldPath, newPath, (err) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(newFileName)
                                };
                            });
                        });

                        // Step 4: Create a record in Item_images for each image
                        await Item_images.create({
                            item_id: createItem.id,
                            order: index + 1,
                            path: 'images/items/' + newFileName, // Save the new path to the database
                        });
                    })
                );
            }
            res.send(this.apiResponse.response(true, createItem));
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error:' + error));
        }
    }

    async update(req: Request, res: Response) {
        try {
            const item = await Items.findOne({
                where: {
                    'id': req.body.id
                }
            })

            if (!item) {
                res.status(500).send(this.apiResponse.response(false, 'item not found'));
            } else {
                await item.update({
                    "sub_title_id": req.body.sub_title_id,
                    "name": req.body.name,
                    "price": req.body.price,
                    "storage": req.body.storage,
                    "description": req.body.description
                });

                if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                    const files: any = req.files;

                    // Find and delete old images in Item_images and file system
                    const oldImages = await Item_images.findAll({ where: { item_id: item.id } });
                    await Promise.all(oldImages.map(async (image: any) => {
                        const imagePath = './src/' + image.path;
                        await fs.promises.unlink(imagePath); // Delete image file
                        await image.destroy(); // Remove record from Item_images table
                    }));

                    // Save new images and update Item_images
                    await Promise.all(
                        files.map(async (file: any, index: number) => {
                            const oldPath = file.path;
                            const newFileName = `image_${index + 1}_${Date.now()}${path.extname(file.originalname)}`;
                            const newPath = './src/images/items/' + newFileName;

                            // Rename and save file to the target directory
                            await new Promise((resolve, reject) => {
                                fs.rename(oldPath, newPath, (err) => {
                                    if (err) reject(err);
                                    else resolve(newFileName);
                                });
                            });

                            // Save image details to the Item_images table
                            await Item_images.create({
                                item_id: item.id,
                                order: index + 1,
                                path: 'images/items/' + newFileName // Save new path in the database
                            });
                        })
                    );
                }
            }

            res.send(this.apiResponse.response(true, 'Item updated successfully'));
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error:' + error));
        }
    }


    async show(req: Request, res: Response) {
        try {
            const date = dayjs().format('YYYY-MM-DD');

            const CACHE_TTL = 600; // (10 分鐘)
            const redis = req.app.locals.redis;
            let CACHE_KEY = `itemController:show:${req.query.id}:${date}`;

            const cached = await getCache(redis, CACHE_KEY);
            if (cached) {
                res.send(this.apiResponse.response(true, cached));
            } else {
                const query: any = await Items.findOne({
                    include: [
                        {
                            model: Item_images,
                            as: "images",
                            attributes: ["id", "path", "order"],
                            order: [["order", "ASC"]],
                            separate: true,
                            required: false
                        },
                        {
                            model: Discount,
                            as: "discounts",
                            attributes: ['id', 'item_id', 'startAt', 'endAt', 'discountNumber', 'discountPercent'],
                            where: {
                                startAt: { [Op.lte]: date },
                                endAt: { [Op.gte]: date },
                            },
                            required: false
                        }
                    ],
                    attributes: ["id", "name", "price", "storage", "description"],
                    where: {
                        "id": Number(req.query.id)
                    }
                })

                // Check if query returned a result
                if (query && query.Item_images) {
                    // Convert Sequelize instances to plain objects
                    query.Item_images = query.Item_images.map((image: any) => {
                        const plainImage = image.get({ plain: true }); // Convert to plain object
                        plainImage.path = `${process.env.APP_URL}${plainImage.path}`; // Modify path
                        return plainImage;
                    });
                }

                // Set cache
                await setCache(redis, CACHE_KEY, query, CACHE_TTL);
                // Send the response
                res.send(this.apiResponse.response(true, query));
            }


        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error:' + error));
        }
    }
}