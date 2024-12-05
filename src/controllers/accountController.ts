import { Request, Response } from "express";
import Users from "../models/Users";
import { apiResponse } from "../response/apiResponse";
import bcrypt from 'bcrypt';
import { Op } from "sequelize";
import User_token from "../models/User_token";
import { generateVerificationToken, verifyToken } from "../utils/jwt";
import { sendVerificationEmail } from "../utils/emailSender";

export default class account {
    public apiResponse = new apiResponse

    async list(req: Request, res: Response) {
        try {
            const query: any = await Users.findAll({
                attributes: ["id", "username"]
            })

            res.send(this.apiResponse.response(true, query))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    // 登入
    async signIn(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            const query: any = await Users.findOne({
                attributes: ['id', 'username', 'password', 'permissions'],
                where: {
                    "username": username,
                    "isVerified": 1
                }
            })

            if (query) {
                let hashPassword = query.password;
                // hash check password
                const match = await bcrypt.compare(password, hashPassword);
                if (!match) {
                    res.status(400).send(this.apiResponse.response(false, 'account\'s password is wrong'));
                } else {
                    // 設定加密強度，通常 10-12 是合理範圍
                    const saltRounds = 10;
                    // 用帳號新增token
                    let hashedToken = await bcrypt.hash(query.username, saltRounds);

                    let output = {
                        "id": query.id,
                        "username": query.username,
                        'permissions': query.permissions,
                        "token": hashedToken
                    }
                    // 新增token紀錄
                    const queryCreateTokenRecord = await User_token.create({
                        "user_id": output.id,
                        "token": hashedToken,
                        "expiredAt": Date.now() + 30 * 60 * 1000 // Add 10 minutes
                    })
                    res.send(this.apiResponse.response(true, output))
                }
            } else {
                res.send(this.apiResponse.response(false, 'account not find or not verified'))
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    // 註冊
    async signUp(req: Request, res: Response) {
        try {
            const { username, password, email, permissions } = req.body;
            const querySearchExistAccount: any = await Users.findOne({
                attributes: ['id'],
                where: {
                    [Op.or]: [{ username: username }, { email: email }]
                }
            });

            if (querySearchExistAccount) {
                res.send(this.apiResponse.response(false, 'account or email is already exist'))
            } else {
                const query: any = Users.create({
                    "username": username,
                    "password": await bcrypt.hash(password, 10),
                    "email": email,
                    "permissions": permissions,
                    "isVerified": 0
                })
                if (query) {
                    const token = generateVerificationToken(email);
                    await sendVerificationEmail(email, token)
                    res.send(this.apiResponse.response(true, 'We already send a verify mail to you, please checkout you email'))
                } else {
                    res.status(400).send(this.apiResponse.response(false, 'sign up fail'))
                }
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    // 登出
    async signOut(req: Request, res: Response) {
        try {
            const queryCheckToken: any = await User_token.findOne({
                where: {
                    "token": req.headers.token
                }
            })

            if (queryCheckToken) {
                const querySignOut: any = await User_token.update({
                    "deletedAt": Date.now()
                }, {
                    where: {
                        "token": req.headers.token
                    }
                })
                res.send(this.apiResponse.response(true, 'sign out success'))
            } else {
                res.status(500).send(this.apiResponse.response(false, 'token not found'))
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    // 刪除帳號
    async deleteAccount(req: Request, res: Response) {
        try {
            const { username } = req.body;
            const querySearchExistAccount: any = await Users.findOne({
                attributes: ['id'],
                where: {
                    "username": username
                }
            });
            if (querySearchExistAccount) {
                Users.destroy({
                    where: {
                        "username": username
                    }
                })
                res.send(this.apiResponse.response(true, 'user ' + username + ' is deleted'))
            } else {
                res.send(this.apiResponse.response(false, 'account not found'))
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async profiles(req: Request, res: Response) {
        try {
            const query: any = await Users.findOne({
                attributes: ["id", "username", "email", "permissions", "isVerified"],
                where: {
                    "id": req.query.id
                }
            })

            res.send(this.apiResponse.response(true, query))
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async updateProfiles(req: Request, res: Response) {
        try {
            const query: any = await Users.update({
                "username": req.body.username,
                "email": req.body.email
            }, {
                where: {
                    "id": req.body.id
                }
            })

            if (query) {
                res.send(this.apiResponse.response(true, 'update profiles successfully'))
            } else {
                res.status(500).json(this.apiResponse.response(false, 'update profiles failed'))
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }

    async verifyAccount(req: Request, res: Response) {
        try {
            const result = verifyToken(String(req.query.token));

            const findAccount: any = await Users.findOne({
                where: {
                    "email": result.email
                }
            })

            if (findAccount) {
                findAccount.isVerified = 1
                findAccount.save()
                res.send(this.apiResponse.response(true, 'verify successfully'))
            } else {
                res.send(this.apiResponse.response(true, 'account not found'))
            }
        } catch (error: any) {
            res.status(500).json(this.apiResponse.response(false, error.message))
        }
    }
}