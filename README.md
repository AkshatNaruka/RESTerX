# RESTerX

RESTerX is a **powerful, feature-complete API testing tool** that supports both command-line interface (CLI) and web interface. Designed to compete with premium tools like Postman and Insomnia, RESTerX offers enterprise-grade features while remaining **simple, fast, and free**.

## ✨ Key Features

### 🚀 **Complete API Testing Suite**
- **All HTTP Methods**: GET, POST, PUT, PATCH, DELETE, HEAD with advanced options
- **GraphQL Support**: Full query execution, schema introspection, and validation
- **WebSocket Testing**: Real-time connection testing and message exchange
- **Request Tabs**: Multiple simultaneous requests like modern API clients
- **Advanced Authentication**: Bearer tokens, Basic auth, JWT, and OAuth flows

### 🎨 **Modern Interface & UX**
- **Postman-like Interface**: Familiar, intuitive design for easy adoption
- **Dark/Light Theme**: Toggle themes with persistent settings
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Request History**: Automatic saving with timestamps and analytics
- **Quick Templates**: Pre-built requests for popular APIs

### 🔄 **Import/Export & Compatibility**
- **Postman Collections**: Full v2.1 import/export compatibility
- **OpenAPI/Swagger**: Import API specifications and generate collections
- **cURL Import**: Convert cURL commands to requests instantly
- **Multiple Export Formats**: JSON, Postman, OpenAPI specifications

### 📊 **Advanced Response Analysis**
- **Smart Content Detection**: JSON, XML, HTML, images with structure analysis
- **Performance Scoring**: Response time analysis with optimization suggestions
- **Response Comparison**: Diff viewer between different responses
- **Auto-formatting**: Beautiful JSON formatting and syntax highlighting

### 🧪 **Testing & Automation**
- **Pre/Post Request Scripts**: JavaScript-like scripting for dynamic testing
- **Test Suites**: Organized test collections with assertions
- **Load Testing**: Performance testing with configurable parameters
- **API Monitoring**: Uptime monitoring with automated alerts
- **Batch Requests**: Execute multiple requests in sequence

### 🎭 **Mock Server & Prototyping**
- **Dynamic Mock Server**: Create mock endpoints for rapid prototyping
- **API Documentation**: Auto-generated docs from requests and mocks
- **OpenAPI Export**: Generate specifications from your collections
- **Response Simulation**: Custom status codes, delays, and responses

### 👥 **Collaboration & Sharing**
- **Request Sharing**: Share requests via secure URLs with password protection
- **Team Workspaces**: Collaborative environments for team development
- **Public Gallery**: Browse and fork community-shared requests
- **Embed Support**: Embed interactive API docs in websites

### 💻 **Code Generation**
- **Multiple Languages**: Generate code for cURL, JavaScript, Python, Go, Node.js
- **Copy & Share**: Easy code snippet sharing and collaboration
- **Custom Templates**: Extensible code generation templates

## 🏆 **Competitive Advantages**

| Feature | RESTerX | Postman | Insomnia | Thunder Client |
|---------|---------|---------|----------|----------------|
| **Price** | 🟢 **Free** | 🔴 $12-21/user/month | 🟡 $5/user/month | 🟢 Free (limited) |
| **GraphQL Support** | 🟢 **Full Support** | 🟢 Yes | 🟢 Yes | 🟡 Basic |
| **WebSocket Testing** | 🟢 **Built-in** | 🔴 No | 🟡 Plugin | 🔴 No |
| **Request Tabs** | 🟢 **Multiple Tabs** | 🟢 Yes | 🟢 Yes | 🔴 No |
| **Import/Export** | 🟢 **Postman Compatible** | 🟢 Yes | 🟡 Limited | 🔴 No |
| **Mock Server** | 🟢 **Integrated** | 🟢 Yes | 🔴 No | 🔴 No |
| **Response Analysis** | 🟢 **Advanced** | 🟡 Basic | 🟡 Basic | 🟡 Basic |
| **Sharing** | 🟢 **URL + Embed** | 🟢 Team only | 🟡 Team only | 🔴 No |
| **Privacy** | 🟢 **Local Storage** | 🔴 Cloud required | 🔴 Cloud required | 🟢 Local |

## 🚀 Quick Start

### Web Interface (Recommended)

```bash
# Clone and build
git clone https://github.com/AkshatNaruka/RESTerX
cd RESTerX
go build -o resterx ./cmd

# Start web server
./resterx web --port 8080

# Open browser to http://localhost:8080
```

### CLI Interface

```bash
./resterx
# Follow the interactive prompts
```

## 📖 Usage Examples

### 1. **Basic HTTP Request**
```bash
# Web interface: Select GET, enter URL, click Send
# CLI: Choose method → Enter URL → View response
```

### 2. **GraphQL Query**
```javascript
# Switch to GraphQL mode in web interface
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
    posts {
      title
      content
    }
  }
}
```

### 3. **Import Postman Collection**
```bash
# Click Import → Select Postman → Paste JSON → Import
# Supports Postman Collection v2.1 format
```

### 4. **WebSocket Testing**
```javascript
// Connect to WebSocket endpoint
ws://localhost:8080/ws

// Send messages and view real-time responses
{"type": "message", "data": "Hello WebSocket!"}
```

### 5. **Pre-request Script**
```javascript
// Generate dynamic auth token
var authToken = "Bearer " + uuid();
request.headers["Authorization"] = authToken;

// Set timestamp
request.headers["X-Timestamp"] = timestamp();
```

