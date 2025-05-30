const express = require("express");
const { createAssets, getAssets } = require("../controllers/campaignAssets");
const router = express.Router();

router.post("/:id/assets", /*checkJwt,*/ createAssets);
router.get("/:id/assets", /*checkJwt,*/ getAssets);

module.exports = router;
