# Crowe Logic Platform API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://app.crowelogic.com/api`

## Authentication
All protected endpoints require JWT authentication via HTTP-only cookie (`auth_token`).

### Headers
```
Cookie: auth_token=<jwt_token>
Content-Type: application/json
```

## Rate Limiting
- Global: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- AI endpoints: 10 requests per minute

## API Endpoints

### Health & Monitoring

#### GET /api/health
Basic health check
```json
Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600
}
```

#### GET /api/healthz
Detailed health check with dependencies
```json
Response: 200 OK (healthy) / 503 Service Unavailable (degraded)
{
  "status": "healthy|degraded",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "memory": "healthy"
  },
  "metrics": {
    "memory": { "heapUsed": 50, "systemUsedPercent": 45 },
    "cpu": { "cores": 4, "loadAverage": { "1m": 0.5 } }
  }
}
```

### Authentication

#### POST /api/auth/register
Create new user account
```json
Request:
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "subscriptionStatus": "inactive",
    "subscriptionTier": "free"
  },
  "message": "Registration successful"
}

Errors:
- 400: Validation failed / Email already exists
- 429: Rate limit exceeded
```

#### POST /api/auth/login
Authenticate user
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "subscriptionStatus": "active",
    "subscriptionTier": "pro"
  },
  "message": "Login successful"
}

Errors:
- 401: Invalid credentials
- 429: Too many failed attempts
```

#### POST /api/auth/logout
End user session
```json
Response: 200 OK
{
  "message": "Logout successful"
}
```

#### GET /api/auth/me
Get current authenticated user
```json
Response: 200 OK
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "subscriptionStatus": "active",
    "subscriptionTier": "pro",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}

Errors:
- 401: Not authenticated
```

### Knowledge Base

#### GET /api/knowledge/strains
List mushroom strains
```json
Query Parameters:
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 20, max: 100)
- difficulty (string): Filter by cultivation difficulty
- edibility (string): Filter by edibility status

Response: 200 OK
{
  "strains": [
    {
      "id": 1,
      "scientificName": "Psilocybe cubensis",
      "commonNames": ["Golden Teacher", "Cubes"],
      "cultivationDifficulty": "beginner",
      "habitat": "Subtropical",
      "substrates": ["grain", "straw", "manure"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /api/knowledge/strains/:id
Get specific strain details
```json
Response: 200 OK
{
  "id": 1,
  "scientificName": "Psilocybe cubensis",
  "commonNames": ["Golden Teacher", "Cubes"],
  "taxonomy": {
    "kingdom": "Fungi",
    "phylum": "Basidiomycota",
    "genus": "Psilocybe"
  },
  "morphology": {
    "cap": "Golden brown, 2-8cm",
    "stem": "White, bruising blue"
  },
  "optimalGrowthConditions": {
    "temperature": "75-80°F",
    "humidity": "90-95%",
    "pH": "6.5-7.0"
  },
  "protocols": [...]
}

Errors:
- 404: Strain not found
```

#### GET /api/knowledge/search
Search knowledge base
```json
Query Parameters:
- q (string): Search query (required)
- type (string): Filter by type (strains|compounds|papers)
- page (number): Page number
- limit (number): Results per page

Response: 200 OK
{
  "results": [...],
  "pagination": {...}
}
```

### Lab Notebook

#### GET /api/lab/notebooks
List user's lab notebooks (Protected)
```json
Response: 200 OK
{
  "notebooks": [
    {
      "id": 1,
      "title": "Golden Teacher Cultivation",
      "description": "First grow attempt",
      "category": "cultivation",
      "entryCount": 15,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/lab/notebooks
Create new notebook (Protected)
```json
Request:
{
  "title": "PE Strain Experiments",
  "description": "Testing different substrates",
  "category": "experiments",
  "aiInsightsEnabled": true
}

Response: 201 Created
{
  "id": 2,
  "title": "PE Strain Experiments",
  "createdAt": "2024-01-20T14:00:00Z"
}
```

#### POST /api/lab/entries
Add lab entry (Protected)
```json
Request:
{
  "notebookId": 1,
  "title": "Day 7 - First pins",
  "content": "Observed first pin formation...",
  "category": "observation",
  "tags": ["pinning", "success"],
  "metadata": {
    "temperature": 75,
    "humidity": 92
  }
}

Response: 201 Created
{
  "id": 42,
  "aiAnalysis": {
    "recommendations": ["Maintain current conditions"],
    "warnings": [],
    "predictions": "Harvest ready in 3-4 days"
  }
}
```

### AI Services

#### POST /api/ai/chat
Chat with AI assistant (Protected, Rate Limited)
```json
Request:
{
  "message": "What's the best substrate for oyster mushrooms?",
  "conversationId": 5 // optional
}

Response: 200 OK
{
  "response": "For oyster mushrooms (Pleurotus ostreatus), the best substrates are...",
  "conversationId": 5,
  "messageId": 123
}

Errors:
- 429: AI rate limit exceeded
- 503: AI service unavailable
```

#### POST /api/ai/analyze
Analyze cultivation data (Protected, Pro tier)
```json
Request:
{
  "type": "contamination",
  "data": {
    "description": "White fuzzy growth on substrate",
    "daysSinceInoculation": 5,
    "environmentalData": {...}
  }
}

Response: 200 OK
{
  "analysis": {
    "identified": "Likely cobweb mold (Dactylium)",
    "confidence": 0.85,
    "recommendations": [...],
    "severity": "moderate"
  }
}

Errors:
- 403: Pro subscription required
```

### Payments

#### POST /api/payments/create-checkout
Create Stripe checkout session (Protected)
```json
Request:
{
  "tier": "pro", // core|plus|pro|enterprise
  "period": "monthly" // monthly|yearly
}

Response: 200 OK
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

#### GET /api/payments/subscription
Get current subscription (Protected)
```json
Response: 200 OK
{
  "subscription": {
    "id": "sub_...",
    "status": "active",
    "tier": "pro",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

#### POST /api/payments/cancel
Cancel subscription (Protected)
```json
Response: 200 OK
{
  "message": "Subscription will be canceled at period end",
  "endsAt": "2024-02-01T00:00:00Z"
}
```

### Batch Tracking

#### GET /api/batches
List cultivation batches (Protected)
```json
Response: 200 OK
{
  "batches": [
    {
      "id": 1,
      "batchCode": "GT-2024-001",
      "species": "Psilocybe cubensis",
      "substrate": "Rye grain",
      "quantity": 10,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/batches
Create new batch (Protected)
```json
Request:
{
  "batchCode": "PE-2024-002",
  "species": "Psilocybe cubensis PE",
  "substrate": "CVG mix",
  "quantity": 5,
  "environmentalData": {
    "temperature": 75,
    "humidity": 90
  }
}

Response: 201 Created
{
  "id": 2,
  "batchCode": "PE-2024-002",
  "createdAt": "2024-01-20T00:00:00Z"
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "message": "Human readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "abc123",
    "details": {} // Optional additional information
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Not authenticated
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_ERROR`: Too many requests
- `INTERNAL_ERROR`: Server error

## Pagination

Paginated endpoints return:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

### Stripe Webhook
POST /api/payments/webhook
- Handles subscription events
- Requires `stripe-signature` header
- Raw body required (no JSON parsing)

## WebSocket Events (Future)

### Real-time monitoring
```javascript
ws://localhost:5000/ws
// or wss://app.crowelogic.com/ws

Events:
- batch.update
- ai.insight
- notification
```