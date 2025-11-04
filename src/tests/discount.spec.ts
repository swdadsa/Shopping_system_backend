import discountController from "../controllers/discountController";

jest.mock("../models/Discount", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn(),
    },
}));

const mockDiscountModel = jest.requireMock("../models/Discount").default as any;
const { Op } = require("sequelize");

const buildResponse = () => ({
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
});

describe("discountController", () => {
    let controller: discountController;

    beforeEach(() => {
        controller = new discountController();
        mockDiscountModel.findAll.mockReset();
        mockDiscountModel.findOne.mockReset();
        mockDiscountModel.create.mockReset();
        mockDiscountModel.destroy.mockReset();
    });

    test("index returns all discounts", async () => {
        const res = buildResponse();
        mockDiscountModel.findAll.mockResolvedValueOnce([{ id: 1 }]);

        await controller.index({} as any, res as any);

        expect(mockDiscountModel.findAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: [{ id: 1 }],
        });
    });

    test("show filters by item and date range", async () => {
        const res = buildResponse();
        mockDiscountModel.findOne.mockResolvedValueOnce({ id: 9 });

        const req = {
            query: {
                item_id: "12",
                date: "2024-01-05",
            },
        } as any;

        await controller.show(req, res as any);

        expect(mockDiscountModel.findOne).toHaveBeenCalled();
        const where = mockDiscountModel.findOne.mock.calls[0][0].where;
        expect(where.item_id).toBe(12);
        expect(where.startAt[Op.lte]).toEqual(new Date("2024-01-05"));
        expect(where.endAt[Op.gte]).toEqual(new Date("2024-01-05"));
        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: { id: 9 },
        });
    });

    test("store persists new discount", async () => {
        const res = buildResponse();
        mockDiscountModel.create.mockResolvedValueOnce({ id: 20 });

        const req = {
            body: {
                item_id: 7,
                discountNumber: 30,
                discountPercent: null,
                startAt: "2024-02-01",
                endAt: "2024-02-10",
            },
        } as any;

        await controller.store(req, res as any);

        expect(mockDiscountModel.create).toHaveBeenCalledWith({
            item_id: 7,
            discountNumber: 30,
            discountPercent: null,
            startAt: "2024-02-01",
            endAt: "2024-02-10",
        });
        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: "add discount successfully",
        });
    });

    test("store reports failure when creation returns null", async () => {
        const res = buildResponse();
        mockDiscountModel.create.mockResolvedValueOnce(null);

        await controller.store({ body: {} } as any, res as any);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            status: "failed",
            data: "add discount failed",
        });
    });

    test("destroy handles missing discount", async () => {
        const res = buildResponse();
        mockDiscountModel.destroy.mockResolvedValueOnce(0);

        await controller.destroy({ query: { id: "88" } } as any, res as any);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            status: "failed",
            data: "delete discount failed",
        });
    });
});
