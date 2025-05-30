// src/controllers/campaigns.js
const { query } = require("../db");
const { get } = require("../routes/users");
const { generatePosts } = require("../services/postGenerator");

/**
 * GET /api/campaigns
 * List all campaigns for the authenticated user.
 */
async function getAllCampaignsById(req, res, next) {
  try {
    const ownerId = req.auth?.sub || null; // if auth disabled, this may be undefined
    const rows = await query(
      `SELECT * 
         FROM campaigns 
        WHERE owner_id = $1
     ORDER BY created_at DESC`,
      [ownerId]
    );
    res.json({ campaigns: rows });
  } catch (err) {
    next(err);
  }
}

async function getAllCampaigns(req, res, next) {
  try {
    // const ownerId = req.auth?.sub || null; // if auth disabled, this may be undefined
    const rows = await query(
      `SELECT * 
         FROM campaigns 
     ORDER BY created_at DESC`
    );
    res.json({ campaigns: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/campaigns
 * Body: { name, budget, product_name, description, media_url, target_audience, product_price }
 * Creates a new campaign under the authenticated user.
 */
async function createCampaign(req, res, next) {
  const ownerId = req.auth?.sub || "anonymous";
  const {
    name,
    budget,
    product_name,
    description,
    media_url,
    target_audience,
    product_price,
  } = req.body;

  // Basic validation
  if (!name || budget == null || !product_name) {
    return res.status(400).json({
      message: "name, budget, and product_name are required",
    });
  }

  try {
    const [campaign] = await query(
      `INSERT INTO campaigns 
         (owner_id, name, budget, product_name, description, media_url, target_audience, product_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        ownerId,
        name,
        budget,
        product_name,
        description || null,
        media_url || null,
        target_audience || null,
        product_price || null,
      ]
    );

    // 2) Call LLM to generate posts for this campaign
    const posts = await generatePosts({
      name: campaign.name,
      campaign_id: campaign.id,
      budget: campaign.budget,
      product_name: campaign.product_name,
      description: campaign.description,
      target_audience: campaign.target_audience,
      product_price: campaign.product_price,
    });

    console.log("Generated posts:", posts);

    const assets = [];
    for (const p of posts) {
      const {
        platform,
        post_title,
        post_description,
        number_of_posts,
        timing,
        post_type,
        post_id_on_platform,
        processed,
      } = p;

      const [asset] = await query(
        `INSERT INTO campaign_assets
           (campaign_id, platform, post_title, post_description,
            number_of_posts, timing, post_type,
            post_id_on_platform, processed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          campaign.id,
          platform,
          post_title,
          post_description,
          number_of_posts,
          timing,
          post_type,
          post_id_on_platform,
          processed,
        ]
      );
      assets.push(asset);
    }
    res.status(201).json({ campaign, assets });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCampaigns,
  getAllCampaignsById,
  createCampaign,
};
