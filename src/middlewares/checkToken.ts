import { NextFunction, Request, Response } from "express"
import { apiResponse } from '../response/apiResponse'
import User_token from "../models/User_token";

export async function checkToken(req: Request, res: Response, next: NextFunction) {
    var response = new apiResponse
    if (req.headers.token) {
        // permanent token for developer
        if (req.headers.token == String(process.env.PERMANENT_TOKEN)) {
            next()
        } else {
            const checkoutTokenExpired: any = await User_token.findOne({
                attributes: ["id", "token", "expiredAt"],
                where: {
                    "token": req.headers.token
                }
            })

            if (checkoutTokenExpired) {
                // 檢查token是否過期
                if (checkoutTokenExpired.expiredAt < Date.now()) {
                    res.status(500).json(response.response(false, 'Token expired'))
                } else {
                    //token 沒過期則延長token時效 30 mins
                    const updateQuery: any = await User_token.update({
                        "expiredAt": new Date(Date.now() + 30 * 60 * 1000)
                    }, {
                        where: {
                            "id": checkoutTokenExpired.id
                        }
                    })
                    next()
                }
            } else {
                res.status(500).json(response.response(false, 'Token not found'))
            }
        }

    } else {
        res.status(500).json(response.response(false, '需要Token'))
    }
}