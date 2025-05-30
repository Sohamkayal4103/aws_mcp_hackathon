require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generatePosts({
  name,
  campaign_id,
  budget,
  product_name,
  description,
  target_audience,
  product_price,
}) {
  const prompt = `You are a marketing agent. Given this campaign:
- Campaign Name: ${name}
- Campaign ID: ${campaign_id}
- Budget: $${budget}
- Product Name: ${product_name}
- Description: ${description}
- Target Audience: ${target_audience}
- Product Price: $${product_price}

Generate a JSON array of objects with these fields:
post_title,
post_description,
platform,
number_of_posts,
timing,
post_type,
post_id_on_platform,
processed

Where:
- post_id_on_platform: initially null
- processed: false

Example:
[
  {
    "post_title":"Summer Sale Kickoff!",
    "post_description":"🔥 Our SuperWidget is 20% off...",
    "platform":"Twitter",
    "number_of_posts":3,
    "timing":"Next Monday at 9:00 AM",
    "post_type":"text",
    "post_id_on_platform":null,
    "processed":false
  }
]

Return **only** valid JSON.`;

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text;
    return JSON.parse(responseText);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(
        "Invalid JSON from Claude: " +
          e.message +
          "\n" +
          message.content[0].text
      );
    }
    throw new Error("API call failed: " + e.message);
  }
}

module.exports = { generatePosts };
