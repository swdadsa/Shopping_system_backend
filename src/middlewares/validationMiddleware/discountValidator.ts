
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { apiResponse } from "../../response/apiResponse";

// 登入驗證
export const validateIndex = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};
