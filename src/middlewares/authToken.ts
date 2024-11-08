import { NextFunction, Request, Response } from "express"
import { apiResponse } from '../response/apiResponse'

export function authToken(req: Request, res: Response, next: NextFunction) {
    var response = new apiResponse
    if (req.headers.token) {
        next();
    } else {
        res.status(500).json(response.response(false, '需要Token'))
    }
}