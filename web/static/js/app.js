class RESTerX {
    constructor() {
        this.authToken = localStorage.getItem('resterx-auth-token');
        this.currentUser = JSON.parse(localStorage.getItem('resterx-user') || 'null');
        this.currentWorkspace = JSON.parse(localStorage.getItem('resterx-workspace') || 'null');
        this.isStaticMode = this.detectStaticMode();
        
        // Check authentication status - automatically use demo account for API playground mode
        if (!this.authToken) {
            this.autoLoginWithDemo();
        } else {
            this.init();
            this.setupEventListeners();
            this.loadHistory();
            this.showUserBar();
        }
    }

    // Detect if we're running in static mode (GitHub Pages) without backend
    detectStaticMode() {
        // Check if we're on GitHub Pages or likely running without backend
        const isGitHubPages = window.location.hostname.includes('github.io');
        const isFileProtocol = window.location.protocol === 'file:';
        
        // If we're clearly on GitHub Pages or file protocol, we're in static mode
        if (isGitHubPages || isFileProtocol) {
            return true;
        }
        
        // For other cases, we'll detect this at runtime when API calls fail
        return false;
    }

    init() {
        this.history = JSON.parse(localStorage.getItem('resterx-history') || '[]');
        this.currentTheme = localStorage.getItem('resterx-theme') || 'light';
        this.collections = JSON.parse(localStorage.getItem('resterx-collections') || '[]');
        this.environments = JSON.parse(localStorage.getItem('resterx-environments') || '[]');
        this.activeEnvironment = localStorage.getItem('resterx-active-env') || '';
        this.variables = JSON.parse(localStorage.getItem('resterx-variables') || '{}');
        this.analytics = JSON.parse(localStorage.getItem('resterx-analytics') || '{"requests": [], "totalRequests": 0, "successfulRequests": 0}');
        this.applyTheme();
        this.loadCollections();
        this.loadEnvironments();
        this.updateAnalytics();
    }

    // Auto-login with demo account for API playground mode
    async autoLoginWithDemo() {
        // Hide auth modal during auto-login
        document.getElementById('authModal').style.display = 'none';
        
        // In static mode, skip API calls and simulate successful authentication
        if (this.isStaticMode) {
            this.handleStaticModeDemo();
            return;
        }
        
        try {
            // Create demo account if it doesn't exist
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'demo',
                    email: 'demo@resterx.com',
                    password: 'demo123',
                    fullName: 'API Playground Demo User'
                })
            });
        } catch (error) {
            // Account might already exist, continue with login
        }

        // Login with demo credentials
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'demo',
                    password: 'demo123'
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.handleAuthSuccess(data);
                console.log('🚀 RESTerX API Playground ready - Demo user logged in automatically');
            } else if (response.status === 501 || response.status === 404) {
                // 501 = Unsupported method (Python HTTP server), 404 = Not found (static mode)
                console.log('Detected static mode (API not available), enabling demo without backend');
                this.isStaticMode = true;
                this.handleStaticModeDemo();
            } else {
                console.error('Demo login failed, falling back to auth modal');
                this.showAuthModal();
            }
        } catch (error) {
            console.error('Demo login error:', error);
            // If we get a network error, we might be in static mode
            console.log('Detected static mode (network error), enabling demo without backend');
            this.isStaticMode = true;
            this.handleStaticModeDemo();
        }
    }

    // Handle demo authentication in static mode (no backend)
    handleStaticModeDemo() {
        // Create fake auth data for static mode
        const staticDemoData = {
            token: 'static-demo-token-' + Date.now(),
            user: {
                id: 1,
                username: 'demo',
                email: 'demo@resterx.com',
                fullName: 'Demo User (Static Mode)',
                role: 'user'
            },
            workspaces: [{
                id: 1,
                name: 'Demo Workspace',
                description: 'Static mode demo workspace'
            }]
        };

        // Simulate successful authentication
        this.handleAuthSuccess(staticDemoData);
        console.log('🚀 RESTerX Static Mode - Demo user logged in (no backend required)');
    }

    // Authentication Methods
    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
        this.setupAuthEventListeners();
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    showUserBar() {
        if (this.currentUser) {
            document.getElementById('userBar').style.display = 'flex';
            document.getElementById('userName').textContent = this.currentUser.fullName || this.currentUser.username;
        }
    }

    hideUserBar() {
        document.getElementById('userBar').style.display = 'none';
    }

    setupAuthEventListeners() {
        // Auth tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });

        // Login form
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('demoLogin').addEventListener('click', () => this.handleDemoLogin());

        // Register form
        document.getElementById('registerBtn').addEventListener('click', () => this.handleRegister());

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Enter key handling
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');

        // Clear error
        this.hideAuthError();
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showAuthError('Please enter both username and password');
            return;
        }

        // Check if this is demo credentials in static mode
        if ((this.isStaticMode || username === 'demo') && username === 'demo' && password === 'demo123') {
            this.isStaticMode = true;
            this.handleStaticModeDemo();
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.handleAuthSuccess(data);
            } else if ((response.status === 501 || response.status === 404) && username === 'demo' && password === 'demo123') {
                // Static mode detected with demo credentials
                console.log('Detected static mode during login, enabling demo without backend');
                this.isStaticMode = true;
                this.handleStaticModeDemo();
            } else {
                const error = await response.text();
                this.showAuthError(error || 'Login failed');
            }
        } catch (error) {
            if (username === 'demo' && password === 'demo123') {
                // Network error with demo credentials - enable static mode
                console.log('Detected static mode during login (network error), enabling demo without backend');
                this.isStaticMode = true;
                this.handleStaticModeDemo();
            } else {
                this.showAuthError('Network error. Please try again.');
            }
        }
    }

    async handleDemoLogin() {
        // In static mode, use the static mode demo handler
        if (this.isStaticMode) {
            this.handleStaticModeDemo();
            return;
        }

        // Create demo account if it doesn't exist, then login
        try {
            // First try to register demo account
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'demo',
                    email: 'demo@resterx.com',
                    password: 'demo123',
                    fullName: 'Demo User'
                })
            });
        } catch (error) {
            // Account might already exist, continue with login
        }

        // Login with demo credentials
        document.getElementById('loginUsername').value = 'demo';
        document.getElementById('loginPassword').value = 'demo123';
        await this.handleLogin();
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const fullName = document.getElementById('registerFullName').value;
        const password = document.getElementById('registerPassword').value;

        if (!username || !email || !password) {
            this.showAuthError('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, fullName, password })
            });

            if (response.ok) {
                // Switch to login tab and show success message
                this.switchAuthTab('login');
                this.showAuthError('Account created successfully! Please log in.', 'success');
                
                // Pre-fill login form
                document.getElementById('loginUsername').value = username;
            } else {
                const error = await response.text();
                this.showAuthError(error || 'Registration failed');
            }
        } catch (error) {
            this.showAuthError('Network error. Please try again.');
        }
    }

    handleAuthSuccess(data) {
        // Store authentication data
        localStorage.setItem('resterx-auth-token', data.token);
        localStorage.setItem('resterx-user', JSON.stringify(data.user));
        if (data.workspaces && data.workspaces.length > 0) {
            localStorage.setItem('resterx-workspace', JSON.stringify(data.workspaces[0]));
        }

        this.authToken = data.token;
        this.currentUser = data.user;
        this.currentWorkspace = data.workspaces?.[0] || null;

        // Initialize the app
        this.hideAuthModal();
        this.showUserBar();
        this.init();
        this.setupEventListeners();
        this.loadHistory();

        // Show success message
        this.showNotification('Welcome to RESTerX Enterprise! 🚀', 'success');
    }

    handleLogout() {
        // Clear authentication data
        localStorage.removeItem('resterx-auth-token');
        localStorage.removeItem('resterx-user');
        localStorage.removeItem('resterx-workspace');

        this.authToken = null;
        this.currentUser = null;
        this.currentWorkspace = null;

        // Show auth modal
        this.hideUserBar();
        this.showAuthModal();
    }

    showAuthError(message, type = 'error') {
        const errorDiv = document.getElementById('authError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        if (type === 'success') {
            errorDiv.style.background = 'rgba(40, 167, 69, 0.1)';
            errorDiv.style.borderColor = '#28a745';
            errorDiv.style.color = '#28a745';
        } else {
            errorDiv.style.background = 'rgba(220, 53, 69, 0.1)';
            errorDiv.style.borderColor = '#dc3545';
            errorDiv.style.color = '#dc3545';
        }
    }

    hideAuthError() {
        document.getElementById('authError').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--success-color);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Enhanced request method with authentication
    async sendRequest() {
        if (!this.authToken) {
            this.showAuthModal();
            return;
        }

        // Get request data
        const method = document.getElementById('methodSelect_tab1').value;
        const url = document.getElementById('urlInput_tab1').value.trim();
        
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Show loading
        document.getElementById('loading').style.display = 'flex';
        
        // Collect headers
        const headers = {};
        document.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key) {
                headers[key] = value;
            }
        });

        // Get body content
        let body = '';
        const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
        if (bodyType === 'json' || bodyType === 'text') {
            body = document.getElementById('requestBody').value;
        } else if (bodyType === 'form') {
            const formData = {};
            document.querySelectorAll('.form-row').forEach(row => {
                const key = row.querySelector('.form-key').value.trim();
                const value = row.querySelector('.form-value').value.trim();
                if (key) {
                    formData[key] = value;
                }
            });
            body = JSON.stringify(formData);
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch('/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    method,
                    url,
                    headers,
                    body
                })
            });

            if (response.status === 401) {
                // Token expired
                this.handleLogout();
                return;
            }

            const result = await response.json();
            this.displayResponse(result);
            this.addToHistory({ method, url, headers, body }, result);
            
        } catch (error) {
            this.displayError(error.message);
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Shortcuts modal
        document.getElementById('shortcutsBtn').addEventListener('click', () => this.showShortcutsModal());

        // Template selector
        document.getElementById('templateSelect_tab1').addEventListener('change', (e) => this.loadTemplate(e.target.value));

        // Send request
        document.getElementById('sendBtn_tab1').addEventListener('click', () => this.sendRequest());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.querySelectorAll('.response-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchResponseTab(e.target.dataset.tab));
        });

        // Add/remove headers
        document.getElementById('addHeader').addEventListener('click', () => this.addHeaderRow());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-header')) {
                this.removeHeaderRow(e.target);
            }
        });

        // Body type change
        document.querySelectorAll('input[name="bodyType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleBodyTypeChange(e.target.value));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auth type change
        document.querySelectorAll('input[name="authType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleAuthTypeChange(e.target.value));
        });

        // Add/remove form data
        document.getElementById('addFormData').addEventListener('click', () => this.addFormDataRow());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-form')) {
                this.removeFormDataRow(e.target);
            }
        });

        // Response controls
        document.getElementById('formatJson').addEventListener('click', () => this.formatJsonResponse());
        document.getElementById('copyResponse').addEventListener('click', () => this.copyResponse());

        // History
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());

        // URL input enter key
        document.getElementById('urlInput_tab1').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendRequest();
            }
        });

        // New enhanced features event listeners
        
        // Environment management
        document.getElementById('manageEnv').addEventListener('click', () => this.showEnvironmentModal());
        document.getElementById('environmentSelect').addEventListener('change', (e) => this.setActiveEnvironment(e.target.value));
        
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSidebarTab(e.target.dataset.tab));
        });

        // Collections
        document.getElementById('newCollection').addEventListener('click', () => this.showCollectionModal());

        // Variables
        document.getElementById('addVariable').addEventListener('click', () => this.addVariableRow());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-variable')) {
                this.removeVariableRow(e.target);
            }
        });

        // Environment modal
        document.getElementById('addEnvVar').addEventListener('click', () => this.addEnvVariableRow());
        document.getElementById('createEnv').addEventListener('click', () => this.createEnvironment());
        document.getElementById('createCollection').addEventListener('click', () => this.createCollection());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Code generation
        document.getElementById('generateCode').addEventListener('click', () => this.generateCode());
        document.getElementById('copyCode').addEventListener('click', () => this.copyGeneratedCode());

        // Mock server
        document.getElementById('createMockFromRequest').addEventListener('click', () => this.createMockFromRequest());
        document.getElementById('viewMockEndpoints').addEventListener('click', () => this.viewMockEndpoints());
        document.getElementById('generateApiDocs').addEventListener('click', () => this.generateApiDocs());

        // Documentation
        document.getElementById('refreshDocs').addEventListener('click', () => this.refreshDocumentation());
        document.getElementById('exportOpenAPI').addEventListener('click', () => this.exportOpenAPI());
        document.getElementById('copyDocs').addEventListener('click', () => this.copyDocumentation());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('resterx-theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    switchResponseTab(tabName) {
        // Remove active class from all response tabs and panes
        document.querySelectorAll('.response-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.response-tab-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    addHeaderRow() {
        const container = document.querySelector('.headers-container');
        const row = document.createElement('div');
        row.className = 'header-row';
        row.innerHTML = `
            <input type="text" placeholder="Header Name" class="header-key">
            <input type="text" placeholder="Header Value" class="header-value">
            <button class="remove-header">×</button>
        `;
        container.appendChild(row);
    }

    removeHeaderRow(button) {
        button.parentElement.remove();
    }

    addFormDataRow() {
        const container = document.querySelector('.form-data-container');
        const addBtn = document.getElementById('addFormData');
        const row = document.createElement('div');
        row.className = 'form-row';
        row.innerHTML = `
            <input type="text" placeholder="Key" class="form-key">
            <input type="text" placeholder="Value" class="form-value">
            <button class="remove-form">×</button>
        `;
        container.insertBefore(row, addBtn);
    }

    removeFormDataRow(button) {
        button.parentElement.remove();
    }

    handleBodyTypeChange(type) {
        const bodyTextarea = document.getElementById('requestBody');
        const formDataContainer = document.getElementById('formData');

        if (type === 'form') {
            bodyTextarea.style.display = 'none';
            formDataContainer.style.display = 'block';
        } else {
            bodyTextarea.style.display = 'block';
            formDataContainer.style.display = 'none';

            if (type === 'json') {
                bodyTextarea.placeholder = '{\n  "key": "value"\n}';
            } else if (type === 'text') {
                bodyTextarea.placeholder = 'Raw text content...';
            } else {
                bodyTextarea.placeholder = 'Request body content...';
                bodyTextarea.value = '';
            }
        }
    }

    handleAuthTypeChange(type) {
        const bearerAuth = document.getElementById('bearerAuth');
        const basicAuth = document.getElementById('basicAuth');

        bearerAuth.style.display = type === 'bearer' ? 'block' : 'none';
        basicAuth.style.display = type === 'basic' ? 'block' : 'none';
    }

    collectHeaders() {
        const headers = {};
        const headerRows = document.querySelectorAll('.header-row');

        headerRows.forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key && value) {
                headers[key] = value;
            }
        });

        // Add authentication headers
        const authType = document.querySelector('input[name="authType"]:checked').value;
        if (authType === 'bearer') {
            const token = document.getElementById('bearerToken').value.trim();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } else if (authType === 'basic') {
            const username = document.getElementById('basicUsername').value.trim();
            const password = document.getElementById('basicPassword').value.trim();
            if (username && password) {
                headers['Authorization'] = `Basic ${btoa(username + ':' + password)}`;
            }
        }

        return headers;
    }

    collectRequestBody() {
        const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
        
        if (bodyType === 'none') {
            return '';
        } else if (bodyType === 'form') {
            const formData = {};
            const formRows = document.querySelectorAll('.form-row');
            
            formRows.forEach(row => {
                const key = row.querySelector('.form-key')?.value.trim();
                const value = row.querySelector('.form-value')?.value.trim();
                if (key && value) {
                    formData[key] = value;
                }
            });
            
            return new URLSearchParams(formData).toString();
        } else {
            return document.getElementById('requestBody').value;
        }
    }

    async sendRequest() {
        const method = document.getElementById('methodSelect').value;
        let url = document.getElementById('urlInput').value.trim();

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Resolve variables in URL and body
        url = this.resolveVariables(url);
        
        const headers = this.collectHeaders();
        let body = this.collectRequestBody();
        
        // Resolve variables in body
        body = this.resolveVariables(body);

        // Set content type for form data
        const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
        if (bodyType === 'form' && body) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (bodyType === 'json' && body) {
            headers['Content-Type'] = 'application/json';
        }

        const request = { method, url, headers, body };

        this.showLoading(true);
        this.disableSendButton(true);

        try {
            let result;
            
            // In static mode, make direct HTTP requests instead of using backend
            if (this.isStaticMode) {
                result = await this.makeDirectHttpRequest(request);
            } else {
                // Use backend API
                const requestHeaders = { 'Content-Type': 'application/json' };
                if (this.authToken) {
                    requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
                }
                
                const response = await fetch('/api/request', {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(request)
                });

                if (!response.ok && (response.status === 501 || response.status === 404)) {
                    // Backend not available, switch to static mode
                    console.log('Backend unavailable during request, switching to static mode');
                    this.isStaticMode = true;
                    result = await this.makeDirectHttpRequest(request);
                } else {
                    result = await response.json();
                }
            }
            
            this.displayResponse(result);
            this.addToHistory(request, result);
            this.trackAnalytics(request, result);
        } catch (error) {
            this.displayError('Failed to send request: ' + error.message);
        } finally {
            this.showLoading(false);
            this.disableSendButton(false);
        }
    }

    // Make direct HTTP request in static mode (no backend proxy)
    async makeDirectHttpRequest(request) {
        const startTime = Date.now();
        
        try {
            // Prepare fetch options
            const fetchOptions = {
                method: request.method,
                headers: request.headers || {},
                mode: 'cors', // Enable CORS for cross-origin requests
            };

            // Add body for methods that support it
            if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
                fetchOptions.body = request.body;
            }

            // Make the request
            const response = await fetch(request.url, fetchOptions);
            const responseTime = Date.now() - startTime;

            // Get response headers
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            // Get response body
            let responseBody;
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
                try {
                    responseBody = await response.json();
                    responseBody = JSON.stringify(responseBody, null, 2);
                } catch (e) {
                    responseBody = await response.text();
                }
            } else {
                responseBody = await response.text();
            }

            return {
                statusCode: response.status,
                status: response.statusText || 'OK',
                headers: responseHeaders,
                body: responseBody,
                responseTime: responseTime
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            return {
                statusCode: 0,
                status: 'Error',
                headers: {},
                body: `Request failed: ${error.message}`,
                responseTime: responseTime,
                error: true
            };
        }
    }

    displayResponse(response) {
        // Status code
        const statusElement = document.getElementById('statusCode');
        statusElement.textContent = response.error ? 'ERROR' : `${response.statusCode} ${response.status}`;
        
        // Remove existing status classes
        statusElement.className = 'status-code';
        
        if (!response.error) {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                statusElement.classList.add('status-2xx');
            } else if (response.statusCode >= 300 && response.statusCode < 400) {
                statusElement.classList.add('status-3xx');
            } else if (response.statusCode >= 400 && response.statusCode < 500) {
                statusElement.classList.add('status-4xx');
            } else if (response.statusCode >= 500) {
                statusElement.classList.add('status-5xx');
            }
        } else {
            statusElement.classList.add('status-5xx');
        }

        // Response time
        document.getElementById('responseTime').textContent = 
            response.responseTime ? `${Math.round(response.responseTime / 1000000)}ms` : '';

        // Response body
        const responseBody = document.getElementById('responseBody');
        if (response.error) {
            responseBody.textContent = response.error;
        } else {
            responseBody.textContent = response.body || 'No content';
        }

        // Response headers
        const responseHeaders = document.getElementById('responseHeaders');
        if (response.headers) {
            const headerText = Object.entries(response.headers)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            responseHeaders.textContent = headerText || 'No headers';
        } else {
            responseHeaders.textContent = 'No headers';
        }
    }

    displayError(message) {
        const statusElement = document.getElementById('statusCode');
        statusElement.textContent = 'ERROR';
        statusElement.className = 'status-code status-5xx';
        
        document.getElementById('responseTime').textContent = '';
        document.getElementById('responseBody').textContent = message;
        document.getElementById('responseHeaders').textContent = '';
    }

    formatJsonResponse() {
        const responseBody = document.getElementById('responseBody');
        try {
            const json = JSON.parse(responseBody.textContent);
            responseBody.textContent = JSON.stringify(json, null, 2);
        } catch (error) {
            alert('Response is not valid JSON');
        }
    }

    async copyResponse() {
        const responseBody = document.getElementById('responseBody');
        try {
            await navigator.clipboard.writeText(responseBody.textContent);
            const btn = document.getElementById('copyResponse');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1000);
        } catch (error) {
            console.error('Failed to copy response:', error);
        }
    }

    addToHistory(request, response) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: response.responseTime
        };

        this.history.unshift(historyItem);
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }

        this.saveHistory();
        this.renderHistory();
    }

    loadHistory() {
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('history');
        
        if (this.history.length === 0) {
            container.innerHTML = '<p class="empty-state">No requests yet</p>';
            return;
        }

        container.innerHTML = this.history.map(item => `
            <div class="history-item" onclick="app.loadHistoryItem('${item.id}')">
                <div class="history-method">${item.method}</div>
                <div class="history-url">${item.url}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${new Date(item.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    loadHistoryItem(id) {
        const item = this.history.find(h => h.id == id);
        if (item) {
            document.getElementById('methodSelect').value = item.method;
            document.getElementById('urlInput').value = item.url;
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the request history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    saveHistory() {
        localStorage.setItem('resterx-history', JSON.stringify(this.history));
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    disableSendButton(disable) {
        document.getElementById('sendBtn').disabled = disable;
    }

    // Enhanced Features Methods

    switchSidebarTab(tabName) {
        // Remove active class from all sidebar tabs and panes
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sidebar-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    loadCollections() {
        // Load collections from local storage and display them
        const container = document.getElementById('collectionsContainer');
        if (this.collections.length === 0) {
            container.innerHTML = '<p class="empty-state">No collections yet</p>';
            return;
        }

        container.innerHTML = this.collections.map(collection => `
            <div class="collection-item">
                <h4>${collection.name}</h4>
                <p>${collection.description || 'No description'}</p>
                <small>${collection.requests?.length || 0} requests</small>
            </div>
        `).join('');
    }

    loadEnvironments() {
        const select = document.getElementById('environmentSelect');
        select.innerHTML = '<option value="">No Environment</option>';
        
        this.environments.forEach(env => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = env.name;
            if (env.id === this.activeEnvironment) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    setActiveEnvironment(envId) {
        this.activeEnvironment = envId;
        localStorage.setItem('resterx-active-env', envId);
    }

    showEnvironmentModal() {
        document.getElementById('envModal').style.display = 'flex';
        this.loadEnvironmentModal();
    }

    showCollectionModal() {
        document.getElementById('collectionModal').style.display = 'flex';
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    loadEnvironmentModal() {
        const envList = document.getElementById('envList');
        envList.innerHTML = this.environments.map(env => `
            <div class="env-item">
                <span>${env.name}</span>
                <small>${Object.keys(env.variables || {}).length} variables</small>
            </div>
        `).join('');
    }

    addVariableRow() {
        const container = document.querySelector('.variables-container');
        const row = document.createElement('div');
        row.className = 'variable-row';
        row.innerHTML = `
            <input type="text" placeholder="Variable Name" class="variable-key">
            <input type="text" placeholder="Variable Value" class="variable-value">
            <button class="remove-variable">×</button>
        `;
        container.appendChild(row);
    }

    removeVariableRow(button) {
        button.closest('.variable-row').remove();
    }

    addEnvVariableRow() {
        const container = document.querySelector('.env-variables');
        const row = document.createElement('div');
        row.className = 'env-var-row';
        row.innerHTML = `
            <input type="text" placeholder="Variable Name" class="env-var-key">
            <input type="text" placeholder="Variable Value" class="env-var-value">
            <button class="remove-env-var">×</button>
        `;
        container.appendChild(row);
    }

    createEnvironment() {
        const name = document.getElementById('envName').value.trim();
        if (!name) {
            alert('Please enter an environment name');
            return;
        }

        const variables = {};
        document.querySelectorAll('.env-var-row').forEach(row => {
            const key = row.querySelector('.env-var-key').value.trim();
            const value = row.querySelector('.env-var-value').value.trim();
            if (key && value) {
                variables[key] = value;
            }
        });

        const env = {
            id: 'env_' + Date.now(),
            name: name,
            variables: variables,
            active: false
        };

        this.environments.push(env);
        localStorage.setItem('resterx-environments', JSON.stringify(this.environments));
        this.loadEnvironments();
        this.closeModal(document.getElementById('envModal'));
        
        // Clear form
        document.getElementById('envName').value = '';
        document.querySelector('.env-variables').innerHTML = `
            <div class="env-var-row">
                <input type="text" placeholder="Variable Name" class="env-var-key">
                <input type="text" placeholder="Variable Value" class="env-var-value">
                <button class="remove-env-var">×</button>
            </div>
        `;
    }

    createCollection() {
        const name = document.getElementById('collectionName').value.trim();
        const description = document.getElementById('collectionDescription').value.trim();
        
        if (!name) {
            alert('Please enter a collection name');
            return;
        }

        const collection = {
            id: 'col_' + Date.now(),
            name: name,
            description: description,
            requests: [],
            createdAt: new Date().toISOString()
        };

        this.collections.push(collection);
        localStorage.setItem('resterx-collections', JSON.stringify(this.collections));
        this.loadCollections();
        this.closeModal(document.getElementById('collectionModal'));

        // Clear form
        document.getElementById('collectionName').value = '';
        document.getElementById('collectionDescription').value = '';
    }

    collectVariables() {
        const variables = {};
        document.querySelectorAll('.variable-row').forEach(row => {
            const key = row.querySelector('.variable-key').value.trim();
            const value = row.querySelector('.variable-value').value.trim();
            if (key && value) {
                variables[key] = value;
            }
        });
        return variables;
    }

    resolveVariables(text) {
        // Simple variable resolution for frontend
        let resolved = text;
        
        // Get active environment variables
        let envVars = {};
        if (this.activeEnvironment) {
            const activeEnv = this.environments.find(env => env.id === this.activeEnvironment);
            if (activeEnv) {
                envVars = activeEnv.variables || {};
            }
        }

        // Get current variables from the form
        const currentVars = this.collectVariables();
        const allVars = { ...envVars, ...currentVars };

        // Replace variables
        Object.keys(allVars).forEach(key => {
            const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            resolved = resolved.replace(pattern, allVars[key]);
        });

        // Replace built-in variables
        resolved = resolved.replace(/\{\{timestamp\}\}/g, Date.now());
        resolved = resolved.replace(/\{\{datetime\}\}/g, new Date().toISOString());
        resolved = resolved.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0]);
        resolved = resolved.replace(/\{\{uuid\}\}/g, 'uuid-' + Math.random().toString(36).substr(2, 9));
        resolved = resolved.replace(/\{\{random_int\}\}/g, Math.floor(Math.random() * 1000000));

        return resolved;
    }

    async generateCode() {
        const method = document.getElementById('methodSelect').value;
        const url = this.resolveVariables(document.getElementById('urlInput').value.trim());
        const headers = this.collectHeaders();
        const body = this.resolveVariables(this.collectRequestBody());
        const language = document.getElementById('languageSelect').value;

        if (!url) {
            alert('Please enter a URL first');
            return;
        }

        const request = { method, url, headers, body };

        try {
            const response = await fetch('/api/codegen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request, language })
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('generatedCode').textContent = result.code;
            } else {
                document.getElementById('generatedCode').textContent = 'Error generating code';
            }
        } catch (error) {
            document.getElementById('generatedCode').textContent = 'Error generating code: ' + error.message;
        }
    }

    copyGeneratedCode() {
        const codeElement = document.getElementById('generatedCode');
        const code = codeElement.textContent;
        
        if (code && code !== 'Click "Generate Code" to create code snippets' && code !== 'Error generating code') {
            navigator.clipboard.writeText(code).then(() => {
                // Show brief feedback
                const originalText = document.getElementById('copyCode').textContent;
                document.getElementById('copyCode').textContent = 'Copied!';
                setTimeout(() => {
                    document.getElementById('copyCode').textContent = originalText;
                }, 1000);
            }).catch(() => {
                alert('Failed to copy code to clipboard');
            });
        }
    }

    createMockFromRequest() {
        const method = document.getElementById('methodSelect').value;
        const url = document.getElementById('urlInput').value.trim();
        const body = document.getElementById('responseBody').textContent;
        
        if (!url) {
            alert('Please enter a URL first');
            return;
        }

        // Extract path from URL
        let path;
        try {
            const urlObj = new URL(url);
            path = urlObj.pathname;
        } catch (e) {
            path = url.startsWith('/') ? url : '/' + url;
        }

        const mockEndpoint = {
            method: method,
            path: path,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: body && body !== 'Send a request to see the response' ? body : '{"message": "Mock response"}',
            delay: 0,
            description: `Mock endpoint for ${method} ${path}`
        };

        this.saveMockEndpoint(mockEndpoint);
    }

    async saveMockEndpoint(endpoint) {
        try {
            const response = await fetch('/api/mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(endpoint)
            });

            if (response.ok) {
                alert('Mock endpoint created successfully!');
                this.viewMockEndpoints();
            } else {
                alert('Failed to create mock endpoint');
            }
        } catch (error) {
            alert('Error creating mock endpoint: ' + error.message);
        }
    }

    async viewMockEndpoints() {
        try {
            const response = await fetch('/api/mock');
            if (response.ok) {
                const endpoints = await response.json();
                this.displayMockEndpoints(endpoints);
            } else {
                alert('Failed to load mock endpoints');
            }
        } catch (error) {
            alert('Error loading mock endpoints: ' + error.message);
        }
    }

    displayMockEndpoints(endpoints) {
        const mockTab = document.getElementById('mock');
        let listContainer = mockTab.querySelector('.mock-endpoints-list');
        
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.className = 'mock-endpoints-list';
            mockTab.appendChild(listContainer);
        }

        if (Object.keys(endpoints).length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No mock endpoints created yet</p>';
            return;
        }

        listContainer.innerHTML = Object.values(endpoints).map(endpoint => `
            <div class="mock-endpoint-item">
                <div class="mock-endpoint-info">
                    <span class="mock-endpoint-method ${endpoint.method}">${endpoint.method}</span>
                    <span class="mock-endpoint-path">${endpoint.path}</span>
                    <div class="mock-endpoint-status">Status: ${endpoint.statusCode} | Delay: ${endpoint.delay}ms</div>
                </div>
                <button class="delete-mock-btn" onclick="app.deleteMockEndpoint('${endpoint.method}', '${endpoint.path}')">Delete</button>
            </div>
        `).join('');
    }

    async deleteMockEndpoint(method, path) {
        try {
            const response = await fetch('/api/mock', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, path })
            });

            if (response.ok) {
                this.viewMockEndpoints();
            } else {
                alert('Failed to delete mock endpoint');
            }
        } catch (error) {
            alert('Error deleting mock endpoint: ' + error.message);
        }
    }

    async generateApiDocs() {
        this.refreshDocumentation();
    }

    async refreshDocumentation() {
        try {
            const response = await fetch('/api/docs');
            if (response.ok) {
                const docs = await response.text();
                document.getElementById('apiDocumentation').textContent = docs;
            } else {
                document.getElementById('apiDocumentation').textContent = 'Failed to load documentation';
            }
        } catch (error) {
            document.getElementById('apiDocumentation').textContent = 'Error loading documentation: ' + error.message;
        }
    }

    async exportOpenAPI() {
        try {
            const response = await fetch('/api/docs?format=openapi');
            if (response.ok) {
                const openapi = await response.json();
                const blob = new Blob([JSON.stringify(openapi, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'api-spec.json';
                a.click();
                URL.revokeObjectURL(url);
            } else {
                alert('Failed to export OpenAPI specification');
            }
        } catch (error) {
            alert('Error exporting OpenAPI: ' + error.message);
        }
    }

    copyDocumentation() {
        const docsElement = document.getElementById('apiDocumentation');
        const docs = docsElement.textContent;
        
        if (docs && docs !== 'Click "Refresh Documentation" to generate API docs from mock endpoints') {
            navigator.clipboard.writeText(docs).then(() => {
                // Show brief feedback
                const originalText = document.getElementById('copyDocs').textContent;
                document.getElementById('copyDocs').textContent = 'Copied!';
                setTimeout(() => {
                    document.getElementById('copyDocs').textContent = originalText;
                }, 1000);
            }).catch(() => {
                alert('Failed to copy documentation to clipboard');
            });
        }
    }

    trackAnalytics(request, response) {
        const requestData = {
            timestamp: Date.now(),
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: response.responseTime || 0,
            success: response.statusCode >= 200 && response.statusCode < 400,
            responseSize: response.body ? response.body.length : 0
        };

        this.analytics.requests.push(requestData);
        this.analytics.totalRequests++;
        
        if (requestData.success) {
            this.analytics.successfulRequests++;
        }

        // Keep only last 100 requests for performance
        if (this.analytics.requests.length > 100) {
            this.analytics.requests = this.analytics.requests.slice(-100);
        }

        localStorage.setItem('resterx-analytics', JSON.stringify(this.analytics));
        this.updateAnalytics();
    }

    updateAnalytics() {
        if (this.analytics.totalRequests === 0) {
            return;
        }

        // Show analytics panel
        document.getElementById('analyticsPanel').style.display = 'block';

        // Calculate average response time
        const totalTime = this.analytics.requests.reduce((sum, req) => sum + (req.responseTime || 0), 0);
        const avgTime = totalTime / this.analytics.requests.length;
        document.getElementById('avgResponseTime').textContent = `${Math.round(avgTime / 1000000)}ms`;

        // Update request count
        document.getElementById('requestCount').textContent = this.analytics.totalRequests;

        // Calculate success rate
        const successRate = (this.analytics.successfulRequests / this.analytics.totalRequests * 100).toFixed(1);
        document.getElementById('successRate').textContent = `${successRate}%`;

        // Last response size
        if (this.analytics.requests.length > 0) {
            const lastRequest = this.analytics.requests[this.analytics.requests.length - 1];
            const sizeKB = (lastRequest.responseSize / 1024).toFixed(1);
            document.getElementById('lastResponseSize').textContent = `${sizeKB}KB`;
        }
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        // Ignore shortcuts if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl+Enter: Send request
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.sendRequest();
            return;
        }

        // Ctrl+T: Toggle theme
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
            return;
        }

        // Ctrl+Shift+F: Format JSON response
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            this.formatJsonResponse();
            return;
        }

        // Ctrl+C: Copy response (when response area is focused)
        if (e.ctrlKey && e.key === 'c' && document.querySelector('#responseBody:focus')) {
            e.preventDefault();
            this.copyResponse();
            return;
        }

        // Ctrl+H: Toggle history sidebar
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.switchSidebarTab('history');
            return;
        }

        // Number keys 1-6: Switch request tabs
        if (!e.ctrlKey && !e.shiftKey && /^[1-6]$/.test(e.key)) {
            e.preventDefault();
            const tabs = ['headers', 'body', 'auth', 'variables', 'tests', 'mock'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
            return;
        }

        // Ctrl+Number keys 1-4: Switch response tabs
        if (e.ctrlKey && /^[1-4]$/.test(e.key)) {
            e.preventDefault();
            const responseTabs = ['response-body', 'response-headers', 'code-gen', 'docs'];
            const tabIndex = parseInt(e.key) - 1;
            if (responseTabs[tabIndex]) {
                this.switchResponseTab(responseTabs[tabIndex]);
            }
            return;
        }

        // ? key: Show shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            this.showShortcutsModal();
            return;
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            e.preventDefault();
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    this.closeModal(modal);
                }
            });
            return;
        }
    }

    showShortcutsModal() {
        document.getElementById('shortcutsModal').style.display = 'flex';
        
        // Add escape key handler for modal
        const modal = document.getElementById('shortcutsModal');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.onclick = () => this.closeModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        };
    }

    // Enhanced history with timestamps
    addToHistory(request, response) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
            response: {
                statusCode: response.statusCode,
                status: response.status,
                responseTime: response.responseTime
            }
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 requests
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.renderHistory();
    }

    // Enhanced history rendering with timestamps
    renderHistory() {
        const container = document.getElementById('historyContainer');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<p class="empty-state">No requests yet</p>';
            return;
        }

        container.innerHTML = this.history.map(item => {
            const date = new Date(item.timestamp);
            const timeAgo = this.getTimeAgo(date);
            
            return `
                <div class="history-item" onclick="app.loadHistoryItem(${item.id})">
                    <div class="history-method">${item.method}</div>
                    <div class="history-url">${item.url}</div>
                    <div class="history-timestamp">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    // Template functionality
    loadTemplate(templateId) {
        if (!templateId) return;

        const templates = {
            'jsonplaceholder-posts': {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                description: 'Fetch sample posts from JSONPlaceholder'
            },
            'jsonplaceholder-users': {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/users',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                description: 'Fetch sample users from JSONPlaceholder'
            },
            'httpbin-get': {
                method: 'GET',
                url: 'https://httpbin.org/get?test=123',
                headers: { 'User-Agent': 'RESTerX/1.0' },
                body: '',
                description: 'Test GET request with HTTPBin'
            },
            'httpbin-post': {
                method: 'POST',
                url: 'https://httpbin.org/post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Hello from RESTerX!', timestamp: new Date().toISOString() }, null, 2),
                description: 'Test POST request with HTTPBin'
            },
            'github-api': {
                method: 'GET',
                url: 'https://api.github.com/users/octocat',
                headers: { 'Accept': 'application/vnd.github.v3+json' },
                body: '',
                description: 'Fetch GitHub user information'
            },
            'rest-countries': {
                method: 'GET',
                url: 'https://restcountries.com/v3.1/name/india',
                headers: { 'Accept': 'application/json' },
                body: '',
                description: 'Get country information from REST Countries API'
            }
        };

        const template = templates[templateId];
        if (!template) return;

        // Set method
        document.getElementById('methodSelect_tab1').value = template.method;

        // Set URL
        document.getElementById('urlInput_tab1').value = template.url;

        // Set headers
        this.clearHeaders();
        Object.entries(template.headers).forEach(([key, value]) => {
            this.addHeaderRow(key, value);
        });

        // Set body if exists
        if (template.body) {
            // Switch to body tab
            this.switchTab('body');
            // Set body type to JSON if it looks like JSON
            if (template.body.trim().startsWith('{')) {
                document.querySelector('input[name="bodyType"][value="json"]').checked = true;
                this.handleBodyTypeChange('json');
            }
            document.getElementById('requestBody').value = template.body;
        }

        // Show notification
        this.showNotification(`Template loaded: ${template.description}`, 'success');

        // Reset template selector
        document.getElementById('templateSelect_tab1').value = '';
    }

    clearHeaders() {
        const container = document.querySelector('.headers-container');
        // Keep one empty row
        container.innerHTML = `
            <div class="header-row">
                <input type="text" placeholder="Header Name" class="header-key">
                <input type="text" placeholder="Header Value" class="header-value">
                <button class="remove-header">×</button>
            </div>
        `;
    }

    addHeaderRow(key = '', value = '') {
        const container = document.querySelector('.headers-container');
        const row = document.createElement('div');
        row.className = 'header-row';
        row.innerHTML = `
            <input type="text" placeholder="Header Name" class="header-key" value="${key}">
            <input type="text" placeholder="Header Value" class="header-value" value="${value}">
            <button class="remove-header">×</button>
        `;
        container.appendChild(row);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;

        // Add to body
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RESTerX();
});