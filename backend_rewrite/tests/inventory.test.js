const request = require('supertest');
const app = require('../app');
const { sequelize, Product, Inventory, Recipe, Order, OrderItem, User, Category, StockLog } = require('../models');
// describe, it, expect, beforeAll, afterAll, beforeEach, vi are provided globally by vitest config

describe('Inventory Logic (Sales Deduction)', () => {
    beforeAll(async () => {
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
            name: 'Espresso',
            base_price: 50.0,
            category_name: 'Coffee'
        });

        await Inventory.create({
            id: 1,
            name: 'Coffee Beans',
            category: 'Raw Material',
            stock: 1000.0,
            unit: 'grams',
            threshold: 100.0
        });

        await Recipe.create({
            product_id: 1,
            inventory_id: 1,
            quantity: 18.5 // 18.5g per espresso
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should deduct inventory stock when an order is placed', async () => {
        const orderId = 'ORD-INV-' + Date.now();
        const orderData = {
            id: orderId,
            subtotal: 50.0,
            vat: 6.0,
            total: 56.0,
            payment_method: 'Cash',
            order_type: 'Takeaway',
            cashier: 'master',
            items: [
                {
                    id: 1,
                    name: 'Espresso',
                    quantity: 2,
                    price: 50.0,
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

        // Verify inventory deduction: 1000 - (18.5 * 2) = 1000 - 37 = 963
        const ingredient = await Inventory.findByPk(1);
        expect(ingredient.stock).toBe(963.0);

        // Verify stock log creation
        const log = await StockLog.findOne({
            where: { inventory_id: 1, reference_id: orderId }
        });
        expect(log).not.toBeNull();
        expect(log.change_qty).toBe(-37.0);
        expect(log.reason).toBe('order');
    });
});
