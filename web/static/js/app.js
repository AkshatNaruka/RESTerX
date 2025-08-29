class RESTerX {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.loadHistory();
    }

    init() {
        this.history = JSON.parse(localStorage.getItem('resterx-history') || '[]');
        this.currentTheme = localStorage.getItem('resterx-theme') || 'light';
        this.applyTheme();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Send request
        document.getElementById('sendBtn').addEventListener('click', () => this.sendRequest());

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
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendRequest();
            }
        });
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
        const url = document.getElementById('urlInput').value.trim();

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        const headers = this.collectHeaders();
        const body = this.collectRequestBody();

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
            const response = await fetch('/api/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            const result = await response.json();
            this.displayResponse(result);
            this.addToHistory(request, result);
        } catch (error) {
            this.displayError('Failed to send request: ' + error.message);
        } finally {
            this.showLoading(false);
            this.disableSendButton(false);
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RESTerX();
});