require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.get("/api/students", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM students ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/students/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ message: "Not found" });
    }

    try {
        const result = await pool.query("SELECT * FROM students WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});