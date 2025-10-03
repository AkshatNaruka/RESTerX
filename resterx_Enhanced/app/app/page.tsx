"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Moon,
  Sun,
  Plus,
  Trash2,
  Copy,
  Download,
  Settings,
  Keyboard,
  Clock,
  Code,
  Zap,
  Save,
  Share2,
  History,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Folder,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface HeaderItem {
  key: string
  value: string
}

interface HistoryItem {
  id: number
  method: string
  url: string
  statusCode: number
  responseTime: number
  timestamp: string
}

interface ResponseData {
  statusCode: number
  statusText: string
  headers: Record<string, string>
  body: string
  responseTime: number
  timestamp?: string
  error?: boolean
}

interface SavedRequest {
  id: string
  name: string
  method: string
  url: string
  headers: Record<string, string>
  body: string
  authType: string
  bearerToken?: string
  basicUsername?: string
  basicPassword?: string
  createdAt: string
}

interface Collection {
  id: number
  name: string
  description: string
  requests: SavedRequest[]
}

const API_TEMPLATES = {
  "jsonplaceholder-posts": {
    name: "JSONPlaceholder - Posts",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: [],
    body: "",
  },
  "jsonplaceholder-users": {
    name: "JSONPlaceholder - Users",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users",
    headers: [],
    body: "",
  },
  "httpbin-get": {
    name: "HTTPBin - GET Test",
    method: "GET",
    url: "https://httpbin.org/get",
    headers: [],
    body: "",
  },
  "httpbin-post": {
    name: "HTTPBin - POST Test",
    method: "POST",
    url: "https://httpbin.org/post",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: '{\n  "name": "Test User",\n  "email": "test@example.com"\n}',
  },
  "github-api": {
    name: "GitHub API - User Info",
    method: "GET",
    url: "https://api.github.com/users/octocat",
    headers: [{ key: "Accept", value: "application/vnd.github.v3+json" }],
    body: "",
  },
  "rest-countries": {
    name: "REST Countries API",
    method: "GET",
    url: "https://restcountries.com/v3.1/all",
    headers: [],
    body: "",
  },
  "local-test-api": {
    name: "Local Test API - Users",
    method: "GET", 
    url: "http://localhost:3000/api/users",
    headers: [],
    body: "",
  },
  "local-test-api-post": {
    name: "Local Test API - Create User",
    method: "POST",
    url: "http://localhost:3000/api/users",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "username": "johndoe",\n  "active": true\n}',
  },
}

