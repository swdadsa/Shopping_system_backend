import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Advertisement from "../models/Advertisement";
import path from 'path';
import fs from 'fs';


export default class advertisement {
    public apiResponse = new apiResponse

    async index(req: Request, res: Response) {
        try {
            const query: any = await Advertisement.findAll({
                attributes: ["id", "item_id", "image_path"]
            })

            const output: any = query.map((index: any, key: any) => {
                return {
                    ...index?.toJSON(),
                    image_path: process.env.APP_URL + index.image_path
                }
            })

            res.send(this.apiResponse.response(true, output))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async store(req: Request, res: Response) {
        try {
            let query: any
            const file: any = req.file;
            const oldPath = file.path;
            const newFileName = `image_${Date.now()}${path.extname(file.originalname)}`;
            const newPath = './src/images/advertisements/' + newFileName;
            fs.rename(oldPath, newPath, async (err) => {
                if (err) {
                    res.status(500).json(this.apiResponse.response(false, err))
                } else {
                    query = await Advertisement.create({
                        "item_id": req.body.item_id,
                        "image_path": 'images/advertisements/' + newFileName
                    })

                    if (query) {
                        res.send(this.apiResponse.response(true, query))
                    } else {
                        res.status(500).json(this.apiResponse.response(false, 'create ads failed'))
                    }
                }
            });

        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async update(req: Request, res: Response) {
        try {
            const query: any = await Advertisement.findOne({
                where: {
                    "item_id": req.body.item_id
                }
            })

            if (query) {
                const imagePath = './src/' + query.image_path
                await fs.promises.unlink(imagePath); // Delete file

                const file: any = req.file;
                const oldPath = file.path;
                const newFileName = `image_${Date.now()}${path.extname(file.originalname)}`;
                const newPath = './src/images/advertisements/' + newFileName;

                fs.rename(oldPath, newPath, async (err) => {
                    if (err) {
                        res.status(500).json(this.apiResponse.response(false, err))
                    } else {
                        query.update({
                            "image_path": 'images/advertisements/' + newFileName
                        })
                        res.send(this.apiResponse.response(true, 'update ads successfully'))
                    }
                });
            } else {
                res.status(500).json(this.apiResponse.response(false, 'update ads failed'))
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async destroy(req: Request, res: Response) {
        try {
            const query: any = await Advertisement.findOne({
                where: {
                    "item_id": req.body.item_id
                }
            })

            const imagePath = './src/' + query.image_path
            await fs.promises.unlink(imagePath); // 刪除檔案
            query.destroy()

            res.send(this.apiResponse.response(true, 'delete ads successfully'))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

}
