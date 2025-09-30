# RESTerX Test API

A simple REST API server built with Node.js and Express for testing HTTP clients and the RESTerX tool.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Navigate to the test-api directory:**
   ```bash
   cd test-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or use the provided script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

The server will start on `http://localhost:3000`

## 📋 Available Endpoints

### 🏠 General Endpoints
- `GET /` - API information and available endpoints
- `GET /health` - Health check with server status
- `GET /info` - Detailed API information
- `GET /status` - Server status and metrics

### 👥 User Endpoints
- `GET /api/users` - Get all users (supports `?active=true/false` filter)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user (full update)
- `PATCH /api/users/:id` - Partially update user
- `DELETE /api/users/:id` - Delete user

### 📝 Post Endpoints
- `GET /api/posts` - Get all posts (supports `?userId=1` filter)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### 🛍️ Product Endpoints
- `GET /api/products` - Get all products (supports `?category=Electronics&inStock=true` filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product

## 🧪 Sample API Calls

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Create a New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","username":"testuser"}'
```

### Update a User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com","username":"updateduser","active":true}'
```

### Partially Update a User
```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"active":false}'
```

### Create a New Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My New Post","content":"This is the content of my new post","userId":1}'
```

### Get Posts by User
```bash
curl "http://localhost:3000/api/posts?userId=1"
```

### Get Products by Category
```bash
curl "http://localhost:3000/api/products?category=Electronics&inStock=true"
```

## 📊 Sample Data

The API comes with pre-populated sample data:

### Users (4 users)
- John Doe, Jane Smith, Bob Johnson, Alice Brown

### Posts (3 posts)
- Various posts linked to different users

### Products (4 products)
- Electronics: Laptop, Mouse, Keyboard, Monitor

## 🔧 Features

- **CORS enabled** - Works with any frontend
- **JSON responses** - All responses in JSON format
- **Error handling** - Proper HTTP status codes and error messages
- **Query parameters** - Filter data using query strings
- **Input validation** - Validates required fields
- **Mock data persistence** - Data persists while server is running
- **RESTful design** - Follows REST API conventions

## 🎯 Perfect for Testing

This API is ideal for testing:
- GET requests with and without parameters
- POST requests with JSON payloads
- PUT/PATCH requests for updates
- DELETE operations
- Error handling (404, 400, 500)
- CORS functionality
- Different response formats

## 📝 Response Examples

### Success Response (GET /api/users)
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "active": true
    }
  ],
  "count": 1,
  "total": 4
}
```

### Error Response (404)
```json
{
  "error": "User not found"
}
```

### Validation Error (400)
```json
{
  "error": "Missing required fields",
  "required": ["name", "email", "username"]
}
```

## 🛑 Stopping the Server

To stop the server, use `Ctrl+C` in the terminal.

## 🔄 Development

For development with auto-reload:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.