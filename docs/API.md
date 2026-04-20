<!-- GSD:docs-update -->
# API Reference — PulsePoint POS

Base URL: `http://localhost:5000/api`

All endpoints (except `/users/login` and `/notifications`) require session authentication headers:

| Header | Value |
|--------|-------|
| `x-user-id` | Authenticated user's numeric ID |
| `x-session-id` | UUID session token received at login |

---

## Authentication

### `POST /users/login`
Authenticate a user and receive a session token.

**Body:**
```json
{ "username": "master", "password": "master123" }
```
**Response `200`:**
```json
{
  "user": { "id": 1, "username": "master", "role": "Master", "name": "Master", "avatar_icon": "..." },
  "session_id": "uuid-v4"
}
```
> Logging in invalidates any previous session for this account (single active session).

---

## Users `/api/users`

### `GET /`
List all users (excludes password field). **Auth required.**

### `POST /`
Create a new user. **Auth required.**
```json
{ "name": "Jane", "username": "jane", "password": "secret123", "role": "Cashier" }
```

### `PATCH /:id`
Update user fields. **Auth required.** User `id=1` (root Master) cannot have `role` or `is_active` changed.
```json
{ "name": "Jane Doe", "role": "Admin", "is_active": true }
```

### `DELETE /:id`
Delete a user. **Auth required.** User `id=1` is protected from deletion.

---

## Products `/api/products`

### `GET /`
List all products ordered by ID. **Auth required.**

### `GET /:id`
Get a single product by ID. **Auth required.**

### `POST /`
Create a product. Supports `multipart/form-data` for image uploads. **Auth required.**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name |
| `category_name` | string | Must match an existing category name |
| `base_price` | number | Base price in PHP |
| `is_available` | boolean | Show/hide on POS |
| `modifiers` | boolean | Enable modifier sheet (sugar, milk) |
| `has_sugar_selector` | boolean | Show sugar level slider |
| `addons` | JSON string | Array of `{ name, price }` addon objects |
| `image` | file | Product image (any format → converted to WebP) |

### `PATCH /:id`
Update product fields. Same fields as POST. **Auth required.**

### `DELETE /:id`
Delete product. **Auth required.**

---

## Categories `/api/categories`

### `GET /`
List active categories sorted by name. **Auth required.**

### `POST /`
Create category. Returns `400` if name exists. **Auth required.**
```json
{ "name": "Hot Drinks" }
```

### `PUT /:id`
Update category name or active status. **Auth required.**
```json
{ "name": "Hot Beverages", "is_active": true }
```

### `DELETE /:id`
Delete category. Returns `400` if the category has products. **Auth required.**

---

## Orders `/api/orders`

### `GET /`
List orders with optional filters and pagination. **Auth required.**

| Query Param | Description |
|-------------|-------------|
| `from` | Start date (ISO string) |
| `to` | End date (ISO string) |
| `page` | Page number (default: 1) |
| `limit` | Items per page (default: 20) |

**Response:** `{ orders: [...], meta: { total, page, limit, totalPages } }`

### `POST /`
Create an order with items in a single transaction. **Auth required.**
```json
{
  "id": "ORD-123456",
  "timestamp": "2026-04-12T12:00:00Z",
  "subtotal": 150,
  "vat": 16.07,
  "total": 166.07,
  "payment_method": "Cash",
  "order_type": "Dine In",
  "cashier": "jane",
  "amount_tendered": 200,
  "change": 33.93,
  "items": [
    {
      "product_id": 1,
      "name": "Caramel Latte",
      "quantity": 2,
      "price": 75,
      "original_price": 75,
      "modifiers": { "size": "Regular", "sugar": 75 }
    }
  ]
}
```

---

## Inventory `/api/inventory`

### `GET /`
List all inventory items ordered by ID. **Auth required.**

### `GET /logs`
Fetch last 200 stock log entries in reverse chronological order, including ingredient name. **Auth required.**

### `POST /`
Create inventory item. Auto-creates an initial `StockLog` entry. **Auth required.**
```json
{ "name": "Espresso Beans", "category": "Coffee", "stock": 5000, "unit": "g", "threshold": 500 }
```

### `PATCH /:id`
Update inventory item. If `stock` changes, auto-creates a `StockLog` entry with the delta. **Auth required.**
```json
{ "stock": 4500, "reason": "manual", "reference_id": null }
```

### `DELETE /:id`
Delete inventory item (cascade-deletes associated stock logs). **Auth required.**

---

## Product Sizes `/api/product-sizes`

### `GET /`
List all product sizes. Filter by `?product_id=X`. **Auth required.**

### `POST /`
Create a size variation. **Auth required.**
```json
{ "product_id": 1, "name": "Large", "price_adjustment": 15, "sort_order": 1 }
```

### `PATCH /:id`
Update a size. **Auth required.**

### `DELETE /:id`
Delete a size (nullifies linked recipes). **Auth required.**

---

## Recipes `/api/recipes`

### `GET /`
List all recipes. Filter by `?product_id=X`. Includes `Inventory` ingredient details. **Auth required.**

### `POST /`
Create a recipe entry (product-to-ingredient link). **Auth required.**
```json
{ "product_id": 1, "size_id": null, "inventory_id": 3, "quantity": 30 }
```
> `size_id: null` means the recipe applies to all sizes of the product.

### `DELETE /:id`
Delete a recipe entry. **Auth required.**

---

## Attendance `/api/attendance`

### `GET /:userId`
Fetch all attendance records for a user. **Auth required.**

### `POST /clock-in`
Clock in for today. **Auth required.**
```json
{ "user_id": 2 }
```

### `POST /clock-out`
Clock out for today. Requires a prior clock-in. **Auth required.**
```json
{ "user_id": 2 }
```

### `POST /day-off`
Mark a date as day off. **Auth required.**
```json
{ "user_id": 2, "date": "2026-04-12" }
```

### `GET /stats/:username`
Aggregate total revenue and order count attributed to a cashier. **Auth required.**

---

## Notifications `/api/notifications`

### `GET /cloud-status`
Returns Cloudflare tunnel status. **No auth required.**

### `GET /`
List all notifications in reverse chronological order. **Auth required.**

### `POST /`
Create a notification log entry. **Auth required.**
```json
{ "type": "SALE", "message": "Order ORD-123456 completed", "details": "...", "cashier": "jane" }
```

### `DELETE /`
Clear all notifications. **Auth required.**

---

## System `/api/system`

> All system endpoints require **Master** role. Destructive operations are irreversible.

### `GET /export`
Download the raw `pos_data.sqlite` file. Returns binary file stream with `Content-Disposition: attachment` and cache-busting headers.

### `POST /import`
Replace the database file. **Triggers automatic server restart.**

Accepts `multipart/form-data`:
| Field | Type | Description |
|-------|------|-------------|
| `db` | file | `.sqlite` file to restore |
| `password` | string | Master account password for verification |

After success: server exits with code 0 → cluster primary reforks → new server boots with restored DB.

### `POST /wipe`
Factory reset. Drops and recreates all tables, reseeds master account and default categories.
```json
{ "password": "master123" }
```
