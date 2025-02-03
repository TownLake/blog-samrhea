const { WorkersAI } = require('@cloudflare/workers-ai');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

const ai = new WorkersAI({
  apiToken: process.env.CLOUDFLARE_VECTORIZE_TOKEN,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID
});

async function processPost(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  const embedding = await ai.embedText({
    text: `${data.title}\n${content}`,
    model: '@cf/baai/bge-base-en-v1.5'
  });

  await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/vectorize/indexes/blog-posts/entries`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_VECTORIZE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vectors: [{
        id: path.basename(filePath, '.md'),
        values: embedding,
        metadata: {
          title: data.title,
          path: filePath,
          date: data.date
        }
      }]
    })
  });
}