require("dotenv").config();
const { generatePosts } = require("./services/postGenerator");

async function main() {
  try {
    console.log("💡 Invoking generatePosts with test data…");

    const testInput = {
      name: "Summer Sale 2025",
      campaign_id: 42,
      budget: 1500,
      product_name: "SuperWidget 3000",
      description: "Our flagship widget that boosts productivity by 50%.",
      target_audience: "Small business owners",
      product_price: 49.99,
    };

    const posts = await generatePosts(testInput);

    console.log("✅ Generated posts:\n", JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error("❌ Error generating posts:", err);
  }
}

main();