export default function RESTerXApp() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState<HeaderItem[]>([{ key: "", value: "" }])
  const [body, setBody] = useState("")
  const [bodyType, setBodyType] = useState<"none" | "json" | "text" | "form">("none")
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic">("none")
  const [bearerToken, setBearerToken] = useState("")
  const [basicUsername, setBasicUsername] = useState("")
  const [basicPassword, setBasicPassword] = useState("")
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeTab, setActiveTab] = useState("headers")
  const [responseTab, setResponseTab] = useState("body")
  const [sidebarTab, setSidebarTab] = useState("history")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCodeExport, setShowCodeExport] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState("curl")
  const [searchTerm, setSearchTerm] = useState("")
  const [jsonExpanded, setJsonExpanded] = useState(true)
  const [historyFilter, setHistoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [showSaveToCollectionModal, setShowSaveToCollectionModal] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)
  const [requestName, setRequestName] = useState("")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  useEffect(() => {
    // Load from localStorage on mount
    const savedHistory = localStorage.getItem("resterx-history")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

    const savedCollections = localStorage.getItem("resterx-collections")
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections))
    }
  }, [])

  useEffect(() => {
    // Save history to localStorage
    localStorage.setItem("resterx-history", JSON.stringify(history))
  }, [history])

  useEffect(() => {
    // Save collections to localStorage
    localStorage.setItem("resterx-collections", JSON.stringify(collections))
  }, [collections])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter: Send request
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        sendRequest()
      }
      // Cmd/Ctrl + K: Focus URL
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("url-input")?.focus()
      }
      // Cmd/Ctrl + S: Save to collection
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        // Open save dialog
      }
      // Cmd/Ctrl + H: Toggle history
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault()
        setSidebarTab("history")
      }
      // ?: Show shortcuts
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [url, method, headers, body])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }])
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const loadTemplate = (templateId: string) => {
    const template = API_TEMPLATES[templateId as keyof typeof API_TEMPLATES]
    if (template) {
      setMethod(template.method)
      setUrl(template.url)
      setHeaders(template.headers.length > 0 ? template.headers : [{ key: "", value: "" }])
      setBody(template.body)
      setBodyType(template.body ? "json" : "none")
    }
  }

  const createCollection = () => {
    if (!newCollectionName.trim()) {
      alert("Please enter a collection name")
      return
    }

    const newCollection: Collection = {
      id: Date.now(),
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim(),
      requests: [],
    }

    setCollections([...collections, newCollection])
    setShowCollectionModal(false)
    setNewCollectionName("")
    setNewCollectionDescription("")
    setSidebarTab("collections")
  }

  const saveToCollection = () => {
    if (!url) {
      alert("Please enter a URL to save")
      return
    }

    if (!requestName.trim()) {
      alert("Please enter a request name")
      return
    }

    if (selectedCollectionId === null) {
      alert("Please select a collection")
      return
    }

    // Convert headers array to object
    const headersObj: Record<string, string> = {}
    headers.forEach((header) => {
      if (header.key && header.value) {
        headersObj[header.key] = header.value
      }
    })

    const savedRequest: SavedRequest = {
      id: `req_${Date.now()}`,
      name: requestName.trim(),
      method: method,
      url: url,
      headers: headersObj,
      body: body,
      authType: authType,
      bearerToken: authType === "bearer" ? bearerToken : undefined,
      basicUsername: authType === "basic" ? basicUsername : undefined,
      basicPassword: authType === "basic" ? basicPassword : undefined,
      createdAt: new Date().toISOString(),
    }

    // Find the collection and add the request
    const updatedCollections = collections.map((collection) => {
      if (collection.id === selectedCollectionId) {
        return {
          ...collection,
          requests: [...collection.requests, savedRequest],
        }
      }
      return collection
    })

    setCollections(updatedCollections)
    setShowSaveToCollectionModal(false)
    setRequestName("")
    setSelectedCollectionId(null)
    setSidebarTab("collections")
  }

  const sendRequest = async () => {
    if (!url) return

    setLoading(true)
    const startTime = Date.now()

    try {
      const requestHeaders: Record<string, string> = {}

      // Add custom headers
      headers.forEach((h) => {
        if (h.key && h.value) {
          requestHeaders[h.key] = h.value
        }
      })

      // Add auth headers
      if (authType === "bearer" && bearerToken) {
        requestHeaders["Authorization"] = `Bearer ${bearerToken}`
      } else if (authType === "basic" && basicUsername && basicPassword) {
        const credentials = btoa(`${basicUsername}:${basicPassword}`)
        requestHeaders["Authorization"] = `Basic ${credentials}`
      }

      // Add content-type for JSON body
      if (bodyType === "json" && body && !requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json"
      }

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      }

      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        options.body = body
      }

      const res = await fetch(url, options)
      const responseTime = Date.now() - startTime
      const responseBody = await res.text()

      const responseData: ResponseData = {
        statusCode: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseBody,
        responseTime,
        timestamp: new Date().toISOString(),
      }

      setResponse(responseData)

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now(),
        method,
        url,
        statusCode: res.status,
        responseTime,
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [historyItem, ...prev].slice(0, 100))
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      setResponse({
        statusCode: 0,
        statusText: "Error",
        body: error.message,
        headers: {},
        error: true,
        responseTime,
      })

      // Add error to history
      const historyItem: HistoryItem = {
        id: Date.now(),
        method,
        url,
        statusCode: 0,
        responseTime,
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [historyItem, ...prev].slice(0, 100))
    } finally {
      setLoading(false)
    }
  }

  const formatJson = () => {
    if (response?.body) {
      try {
        const parsed = JSON.parse(response.body)
        setResponse({ ...response, body: JSON.stringify(parsed, null, 2) })
      } catch (e) {
        // Not valid JSON
      }
    }
  }

  const minifyJson = () => {
    if (response?.body) {
      try {
        const parsed = JSON.parse(response.body)
        setResponse({ ...response, body: JSON.stringify(parsed) })
      } catch (e) {
        // Not valid JSON
      }
    }
  }

  const copyResponse = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body)
    }
  }

  const downloadResponse = () => {
    if (response?.body) {
      const blob = new Blob([response.body], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `response-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("resterx-history")
  }

  const loadFromHistory = (item: HistoryItem) => {
    setUrl(item.url)
    setMethod(item.method)
  }

  const generateCode = () => {
    if (!url) return ""

    const headersObj: Record<string, string> = {}
    headers.forEach((h) => {
      if (h.key && h.value) {
        headersObj[h.key] = h.value
      }
    })

    switch (codeLanguage) {
      case "curl":
        let curl = `curl -X ${method} "${url}"`
        Object.entries(headersObj).forEach(([key, value]) => {
          curl += ` \\\n  -H "${key}: ${value}"`
        })
        if (body && ["POST", "PUT", "PATCH"].includes(method)) {
          curl += ` \\\n  -d '${body}'`
        }
        return curl

      case "javascript":
        return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headersObj, null, 2)},${
    body && ["POST", "PUT", "PATCH"].includes(method) ? `\n  body: ${JSON.stringify(body)}` : ""
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`

      case "python":
        return `import requests

url = "${url}"
headers = ${JSON.stringify(headersObj, null, 2).replace(/"/g, "'")}
${body && ["POST", "PUT", "PATCH"].includes(method) ? `data = ${JSON.stringify(body, null, 2).replace(/"/g, "'")}` : ""}

response = requests.${method.toLowerCase()}(url, headers=headers${
          body && ["POST", "PUT", "PATCH"].includes(method) ? ", json=data" : ""
        })
print(response.json())`

      case "nodejs":
        return `const https = require('https');

const options = {
  hostname: '${new URL(url).hostname}',
  path: '${new URL(url).pathname}',
  method: '${method}',
  headers: ${JSON.stringify(headersObj, null, 2)}
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

${body && ["POST", "PUT", "PATCH"].includes(method) ? `req.write(${JSON.stringify(body)});` : ""}
req.end();`

      case "go":
        return `package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    ${body && ["POST", "PUT", "PATCH"].includes(method) ? '"strings"' : ""}
)

func main() {
    url := "${url}"
    ${body && ["POST", "PUT", "PATCH"].includes(method) ? `payload := strings.NewReader(${JSON.stringify(body)})` : ""}
    
    req, _ := http.NewRequest("${method}", url, ${body && ["POST", "PUT", "PATCH"].includes(method) ? "payload" : "nil"})
    ${Object.entries(headersObj)
      .map(([key, value]) => `req.Header.Add("${key}", "${value}")`)
      .join("\n    ")}
    
    res, _ := http.DefaultClient.Do(req)
    defer res.Body.Close()
    body, _ := ioutil.ReadAll(res.Body)
    
    fmt.Println(string(body))
}`

      default:
        return "// Select a language to generate code"
    }
  }

  const getStatusColor = (status: number) => {
    if (status === 0) return "text-destructive"
    if (status >= 200 && status < 300) return "text-green-500"
    if (status >= 300 && status < 400) return "text-blue-500"
    if (status >= 400 && status < 500) return "text-yellow-500"
    if (status >= 500) return "text-red-500"
    return "text-muted-foreground"
  }

  const getStatusBadgeVariant = (status: number): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 0) return "destructive"
    if (status >= 200 && status < 300) return "default"
    if (status >= 300 && status < 400) return "secondary"
    if (status >= 400) return "destructive"
    return "outline"
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.url.toLowerCase().includes(historyFilter.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "2xx" && item.statusCode >= 200 && item.statusCode < 300) ||
      (statusFilter === "4xx" && item.statusCode >= 400 && item.statusCode < 500) ||
      (statusFilter === "5xx" && item.statusCode >= 500) ||
      (statusFilter === "error" && item.statusCode === 0)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">Back to Landing</span>
              </Link>
              <div className="flex items-center gap-2 ml-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">RESTerX</h1>
              </div>
              <Badge variant="secondary" className="text-xs">
                Advanced API Playground
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Keyboard Shortcuts (?)">
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Request Actions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Send Request</span>
                          <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Focus URL</span>
                          <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">K</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Save Request</span>
                          <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Navigation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Toggle History</span>
                          <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs">H</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Show Shortcuts</span>
                          <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Settings">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Request Timeout (seconds)</label>
                      <Input type="number" defaultValue={30} min={1} max={300} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Response Size (MB)</label>
                      <Input type="number" defaultValue={50} min={1} max={100} />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Follow redirects automatically
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Validate SSL certificates
                      </label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Action Bar */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={sendRequest} disabled={loading || !url} className="gap-2">
                <Zap className="w-4 h-4" />
                {loading ? "Sending..." : "Send"}
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background/50 px-1.5 font-mono text-[10px] font-medium opacity-100">
                  ⌘↵
                </kbd>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                title="Save to Collection"
                onClick={() => setShowSaveToCollectionModal(true)}
              >
                <Save className="w-4 h-4" />
              </Button>
              <Dialog open={showCodeExport} onOpenChange={setShowCodeExport}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Export as Code">
                    <Code className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Export as Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curl">cURL</SelectItem>
                        <SelectItem value="javascript">JavaScript (Fetch)</SelectItem>
                        <SelectItem value="python">Python (Requests)</SelectItem>
                        <SelectItem value="nodejs">Node.js (HTTPS)</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <pre className="bg-muted/50 rounded-lg p-4 border border-border overflow-x-auto text-sm font-mono">
                        {generateCode()}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 bg-transparent"
                        onClick={() => navigator.clipboard.writeText(generateCode())}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" title="Share Request">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {response && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-mono font-semibold ${getStatusColor(response.statusCode)}`}>
                    {response.statusCode} {response.statusText}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-mono font-semibold">{response.responseTime}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-mono font-semibold">{formatBytes(response.body.length)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Templates Section */}
            <Card className="p-4 border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">API Templates</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowTemplates(!showTemplates)} className="gap-2">
                  {showTemplates ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {showTemplates ? "Hide" : "Browse"}
                </Button>
              </div>

              {showTemplates && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {Object.entries(API_TEMPLATES).map(([id, template]) => (
                    <button
                      key={id}
                      onClick={() => loadTemplate(id)}
                      className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {template.method}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{template.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Request Builder */}
            <Card className="p-6 border-border">
              <div className="space-y-4">
                {/* URL Input */}
                <div className="flex gap-2">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    id="url-input"
                    placeholder="Enter request URL (e.g., https://api.example.com/users)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendRequest()
                      }
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                </div>

                {/* Request Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="auth">Auth</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="headers" className="space-y-3 mt-4">
                    {headers.map((header, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) => updateHeader(index, "key", e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                        <Input
                          placeholder="Header value"
                          value={header.value}
                          onChange={(e) => updateHeader(index, "value", e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeHeader(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addHeader} className="gap-2 bg-transparent">
                      <Plus className="w-4 h-4" />
                      Add Header
                    </Button>
                  </TabsContent>

                  <TabsContent value="body" className="space-y-3 mt-4">
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant={bodyType === "none" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBodyType("none")}
                      >
                        None
                      </Button>
                      <Button
                        variant={bodyType === "json" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBodyType("json")}
                      >
                        JSON
                      </Button>
                      <Button
                        variant={bodyType === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBodyType("text")}
                      >
                        Text
                      </Button>
                      <Button
                        variant={bodyType === "form" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBodyType("form")}
                      >
                        Form
                      </Button>
                    </div>

                    {bodyType !== "none" && (
                      <Textarea
                        placeholder={
                          bodyType === "json"
                            ? '{\n  "key": "value"\n}'
                            : bodyType === "form"
                              ? "key1=value1&key2=value2"
                              : "Request body..."
                        }
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="auth" className="space-y-3 mt-4">
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant={authType === "none" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAuthType("none")}
                      >
                        No Auth
                      </Button>
                      <Button
                        variant={authType === "bearer" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAuthType("bearer")}
                      >
                        Bearer Token
                      </Button>
                      <Button
                        variant={authType === "basic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAuthType("basic")}
                      >
                        Basic Auth
                      </Button>
                    </div>

                    {authType === "bearer" && (
                      <Input
                        placeholder="Bearer Token"
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        className="font-mono text-sm"
                      />
                    )}

                    {authType === "basic" && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Username"
                          value={basicUsername}
                          onChange={(e) => setBasicUsername(e.target.value)}
                          className="font-mono text-sm"
                        />
                        <Input
                          type="password"
                          placeholder="Password"
                          value={basicPassword}
                          onChange={(e) => setBasicPassword(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="variables" className="mt-4">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        Use variables in URL and body with the syntax:{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">{"{{variable_name}}"}</code>
                      </p>
                      <p className="font-semibold">Built-in variables:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">{"{{timestamp}}"}</code> - Current Unix
                          timestamp
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">{"{{datetime}}"}</code> - Current ISO datetime
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">{"{{uuid}}"}</code> - Random UUID
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">{"{{random_int}}"}</code> - Random integer
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Response */}
            {response && (
              <Card className="p-6 border-border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Response</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={formatJson} className="gap-2 bg-transparent">
                        <Sparkles className="w-4 h-4" />
                        Pretty
                      </Button>
                      <Button variant="outline" size="sm" onClick={minifyJson} className="gap-2 bg-transparent">
                        <Minimize2 className="w-4 h-4" />
                        Minify
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyResponse} className="gap-2 bg-transparent">
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResponse} className="gap-2 bg-transparent">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <Tabs value={responseTab} onValueChange={setResponseTab}>
                    <TabsList>
                      <TabsTrigger value="body">Body</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="body" className="mt-4">
                      <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-[500px] overflow-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap break-words">{response.body}</pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="mt-4">
                      <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-[500px] overflow-auto">
                        <pre className="text-sm font-mono">{JSON.stringify(response.headers, null, 2)}</pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="code" className="mt-4">
                      <div className="space-y-3">
                        <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="curl">cURL</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="nodejs">Node.js</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-[500px] overflow-auto">
                          <pre className="text-sm font-mono">{generateCode()}</pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 border-border sticky top-[145px]">
              <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="history" className="gap-2">
                    <History className="w-4 h-4" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="gap-2">
                    <Folder className="w-4 h-4" />
                    Saved
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Input
                      placeholder="Search history..."
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="text-sm"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="2xx">Success (2xx)</SelectItem>
                        <SelectItem value="4xx">Client Error (4xx)</SelectItem>
                        <SelectItem value="5xx">Server Error (5xx)</SelectItem>
                        <SelectItem value="error">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    {history.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearHistory}
                        className="w-full gap-2 bg-transparent"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {history.length === 0 ? "No requests yet" : "No matching requests"}
                      </p>
                    ) : (
                      filteredHistory.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.method}
                            </Badge>
                            <span className={`text-xs font-mono font-semibold ${getStatusColor(item.statusCode)}`}>
                              {item.statusCode || "ERR"}
                            </span>
                          </div>
                          <p className="text-sm font-mono truncate text-muted-foreground mb-2">{item.url}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {item.responseTime}ms
                            <span className="ml-auto">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="collections" className="mt-4">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 bg-transparent"
                      onClick={() => setShowCollectionModal(true)}
                    >
                      <Plus className="w-3 h-3" />
                      New Collection
                    </Button>
                    {collections.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No saved collections</p>
                    ) : (
                      <div className="space-y-2">
                        {collections.map((collection) => (
                          <div
                            key={collection.id}
                            className="p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                          >
                            <h4 className="font-medium text-sm mb-1">{collection.name}</h4>
                            {collection.description && (
                              <p className="text-xs text-muted-foreground mb-2">{collection.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Folder className="w-3 h-3" />
                              <span>{collection.requests?.length || 0} requests</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Collection Creation Dialog */}
      <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="collection-name" className="text-sm font-medium">
                Collection Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="collection-name"
                placeholder="e.g., My API Collection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="collection-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="collection-description"
                placeholder="Optional description for this collection"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCollectionModal(false)}>
              Cancel
            </Button>
            <Button onClick={createCollection}>
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save to Collection Dialog */}
      <Dialog open={showSaveToCollectionModal} onOpenChange={setShowSaveToCollectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Request to Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="request-name" className="text-sm font-medium">
                Request Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="request-name"
                placeholder="e.g., Get User Profile"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="select-collection" className="text-sm font-medium">
                Select Collection <span className="text-red-500">*</span>
              </label>
              {collections.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No collections available. Create a collection first.
                </div>
              ) : (
                <Select
                  value={selectedCollectionId?.toString() || ""}
                  onValueChange={(value) => setSelectedCollectionId(Number(value))}
                >
                  <SelectTrigger id="select-collection">
                    <SelectValue placeholder="Choose a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id.toString()}>
                        {collection.name} ({collection.requests?.length || 0} requests)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="font-medium mb-1">Request Details:</div>
              <div className="space-y-1">
                <div><span className="font-medium">Method:</span> {method}</div>
                <div><span className="font-medium">URL:</span> {url || "Not set"}</div>
                {authType !== "none" && (
                  <div><span className="font-medium">Auth:</span> {authType}</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSaveToCollectionModal(false)
                setRequestName("")
                setSelectedCollectionId(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveToCollection} disabled={collections.length === 0}>
              Save Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Sending request...</p>
          </div>
        </div>
      )}
    </div>
  )
}