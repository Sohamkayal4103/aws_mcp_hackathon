// src/index.js
require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/users");
const campaignRoutes = require("./routes/campaigns");
const campaignAssetsRoutes = require("./routes/campaignAssets");
const cors = require("cors");
// const checkJwt = require("./middleware/auth");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Public endpoint
app.get("/api/public", (_req, res) => {
  res.json({ msg: "Public endpoint—no auth needed." });
});

// Users CRUD
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/campaigns_asset", campaignAssetsRoutes);

// Example protected route
app.get("/api/private", (req, res) => {
  res.json({ msg: `Hello, ${req.auth.sub}!` });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
