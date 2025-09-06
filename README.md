# RESTerX

RESTerX is a powerful API testing tool that supports both command-line interface (CLI) and web interface. It supports the GET, POST, PUT, PATCH, HEAD, and DELETE HTTP methods with advanced features for testing APIs both locally and online.

## ✨ Features

### 🖥️ Web Interface
- **Modern Postman-like Interface**: Clean, intuitive design for easy API testing
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Request History**: Automatic saving of requests using browser localStorage
- **Custom Headers**: Add, edit, and remove HTTP headers
- **Request Body Support**: JSON, raw text, and form data with syntax highlighting
- **Authentication**: Bearer token and Basic auth support
- **Response Formatting**: JSON formatting and copy functionality
- **Real-time Response**: Status codes, response time, and detailed headers
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🖥️ CLI Interface
- **Interactive Menu**: Easy-to-use command-line interface
- **All HTTP Methods**: GET, POST, PUT, PATCH, HEAD, DELETE support
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Installation

To install RESTerX, you need to have Go installed on your machine. Once you have Go installed, you can clone this repository and build the project:

```bash
git clone https://github.com/AkshatNaruka/RESTerX
cd RESTerX
go build -o restcli ./cmd
```

This will create an executable file in your project directory.

## 📖 Usage

### Web Interface (Recommended)

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

- **No Data Storage Required**: All user data stored in browser localStorage
- **Privacy Focused**: No data sent to external servers
- **Fast and Lightweight**: Built with Go for optimal performance
- **User Friendly**: Postman-like interface with modern design
- **Local & Online API Testing**: Test localhost and remote APIs seamlessly
- **Cross-platform**: Web interface works on any device with a browser

## 🔧 Development

To contribute to RESTerX:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Static Site Deployment

RESTerX includes automatic deployment of the web interface as a static site to GitHub Pages. The deployment workflow is triggered automatically on pushes to the main branch.

### How it works:
- The GitHub Actions workflow copies the static files from `web/static/` directory
- Deploys them to GitHub Pages for easy access without running a local server
- The static site provides basic HTTP request testing functionality for external APIs

### Limitations of Static Deployment:
- Mock server features require the backend API
- Code generation features require the backend API  
- History and collections are stored locally in browser storage
- All other HTTP testing features work normally

### Accessing the Static Site:
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


