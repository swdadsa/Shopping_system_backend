import { Request, Response } from "express";
import User from "../models/User";
import User_token from "../models/User_token";
import { apiResponse } from "../response/apiResponse";
import bcrypt from 'bcrypt';
import { Op } from "sequelize";
import { generateVerificationToken, verifyToken } from "../utils/jwt";
import { sendVerificationEmail } from "../utils/emailSender";

export default class account {
    public apiResponse = new apiResponse

    async list(req: Request, res: Response) {
        try {
            const query = await User.findAll({
                attributes: ["id", "username"]
            })

            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    // 登入
    async signIn(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // 驗證輸入
            if ((!username && !email) || !password) {
                res.status(400).send(this.apiResponse.response(false, '請輸入帳號/信箱與密碼'));
            }

            // 根據輸入選擇查詢欄位
            const whereCondition: any = {
                isVerified: 1
            };

            if (username) {
                whereCondition.username = username;
            } else if (email) {
                whereCondition.email = email;
            }

            // 查詢使用者
            const user = await User.findOne({
                attributes: ['id', 'username', 'password', 'permissions'],
                where: whereCondition
            });

            if (!user) {
                res.send(this.apiResponse.response(false, '帳號不存在或尚未驗證'));
            } else {// 驗證密碼
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    res.status(400).send(this.apiResponse.response(false, '密碼錯誤'));
                }

                // 產生 Token
                const saltRounds = 10;
                const hashedToken = await bcrypt.hash(user.username, saltRounds);

                const output = {
                    id: user.id,
                    username: user.username,
                    permissions: user.permissions,
                    token: hashedToken
                };

                // 儲存 token 記錄
                await User_token.create({
                    user_id: user.id,
                    token: hashedToken,
                    expiredAt: new Date(Date.now() + 30 * 60 * 1000) // 30 分鐘後過期
                });

                res.send(this.apiResponse.response(true, output));
            }



        } catch (error) {
            res.status(500).json(
                this.apiResponse.response(false, error instanceof Error ? error.message : String(error))
            );
        }
    }


    // 註冊
    async signUp(req: Request, res: Response) {
        try {
            const { username, password, email, permissions } = req.body;
            const querySearchExistAccount = await User.findOne({
                attributes: ['id'],
                where: {
                    [Op.or]: [{ username: username }, { email: email }]
                }
            });

            if (querySearchExistAccount) {
                res.send(this.apiResponse.response(false, 'account or email is already exist'))
            } else {
                const query = User.create({
                    "username": username,
                    "email": email,
                    "password": await bcrypt.hash(password, 10),
                    "permissions": permissions,
                    "isVerified": false,
                })
                if (query instanceof User) {
                    const token = generateVerificationToken(email);
                    await sendVerificationEmail(email, token)
                    res.send(this.apiResponse.response(true, 'We already send a verify mail to you, please checkout you email'))
                } else {
                    res.status(400).send(this.apiResponse.response(false, 'sign up fail'))
                }
            }
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    // 登出
    async signOut(req: Request, res: Response) {
        try {
            const queryCheckToken = await User_token.findOne({
                where: {
                    "token": req.headers.token
                }
            })

            if (queryCheckToken) {
                const querySignOut = await User_token.update({
                    "deletedAt": new Date(Date.now())
                }, {
                    where: {
                        "token": req.headers.token
                    }
                })
                res.send(this.apiResponse.response(true, 'sign out success'))
            } else {
                res.status(500).send(this.apiResponse.response(false, 'token not found'))
            }
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    // 刪除帳號
    async deleteAccount(req: Request, res: Response) {
        try {
            const { username } = req.body;
            const querySearchExistAccount = await User.findOne({
                attributes: ['id'],
                where: {
                    "username": username
                }
            });
            if (querySearchExistAccount) {
                User.destroy({
                    where: {
                        "username": username
                    }
                })
                res.send(this.apiResponse.response(true, 'user ' + username + ' is deleted'))
            } else {
                res.send(this.apiResponse.response(false, 'account not found'))
            }
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async profiles(req: Request, res: Response) {
        try {
            const query = await User.findOne({
                attributes: ["id", "username", "email", "permissions", "isVerified"],
                where: {
                    "id": Number(req.query.id)
                }
            })

            res.send(this.apiResponse.response(true, query))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async updateProfiles(req: Request, res: Response) {
        try {
            const query = await User.update({
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
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    async verifyAccount(req: Request, res: Response) {
        try {
            const result = verifyToken(String(req.query.token));

            const findAccount = await User.findOne({
                where: {
                    "email": result.email
                }
            })

            if (findAccount) {
                findAccount.isVerified = true
                findAccount.save()
                res.send(this.apiResponse.response(true, 'verify successfully'))
            } else {
                res.send(this.apiResponse.response(true, 'account not found'))
            }
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }
}