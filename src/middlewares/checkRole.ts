import { NextFunction, Request, Response } from "express"
import { apiResponse } from '../response/apiResponse'
import User_token from "../models/User_token";
import User from "../models/User";
import User_role from "../models/User_role";
import Roles from "../models/Roles";
export function checkRole(requiredRole: Array<string>) {
    return async function (req: Request & { user_id?: number }, res: Response, next: NextFunction) {
        var response = new apiResponse
        if (req.headers.token) {
            // permanent token for developer
            if (req.headers.token == String(process.env.PERMANENT_TOKEN)) {
                req.user_id = 1
                next()
            } else {
                const checkoutTokenExpired: any = await User_token.findOne({
                    attributes: ["id", "token", "user_id", "expiredAt"],
                    where: {
                        "token": req.headers.token
                    }
                })

                if (checkoutTokenExpired) {
                    // 以token檢查user
                    const user = await User.findOne({
                        include: [
                            {
                                model: User_role,
                                as: "UserRole",
                                attributes: ["role_id"],
                            }
                        ],
                        attributes: ["id", "username"],
                        where: {
                            "id": checkoutTokenExpired.user_id
                        }
                    })
                    res.status(500).json(response.response(false, user))
                    if (user) {
                        // 檢查權限
                        // todo 檢查
                    } else {
                        res.status(500).json(response.response(false, 'User not found'))
                    }
                } else {
                    res.status(500).json(response.response(false, 'Token not found'))
                }
            }

        } else {
            res.status(500).json(response.response(false, '需要Token'))
        }
    }
}