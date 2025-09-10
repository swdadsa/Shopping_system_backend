import request from 'supertest';
import app from '../../testServer';

// Mock controller
// jest.mock('../src/controllers/userController', () => ({
//     getUser: jest.fn((req, res) => {
//         return res.json({ mocked: true, id: req.params.id });
//     }),
// }));

describe('route test', () => {
    test('GET /api/account/unitTest', async () => {
        const res = await request(app).get('/api/account/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'accroun unit test'
        });
    });

    test('GET /api/mainTitle/unitTest', async () => {
        const res = await request(app).get('/api/mainTitle/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'mainTitle unit test'
        });
    });

    test('GET /api/subTitle/unitTest', async () => {
        const res = await request(app).get('/api/subTitle/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'subTitle unit test'
        });
    });

    test('GET /api/items/unitTest', async () => {
        const res = await request(app).get('/api/items/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'items unit test'
        });
    });

    test('GET /api/cart/unitTest', async () => {
        const res = await request(app).get('/api/cart/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'cart unit test'
        });
    });

    test('GET /api/orderList/unitTest', async () => {
        const res = await request(app).get('/api/orderList/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'orderList unit test'
        });
    });

    test('GET /api/advertisement/unitTest', async () => {
        const res = await request(app).get('/api/advertisement/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'advertisement unit test'
        });
    });

    test('GET /api/discount/unitTest', async () => {
        const res = await request(app).get('/api/discount/unitTest');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'success',
            data: 'discount unit test'
        });
    });

})