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
import { toast } from "sonner"
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
  FileJson,
  Upload,
  Target,
  Scale,
  PlayCircle,
  StopCircle,
  Activity,
  Network,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Globe,
} from "lucide-react"
import Link from "next/link"

interface HeaderItem {
  key: string
  value: string
}

interface QueryParamItem {
  key: string
  value: string
  enabled: boolean
}

interface PathVariableItem {
  key: string
  value: string
}

interface CookieItem {
  name: string
  value: string
  domain?: string
  path?: string
  expires?: string
  httpOnly?: boolean
  secure?: boolean
}

interface Environment {
  id: number
  name: string
  variables: { key: string; value: string }[]
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
  responseSize?: number
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

interface PostmanCollection {
  info: {
    name: string
    description?: string
    schema: string
  }
  item: PostmanItem[]
}

interface PostmanItem {
  name: string
  request: {
    method: string
    url: {
      raw: string
      host?: string[]
      path?: string[]
      query?: Array<{ key: string, value: string }>
    }
    header?: Array<{ key: string, value: string }>
    body?: {
      mode?: string
      raw?: string
      options?: {
        raw?: {
          language: string
        }
      }
    }
    auth?: {
      type: string
      bearer?: Array<{ key: string, value: string, type: string }>
      basic?: Array<{ key: string, value: string, type: string }>
    }
  }
  response?: any[]
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
  "bearer-auth": {
    name: "Bearer Token Auth",
    method: "POST",
    url: "https://httpbin.org/bearer",
    headers: [
      { key: "Authorization", value: "Bearer YOUR_TOKEN_HERE" },
      { key: "Content-Type", value: "application/json" }
    ],
    body: '{\n  "action": "test",\n  "data": "protected resource"\n}',
  },
  "webhook-receiver": {
    name: "Webhook Receiver",
    method: "POST",
    url: "https://webhook.site/unique-url",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: '{\n  "event": "webhook.test",\n  "timestamp": "' + new Date().toISOString() + '",\n  "data": {\n    "message": "Test webhook payload"\n  }\n}',
  },
  "weather-api": {
    name: "Weather API",
    method: "GET",
    url: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "cat-facts": {
    name: "Cat Facts API",
    method: "GET",
    url: "https://catfact.ninja/fact",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "dog-facts": {
    name: "Dog Facts API",
    method: "GET",
    url: "https://dog-api.kinduff.com/api/facts",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "crypto-prices": {
    name: "Cryptocurrency Prices",
    method: "GET",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "random-user": {
    name: "Random User Generator",
    method: "GET",
    url: "https://randomuser.me/api/",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "ip-geolocation": {
    name: "IP Geolocation",
    method: "GET",
    url: "https://ipapi.co/json/",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "quote-api": {
    name: "Random Quotes",
    method: "GET",
    url: "https://api.quotable.io/random",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "spacex-api": {
    name: "SpaceX Launches",
    method: "GET",
    url: "https://api.spacexdata.com/v4/launches/latest",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "pokemon-api": {
    name: "Pokémon API",
    method: "GET",
    url: "https://pokeapi.co/api/v2/pokemon/pikachu",
    headers: [{ key: "Accept", value: "application/json" }],
    body: "",
  },
  "chuck-norris": {
    name: "Chuck Norris Jokes",
    method: "GET",
    url: "https://api.chucknorris.io/jokes/random",
    headers: [{ key: "Accept", value: "application/json" }],
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
  const [queryParams, setQueryParams] = useState<QueryParamItem[]>([{ key: "", value: "", enabled: true }])
  const [pathVariables, setPathVariables] = useState<PathVariableItem[]>([])
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [body, setBody] = useState("")
  const [bodyType, setBodyType] = useState<"none" | "json" | "text" | "form">("none")
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic" | "oauth2">("none")
  const [bearerToken, setBearerToken] = useState("")
  const [basicUsername, setBasicUsername] = useState("")
  const [basicPassword, setBasicPassword] = useState("")
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeTab, setActiveTab] = useState("params")
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
  const [showImportCollectionModal, setShowImportCollectionModal] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)
  const [requestName, setRequestName] = useState("")
  const [expandedCollectionId, setExpandedCollectionId] = useState<number | null>(null)
  
  // Bulk test states
  const [showBulkTest, setShowBulkTest] = useState(false)
  const [bulkTestCount, setBulkTestCount] = useState(10)
  const [bulkTestDelay, setBulkTestDelay] = useState(100)
  const [bulkTestParallel, setBulkTestParallel] = useState(false)
  const [bulkTestRunning, setBulkTestRunning] = useState(false)
  const [bulkTestResults, setBulkTestResults] = useState<{
    total: number
    completed: number
    successful: number
    failed: number
    avgTime: number
    minTime: number
    maxTime: number
  } | null>(null)
  
  // Response comparison states
  const [showCompare, setShowCompare] = useState(false)
  const [compareIndex1, setCompareIndex1] = useState<number | null>(null)
  const [compareIndex2, setCompareIndex2] = useState<number | null>(null)
  
  // Retry configuration states
  const [retryCount, setRetryCount] = useState(0)
  const [retryDelay, setRetryDelay] = useState(2)
  
  // Environment variables states
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [activeEnvironment, setActiveEnvironment] = useState<number | null>(null)
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false)
  const [newEnvironmentName, setNewEnvironmentName] = useState("")
  const [environmentVariables, setEnvironmentVariables] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" }
  ])

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
    
    const savedEnvironments = localStorage.getItem("resterx-environments")
    if (savedEnvironments) {
      setEnvironments(JSON.parse(savedEnvironments))
    }
    
    const savedActiveEnv = localStorage.getItem("resterx-active-environment")
    if (savedActiveEnv) {
      setActiveEnvironment(Number(savedActiveEnv))
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
  
  useEffect(() => {
    // Save environments to localStorage
    localStorage.setItem("resterx-environments", JSON.stringify(environments))
  }, [environments])
  
  useEffect(() => {
    // Save active environment to localStorage
    if (activeEnvironment !== null) {
      localStorage.setItem("resterx-active-environment", String(activeEnvironment))
    }
  }, [activeEnvironment])

  useEffect(() => {
    // Extract path variables from URL
    extractPathVariables(url)
  }, [url])

  // Keyboard shortcuts will be moved after the sendRequest function to fix dependency issues

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

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "", enabled: true }])
  }

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index))
  }

  const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
    const newParams = [...queryParams]
    newParams[index][field] = value
    setQueryParams(newParams)
  }

  const toggleQueryParam = (index: number) => {
    const newParams = [...queryParams]
    newParams[index].enabled = !newParams[index].enabled
    setQueryParams(newParams)
  }

  const buildUrlWithParams = () => {
    try {
      let finalUrl = url
      
      // Replace path variables {{variable}}
      pathVariables.forEach(pv => {
        if (pv.key && pv.value) {
          finalUrl = finalUrl.replace(new RegExp(`{{${pv.key}}}`, 'g'), pv.value)
        }
      })

      // Add query parameters
      const enabledParams = queryParams.filter(p => p.enabled && p.key && p.value)
      if (enabledParams.length > 0) {
        const urlObj = new URL(finalUrl)
        enabledParams.forEach(p => {
          urlObj.searchParams.append(p.key, p.value)
        })
        finalUrl = urlObj.toString()
      }
      
      return finalUrl
    } catch {
      return url
    }
  }

  const extractPathVariables = (url: string) => {
    const regex = /{{(\w+)}}/g
    const matches = url.matchAll(regex)
    const variables: PathVariableItem[] = []
    for (const match of matches) {
      if (!variables.find(v => v.key === match[1])) {
        const existing = pathVariables.find(v => v.key === match[1])
        variables.push({ key: match[1], value: existing?.value || "" })
      }
    }
    setPathVariables(variables)
  }

  const parseCookiesFromResponse = (headers: Record<string, string>) => {
    const setCookieHeader = headers['set-cookie'] || headers['Set-Cookie']
    if (!setCookieHeader) return

    const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
    const parsedCookies: CookieItem[] = cookieStrings.map(cookieStr => {
      const parts = cookieStr.split(';').map(p => p.trim())
      const [nameValue] = parts
      const [name, value] = nameValue.split('=')
      
      const cookie: CookieItem = { name, value }
      
      parts.slice(1).forEach(part => {
        const [key, val] = part.split('=')
        const lowerKey = key.toLowerCase()
        if (lowerKey === 'domain') cookie.domain = val
        if (lowerKey === 'path') cookie.path = val
        if (lowerKey === 'expires') cookie.expires = val
        if (lowerKey === 'httponly') cookie.httpOnly = true
        if (lowerKey === 'secure') cookie.secure = true
      })
      
      return cookie
    })
    
    setCookies(prev => [...parsedCookies, ...prev])
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
  
  // Environment variable helper functions
  const replaceEnvironmentVariables = (text: string): string => {
    if (!activeEnvironment) return text
    
    const env = environments.find(e => e.id === activeEnvironment)
    if (!env) return text
    
    let result = text
    env.variables.forEach(variable => {
      if (variable.key && variable.value) {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g')
        result = result.replace(regex, variable.value)
      }
    })
    
    return result
  }
  
  const createEnvironment = () => {
    if (!newEnvironmentName.trim()) {
      toast.error("Please enter an environment name")
      return
    }
    
    const variables = environmentVariables.filter(v => v.key.trim() !== "")
    
    const newEnv: Environment = {
      id: Date.now(),
      name: newEnvironmentName.trim(),
      variables: variables
    }
    
    setEnvironments([...environments, newEnv])
    setShowEnvironmentModal(false)
    setNewEnvironmentName("")
    setEnvironmentVariables([{ key: "", value: "" }])
    toast.success(`Environment "${newEnv.name}" created successfully`)
  }
  
  const deleteEnvironment = (id: number) => {
    if (confirm("Are you sure you want to delete this environment?")) {
      setEnvironments(environments.filter(e => e.id !== id))
      if (activeEnvironment === id) {
        setActiveEnvironment(null)
      }
    }
  }
  
  const addEnvironmentVariable = () => {
    setEnvironmentVariables([...environmentVariables, { key: "", value: "" }])
  }
  
  const removeEnvironmentVariable = (index: number) => {
    setEnvironmentVariables(environmentVariables.filter((_, i) => i !== index))
  }
  
  const updateEnvironmentVariable = (index: number, field: "key" | "value", value: string) => {
    const newVars = [...environmentVariables]
    newVars[index][field] = value
    setEnvironmentVariables(newVars)
  }

  const createCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name")
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
    toast.success(`Collection "${newCollection.name}" created successfully`)
  }

  const saveToCollection = () => {
    if (!url) {
      toast.error("Please enter a URL to save")
      return
    }

    if (!requestName.trim()) {
      toast.error("Please enter a request name")
      return
    }

    if (selectedCollectionId === null) {
      toast.error("Please select a collection")
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
    toast.success(`Request "${savedRequest.name}" saved to collection`)
  }

  const loadSavedRequest = (request: SavedRequest) => {
    // Set the method
    setMethod(request.method)
    
    // Set the URL
    setUrl(request.url)
    
    // Convert headers from object to array format
    const headersArray: HeaderItem[] = Object.entries(request.headers).map(([key, value]) => ({
      key,
      value,
    }))
    setHeaders(headersArray.length > 0 ? headersArray : [{ key: "", value: "" }])
    
    // Set the body
    setBody(request.body)
    setBodyType(request.body ? "json" : "none")
    
    // Set auth type and credentials
    setAuthType(request.authType as "none" | "bearer" | "basic")
    if (request.authType === "bearer" && request.bearerToken) {
      setBearerToken(request.bearerToken)
    } else if (request.authType === "basic") {
      setBasicUsername(request.basicUsername || "")
      setBasicPassword(request.basicPassword || "")
    }
  }
  
  const handleImportCollection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const jsonData = JSON.parse(content)
        
        // Check if this is a valid collection format (either Postman or RESTerX)
        if (!jsonData.info || !jsonData.info.name || !jsonData.item) {
          setImportError("Invalid collection format")
          return
        }
        
        // Convert collection to RESTerX collection
        const newCollection: Collection = {
          id: Date.now(),
          name: jsonData.info.name,
          description: jsonData.info.description || "",
          requests: [],
        }
        
        // Convert each item in the collection
        jsonData.item.forEach((item: any) => {
          if (!item.request) return
          
          // Extract URL
          let url = ""
          if (typeof item.request.url === "string") {
            url = item.request.url
          } else if (item.request.url.raw) {
            url = item.request.url.raw
          }
          
          // Extract headers
          const headers: Record<string, string> = {}
          if (item.request.header) {
            item.request.header.forEach((h: any) => {
              if (h.key && h.value) {
                headers[h.key] = h.value
              }
            })
          }
          
          // Extract body
          let body = ""
          let authType: "none" | "bearer" | "basic" = "none"
          let bearerToken = ""
          let basicUsername = ""
          let basicPassword = ""
          
          if (item.request.body) {
            if (item.request.body.mode === "raw" && item.request.body.raw) {
              body = item.request.body.raw
            } else if (typeof item.request.body === "string") {
              // Handle case where body might be directly a string
              body = item.request.body
            }
          }
          
          // Extract auth
          if (item.request.auth) {
            if (item.request.auth.type === "bearer") {
              authType = "bearer"
              const tokenItem = item.request.auth.bearer?.find((item: any) => item.key === "token")
              if (tokenItem) {
                bearerToken = tokenItem.value
              }
            } else if (item.request.auth.type === "basic") {
              authType = "basic"
              const usernameItem = item.request.auth.basic?.find((item: any) => item.key === "username")
              const passwordItem = item.request.auth.basic?.find((item: any) => item.key === "password")
              if (usernameItem) basicUsername = usernameItem.value
              if (passwordItem) basicPassword = passwordItem.value
            }
          }
          
          // Create saved request
          const savedRequest: SavedRequest = {
            id: `req_${Date.now()}_${newCollection.requests.length}`,
            name: item.name,
            method: item.request.method || "GET",
            url,
            headers,
            body,
            authType,
            bearerToken: authType === "bearer" ? bearerToken : undefined,
            basicUsername: authType === "basic" ? basicUsername : undefined,
            basicPassword: authType === "basic" ? basicPassword : undefined,
            createdAt: new Date().toISOString(),
          }
          
          newCollection.requests.push(savedRequest)
        })
        
        // Add the new collection
        setCollections([...collections, newCollection])
        setShowImportCollectionModal(false)
        setSidebarTab("collections")
        
        // Reset the file input
        event.target.value = ""
        
      } catch (error) {
        console.error("Import error:", error)
        setImportError("Failed to parse collection file. Please make sure it's a valid collection JSON.")
      }
    }
    reader.readAsText(file)
  }

  const toggleCollection = (collectionId: number) => {
    setExpandedCollectionId(expandedCollectionId === collectionId ? null : collectionId)
  }

  const exportCollection = (collection: Collection) => {
    // Convert RESTerX collection to a more standard format that's similar to Postman
    const exportData = {
      info: {
        name: collection.name,
        description: collection.description,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: collection.requests.map(req => {
        // Convert headers from object to array format
        const headerArray = Object.entries(req.headers).map(([key, value]) => ({
          key,
          value,
          type: "text"
        }))

        // Handle authentication
        let auth = null
        if (req.authType === "bearer" && req.bearerToken) {
          auth = {
            type: "bearer",
            bearer: [{ key: "token", value: req.bearerToken, type: "string" }]
          }
        } else if (req.authType === "basic" && req.basicUsername) {
          auth = {
            type: "basic",
            basic: [
              { key: "username", value: req.basicUsername, type: "string" },
              { key: "password", value: req.basicPassword || "", type: "string" }
            ]
          }
        }

        return {
          name: req.name,
          request: {
            method: req.method,
            url: {
              raw: req.url,
              protocol: req.url.startsWith("https") ? "https" : "http",
              host: req.url.replace(/^https?:\/\//, "").split("/")[0].split("."),
              path: req.url.replace(/^https?:\/\/[^/]+/, "").split("/").filter(p => p)
            },
            header: headerArray,
            body: req.body ? {
              mode: "raw",
              raw: req.body,
              options: {
                raw: {
                  language: "json"
                }
              }
            } : undefined,
            auth
          }
        }
      })
    }

    // Create a JSON blob and trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${collection.name.replace(/\s+/g, "_").toLowerCase()}_collection.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sendRequest = async () => {
    if (!url) return

    setLoading(true)
    const startTime = Date.now()

    try {
      const requestHeaders: Record<string, string> = {}

      // Add custom headers with environment variable replacement
      headers.forEach((h) => {
        if (h.key && h.value) {
          requestHeaders[replaceEnvironmentVariables(h.key)] = replaceEnvironmentVariables(h.value)
        }
      })

      // Add auth headers with environment variable replacement
      if (authType === "bearer" && bearerToken) {
        requestHeaders["Authorization"] = `Bearer ${replaceEnvironmentVariables(bearerToken)}`
      } else if (authType === "oauth2" && bearerToken) {
        requestHeaders["Authorization"] = `Bearer ${replaceEnvironmentVariables(bearerToken)}`
      } else if (authType === "basic" && basicUsername && basicPassword) {
        const credentials = btoa(`${replaceEnvironmentVariables(basicUsername)}:${replaceEnvironmentVariables(basicPassword)}`)
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
        options.body = replaceEnvironmentVariables(body)
      }

      // Build final URL with query params and path variables (with env var replacement)
      const finalUrl = replaceEnvironmentVariables(buildUrlWithParams())

      const res = await fetch(finalUrl, options)
      const responseTime = Date.now() - startTime
      const responseBody = await res.text()
      const responseSize = new Blob([responseBody]).size

      const responseHeaders = Object.fromEntries(res.headers.entries())
      
      const responseData: ResponseData = {
        statusCode: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        responseTime,
        responseSize,
        timestamp: new Date().toISOString(),
      }

      setResponse(responseData)
      
      // Parse cookies from response
      parseCookiesFromResponse(responseHeaders)

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now(),
        method,
        url: finalUrl,
        statusCode: res.status,
        responseTime,
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [historyItem, ...prev].slice(0, 100))
      
      // Show success toast
      if (res.status >= 200 && res.status < 300) {
        toast.success(`Request completed successfully (${res.status})`)
      } else if (res.status >= 400) {
        toast.error(`Request failed with status ${res.status}`)
      }
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
      
      // Show error toast
      toast.error(`Request failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Keyboard shortcuts - moved after sendRequest function to fix dependency issues
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip shortcuts if we're in an input or textarea except for specific exceptions
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        // Still allow Cmd+S even in input/textarea
        if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s")) {
          return;
        }
      }
      
      // Cmd/Ctrl + Enter: Send request
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        sendRequest()
      }
      
      // Cmd/Ctrl + K: Focus URL
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        document.getElementById("url-input")?.focus()
      }
      
      // Cmd/Ctrl + S: Save to collection
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        setShowSaveToCollectionModal(true)
      }
      
      // Cmd/Ctrl + H: Toggle history
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
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
  }, [sendRequest, setShowSaveToCollectionModal, setSidebarTab, setShowShortcuts])

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
      toast.success("Response copied to clipboard")
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
      toast.success("Response downloaded")
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("resterx-history")
    toast.info("History cleared")
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

  // Bulk test function
  const runBulkTest = async () => {
    if (!url) return
    
    setBulkTestRunning(true)
    setBulkTestResults({
      total: bulkTestCount,
      completed: 0,
      successful: 0,
      failed: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0
    })

    const results = {
      total: bulkTestCount,
      completed: 0,
      successful: 0,
      failed: 0,
      times: [] as number[]
    }

    const makeRequest = async () => {
      const startTime = performance.now()
      try {
        const response = await fetch(url, {
          method,
          headers: headers.reduce((acc, h) => {
            if (h.key && h.value) acc[h.key] = h.value
            return acc
          }, {} as Record<string, string>),
          body: body && ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
        })
        
        const endTime = performance.now()
        const time = endTime - startTime
        
        results.completed++
        results.successful++
        results.times.push(time)
        
        setBulkTestResults({
          total: results.total,
          completed: results.completed,
          successful: results.successful,
          failed: results.failed,
          avgTime: results.times.reduce((a, b) => a + b, 0) / results.times.length,
          minTime: Math.min(...results.times),
          maxTime: Math.max(...results.times)
        })
      } catch (error) {
        results.completed++
        results.failed++
        
        setBulkTestResults({
          total: results.total,
          completed: results.completed,
          successful: results.successful,
          failed: results.failed,
          avgTime: results.times.length > 0 ? results.times.reduce((a, b) => a + b, 0) / results.times.length : 0,
          minTime: results.times.length > 0 ? Math.min(...results.times) : 0,
          maxTime: results.times.length > 0 ? Math.max(...results.times) : 0
        })
      }
    }

    if (bulkTestParallel) {
      // Parallel execution
      const promises = Array(bulkTestCount).fill(null).map(() => makeRequest())
      await Promise.all(promises)
    } else {
      // Sequential execution with delay
      for (let i = 0; i < bulkTestCount; i++) {
        await makeRequest()
        if (i < bulkTestCount - 1 && bulkTestDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, bulkTestDelay))
        }
      }
    }

    setBulkTestRunning(false)
  }

  // Response comparison functions
  const compareResponses = () => {
    if (compareIndex1 === null || compareIndex2 === null) return null
    
    const response1 = history[compareIndex1]
    const response2 = history[compareIndex2]
    
    if (!response1 || !response2) return null

    const differences = []
    
    if (response1.statusCode !== response2.statusCode) {
      differences.push(`Status code: ${response1.statusCode} vs ${response2.statusCode}`)
    }
    
    const timeDiff = Math.abs(response1.responseTime - response2.responseTime)
    if (timeDiff > 100) {
      differences.push(`Response time difference: ${timeDiff.toFixed(0)}ms`)
    }
    
    if (response1.method !== response2.method) {
      differences.push(`Method: ${response1.method} vs ${response2.method}`)
    }
    
    if (response1.url !== response2.url) {
      differences.push(`URL: Different endpoints`)
    }
    
    return {
      response1,
      response2,
      differences
    }
  }

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

              {/* Environment Variables */}
              <Dialog open={showEnvironmentModal} onOpenChange={setShowEnvironmentModal}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Environment Variables">
                    <Globe className="w-4 h-4 mr-2" />
                    {activeEnvironment 
                      ? environments.find(e => e.id === activeEnvironment)?.name 
                      : "No Environment"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Environment Variables</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Active Environment Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Active Environment</label>
                      <Select 
                        value={activeEnvironment?.toString() || "none"} 
                        onValueChange={(value) => setActiveEnvironment(value === "none" ? null : parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Environment</SelectItem>
                          {environments.map(env => (
                            <SelectItem key={env.id} value={env.id.toString()}>
                              {env.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Existing Environments List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Saved Environments</h4>
                        <Button
                          size="sm"
                          onClick={() => {
                            setNewEnvironmentName("")
                            setEnvironmentVariables([{ key: "", value: "" }])
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          New Environment
                        </Button>
                      </div>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {environments.map(env => (
                          <Card key={env.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{env.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {env.variables.length} variable(s)
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteEnvironment(env.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Create New Environment Form */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold">Create New Environment</h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Environment Name</label>
                        <Input
                          placeholder="e.g., Production, Staging, Development"
                          value={newEnvironmentName}
                          onChange={(e) => setNewEnvironmentName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Variables</label>
                          <Button size="sm" variant="outline" onClick={addEnvironmentVariable}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Variable
                          </Button>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {environmentVariables.map((variable, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Variable name (e.g., API_URL)"
                                value={variable.key}
                                onChange={(e) => updateEnvironmentVariable(index, "key", e.target.value)}
                                className="flex-1"
                              />
                              <Input
                                placeholder="Value"
                                value={variable.value}
                                onChange={(e) => updateEnvironmentVariable(index, "value", e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeEnvironmentVariable(index)}
                                disabled={environmentVariables.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Use variables in your requests with {"{{variable_name}}"} syntax
                        </p>
                      </div>
                      
                      <Button onClick={createEnvironment} className="w-full">
                        Create Environment
                      </Button>
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
                    <div className="space-y-2 pt-2 border-t">
                      <h4 className="text-sm font-semibold">Retry Configuration</h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Retries:</label>
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          value={retryCount}
                          onChange={(e) => setRetryCount(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">Automatically retry failed requests (0-5 times)</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Retry Delay (seconds):</label>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={retryDelay}
                          onChange={(e) => setRetryDelay(parseInt(e.target.value) || 2)}
                        />
                        <p className="text-xs text-muted-foreground">Wait time between retries (1-30 seconds)</p>
                      </div>
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
                title="Save to Collection (⌘S)"
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
              
              {/* Bulk Test Button */}
              <Dialog open={showBulkTest} onOpenChange={setShowBulkTest}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Bulk Test">
                    <Target className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>🎯 Bulk Test Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Requests:</label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={bulkTestCount}
                        onChange={(e) => setBulkTestCount(parseInt(e.target.value) || 10)}
                      />
                      <p className="text-xs text-muted-foreground">Send the same request multiple times (1-100)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Delay Between Requests (ms):</label>
                      <Input
                        type="number"
                        min={0}
                        max={5000}
                        value={bulkTestDelay}
                        onChange={(e) => setBulkTestDelay(parseInt(e.target.value) || 100)}
                      />
                      <p className="text-xs text-muted-foreground">Wait time between each request (0-5000 ms)</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="bulkTestParallel"
                        checked={bulkTestParallel}
                        onChange={(e) => setBulkTestParallel(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="bulkTestParallel" className="text-sm">
                        Send requests in parallel
                      </label>
                    </div>
                    
                    {bulkTestResults && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium">Test Results</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-lg font-semibold">{bulkTestResults.completed}/{bulkTestResults.total}</p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                            <p className="text-lg font-semibold">
                              {bulkTestResults.completed > 0 ? ((bulkTestResults.successful / bulkTestResults.completed) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Avg Response Time</p>
                            <p className="text-lg font-semibold">{bulkTestResults.avgTime.toFixed(0)}ms</p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Min/Max Time</p>
                            <p className="text-lg font-semibold">{bulkTestResults.minTime.toFixed(0)}/{bulkTestResults.maxTime.toFixed(0)}ms</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={runBulkTest} 
                        disabled={bulkTestRunning || !url}
                        className="flex-1"
                      >
                        {bulkTestRunning ? "Running..." : "Start Bulk Test"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowBulkTest(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Response Comparison Button */}
              <Dialog open={showCompare} onOpenChange={setShowCompare}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Compare Responses">
                    <Scale className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>⚖️ Compare Responses</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Response 1:</label>
                        <Select
                          value={compareIndex1?.toString() || ""}
                          onValueChange={(value) => setCompareIndex1(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select from history..." />
                          </SelectTrigger>
                          <SelectContent>
                            {history.map((item, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {item.method} {item.url} - {new Date(item.timestamp).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Response 2:</label>
                        <Select
                          value={compareIndex2?.toString() || ""}
                          onValueChange={(value) => setCompareIndex2(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select from history..." />
                          </SelectTrigger>
                          <SelectContent>
                            {history.map((item, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {item.method} {item.url} - {new Date(item.timestamp).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {compareIndex1 !== null && compareIndex2 !== null && compareResponses() && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Response 1</h4>
                            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                              <p><strong>Status:</strong> {compareResponses()?.response1.statusCode}</p>
                              <p><strong>Time:</strong> {new Date(compareResponses()?.response1.timestamp || "").toLocaleString()}</p>
                              <p><strong>Response Time:</strong> {compareResponses()?.response1.responseTime}ms</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Response 2</h4>
                            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                              <p><strong>Status:</strong> {compareResponses()?.response2.statusCode}</p>
                              <p><strong>Time:</strong> {new Date(compareResponses()?.response2.timestamp || "").toLocaleString()}</p>
                              <p><strong>Response Time:</strong> {compareResponses()?.response2.responseTime}ms</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Differences</h4>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            {compareResponses()?.differences.length === 0 ? (
                              <p className="text-sm text-green-600">✅ No significant differences found</p>
                            ) : (
                              <ul className="space-y-1">
                                {compareResponses()?.differences.map((diff, index) => (
                                  <li key={index} className="text-sm">⚠️ {diff}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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
                  <span className="font-mono font-semibold">
                    {formatBytes(response.responseSize || response.body.length)}
                  </span>
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
                      // Handle Enter key for sending request
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendRequest()
                      }
                      
                      // Allow Cmd+S to be handled by the global handler
                      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                        e.preventDefault()
                        setShowSaveToCollectionModal(true)
                        return;
                      }
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                </div>

                {/* Request Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="params">Params</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="auth">Auth</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="params" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Query Parameters</h3>
                      {queryParams.map((param, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={() => toggleQueryParam(index)}
                            className="w-4 h-4"
                          />
                          <Input
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                          <Input
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeQueryParam(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addQueryParam} className="gap-2 bg-transparent">
                        <Plus className="w-4 h-4" />
                        Add Query Parameter
                      </Button>
                    </div>

                    {pathVariables.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="text-sm font-medium">Path Variables</h3>
                        <p className="text-xs text-muted-foreground">Variables detected in URL (use {`{{variable}}`} syntax)</p>
                        {pathVariables.map((pv, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Variable name"
                              value={pv.key}
                              disabled
                              className="flex-1 font-mono text-sm bg-muted"
                            />
                            <Input
                              placeholder="Value"
                              value={pv.value}
                              onChange={(e) => {
                                const newVars = [...pathVariables]
                                newVars[index].value = e.target.value
                                setPathVariables(newVars)
                              }}
                              className="flex-1 font-mono text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

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
                    <div className="flex gap-2 mb-3 flex-wrap">
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
                      <Button
                        variant={authType === "oauth2" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAuthType("oauth2")}
                      >
                        OAuth 2.0
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

                    {authType === "oauth2" && (
                      <div className="space-y-3 p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          OAuth 2.0 authentication configuration. Get your access token from your OAuth provider.
                        </p>
                        <Input
                          placeholder="Access Token"
                          value={bearerToken}
                          onChange={(e) => setBearerToken(e.target.value)}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          The access token will be added to the Authorization header as "Bearer &lt;token&gt;"
                        </p>
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
                      <TabsTrigger value="cookies">Cookies</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="body" className="mt-4">
                      <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                        <span>
                          {response.responseSize ? `Size: ${formatBytes(response.responseSize)}` : ''}
                        </span>
                        <span>Time: {response.responseTime}ms</span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-[500px] overflow-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap break-words">{response.body}</pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="mt-4">
                      <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-[500px] overflow-auto">
                        <pre className="text-sm font-mono">{JSON.stringify(response.headers, null, 2)}</pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="cookies" className="mt-4">
                      {cookies.length > 0 ? (
                        <div className="space-y-2">
                          {cookies.map((cookie, index) => (
                            <div key={index} className="bg-muted/50 rounded-lg p-3 border border-border">
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-semibold text-sm">{cookie.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCookies(cookies.filter((_, i) => i !== index))}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="space-y-1 text-xs font-mono">
                                <div><span className="text-muted-foreground">Value:</span> {cookie.value}</div>
                                {cookie.domain && <div><span className="text-muted-foreground">Domain:</span> {cookie.domain}</div>}
                                {cookie.path && <div><span className="text-muted-foreground">Path:</span> {cookie.path}</div>}
                                {cookie.expires && <div><span className="text-muted-foreground">Expires:</span> {cookie.expires}</div>}
                                {cookie.httpOnly && <div className="text-blue-500">HttpOnly</div>}
                                {cookie.secure && <div className="text-green-500">Secure</div>}
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCookies([])}
                            className="w-full"
                          >
                            Clear All Cookies
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-muted/50 rounded-lg p-4 border border-border text-center text-muted-foreground">
                          No cookies received yet
                        </div>
                      )}
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2 bg-transparent"
                        onClick={() => setShowCollectionModal(true)}
                      >
                        <Plus className="w-3 h-3" />
                        New Collection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 bg-transparent"
                        onClick={() => setShowImportCollectionModal(true)}
                      >
                        <Upload className="w-3 h-3" />
                        Import Collection
                      </Button>
                    </div>
                    {collections.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No saved collections</p>
                    ) : (
                      <div className="space-y-2">
                        {collections.map((collection) => (
                          <div
                            key={collection.id}
                            className="rounded-lg border border-border overflow-hidden"
                          >
                            <div
                              className="p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                              onClick={() => toggleCollection(collection.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1">{collection.name}</h4>
                                  {collection.description && (
                                    <p className="text-xs text-muted-foreground mb-2">{collection.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Folder className="w-3 h-3" />
                                    <span>{collection.requests?.length || 0} requests</span>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 rounded-full"
                                    title="Export Collection"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportCollection(collection);
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  {expandedCollectionId === collection.id ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {expandedCollectionId === collection.id && collection.requests.length > 0 && (
                              <div className="border-t border-border bg-muted/20">
                                {collection.requests.map((request) => (
                                  <div
                                    key={request.id}
                                    className="px-4 py-2 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      loadSavedRequest(request)
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs font-mono px-1.5 py-0"
                                      >
                                        {request.method}
                                      </Badge>
                                      <span className="text-sm font-medium truncate flex-1">
                                        {request.name}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-1 pl-12">
                                      {request.url}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
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

      {/* Import Collection Dialog */}
      <Dialog open={showImportCollectionModal} onOpenChange={setShowImportCollectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Import Collection
              </label>
              <p className="text-sm text-muted-foreground">
                Upload a Postman or RESTerX collection JSON file to import all requests and folders.
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 border-border hover:bg-muted">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileJson className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-center text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Postman or RESTerX Collection JSON files
                      </p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      accept=".json,application/json" 
                      className="hidden" 
                      onChange={handleImportCollection}
                    />
                  </label>
                </div>
              </div>
              {importError && (
                <div className="mt-2 text-sm text-red-500">
                  {importError}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowImportCollectionModal(false)}>
              Cancel
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