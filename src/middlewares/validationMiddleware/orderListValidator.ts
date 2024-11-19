
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { apiResponse } from "../../response/apiResponse";


// 清單驗證
export const validateOrderListIndex = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        user_id: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 清單詳細資料驗證
export const validateOrderListIndexDetail = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        order_list_id: Joi.number().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 清單詳細資料驗證
export const validateOrderListChangeCondition = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        order_list_id: Joi.number().required(),
        condition: Joi.number().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};
