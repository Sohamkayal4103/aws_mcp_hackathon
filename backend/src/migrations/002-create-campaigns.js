require("dotenv").config();
const { Pool } = require("pg");

async function migrate() {
  const pool = new Pool({
    host: process.env.RDS_HOSTNAME,
    port: +process.env.RDS_PORT,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    console.log("Creating campaigns table…");
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id               SERIAL PRIMARY KEY,
        owner_id         TEXT    NOT NULL,
        name             TEXT    NOT NULL,
        budget           NUMERIC(12,2) NOT NULL,
        product_name     TEXT    NOT NULL,
        description      TEXT,
        media_url        TEXT,
        target_audience  TEXT,
        product_price    NUMERIC(12,2),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ campaigns table created");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
    process.exit();
  }
}

migrate();
