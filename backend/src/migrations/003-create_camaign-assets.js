// src/migrations/003-create-campaign-assets.js
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
    console.log("Creating campaign_assets table…");
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaign_assets (
        id                    SERIAL PRIMARY KEY,
        campaign_id           INTEGER  NOT NULL 
                                 REFERENCES campaigns(id) ON DELETE CASCADE,
        platform              TEXT     NOT NULL,
        post_title            TEXT     NOT NULL,
        post_description      TEXT     NOT NULL,
        number_of_posts       INTEGER  NOT NULL,
        timing                TEXT     NOT NULL,
        post_type             TEXT     NOT NULL,
        post_id_on_platform   TEXT,
        processed             BOOLEAN  NOT NULL DEFAULT FALSE,
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        updated_at            TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ campaign_assets table created");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
    process.exit();
  }
}

migrate();
