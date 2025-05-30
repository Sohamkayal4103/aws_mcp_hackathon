// src/db/index.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.RDS_HOSTNAME,
  port: Number(process.env.RDS_PORT),
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function query(text, params) {
  console.log(">>> Running query:", text);
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    console.log(">>> Query result rows:", res.rows);
    return res.rows;
  } finally {
    client.release();
  }
}

module.exports = { query, pool };
