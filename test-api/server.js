const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
let users = [
  { id: 1, name: "John Doe", email: "john@example.com", username: "johndoe", active: true },
  { id: 2, name: "Jane Smith", email: "jane@example.com", username: "janesmith", active: true },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", username: "bobjohnson", active: false },
  { id: 4, name: "Alice Brown", email: "alice@example.com", username: "alicebrown", active: true }
];

let posts = [
  { id: 1, title: "First Post", content: "This is the first post content", userId: 1, created: "2024-01-15T10:00:00Z" },
  { id: 2, title: "Second Post", content: "This is the second post content", userId: 2, created: "2024-01-16T14:30:00Z" },
  { id: 3, title: "Third Post", content: "This is the third post content", userId: 1, created: "2024-01-17T09:15:00Z" }
];

let products = [
  { id: 1, name: "Laptop", description: "High-performance laptop", price: 999.99, category: "Electronics", inStock: true },
  { id: 2, name: "Mouse", description: "Wireless optical mouse", price: 29.99, category: "Electronics", inStock: true },
  { id: 3, name: "Keyboard", description: "Mechanical keyboard", price: 89.99, category: "Electronics", inStock: false },
  { id: 4, name: "Monitor", description: "4K monitor", price: 299.99, category: "Electronics", inStock: true }
];

let nextUserId = 5;
let nextPostId = 4;
let nextProductId = 5;

// Helper functions
const findUserById = (id) => users.find(user => user.id === parseInt(id));
const findPostById = (id) => posts.find(post => post.id === parseInt(id));
const findProductById = (id) => products.find(product => product.id === parseInt(id));

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: "RESTerX Test API",
    version: "1.0.0",
    description: "A simple REST API for testing HTTP clients",
    endpoints: {
      users: {
        "GET /api/users": "Get all users",
        "GET /api/users/:id": "Get user by ID",
        "POST /api/users": "Create new user",
        "PUT /api/users/:id": "Update user",
        "PATCH /api/users/:id": "Partially update user",
        "DELETE /api/users/:id": "Delete user"
      },
      posts: {
        "GET /api/posts": "Get all posts",
        "GET /api/posts/:id": "Get post by ID",
        "POST /api/posts": "Create new post",
        "PUT /api/posts/:id": "Update post",
        "DELETE /api/posts/:id": "Delete post"
      },
      products: {
        "GET /api/products": "Get all products",
        "GET /api/products/:id": "Get product by ID",
        "POST /api/products": "Create new product"
      },
      utility: {
        "GET /health": "Health check",
        "GET /info": "API information",
        "GET /status": "Server status"
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0"
  });
});

// API info endpoint
app.get('/info', (req, res) => {
  res.json({
    name: "RESTerX Test API",
    version: "1.0.0",
    description: "A simple REST API for testing HTTP clients",
    server: "Node.js with Express",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: "running",
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// User endpoints
app.get('/api/users', (req, res) => {
  const { active } = req.query;
  let filteredUsers = users;
  
  if (active !== undefined) {
    filteredUsers = users.filter(user => user.active === (active === 'true'));
  }
  
  res.json({
    data: filteredUsers,
    count: filteredUsers.length,
    total: users.length
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const { name, email, username, active = true } = req.body;
  
  if (!name || !email || !username) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["name", "email", "username"]
    });
  }
  
  const newUser = {
    id: nextUserId++,
    name,
    email,
    username,
    active
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const { name, email, username, active } = req.body;
  
  if (!name || !email || !username) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["name", "email", "username"]
    });
  }
  
  users[userIndex] = {
    id: userId,
    name,
    email,
    username,
    active: active !== undefined ? active : users[userIndex].active
  };
  
  res.json(users[userIndex]);
});

app.patch('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const updates = req.body;
  users[userIndex] = { ...users[userIndex], ...updates, id: userId };
  
  res.json(users[userIndex]);
});

app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ 
    message: "User deleted successfully",
    deletedUser 
  });
});

// Post endpoints
app.get('/api/posts', (req, res) => {
  const { userId } = req.query;
  let filteredPosts = posts;
  
  if (userId) {
    filteredPosts = posts.filter(post => post.userId === parseInt(userId));
  }
  
  res.json({
    data: filteredPosts,
    count: filteredPosts.length,
    total: posts.length
  });
});

app.get('/api/posts/:id', (req, res) => {
  const post = findPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const { title, content, userId } = req.body;
  
  if (!title || !content || !userId) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["title", "content", "userId"]
    });
  }
  
  const newPost = {
    id: nextPostId++,
    title,
    content,
    userId: parseInt(userId),
    created: new Date().toISOString()
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  const { title, content, userId } = req.body;
  
  if (!title || !content || !userId) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["title", "content", "userId"]
    });
  }
  
  posts[postIndex] = {
    ...posts[postIndex],
    title,
    content,
    userId: parseInt(userId)
  };
  
  res.json(posts[postIndex]);
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  const deletedPost = posts.splice(postIndex, 1)[0];
  res.json({ 
    message: "Post deleted successfully",
    deletedPost 
  });
});

// Product endpoints
app.get('/api/products', (req, res) => {
  const { category, inStock } = req.query;
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (inStock !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.inStock === (inStock === 'true')
    );
  }
  
  res.json({
    data: filteredProducts,
    count: filteredProducts.length,
    total: products.length
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock = true } = req.body;
  
  if (!name || !description || !price || !category) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["name", "description", "price", "category"]
    });
  }
  
  const newProduct = {
    id: nextProductId++,
    name,
    description,
    price: parseFloat(price),
    category,
    inStock
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "GET /info", 
      "GET /status",
      "GET /api/users",
      "GET /api/posts",
      "GET /api/products"
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RESTerX Test API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/info`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET    /api/users          - Get all users`);
  console.log(`   GET    /api/users/:id      - Get user by ID`);
  console.log(`   POST   /api/users          - Create new user`);
  console.log(`   PUT    /api/users/:id      - Update user`);
  console.log(`   PATCH  /api/users/:id      - Partially update user`);
  console.log(`   DELETE /api/users/:id      - Delete user`);
  console.log(`   GET    /api/posts          - Get all posts`);
  console.log(`   GET    /api/posts/:id      - Get post by ID`);
  console.log(`   POST   /api/posts          - Create new post`);
  console.log(`   PUT    /api/posts/:id      - Update post`);
  console.log(`   DELETE /api/posts/:id      - Delete post`);
  console.log(`   GET    /api/products       - Get all products`);
  console.log(`   GET    /api/products/:id   - Get product by ID`);
  console.log(`   POST   /api/products       - Create new product`);
  console.log(`\n🔗 Test URLs:`);
  console.log(`   http://localhost:${PORT}/api/users`);
  console.log(`   http://localhost:${PORT}/api/posts`);
  console.log(`   http://localhost:${PORT}/api/products`);
});

module.exports = app;