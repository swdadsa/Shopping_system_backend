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
            const CACHE_KEY = "main_titles_with_sub_titles";
            const CACHE_TTL = 600; // 秒 (10 分鐘)

            const redis = req.app.locals.redis;

            // 檢查 Redis 是否有快取
            const cached = await redis.get(CACHE_KEY);
            if (cached) {
                console.log('使用快取');
                const parsed = JSON.parse(cached);
                res.send(this.apiResponse.response(true, parsed));
            } else {
                const query = await Main_titles.findAll({
                    include: {
                        model: Sub_title,
                        attributes: ['id', 'main_title_id', 'name'],
                        separate: true, // This allows ordering on the included model
                        order: [["id", "ASC"]] // Specify the order for Sub_title model here
                    },
                    attributes: ["id", "name"]
                })

                // 存入 Redis 快取，10 分鐘有效
                await redis.set(CACHE_KEY, JSON.stringify(query), {
                    EX: CACHE_TTL,
                });

                res.send(this.apiResponse.response(true, query))
            }

        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }
}