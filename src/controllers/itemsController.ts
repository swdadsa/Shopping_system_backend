import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import path from "path";
import Items from "../models/Items";
import Item_images from "../models/Item_images";
import { Op } from "sequelize";
import Discount from "../models/Discount";
import { getCache, setCache } from "../utils/redisCache";
import dayjs from "dayjs";
import { deleteObjectsFromS3, uploadBufferToS3 } from "../utils/s3Client";
import { resolveImageUrl } from "../utils/imageUrl";

export default class items {
    public apiResponse = new apiResponse

    unitTest(req: Request, res: Response) {
        try {
            res.send(this.apiResponse.response(true, 'items unit test'))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

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
                const transformedData = await Promise.all(
                    query.map(async (item: any) => {
                        const images = item.images ?? [];
                        let imageUrl: string | null = null;

                        for (const current of images) {
                            const resolved = await resolveImageUrl(current.path);
                            if (resolved) {
                                imageUrl = resolved;
                                break;
                            }
                        }

                        return {
                            ...item.toJSON(),
                            Item_images: imageUrl
                        };
                    })
                );
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
            });

            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                res.status(400).send(this.apiResponse.response(false, "No image uploaded"));
                return;
            }

            const files = req.files as Express.Multer.File[];

            await Promise.all(
                files.map(async (file, index) => {
                    const extension = path.extname(file.originalname) ?? "";
                    const uniqueSuffix = `${Date.now()}-${index}-${Math.round(Math.random() * 1e9)}`;
                    const key = `items/${createItem.id}-${uniqueSuffix}${extension}`;

                    const uploadResult = await uploadBufferToS3({
                        buffer: file.buffer,
                        key,
                        contentType: file.mimetype,
                    });

                    await Item_images.create({
                        item_id: createItem.id,
                        order: index + 1,
                        path: uploadResult.key,
                    });
                })
            );

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
                    const files = req.files as Express.Multer.File[];

                    const oldImages = await Item_images.findAll({ where: { item_id: item.id } });
                    const oldKeys = oldImages
                        .map((image: any) => image.path)
                        .filter((value: string | null): value is string => typeof value === "string" && value.length > 0);

                    await deleteObjectsFromS3(oldKeys);
                    await Item_images.destroy({ where: { item_id: item.id } });

                    await Promise.all(
                        files.map(async (file, index) => {
                            const extension = path.extname(file.originalname) ?? "";
                            const uniqueSuffix = `${Date.now()}-${index}-${Math.round(Math.random() * 1e9)}`;
                            const key = `items/${item.id}-${uniqueSuffix}${extension}`;

                            const uploadResult = await uploadBufferToS3({
                                buffer: file.buffer,
                                key,
                                contentType: file.mimetype,
                            });

                            await Item_images.create({
                                item_id: item.id,
                                order: index + 1,
                                path: uploadResult.key,
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
                    query.Item_images = await Promise.all(query.Item_images.map(async (image: any) => {
                        const plainImage = image.get({ plain: true }); // Convert to plain object
                        const resolvedPath = await resolveImageUrl(plainImage.path);
                        if (resolvedPath) {
                            plainImage.path = resolvedPath; // Modify path
                        } else {
                            plainImage.path = null;
                        }
                        return plainImage;
                    }));
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
