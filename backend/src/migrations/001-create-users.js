require("dotenv").config();
const { Pool } = require("pg");

async function migrate() {
  const pool = new Pool({
    host: process.env.RDS_HOSTNAME,
    port: Number(process.env.RDS_PORT),
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    console.log("Creating users table…");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id         SERIAL PRIMARY KEY,
        email           TEXT    NOT NULL UNIQUE,
        name            TEXT    NOT NULL,
        organization    TEXT,
        profile_pic_url TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ users table created");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
    process.exit();
  }
}

migrate();
