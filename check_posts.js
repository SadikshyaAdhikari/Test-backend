import { getAllPosts } from './src/models/post.model.js';

(async () => {
  try {
    const posts = await getAllPosts();
    console.log('Posts from DB:', posts);
  } catch (error) {
    console.error('Error:', error);
  }
})();