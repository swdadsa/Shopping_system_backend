
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { apiResponse } from "../../response/apiResponse";

// 登入驗證
export const validateSignIn = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        username: Joi.string().min(8).max(12).required(),
        password: Joi.string().min(8).max(12).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};
// 註冊驗證
export const validateSignUp = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        username: Joi.string().min(8).max(12).required(),
        password: Joi.string().min(8).max(12).required(),
        email: Joi.string().email().required(),
        permissions: Joi.number().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 登出驗證
export const validateSignOut = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        token: Joi.string().required(),
    }).unknown(true);

    const { error } = schema.validate(req.headers);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error));
        return;
    }
    next();
};

// 刪除驗證
export const validateDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        username: Joi.string().min(8).max(12).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 基本資料驗證
export const validateProfiles = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.number().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};

// 更新基本資料驗證
export const validateUpdateProfiles = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.number().required(),
        username: Joi.string().required(),
        email: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json(new apiResponse().response(false, error.details[0].message));
        return;
    }
    next();
};