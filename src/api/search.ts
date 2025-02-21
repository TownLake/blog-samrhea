// src/api/search.ts
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";

export default async function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { query } = req.body;
  if (!query || typeof query !== "string") {
    res.status(400).json({ message: "Invalid input: query must be a non-empty string" });
    return;
  }

  try {
    // 1. Generate the embedding using Cloudflare AI
    const aiResponse = await fetch(
      process.env.CLOUDFLARE_AI_ENDPOINT || "",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include any required authentication headers here
        },
        body: JSON.stringify({
          model: "@cf/baai/bge-base-en-v1.5",
          text: query,
        }),
      }
    );

    const aiData = await aiResponse.json();
    if (!aiData?.data?.[0]) {
      throw new Error("Failed to generate embedding");
    }
    const queryVector = aiData.data[0];

    // 2. Query the Cloudflare Vectorize DB
    const vectorResponse = await fetch(
      process.env.CLOUDFLARE_VECTORIZE_ENDPOINT || "",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include any required authentication headers here
        },
        body: JSON.stringify({
          vector: queryVector,
          topK: 5,
          returnMetadata: "all",
        }),
      }
    );

    const vectorData = await vectorResponse.json();
    if (!vectorData?.matches) {
      res.status(200).json([]);
      return;
    }

    // 3. Process and format results
    const results = vectorData.matches
      .filter(
        (match: any) =>
          match.metadata?.title && match.metadata?.slug
      )
      .map((match: any) => ({
        title: match.metadata.title,
        url: `https://blog.samrhea.com${match.metadata.slug}`,
        score: match.score ? match.score.toFixed(4) : "N/A",
      }));

    res.status(200).json(results);
  } catch (err) {
    console.error("Search error:", err);
    res
      .status(500)
      .json({ message: "An error occurred while processing your search request" });
  }
}
