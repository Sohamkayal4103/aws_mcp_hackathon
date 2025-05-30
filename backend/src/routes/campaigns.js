const express = require("express");
// const checkJwt = require("../middleware/auth"); // you can comment this out if auth disabled
const {
  getAllCampaigns,
  createCampaign,
  getAllCampaignsById,
} = require("../controllers/campaigns");

const router = express.Router();

// List campaigns (protected)
router.get("/id", /*checkJwt,*/ getAllCampaignsById);

router.get("/", /*checkJwt,*/ getAllCampaigns);

// Create campaign (protected)
router.post("/", /*checkJwt,*/ createCampaign);

module.exports = router;
