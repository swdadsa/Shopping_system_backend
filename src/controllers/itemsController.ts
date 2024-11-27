import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import fs from 'fs';
import path from 'path';
import Items from "../models/Items";
import Item_images from "../models/Item_images";

export default class items {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            // generate association
            Items.hasMany(Item_images, { foreignKey: "item_id" });

            const query: any = await Items.findAll({
                include: {
                    model: Item_images,
                    attributes: ['id', 'order', 'path'],
                    where: {
                        "order": 1
                    }
                },
                attributes: ["id", "sub_title_id", "name", "price", "storage"],
                where: {
                    "sub_title_id": req.query.sub_title_id
                }
            })

            if (query) {
                // Transform query data by adding APP_URL to path
                const transformedData = query.map((item: any) => ({
                    ...item.toJSON(),
                    Item_images: item.Item_images.map((image: any) => ({
                        id: image.id,
                        order: image.order,
                        path: process.env.APP_URL + image.path // Append APP_URL to path
                    }))
                }));

                res.send(this.apiResponse.response(true, transformedData));
            } else {
                res.send(this.apiResponse.response(true, []));
            }

        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error:' + error));
        }
    }

    async store(req: Request, res: Response) {
        try {
            const createItem: any = await Items.create({
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
            const item: any = await Items.findOne({
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

            Items.hasMany(Item_images, { foreignKey: "item_id" })

            const query: any = await Items.findOne({
                include: {
                    model: Item_images,
                    attributes: ["id", "path", "order"],
                    order: [["order", "ASC"]],
                    separate: true
                },
                attributes: ["id", "name", "price", "storage", "description"],
                where: {
                    "id": req.query.id
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

            // Send the response
            res.send(this.apiResponse.response(true, query));
        } catch (error) {
            res.status(500).send(this.apiResponse.response(false, 'Unexpected error:' + error));
        }
    }
}