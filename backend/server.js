require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get("/", (req, res) => {
  res.send("POS Backend is running!");
});

// routers
const productRouter = require('./routes/product');
const orderRouter = require('./routes/order');
const inventoryRouter = require('./routes/inventory');
const logRouter = require('./routes/log');

app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/logs", logRouter);

const PORT = process.env.PORT || 5000;

db.sequelize.sync({ alter: true }) 
  .then(() => {
    console.log("Database synced successfully.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database: ", err.message);
  });