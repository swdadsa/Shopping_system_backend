
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { apiResponse } from "../../response/apiResponse";

// 儲存驗證
export const validateItemStore = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        sub_title_id: Joi.number().required(),
        name: Joi.string().required(),
        price: Joi.number().required(),
        storage: Joi.number().required(),
        description: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 查詢單一驗證
export const validateItemShow = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.number().required(),
    }).unknown(true);

    const { error } = schema.validate(req.query);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 清單驗證
export const validateItemIndex = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        sub_title_id: Joi.number().required(),
    });

    const { error } = schema.validate(req.query);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 更新驗證
export const validateItemUpdate = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.number().required(),
        sub_title_id: Joi.number().required(),
        name: Joi.string().required(),
        price: Joi.number().required(),
        storage: Joi.number().required(),
        description: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};
