
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { apiResponse } from "../../response/apiResponse";

// 儲存驗證
export const validateCartStore = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        user_id: Joi.number().required(),
        item_id: Joi.number().required(),
        amount: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};
// 送出驗證
export const validateCartSubmit = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        user_id: Joi.number().required(),
        total_price: Joi.number().required(),
        item: Joi.array().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 查詢單一驗證
export const validateCartShow = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        user_id: Joi.number().required(),
    }).unknown(true);

    const { error } = schema.validate(req.query);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 更新驗證
export const validateCartUpdate = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        user_id: Joi.number().required(),
        item_id: Joi.number().required(),
        movement: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 刪除驗證
export const validateCartDelete = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        user_id: Joi.number().required(),
        item_id: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};
