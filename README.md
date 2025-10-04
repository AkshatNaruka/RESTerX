# RESTerX

RESTerX is a powerful API testing tool that supports both command-line interface (CLI) and web interface. It supports the GET, POST, PUT, PATCH, HEAD, and DELETE HTTP methods with advanced features for testing APIs both locally and online.

## ✨ Features

### 🖥️ Web Interface (Go-based)
- **Modern Postman-like Interface**: Clean, intuitive design for easy API testing
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Request History**: Automatic saving of requests using browser localStorage
- **Custom Headers**: Add, edit, and remove HTTP headers
- **Request Body Support**: JSON, raw text, and form data with syntax highlighting
- **Authentication**: Bearer token and Basic auth support
- **Response Formatting**: JSON formatting and copy functionality
- **Real-time Response**: Status codes, response time, and detailed headers
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### ⚛️ React Version (Next.js)
- **Enhanced UI/UX**: Built with Next.js, React 18, and TypeScript
- **Modern Component Library**: Powered by Radix UI and Tailwind CSS
- **Advanced Features**: 
  - Code generation in multiple languages (cURL, JavaScript, Python, Go)
  - Request collections and organization
  - Environment variables support
  - Pre-request scripts and dynamic variables
  - Keyboard shortcuts for productivity
  - Export/import functionality
  - **Query Parameters UI**: Manage URL query parameters with enable/disable toggles
  - **Path Variables**: Auto-detect and replace `{{variable}}` syntax in URLs
  - **Cookie Management**: View and manage cookies from API responses
  - **OAuth 2.0 Support**: Full OAuth 2.0 authentication alongside Bearer and Basic auth
  - **Response Size Display**: Shows response size in human-readable format (B/KB/MB/GB)
- **Optimized Performance**: Fast page loads and smooth interactions
- **Fully Client-Side**: No backend required, runs entirely in the browser

### 🖥️ CLI Interface
- **Interactive Menu**: Easy-to-use command-line interface
- **All HTTP Methods**: GET, POST, PUT, PATCH, HEAD, DELETE support
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Installation

### Option 1: Go-based Web Interface (with CLI)

To install RESTerX CLI and Go-based web interface, you need to have Go installed on your machine. Once you have Go installed, you can clone this repository and build the project:

```bash
git clone https://github.com/AkshatNaruka/RESTerX
cd RESTerX
go build -o restcli ./cmd
```

This will create an executable file in your project directory.

### Option 2: React Version (Next.js)

To run the enhanced React version locally:

```bash
git clone https://github.com/AkshatNaruka/RESTerX
cd RESTerX/resterx_Enhanced
npm install
npm run dev
```

Then open your browser and navigate to `http://localhost:3000`.

## 📖 Usage

### React Version (Recommended)

The enhanced React version is available at `resterx_Enhanced/` and provides the most feature-rich experience:

**Development:**
```bash
cd resterx_Enhanced
npm run dev
```

**Production Build:**
```bash
cd resterx_Enhanced
npm run build
npm start
```

#### React Version Features:
1. **Select HTTP Method**: Choose from GET, POST, PUT, PATCH, DELETE, HEAD
2. **Enter URL**: Type your API endpoint with autocomplete and path variables support (`{{variable}}` syntax)
3. **Query Parameters**: Manage URL query parameters with checkboxes to enable/disable
4. **Add Headers**: Dynamic header management
5. **Set Request Body**: Multiple body types with syntax highlighting
6. **Configure Auth**: Bearer token, Basic authentication, or OAuth 2.0
7. **Send Request**: Keyboard shortcuts available (⌘↵)
8. **View Response**: Detailed status, headers, formatted body, and cookies
9. **Response Metrics**: Response time in milliseconds and size in bytes/KB/MB
10. **Cookie Management**: View and manage cookies received from API responses
8. **History**: Track all requests with filtering options
9. **Collections**: Organize requests into collections
10. **Code Generation**: Generate code snippets in multiple languages
11. **Environment Variables**: Manage different environments

### Go-based Web Interface

Start the web server:
```bash
./restcli web
```

Or specify a custom port:
```bash
./restcli web --port 3000
```

Then open your browser and navigate to `http://localhost:8080` (or your custom port).

#### Web Interface Features:
1. **Select HTTP Method**: Choose from GET, POST, PUT, PATCH, DELETE, HEAD
2. **Enter URL**: Type your API endpoint
3. **Add Headers**: Use the Headers tab to add custom headers
4. **Set Request Body**: Use the Body tab for JSON, form data, or raw text
5. **Configure Auth**: Use the Auth tab for Bearer token or Basic authentication
6. **Send Request**: Click Send to make the request
7. **View Response**: See status code, response time, body, and headers
8. **History**: Access previous requests from the sidebar

### CLI Interface

For command-line usage:
```bash
./restcli
```

This will start an interactive menu where you can select the HTTP method you want to use. After selecting a method, you will be prompted to enter the URL for the request.

## 🖼️ Screenshots

### Light Theme
![RESTerX Web Interface](https://github.com/user-attachments/assets/fd036ccc-1934-425d-b301-867ff2619013)

### Dark Theme
![RESTerX Dark Theme](https://github.com/user-attachments/assets/b192e59e-aa37-4407-a26d-419b17fbeff1)

## 🎯 Key Benefits

- **Two Powerful Versions**: Choose between Go-based or modern React implementation
- **No Data Storage Required**: All user data stored in browser localStorage
- **Privacy Focused**: No data sent to external servers (fully client-side)
- **Fast and Lightweight**: Optimized performance for quick API testing
- **User Friendly**: Postman-like interface with modern design
- **Local & Online API Testing**: Test localhost and remote APIs seamlessly
- **Cross-platform**: Works on any device with a browser
- **Easy Deployment**: Deploy to Vercel with one click or use static hosting

## 🔧 Development

To contribute to RESTerX:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Deployment

### Deploy React Version to Vercel (Recommended)

The React version (`resterx_Enhanced/`) is optimized for deployment on Vercel:

#### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AkshatNaruka/RESTerX&project-name=resterx&repository-name=resterx&root-directory=resterx_Enhanced)

#### Manual Deploy

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to the React app directory:
   ```bash
   cd resterx_Enhanced
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment

#### Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Set the **Root Directory** to `resterx_Enhanced`
6. Vercel will auto-detect Next.js and configure the build settings
7. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

### Static Site Deployment (Go-based Version)

RESTerX includes automatic deployment of the Go-based web interface as a static site to GitHub Pages. The deployment workflow is triggered automatically on pushes to the main branch.

#### How it works:
- The GitHub Actions workflow copies the static files from `web/static/` directory
- Deploys them to GitHub Pages for easy access without running a local server
- The static site provides basic HTTP request testing functionality for external APIs

#### Limitations of Static Deployment:
- Mock server features require the backend API
- Code generation features require the backend API  
- History and collections are stored locally in browser storage
- All other HTTP testing features work normally

#### Accessing the Static Site:
Once deployed, the static site will be available at: `https://{username}.github.io/{repository-name}/`

## 📝 API Endpoints

The web interface uses the following API endpoints:

- `POST /api/request` - Send HTTP requests
  - Request body: `{"method": "GET", "url": "...", "headers": {...}, "body": "..."}`
  - Response: `{"statusCode": 200, "status": "OK", "headers": {...}, "body": "...", "responseTime": 123}`

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).


