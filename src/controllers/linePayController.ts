import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import { apiResponse } from "../response/apiResponse";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import cart from "../controllers/cartController"

const CHANNEL_ID = process.env.LINE_PAY_CHANNEL_ID
const CHANNEL_SECRET = process.env.LINE_PAY_CHANNEL_SECRET
const BASE_URL = process.env.LINE_PAY_SITE

const client: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json", }
});

interface LinePayRequestBody {
    amount: number;
    currency: string;
    orderId: string;
    packages: {
        id: string;
        amount: number;
        name: string;
        products: { name: string; quantity: number; price: number }[];
    }[];
    redirectUrls: {
        confirmUrl: string;
        cancelUrl: string;
    };
}

function signKey(clientKey: any, msg: any) {
    const encoder = new TextEncoder();
    return crypto
        .createHmac("sha256", encoder.encode(clientKey))
        .update(encoder.encode(msg))
        .digest("base64");
}

export default class linePayController {
    public apiResponse = new apiResponse

    async linePayRequest<T>(method: string, uri: string, body: any): Promise<T> {
        try {
            const nonce = crypto.randomUUID();
            let signature = "";
            let res: any;
            if (method === "GET") {
                signature = signKey(
                    CHANNEL_SECRET,
                    CHANNEL_SECRET + uri + nonce
                );
            } else if (method === "POST") {
                signature = signKey(
                    CHANNEL_SECRET,
                    CHANNEL_SECRET + uri + JSON.stringify(body) + nonce
                );
            }

            if (method === "POST") {
                res = await client.post<T>(BASE_URL + uri, body, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-LINE-ChannelId": CHANNEL_ID,
                        "X-LINE-Authorization": signature,
                        "X-LINE-Authorization-Nonce": nonce,
                    },
                    data: body ? JSON.stringify(body) : null,
                });
            } else if (method === "GET") {
                res = await client.get<T>(BASE_URL + uri, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-LINE-ChannelId": CHANNEL_ID,
                        "X-LINE-Authorization": signature,
                        "X-LINE-Authorization-Nonce": nonce,
                    },
                });

            }

            return res.data;
        } catch (err: any) {
            const remote = err.response?.data;
            const status = err.response?.status;
            console.log("LINE Pay request error:", status, remote || err.message);
            throw new Error(remote?.returnMessage || err.message);
        }
    }

    // 傳送 LINE Pay 付款請求
    async sendingRequest(req: Request, res: Response) {
        try {
            const orderId = `ORDER-${Date.now()}-${uuidv4().slice(0, 6)}`;
            // 購物車商品資料
            const payload = req.body.payload
            const decodePayload = JSON.parse(decodeURIComponent(String(payload)));// 解碼
            const amount = decodePayload.total_price; // 獲取總金額

            const requestOptions: LinePayRequestBody = {
                amount,
                currency: "TWD",
                orderId,
                packages: [
                    {
                        id: "pkg-1",
                        amount,
                        name: "測試商品",
                        products: [{ name: "測試商品", quantity: 1, price: amount }],
                    },
                ],
                redirectUrls: {
                    confirmUrl: `${process.env.APP_URL}/api/linepay/confirm?payload=${payload}`,
                    cancelUrl: `${process.env.APP_URL}/api/linepay/cancel`,
                },
            };

            const response: any = await this.linePayRequest("POST", "/v3/payments/request", requestOptions);

            const paymentUrl = response?.info?.paymentUrl?.web;
            if (!paymentUrl) {
                console.error("LINE Pay no paymentUrl:", response.data);
                res.send(this.apiResponse.response(false, "LINE Pay 未回傳付款網址"))
            } else {
                console.log("LINE Pay response:", response);
                res.send(this.apiResponse.response(true, paymentUrl))
            }

        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    // LINE Pay 確認付款
    async confirm(req: Request, res: Response) {
        try {
            // LINE Pay 會在 query 帶回 transactionId (名稱可能為 transactionId 或 transactionId)
            const transactionId = req.query.transactionId || req.query.transaction_id;
            const orderId = req.query.orderId || req.query.order_id; // 若有帶回 orderId，比對用
            // 購物車商品資料
            const decodePayload = JSON.parse(decodeURIComponent(String(req.query.payload)));// 解碼
            const amount = decodePayload.total_price; // 獲取總金額
            // 將orderId加入decodePayload
            decodePayload.orderId = orderId

            if (!transactionId) {
                res.send(this.apiResponse.response(false, "缺少 transactionId"))
            }

            const confirmBody = { amount, currency: "TWD" };
            const response: any = await this.linePayRequest("POST", `/v3/payments/${transactionId}/confirm`, confirmBody);

            if (response.returnCode == "0000") {
                console.log("LINE Pay confirm success");
                const Cart = new cart()
                // 建立訂單
                await Cart.serviceSubmit(decodePayload)
                res.redirect(`${process.env.FRONTEND_URL}/payment/result?transactionId=${transactionId}`);
            } else {
                res.redirect(`${process.env.FRONTEND_URL}/payment/result?transactionId=${transactionId}`);
            }

        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }

    // LINE Pay 檢查付款
    async check(req: Request, res: Response) {
        try {
            const transactionId = req.query.transactionId || req.query.transaction_id;

            if (!transactionId) {
                res.send(this.apiResponse.response(false, "缺少 transactionId"))
            }

            const response = await this.linePayRequest("GET", `/v3/payments/requests/${transactionId}/check`, {});
            res.send(this.apiResponse.response(true, { ok: true, raw: response }))
        } catch (error) {
            res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)))
        }
    }
}