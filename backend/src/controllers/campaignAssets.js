const { query } = require("../db");
const { generatePosts } = require("../services/postGenerator");

async function createAssets(req, res, next) {
  const campaignId = Number(req.params.id);
  try {
    // 1. Fetch campaign
    const [campaign] = await query(`SELECT * FROM campaigns WHERE id=$1`, [
      campaignId,
    ]);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    // 2. Generate posts via LLM
    const posts = await generatePosts({
      name: campaign.name,
      campaign_id: campaign.id,
      budget: campaign.budget,
      product_name: campaign.product_name,
      description: campaign.description,
      target_audience: campaign.target_audience,
      product_price: campaign.product_price,
    });

    // 3. Insert into campaign_assets
    const inserted = [];
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

      const [row] = await query(
        `INSERT INTO campaign_assets
          (campaign_id, platform, post_title, post_description,
           number_of_posts, timing, post_type,
           post_id_on_platform, processed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          campaignId,
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
      inserted.push(row);
    }

    res.status(201).json({ assets: inserted });
  } catch (err) {
    next(err);
  }
}

async function getAssets(req, res, next) {
  const campaignId = Number(req.params.id);
  try {
    const rows = await query(
      `SELECT * FROM campaign_assets WHERE campaign_id=$1 ORDER BY created_at`,
      [campaignId]
    );
    res.json({ assets: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAssets, getAssets };
