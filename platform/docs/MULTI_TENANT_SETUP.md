# Multi-Tenant Template System

## Overview

This project serves as a **Central Data Portal** that can be accessed by multiple client instances (remixed templates). Each client connects to this portal's API to display and interact with project data while maintaining data security and isolation.

## Architecture

```
┌─────────────────────────────────────────┐
│   Central Portal (This Project)         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Supabase Database                 │ │
│  │  - Projects, Products, Users       │ │
│  │  - Lockbox Configs, XML Data       │ │
│  │  - API Credentials & Access Logs   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Public API Edge Functions         │ │
│  │  - api-get-project                 │ │
│  │  - api-list-projects               │ │
│  │  - api-submit-vote                 │ │
│  │  - api-generate-client-key         │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Client 1 │  │ Client 2 │  │ Client N │
│ (Remix)  │  │ (Remix)  │  │ (Remix)  │
│          │  │          │  │          │
│ Frontend │  │ Frontend │  │ Frontend │
│ Only     │  │ Only     │  │ Only     │
└──────────┘  └──────────┘  └──────────┘
```

## API Endpoints

All API endpoints are secured with API keys generated through the central portal.

### Base URL
```
https://ivopsblevxcujagykobj.supabase.co/functions/v1
```

### Authentication
Include the API key in request headers:
```
x-api-key: xml_[your-api-key-here]
```

### Available Endpoints

#### 1. List All Projects
```http
GET /api-list-projects
Headers:
  x-api-key: xml_xxx
```

Returns array of all projects with basic info, images, and lifecycle stages.

#### 2. Get Single Project
```http
GET /api-get-project?project_sku=PROJ-001
GET /api-get-project?subdomain=hexisle

Headers:
  x-api-key: xml_xxx
```

Returns complete project data including:
- Project details
- All products and production levels
- Images and sections
- Themes
- Lifecycle information

#### 3. Submit Vote/Pledge
```http
POST /api-submit-vote
Headers:
  x-api-key: xml_xxx
  Content-Type: application/json

Body:
{
  "production_level_id": "uuid",
  "user_email": "user@example.com",
  "vote_amount": 100
}
```

Submits a vote/pledge for a production level. Votes are tracked separately from main portal users.

#### 4. Generate Client API Key (Admin Only)
```http
POST /api-generate-client-key
Headers:
  Authorization: Bearer [supabase-jwt-token]
  Content-Type: application/json

Body:
{
  "project_id": "uuid",
  "credential_name": "My Client Instance",
  "client_subdomain": "myclient" (optional)
}
```

Generates a new API key for a client instance. Requires authentication as project owner.

## Setting Up a Client Template

### Step 1: Generate API Key

1. Log into the central portal at your domain
2. Navigate to `/admin/xml-credentials`
3. Click "Generate Client API Key"
4. Provide:
   - Project to connect to
   - Client instance name
   - Client subdomain (optional, for CORS)
5. Copy the generated API key securely

### Step 2: Create Template Project

Create a new template project with this structure:

```typescript
// config/api.ts
export const API_CONFIG = {
  baseUrl: 'https://ivopsblevxcujagykobj.supabase.co/functions/v1',
  apiKey: 'xml_YOUR_API_KEY_HERE', // From Step 1
};

// lib/api-client.ts
import { API_CONFIG } from '@/config/api';

export async function fetchProjects() {
  const response = await fetch(`${API_CONFIG.baseUrl}/api-list-projects`, {
    headers: {
      'x-api-key': API_CONFIG.apiKey,
    },
  });
  return response.json();
}

export async function fetchProject(projectSku: string) {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/api-get-project?project_sku=${projectSku}`,
    {
      headers: {
        'x-api-key': API_CONFIG.apiKey,
      },
    }
  );
  return response.json();
}

export async function submitVote(data: {
  production_level_id: string;
  user_email: string;
  vote_amount: number;
}) {
  const response = await fetch(`${API_CONFIG.baseUrl}/api-submit-vote`, {
    method: 'POST',
    headers: {
      'x-api-key': API_CONFIG.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Step 3: Build UI Components

Create React components that use the API client:

```typescript
// pages/Projects.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/lib/api-client';

export default function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Step 4: Deploy & Remix

1. Deploy your template project
2. Share the template project URL
3. Users can remix it and deploy to their own subdomain
4. Each remix connects to YOUR central database via the shared API key

## Security Considerations

### API Key Management
- **One Key Per Client**: Generate a unique API key for each client instance
- **Origin Restrictions**: Configure allowed origins in credential settings
- **Rate Limiting**: Monitor usage via `xml_access_logs` table
- **Revocation**: Deactivate compromised keys immediately

### Data Isolation
- Client instances can only READ project data (except voting)
- Voting is tracked separately with `source: 'external_client'`
- Client users don't have accounts on central portal
- No access to user data or admin functions

### CORS Configuration
Configure allowed origins when generating client keys:
- Development: `http://localhost:5173`
- Staging: `https://[subdomain].web.app`
- Production: Your custom domain

## Monitoring

### Access Logs
View client API usage in `xml_access_logs` table:
```sql
SELECT
  credential_name,
  COUNT(*) as request_count,
  MAX(accessed_at) as last_access
FROM xml_access_logs
JOIN xml_access_credentials ON xml_access_logs.credential_id = xml_access_credentials.id
WHERE success = true
GROUP BY credential_name
ORDER BY request_count DESC;
```

### Usage Dashboard
Navigate to `/admin/xml-credentials` to see:
- Active client instances
- Request counts
- Last access times
- Failed authentication attempts

## Template Customization

Clients can customize:
- **UI/UX**: Complete control over design
- **Branding**: Logo, colors, fonts
- **Navigation**: Page structure and flow
- **Features**: Add client-specific functionality

Clients cannot modify:
- **Data structure**: Defined by central portal
- **Business logic**: Voting rules, calculations
- **User management**: No auth on central portal

## Example Use Cases

### 1. Project Showcases
Client wants to showcase specific projects on their domain:
- Filter projects by category or owner
- Custom presentation and storytelling
- Branded experience for their audience

### 2. Voting Portals
Client wants to host voting campaigns:
- Focus on specific production levels
- Custom voting UI and experience
- Track votes back to central portal

### 3. Marketplace Views
Client wants to create a marketplace:
- Display products from multiple projects
- Filter and search functionality
- Link back to project details

## Support & Troubleshooting

### Common Issues

**401 Unauthorized**
- Check API key is correct and active
- Verify header is `x-api-key` not `Authorization`

**403 Forbidden**
- Check origin is in allowed origins list
- Verify CORS headers in client requests

**404 Not Found**
- Verify project_sku or subdomain exists
- Check API endpoint URL is correct

### Getting Help
Contact central portal administrators for:
- New API key generation
- Origin allowlist updates
- Access to additional endpoints
- Bug reports or feature requests
