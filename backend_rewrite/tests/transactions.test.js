const request = require('supertest');
const app = require('../app');
const { sequelize, Product, Inventory, Recipe, Order, OrderItem, User, Category } = require('../models');
// describe, it, expect, beforeAll, afterAll, beforeEach, vi are provided globally by vitest config

describe('Transaction Logic (Orders API)', () => {
    beforeAll(async () => {
        // Use an in-memory database for testing to avoid touching production data
        // Note: config/db.js might need to be adjusted or mocked if it doesn't support this easily
        await sequelize.sync({ force: true });

        // Seed basic data
        await User.create({
            id: '1',
            name: 'Test Master',
            username: 'master',
            password: 'password',
            role: 'Master',
            session_id: 'test-session'
        });

        await Category.create({ name: 'Coffee' });
        await Product.create({
            id: 1,
            name: 'Caffe Latte',
            base_price: 75.0,
            category_name: 'Coffee'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create an order and record transaction totals correctly', async () => {
        const orderId = 'ORD-' + Date.now();
        const orderData = {
            id: orderId,
            timestamp: new Date().toISOString(),
            subtotal: 150.0,
            vat: 18.0,
            total: 168.0,
            payment_method: 'Cash',
            order_type: 'Dine In',
            cashier: 'master',
            amount_tendered: 200.0,
            change: 32.0,
            items: [
                {
                    id: 1,
                    name: 'Caffe Latte',
                    quantity: 2,
                    price: 75.0,
                    modifiers: []
                }
            ]
        };

        const res = await request(app)
            .post('/api/orders')
            .set('x-user-id', '1')
            .set('x-session-id', 'test-session')
            .send(orderData);

        expect(res.status).toBe(201);
        expect(res.body.id).toBe(orderId);
        expect(res.body.total).toBe(168.0);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].name).toBe('Caffe Latte');
        expect(res.body.items[0].price).toBe(75.0);
    });

    it('should fail to create an order with missing required fields', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('x-user-id', '1')
            .set('x-session-id', 'test-session')
            .send({ items: [] });

        expect(res.status).toBe(400);
    });
});
