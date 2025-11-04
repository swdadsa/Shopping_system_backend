import request from "supertest";
import app from "../../testServer";

jest.mock("../models/User", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
}));

jest.mock("../models/User_token", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("../models/User_role", () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));

jest.mock("../models/Roles", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock("bcrypt", () => {
    const compare = jest.fn();
    const hash = jest.fn();
    return {
        __esModule: true,
        default: {
            compare,
            hash,
        },
        compare,
        hash,
    };
});

jest.mock("../utils/jwt", () => ({
    __esModule: true,
    generateVerificationToken: jest.fn(),
    verifyToken: jest.fn(),
}));

jest.mock("../utils/emailSender", () => ({
    __esModule: true,
    sendVerificationEmail: jest.fn(),
}));

jest.mock("../middlewares/checkToken", () => ({
    checkToken: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../middlewares/checkRole", () => ({
    checkRole: () => (_req: any, _res: any, next: any) => next(),
}));

const mockUser = jest.requireMock("../models/User").default as any;
const mockUserToken = jest.requireMock("../models/User_token").default as any;
const mockUserRole = jest.requireMock("../models/User_role").default as any;
const mockRoles = jest.requireMock("../models/Roles").default as any;
const bcryptMock = jest.requireMock("bcrypt");
const compareMock = bcryptMock.compare as jest.Mock;
const hashMock = bcryptMock.hash as jest.Mock;
const jwtMock = jest.requireMock("../utils/jwt");
const generateVerificationTokenMock = jwtMock.generateVerificationToken as jest.Mock;
const verifyTokenMock = jwtMock.verifyToken as jest.Mock;
const sendVerificationEmailMock = jest.requireMock("../utils/emailSender").sendVerificationEmail as jest.Mock;

describe("Account controller auth flows", () => {
    beforeEach(() => {
        mockUser.findOne.mockReset();
        mockUser.findAll.mockReset();
        mockUser.create.mockReset();
        mockUser.update.mockReset();
        mockUser.destroy.mockReset();

        mockUserToken.findOne.mockReset();
        mockUserToken.create.mockReset();
        mockUserToken.update.mockReset();

        mockUserRole.create.mockReset();
        mockRoles.findOne.mockReset();

        compareMock.mockReset();
        hashMock.mockReset();
        generateVerificationTokenMock.mockReset();
        verifyTokenMock.mockReset();
        sendVerificationEmailMock.mockReset();
    });

    const signInPath = "/api/account/signIn";
    const signUpPath = "/api/account/signUp";
    const updatePasswordPath = "/api/account/updatePassword";
    const verifyAccountPath = "/api/account/verifyAccount";

    test("signIn succeeds with username and returns session token", async () => {
        mockUser.findOne.mockResolvedValueOnce({
            id: 1,
            username: "demoUser",
            password: "stored-hash",
        });
        compareMock.mockResolvedValueOnce(true);
        hashMock.mockResolvedValueOnce("hashed-token");
        mockRoles.findOne.mockResolvedValueOnce({
            permission: 7,
            name: "manager",
            chinese_name: "管理員",
        });
        mockUserToken.create.mockResolvedValueOnce({});

        const res = await request(app)
            .post(signInPath)
            .send({ username: "demoUser", password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "success",
            data: {
                id: 1,
                username: "demoUser",
                permissions: 7,
                name: "manager",
                chinese_name: "管理員",
                token: "hashed-token",
            },
        });
        expect(mockUserToken.create).toHaveBeenCalledWith({
            user_id: 1,
            token: "hashed-token",
            expiredAt: expect.any(Date),
        });
    });

    test("signIn fails when account is missing", async () => {
        mockUser.findOne.mockResolvedValueOnce(null);

        const res = await request(app)
            .post(signInPath)
            .send({ username: "ghostUser", password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "failed",
            data: "帳號不存在或尚未驗證",
        });
        expect(mockUserToken.create).not.toHaveBeenCalled();
    });

    test("signIn rejects incorrect password", async () => {
        mockUser.findOne.mockResolvedValueOnce({
            id: 2,
            username: "demoUser",
            password: "stored-hash",
        });
        compareMock.mockResolvedValueOnce(false);

        const res = await request(app)
            .post(signInPath)
            .send({ username: "demoUser", password: "wrongpass" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            status: "failed",
            data: "密碼錯誤",
        });
        expect(mockUserToken.create).not.toHaveBeenCalled();
    });

    test("signUp short-circuits when account already exists", async () => {
        mockUser.findOne.mockResolvedValueOnce({ id: 10 });

        const res = await request(app)
            .post(signUpPath)
            .send({
                username: "duplicate",
                password: "password123",
                email: "duplicate@example.com",
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "failed",
            data: "account or email is already exist",
        });
        expect(mockUser.create).not.toHaveBeenCalled();
    });

    test("signUp creates user, assigns default role, and emails verification link", async () => {
        mockUser.findOne.mockResolvedValueOnce(null);
        hashMock.mockResolvedValueOnce("hashed-password");
        mockUser.create.mockResolvedValueOnce({ id: 55 });
        mockUserRole.create.mockResolvedValueOnce({});
        generateVerificationTokenMock.mockReturnValueOnce("verify-token");
        sendVerificationEmailMock.mockResolvedValueOnce(undefined);

        const res = await request(app)
            .post(signUpPath)
            .send({
                username: "newmember",
                password: "password123",
                email: "member@example.com",
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "success",
            data: "We already send a verify mail to you, please checkout you email",
        });
        expect(mockUser.create).toHaveBeenCalledWith({
            username: "newmember",
            email: "member@example.com",
            password: "hashed-password",
            isVerified: false,
        });
        expect(mockUserRole.create).toHaveBeenCalledWith({
            user_id: 55,
            role_id: 1,
        });
        expect(sendVerificationEmailMock).toHaveBeenCalledWith("member@example.com", "verify-token");
    });

    test("updatePassword succeeds when token and passwords are valid", async () => {
        mockUserToken.findOne.mockResolvedValueOnce({ user_id: 3 });
        mockUser.findOne.mockResolvedValueOnce({
            id: 3,
            password: "stored-hash",
            update: jest.fn().mockResolvedValueOnce(undefined),
        });
        compareMock.mockResolvedValueOnce(true);
        hashMock.mockResolvedValueOnce("new-hash");

        const res = await request(app)
            .patch(updatePasswordPath)
            .set("token", "valid-token")
            .send({
                oldPassword: "oldpass1",
                newPassword: "newpass1",
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "success",
            data: "update password successfully",
        });
        expect(hashMock).toHaveBeenCalledWith("newpass1", 10);
    });

    test("updatePassword returns failure when token is missing", async () => {
        mockUserToken.findOne.mockResolvedValueOnce(null);

        const res = await request(app)
            .patch(updatePasswordPath)
            .send({
                oldPassword: "oldpass1",
                newPassword: "newpass1",
            });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            status: "failed",
            data: "update password failed",
        });
    });

    test("verifyAccount marks account as verified", async () => {
        const saveMock = jest.fn().mockResolvedValueOnce(undefined);
        verifyTokenMock.mockReturnValueOnce({ email: "member@example.com" });
        mockUser.findOne.mockResolvedValueOnce({
            id: 9,
            email: "member@example.com",
            isVerified: false,
            save: saveMock,
        });

        const res = await request(app)
            .get(verifyAccountPath)
            .query({ token: "signed-token" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "success",
            data: "verify successfully",
        });
        expect(saveMock).toHaveBeenCalled();
    });
});
