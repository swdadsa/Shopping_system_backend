import { Request, Response } from "express";
import Users from "../models/config";
import { apiResponse } from "../response/apiResponse";
import bcrypt from 'bcrypt';


export default class account {
    public apiResponse = new apiResponse
    // 登入
    signIn(req: Request, res: Response) {
        res.send('sign in')
    }

    // 註冊
    async signUp(req: Request, res: Response) {
        const { username, password, email } = req.body;
        const querySearchExistAccount: any = await Users.findOne({
            attributes: ['id'],
            where: {
                "username": username
            }
        });

        if (querySearchExistAccount) {
            res.send(this.apiResponse.response(false, 'account is already exist'))
        } else {
            const query: any = Users.create({

                "username": username,
                "password": await bcrypt.hash(password, 10),
                "email": email
            })
            if (query) {
                res.send(this.apiResponse.response(true, 'sign up success'))
            } else {
                res.status(400).send(this.apiResponse.response(false, 'sign up fail'))
            }
        }

    }

    // 檢查token
    checkToken(req: Request, res: Response) {
        res.send('check token')
    }
}