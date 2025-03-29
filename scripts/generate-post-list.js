// scripts/generate-post-list.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the function to generate posts.json
function generatePostList() {
  // Path to posts directory
  const postsDirectory = path.join(path.resolve(), 'public', 'content', 'posts');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    console.log('Created posts directory structure');
    return; // Exit if we just created the directory (no posts yet)
  }

  // Get list of files
  const postFiles = fs.readdirSync(postsDirectory);

  // Process each file to extract metadata
  const postsData = postFiles.map(filename => {
    const filePath = path.join(postsDirectory, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    const { data, content: postContent } = matter(content);
    
    // Use the filename (without .md extension) as the unique id
    const id = filename.replace(/\.md$/, '');
    
    // Check for "hits" tag
    const isStarred = data.tags && data.tags.includes('hits');
    
    // Check for country tags
    const hasPortugal = data.tags && data.tags.includes('portugal');
    const hasTexas = data.tags && data.tags.includes('texas');
    
    return {
      id,
      filename,
      title: data.title || 'Untitled',
      date: data.date || '',
      category: data.category || '',
      description: data.description || '',
      starred: isStarred,
      hasPortugal,
      hasTexas,
      external: false // Mark as internal post
    };
  });

  // Load external Cloudflare posts if the file exists
  let allPosts = [...postsData];
  const cloudflarePostsPath = path.join(path.resolve(), 'public', 'cloudflare-posts.json');
  
  if (fs.existsSync(cloudflarePostsPath)) {
    try {
      const cloudflarePostsContent = fs.readFileSync(cloudflarePostsPath, 'utf8');
      const cloudflarePosts = JSON.parse(cloudflarePostsContent);
      console.log(`Loaded ${cloudflarePosts.length} external Cloudflare posts`);
      
      // Add the external posts to the array
      allPosts = [...allPosts, ...cloudflarePosts];
    } catch (error) {
      console.error('Error loading Cloudflare posts:', error);
    }
  } else {
    console.log('No cloudflare-posts.json file found. Only processing regular posts.');
  }

  // Sort all posts by date (newest first)
  allPosts.sort((a, b) => {
    if (!a.date) return 1;  // Items without dates go to the end
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  // Write to JSON file
  fs.writeFileSync(
    path.join(path.resolve(), 'public', 'posts.json'), 
    JSON.stringify(allPosts, null, 2)
  );

  console.log(`Generated posts.json with ${allPosts.length} posts (${postsData.length} internal, ${allPosts.length - postsData.length} external)`);
}

// Run the function
generatePostList();

// Export for potential use in other scripts
export default generatePostList;