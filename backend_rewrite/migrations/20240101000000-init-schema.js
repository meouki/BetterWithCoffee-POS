module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Categories
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('categories')) {
      await queryInterface.createTable('categories', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 2. Users
    if (!tables.includes('users')) {
      await queryInterface.createTable('users', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(100), allowNull: false },
        username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
        password: { type: Sequelize.STRING(255), allowNull: false },
        role: { type: Sequelize.ENUM('Master', 'Admin', 'Cashier'), allowNull: false, defaultValue: 'Cashier' },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        last_login: { type: Sequelize.DATE, allowNull: true },
        avatar_icon: { type: Sequelize.STRING(50), allowNull: true, defaultValue: 'User' },
        session_id: { type: Sequelize.STRING(255), allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 3. Inventory
    if (!tables.includes('inventory')) {
      await queryInterface.createTable('inventory', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        category: { type: Sequelize.STRING(100), allowNull: false },
        stock: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
        unit: { type: Sequelize.STRING(20), allowNull: false },
        threshold: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
        last_updated: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 4. Products
    if (!tables.includes('products')) {
      await queryInterface.createTable('products', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        category_name: { type: Sequelize.STRING(100), allowNull: false },
        base_price: { type: Sequelize.FLOAT, allowNull: false },
        is_available: { type: Sequelize.BOOLEAN, defaultValue: true },
        has_sizes: { type: Sequelize.BOOLEAN, defaultValue: false },
        modifiers: { type: Sequelize.BOOLEAN, defaultValue: false },
        has_sugar_selector: { type: Sequelize.BOOLEAN, defaultValue: false },
        has_milk_selector: { type: Sequelize.BOOLEAN, defaultValue: false },
        addons: { type: Sequelize.TEXT, defaultValue: '[]' },
        is_archived: { type: Sequelize.BOOLEAN, defaultValue: false },
        image_url: { type: Sequelize.STRING(500), allowNull: true, defaultValue: null },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 5. Product Sizes
    if (!tables.includes('product_sizes')) {
      await queryInterface.createTable('product_sizes', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        product_id: { type: Sequelize.INTEGER, allowNull: false },
        name: { type: Sequelize.STRING(50), allowNull: false },
        price: { type: Sequelize.FLOAT, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 6. Recipes
    if (!tables.includes('recipes')) {
      await queryInterface.createTable('recipes', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        product_id: { type: Sequelize.INTEGER, allowNull: false },
        size_id: { type: Sequelize.INTEGER, allowNull: true },
        inventory_id: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.FLOAT, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 7. Orders
    if (!tables.includes('orders')) {
      await queryInterface.createTable('orders', {
        id: { type: Sequelize.STRING(50), primaryKey: true, allowNull: false },
        timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW, allowNull: false },
        subtotal: { type: Sequelize.FLOAT, allowNull: false },
        vat: { type: Sequelize.FLOAT, allowNull: false },
        total: { type: Sequelize.FLOAT, allowNull: false },
        payment_method: { type: Sequelize.STRING(50), allowNull: false },
        order_type: { type: Sequelize.STRING(50), allowNull: false },
        cashier: { type: Sequelize.STRING(100), allowNull: false },
        amount_tendered: { type: Sequelize.FLOAT, allowNull: true, defaultValue: null },
        change: { type: Sequelize.FLOAT, allowNull: true, defaultValue: null },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 8. Order Items
    if (!tables.includes('order_items')) {
      await queryInterface.createTable('order_items', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        order_id: { type: Sequelize.STRING(50), allowNull: false },
        product_id: { type: Sequelize.INTEGER, allowNull: true },
        name: { type: Sequelize.STRING, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        price: { type: Sequelize.FLOAT, allowNull: false },
        original_price: { type: Sequelize.FLOAT, allowNull: true },
        modifiers: { type: Sequelize.TEXT, defaultValue: '[]' },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 9. Attendance
    if (!tables.includes('attendance')) {
      await queryInterface.createTable('attendance', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.INTEGER, allowNull: false },
        date: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW },
        clock_in: { type: Sequelize.DATE, allowNull: true },
        clock_out: { type: Sequelize.DATE, allowNull: true },
        type: { type: Sequelize.ENUM('Work', 'DayOff'), defaultValue: 'Work' },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 10. Notifications
    if (!tables.includes('notifications')) {
      await queryInterface.createTable('notifications', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        type: { type: Sequelize.STRING(50), allowNull: false },
        message: { type: Sequelize.TEXT, allowNull: false },
        details: { type: Sequelize.TEXT, allowNull: true },
        cashier: { type: Sequelize.STRING(100), allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }

    // 11. Stock Logs
    if (!tables.includes('stock_logs')) {
      await queryInterface.createTable('stock_logs', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        inventory_id: { type: Sequelize.INTEGER, allowNull: false },
        change_qty: { type: Sequelize.FLOAT, allowNull: false },
        reason: { type: Sequelize.STRING(20), allowNull: false },
        reference_id: { type: Sequelize.STRING(50), allowNull: true },
        stock_after: { type: Sequelize.FLOAT, allowNull: false },
        timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_logs');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('attendance');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('recipes');
    await queryInterface.dropTable('product_sizes');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('inventory');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('categories');
  }
};
