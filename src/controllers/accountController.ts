import { Request, Response } from "express";
import Users from "../models/Users";
import { apiResponse } from "../response/apiResponse";
import bcrypt from 'bcrypt';
import { Op } from "sequelize";
import User_token from "../models/User_token";


export default class account {
    public apiResponse = new apiResponse

    // 登入
    async signIn(req: Request, res: Response) {
        const { username, password } = req.body;
        const query: any = await Users.findOne({
            attributes: ['id', 'username', 'password', 'permissions'],
            where: {
                "username": username
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
                    "expiredAt": Date.now()
                })
                res.send(this.apiResponse.response(true, output))
            }
        } else {
            res.send(this.apiResponse.response(false, 'account not find'))
        }
    }

    // 註冊
    async signUp(req: Request, res: Response) {
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
                "permissions": permissions
            })
            if (query) {
                res.send(this.apiResponse.response(true, 'sign up success'))
            } else {
                res.status(400).send(this.apiResponse.response(false, 'sign up fail'))
            }
        }

    }

    // 登出
    signOut(req: Request, res: Response) {
        res.send('sign out')
    }

    // 檢查token
    checkToken(req: Request, res: Response) {
        res.send('check token')
    }

    // 刪除帳號
    async deleteAccount(req: Request, res: Response) {
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

    }
}