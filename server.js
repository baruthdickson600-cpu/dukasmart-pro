const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== DATABASE =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("DukaSmart Pro API is running...");
});

// ===== CREATE TABLES =====
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      phone TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      category TEXT,
      buying_price INT,
      selling_price INT,
      stock INT
    );
  `);
}

// ===== REGISTER =====
app.post("/api/register", async (req, res) => {
  const { name, phone, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users(name, phone, password, role) VALUES($1,$2,$3,$4)",
    [name, phone, hash, role]
  );

  res.json({ message: "User created" });
});

// ===== LOGIN =====
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE phone=$1",
    [phone]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: "User not found" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ error: "Wrong password" });
  }

  res.json({ message: "Login successful", user });
});

// ===== ADD PRODUCT =====
app.post("/api/products", async (req, res) => {
  const { name, category, buying_price, selling_price, stock } = req.body;

  await pool.query(
    "INSERT INTO products(name, category, buying_price, selling_price, stock) VALUES($1,$2,$3,$4,$5)",
    [name, category, buying_price, selling_price, stock]
  );

  res.json({ message: "Product added" });
});

// ===== GET PRODUCTS =====
app.get("/api/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`DukaSmart running on port ${PORT}`);
  });
});
//update
