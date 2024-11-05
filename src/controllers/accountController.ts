import { Request, Response } from "express";

export default class account {
    // 登入
    signIn(req: Request, res: Response) {
        res.send('sign in')
    }

    // 註冊
    signUp(req: Request, res: Response) {
        res.send('sign up')
    }

    // 檢查token
    checkToken(req: Request, res: Response) {
        res.send('check token')
    }
}