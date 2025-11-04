import cart from "../controllers/cartController";
import { Request, Response } from "express";

jest.mock("../models/Cart", () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        destroy: jest.fn(),
    },
}));

jest.mock("../models/Order_list", () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("../models/Order_list_detail", () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));

jest.mock("../models/Items", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock("../models/Discount", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock("dayjs", () => {
    let current = "2024-01-01";
    const factory = () => ({
        format: () => current,
    });
    (factory as any).set = (value: string) => {
        current = value;
    };
    return factory;
});

const mockCartModel = jest.requireMock("../models/Cart").default as any;
const mockOrderListModel = jest.requireMock("../models/Order_list").default as any;
const mockOrderDetailModel = jest.requireMock("../models/Order_list_detail").default as any;
const mockItemsModel = jest.requireMock("../models/Items").default as any;
const mockDiscountModel = jest.requireMock("../models/Discount").default as any;
const dayjsMock = jest.requireMock("dayjs") as any;

describe("Cart controller workflows", () => {
    let controller: cart;
    let res: Response;

    beforeEach(() => {
        controller = new cart();
        res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        process.env.APP_URL = "https://static.example.com";
        dayjsMock.set("2024-01-01");

        mockCartModel.create.mockReset();
        mockCartModel.findAll.mockReset();
        mockCartModel.findOne.mockReset();
        mockCartModel.destroy.mockReset();
        mockOrderListModel.create.mockReset();
        mockOrderListModel.update.mockReset();
        mockOrderDetailModel.create.mockReset();
        mockItemsModel.findOne.mockReset();
        mockDiscountModel.findOne.mockReset();
    });

    test("store persists a cart record per requested quantity", async () => {
        mockCartModel.create.mockResolvedValue({});
        const req = {
            body: {
                user_id: 42,
                item_id: 77,
                amount: 3,
            },
        } as unknown as Request;

        await controller.store(req, res);

        expect(mockCartModel.create).toHaveBeenCalledTimes(3);
        expect(mockCartModel.create).toHaveBeenNthCalledWith(1, {
            user_id: 42,
            item_id: 77,
        });
        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: "store items to cart successfully",
        });
    });

    test("show aggregates cart items and applies numeric discount", async () => {
        const aggregatedRow = {
            item_id: 99,
            get: jest.fn().mockReturnValue(2),
        };
        mockCartModel.findAll.mockResolvedValueOnce([aggregatedRow]);
        mockItemsModel.findOne.mockResolvedValueOnce({
            id: 99,
            name: "Mechanical Keyboard",
            price: 120,
            storage: 15,
            discounts: [{ discountNumber: 10, discountPercent: null }],
            images: [{ path: "/keyboard.jpg" }],
        });

        const req = {
            query: { user_id: "8" },
        } as unknown as Request;

        await controller.show(req, res);

        expect(mockCartModel.findAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { user_id: 8 },
            group: "item_id",
            order: [["item_id", "ASC"]],
        }));
        const payload = (res.send as jest.Mock).mock.calls[0][0];
        expect(payload.status).toBe("success");
        expect(payload.data).toHaveLength(1);
        expect(payload.data[0]).toMatchObject({
            id: 99,
            name: "Mechanical Keyboard",
            amount: 2,
            totalPrice: 220,
            path: "https://static.example.com/keyboard.jpg",
        });
    });

    test("submit creates order list, details, and clears cart", async () => {
        mockOrderListModel.create.mockResolvedValueOnce({ id: 501 });
        mockItemsModel.findOne
            .mockResolvedValueOnce({ id: 99, price: 100 })
            .mockResolvedValueOnce({ id: 100, price: 80 });
        mockDiscountModel.findOne
            .mockResolvedValueOnce({ discountNumber: 10, discountPercent: null })
            .mockResolvedValueOnce(null);
        mockOrderDetailModel.create.mockResolvedValue({});
        mockCartModel.findOne
            .mockResolvedValue({ id: 900 });
        mockCartModel.destroy.mockResolvedValue({});
        mockOrderListModel.update.mockResolvedValue({});

        const req = {
            body: {
                orderId: "ORDER-2024",
                user_id: 7,
                item: [
                    { id: 99, amount: 2 },
                    { id: 100, amount: 1 },
                ],
            },
        } as unknown as Request;

        await controller.submit(req, res);

        expect(mockOrderListModel.create).toHaveBeenCalledWith({
            order_unique_number: "ORDER-2024",
            user_id: 7,
            condition: 0,
        });
        expect(mockOrderDetailModel.create).toHaveBeenCalledTimes(2);
        expect(mockCartModel.destroy).toHaveBeenCalledTimes(3);
        expect(mockOrderListModel.update).toHaveBeenCalledWith(
            { total_price: 260 },
            { where: { id: 501 } }
        );
        expect(res.send).toHaveBeenCalledWith({
            status: "success",
            data: "create order list successfully",
        });
    });
});
