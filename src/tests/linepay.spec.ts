process.env.LINE_PAY_CHANNEL_ID = "test-channel";
process.env.LINE_PAY_CHANNEL_SECRET = "test-secret";
process.env.LINE_PAY_SITE = "https://pay.test";

jest.mock("axios", () => {
    const post = jest.fn();
    const get = jest.fn();
    const create = jest.fn(() => ({ post, get }));
    return {
        __esModule: true,
        default: {
            create,
            __post: post,
            __get: get,
        },
    };
});

jest.mock("uuid", () => ({
    __esModule: true,
    v4: jest.fn(() => "mock-uuid-abcdef"),
}));

jest.mock("../controllers/cartController", () => {
    const serviceSubmit = jest.fn();
    const Cart = jest.fn().mockImplementation(() => ({
        serviceSubmit,
    }));
    return {
        __esModule: true,
        default: Cart,
        __serviceSubmit: serviceSubmit,
    };
});

type ControllerSetup = {
    controller: any;
    postMock: jest.Mock;
    getMock: jest.Mock;
    createMock: jest.Mock;
    serviceSubmitMock: jest.Mock;
    cartConstructorMock: jest.Mock;
};

function setupController(): ControllerSetup {
    jest.resetModules();
    process.env.LINE_PAY_CHANNEL_ID = "test-channel";
    process.env.LINE_PAY_CHANNEL_SECRET = "test-secret";
    process.env.LINE_PAY_SITE = "https://pay.test";

    const { default: LinePayController } = require("../controllers/linePayController");
    const axiosModule = require("axios").default as any;
    const cartModule = require("../controllers/cartController");

    const postMock = axiosModule.__post as jest.Mock;
    const getMock = axiosModule.__get as jest.Mock;
    const createMock = axiosModule.create as jest.Mock;
    const serviceSubmitMock = cartModule.__serviceSubmit as jest.Mock;
    const cartConstructorMock = cartModule.default as jest.Mock;

    postMock.mockReset();
    getMock.mockReset();
    createMock.mockClear();
    serviceSubmitMock.mockReset();
    cartConstructorMock.mockClear();

    const controller = new LinePayController();

    return { controller, postMock, getMock, createMock, serviceSubmitMock, cartConstructorMock };
}

describe("Line Pay controller", () => {
    const cryptoModule = require("crypto");

    test("linePayRequest signs payload and posts to LINE Pay", async () => {
        const { controller, postMock } = setupController();
        const nonceSpy = jest.spyOn(cryptoModule, "randomUUID").mockReturnValue("nonce-123");
        postMock.mockResolvedValueOnce({ data: { ok: true } });

        const result = await controller.linePayRequest("POST", "/v3/payments/request", { amount: 100 });

        expect(postMock).toHaveBeenCalledWith(
            "https://pay.test/v3/payments/request",
            { amount: 100 },
            expect.objectContaining({
                headers: expect.objectContaining({
                    "X-LINE-ChannelId": "test-channel",
                    "Content-Type": "application/json",
                    "X-LINE-Authorization": expect.any(String),
                    "X-LINE-Authorization-Nonce": "nonce-123",
                }),
                data: JSON.stringify({ amount: 100 }),
            })
        );
        expect(result).toEqual({ ok: true });
        nonceSpy.mockRestore();
    });

    test("linePayRequest performs GET checks", async () => {
        const { controller, getMock } = setupController();
        const nonceSpy = jest.spyOn(cryptoModule, "randomUUID").mockReturnValue("nonce-789");
        getMock.mockResolvedValueOnce({ data: { status: "ok" } });

        const response = await controller.linePayRequest("GET", "/v3/payments/state", null);

        expect(getMock).toHaveBeenCalledWith(
            "https://pay.test/v3/payments/state",
            expect.objectContaining({
                headers: expect.objectContaining({
                    "X-LINE-ChannelId": "test-channel",
                    "X-LINE-Authorization": expect.any(String),
                    "X-LINE-Authorization-Nonce": "nonce-789",
                }),
            })
        );
        expect(response).toEqual({ status: "ok" });
        nonceSpy.mockRestore();
    });

    test("sendingRequest returns payment URL when request succeeds", async () => {
        const { controller } = setupController();
        const linePayRequestSpy = jest
            .spyOn(controller, "linePayRequest")
            .mockResolvedValueOnce({ info: { paymentUrl: { web: "https://pay.line/web" } } });
        const dateSpy = jest.spyOn(Date, "now").mockReturnValue(1700000000000);

        const req = {
            body: {
                payload: encodeURIComponent(JSON.stringify({ total_price: 320 })),
            },
        } as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await controller.sendingRequest(req, res);

        expect(linePayRequestSpy).toHaveBeenCalledWith(
            "POST",
            "/v3/payments/request",
            expect.objectContaining({
                amount: 320,
                currency: "TWD",
                packages: expect.any(Array),
            })
        );
        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: "https://pay.line/web",
        });

        linePayRequestSpy.mockRestore();
        dateSpy.mockRestore();
    });

    test("sendingRequest reports failure when payment URL is missing", async () => {
        const { controller } = setupController();
        jest.spyOn(controller, "linePayRequest").mockResolvedValueOnce({});

        const req = {
            body: {
                payload: encodeURIComponent(JSON.stringify({ total_price: 150 })),
            },
        } as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await controller.sendingRequest(req, res);

        expect(res.send).toHaveBeenCalledWith({
            status: "failed",
            data: expect.stringContaining("LINE Pay"),
        });
    });

    test("confirm triggers order submission when LINE Pay returns success", async () => {
        const { controller, serviceSubmitMock, cartConstructorMock } = setupController();
        jest.spyOn(controller, "linePayRequest").mockResolvedValueOnce({ returnCode: "0000" });

        const payload = { total_price: 450 };
        const req = {
            query: {
                transactionId: "TX123",
                orderId: "ORDER-99",
                payload: encodeURIComponent(JSON.stringify(payload)),
            },
        } as any;
        const res = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await controller.confirm(req, res);

        expect(cartConstructorMock).toHaveBeenCalled();
        expect(serviceSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                total_price: 450,
                orderId: "ORDER-99",
            })
        );
        expect(res.redirect).toHaveBeenCalledWith("http://localhost:5173/payment/result?transactionId=TX123");
    });

    test("confirm still redirects when LINE Pay denies payment", async () => {
        const { controller, serviceSubmitMock } = setupController();
        jest.spyOn(controller, "linePayRequest").mockResolvedValueOnce({ returnCode: "9999" });

        const req = {
            query: {
                transactionId: "TX999",
                payload: encodeURIComponent(JSON.stringify({ total_price: 200 })),
            },
        } as any;
        const res = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await controller.confirm(req, res);

        expect(serviceSubmitMock).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("http://localhost:5173/payment/result?transactionId=TX999");
    });

    test("check proxies LINE Pay status", async () => {
        const { controller } = setupController();
        jest.spyOn(controller, "linePayRequest").mockResolvedValueOnce({ raw: "data" });

        const req = {
            query: { transactionId: "TX777" },
        } as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await controller.check(req, res);

        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: { ok: true, raw: { raw: "data" } },
        });
    });
});
