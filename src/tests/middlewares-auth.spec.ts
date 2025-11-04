import { checkToken } from "../middlewares/checkToken";

jest.mock("../models/User_token", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        update: jest.fn(),
    },
}));

const mockUserTokenModel = jest.requireMock("../models/User_token").default as any;

describe("checkToken middleware", () => {
    beforeEach(() => {
        mockUserTokenModel.findOne.mockReset();
        mockUserTokenModel.update.mockReset();
        process.env.PERMANENT_TOKEN = "permanent-token";
    });

    const buildResponse = () => {
        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        return res;
    };

    test("allows requests with permanent token", async () => {
        const req: any = { headers: { token: "permanent-token" } };
        const res = buildResponse();
        const next = jest.fn();

        await checkToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test("renews valid user token and calls next", async () => {
        const req: any = { headers: { token: "user-token" } };
        const res = buildResponse();
        const next = jest.fn();

        mockUserTokenModel.findOne.mockResolvedValue({
            id: 33,
            token: "user-token",
            expiredAt: new Date(Date.now() + 60_000),
        });
        mockUserTokenModel.update.mockResolvedValue({});

        await checkToken(req, res, next);

        expect(mockUserTokenModel.update).toHaveBeenCalledWith(
            {
                expiredAt: expect.any(Date),
            },
            {
                where: { id: 33 },
            }
        );
        expect(next).toHaveBeenCalled();
    });

    test("rejects expired tokens", async () => {
        const req: any = { headers: { token: "expired" } };
        const res = buildResponse();
        const next = jest.fn();

        mockUserTokenModel.findOne.mockResolvedValue({
            id: 44,
            token: "expired",
            expiredAt: new Date(Date.now() - 60_000),
        });

        await checkToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "failed",
                data: expect.stringContaining("Token"),
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects requests without token header", async () => {
        const req: any = { headers: {} };
        const res = buildResponse();
        const next = jest.fn();

        await checkToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "failed",
            })
        );
        expect(next).not.toHaveBeenCalled();
    });
});
