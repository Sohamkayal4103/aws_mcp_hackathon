require("dotenv").config();
const { query, pool } = require("./db");

async function main() {
  try {
    console.log("Connecting to database…");
    const rows = await query("SELECT NOW() AS now");
    console.log("✅ Database time is", rows[0].now);
  } catch (err) {
    console.error("❌ DB error:", err);
  } finally {
    await pool.end();
    console.log("Disconnected, exiting");
    process.exit();
  }
}

main();