### 6. **Response Testing**
```javascript
// Test response status
test("Status is 200", function() {
    assertEqual(response.status, 200);
});

// Test response time
test("Response time < 500ms", function() {
    assertTrue(response.responseTime < 500);
});
```

## 🔧 Advanced Configuration

### Environment Variables
```json
{
  "development": {
    "baseUrl": "http://localhost:3000",
    "apiKey": "dev-key-123"
  },
  "production": {
    "baseUrl": "https://api.example.com",
    "apiKey": "prod-key-456"
  }
}
```

### Custom Headers
- Authorization: Bearer {{token}}
- Content-Type: application/json
- X-API-Key: {{apiKey}}
- X-Request-ID: {{uuid}}

## 🌐 **Live Demo & Screenshots**

### Modern Interface
![RESTerX Interface](https://github.com/user-attachments/assets/9989eeb0-c1df-41bf-94c1-87972f02345c)

*Features visible: Request tabs, HTTP/GraphQL toggle, Import/Export buttons, Response analysis*

### Key Interface Elements:
- **Request Tabs**: Multiple simultaneous requests
- **HTTP/GraphQL Toggle**: Switch between API types
- **Import/Export**: Postman compatibility
- **Response Analysis**: Advanced insights
- **Modern Design**: Clean, professional interface

### Try it Live
- **GitHub Pages**: [Live Demo](https://akshatnaruka.github.io/RESTerX) (Static mode)
- **Full Features**: Clone and run locally for complete functionality

## 🎯 Use Cases

### **For Developers**
- API development and testing
- GraphQL schema exploration
- WebSocket application testing
- Mock server for frontend development
- Code generation for multiple languages

### **For QA Engineers**
- Comprehensive test suites
- Automated API testing
- Performance testing and monitoring
- Test data management
- Regression testing

### **For Teams**
- Collaborative API development
- Shared request collections
- Team workspaces and environments
- API documentation generation
- Knowledge sharing and onboarding

### **For DevOps**
- API monitoring and alerts
- Performance analysis
- Integration testing
- CI/CD pipeline integration
- Health check automation

## 🛠 Development & Contribution

### Project Structure
```
RESTerX/
├── cmd/           # CLI application
├── pkg/           # Core Go packages
│   ├── import_export.go    # Postman/OpenAPI support
│   ├── graphql.go         # GraphQL functionality
│   ├── websocket_client.go # WebSocket testing
│   ├── scripting.go       # Pre/post scripts
│   ├── sharing.go         # Request sharing
│   └── response_visualizer.go # Analysis
├── web/
│   ├── api/       # Backend API handlers
│   ├── static/    # Frontend assets
│   └── server.go  # Web server
└── FEATURES.md    # Complete feature list
```

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📊 **Technical Specifications**

### **Performance**
- **Response Time**: < 100ms for local operations
- **Memory Usage**: < 50MB RAM for web interface
- **Concurrent Requests**: 100+ simultaneous connections
- **File Size**: < 10MB binary executable

### **Compatibility**
- **Go Version**: 1.21+
- **Browsers**: Chrome, Firefox, Safari, Edge
- **OS Support**: Windows, macOS, Linux
- **Architecture**: AMD64, ARM64

### **Security**
- **Local Data**: All data stored locally by default
- **HTTPS Support**: SSL/TLS for secure connections
- **Authentication**: Multiple auth methods supported
- **Privacy**: No data sent to external servers

## 🔮 Roadmap

### **Phase 1** ✅ (Current)
- [x] Complete HTTP/GraphQL/WebSocket support
- [x] Import/Export (Postman, OpenAPI, cURL)
- [x] Request tabs and modern UI
- [x] Response analysis and performance insights
- [x] Pre/post request scripting
- [x] Request sharing and collaboration

### **Phase 2** (Next)
- [ ] OAuth 2.0 flow automation
- [ ] Advanced scripting with npm packages
- [ ] CI/CD integration (GitHub Actions, Jenkins)
- [ ] Desktop application (Electron)
- [ ] Mobile companion app
- [ ] Plugin system for extensions

### **Phase 3** (Future)
- [ ] AI-powered API testing suggestions
- [ ] Advanced analytics and reporting
- [ ] Enterprise SSO integration
- [ ] Custom themes and branding
- [ ] Collaborative editing
- [ ] Version control integration

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support & Community

- **GitHub Issues**: [Report bugs and request features](https://github.com/AkshatNaruka/RESTerX/issues)
- **Discussions**: [Community discussions and help](https://github.com/AkshatNaruka/RESTerX/discussions)
- **Documentation**: [Complete user guide](FEATURES.md)
- **Contributing**: [Contribution guidelines](CONTRIBUTING.md)

## 🌟 **Why Choose RESTerX?**

> **"RESTerX combines the best features from Postman, Insomnia, and Thunder Client into a single, free, fast, and privacy-focused tool. Perfect for developers who want enterprise-grade API testing without the enterprise price tag."**

### **Made for Developers, by Developers**
- **No Account Required**: Start testing immediately
- **Lightning Fast**: Go-powered performance
- **Privacy First**: Your data stays local
- **Feature Complete**: Everything you need in one tool
- **Always Free**: No premium features or paywalls

---

**⭐ Star this repo if RESTerX helps you build better APIs!**


