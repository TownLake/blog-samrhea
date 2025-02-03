const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

async function generateEmbedding(text) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_VECTORIZE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text
    })
  });
  
  const data = await response.json();
  return data.result.data;
}

async function processPost(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  const embedding = await generateEmbedding(`${data.title}\n${content}`);

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

// Handle both manual trigger and push events
if (process.env.POST_PATH) {
  processPost(process.env.POST_PATH)
    .catch(error => {
      console.error('Error processing post:', error);
      process.exit(1);
    });
} else {
  const getChangedFiles = () => {
    const diffCommand = 'git diff --name-only HEAD^ HEAD';
    const output = execSync(diffCommand).toString();
    return output.split('\n')
      .filter(file => file.startsWith('content/posts/') && file.endsWith('.md'));
  };

  const changedFiles = getChangedFiles();
  console.log('Processing changed files:', changedFiles);
    
  Promise.all(changedFiles.map(processPost))
    .catch(error => {
      console.error('Error processing posts:', error);
      process.exit(1);
    });
}
