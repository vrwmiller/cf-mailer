# Deployment Pipeline

This diagram illustrates the CI/CD process for deploying cf-mailer to Cloudflare Workers.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Repository
    participant GA as GitHub Actions
    participant Wrangler as Wrangler CLI
    participant CF as Cloudflare Workers
    participant Dashboard as CF Dashboard

    Note over Dev,Dashboard: Development & Deployment Workflow

    Dev->>GH: Push code to branch
    activate GH
    GH->>GA: Trigger workflow
    activate GA
    
    Note over GA: .github/workflows/deploy-cf-mailer.yml
    
    GA->>GA: Checkout code
    GA->>GA: Setup Node.js
    GA->>GA: Install dependencies
    
    alt Feature Branch
        GA->>Wrangler: Deploy to staging environment
        Note over Wrangler,CF: wrangler deploy --env staging
    else Main Branch
        GA->>Wrangler: Deploy to production environment
        Note over Wrangler,CF: wrangler deploy --env production
    end
    
    activate Wrangler
    Wrangler->>CF: Deploy Worker code
    activate CF
    CF->>Wrangler: Deployment success
    Wrangler->>GA: Deployment complete
    deactivate Wrangler
    deactivate CF
    
    GA->>GH: Update deployment status
    deactivate GA
    GH->>Dev: Notification of deployment
    deactivate GH
    
    Note over Dev,Dashboard: Configuration Management
    
    Dev->>Dashboard: Configure environment variables
    activate Dashboard
    Dashboard->>CF: Update Worker environment
    Dashboard->>Dev: Configuration saved
    deactivate Dashboard
    
    Note over Dev,Dashboard: Monitoring & Maintenance
    
    Dev->>Dashboard: Check Worker metrics
    Dashboard->>Dev: Display analytics & logs
```

## Pipeline Components

### Source Control

- **GitHub Repository**: Version control and collaboration
- **Branch Protection**: Main branch requires PR approval
- **Automated Triggers**: Push and PR events start deployments

### CI/CD Pipeline

- **GitHub Actions**: Serverless CI/CD automation
- **Workflow Configuration**: `.github/workflows/deploy-cf-mailer.yml`
- **Environment Strategy**: Separate staging and production environments

### Deployment Tool

- **Wrangler CLI**: Official Cloudflare Workers deployment tool
- **Configuration**: `wrangler.toml` defines Worker settings
- **Authentication**: GitHub secrets store CF API credentials

### Target Platform

- **Cloudflare Workers**: Serverless execution environment
- **Global Distribution**: Automatic deployment to edge locations
- **Environment Variables**: Runtime configuration via CF Dashboard

## Deployment Environments

### Staging Environment

- **Trigger**: Feature branch pushes
- **Purpose**: Testing and validation before production
- **Configuration**: Separate environment variables and settings

### Production Environment

- **Trigger**: Main branch pushes (typically via merged PRs)
- **Purpose**: Live contact form processing
- **Configuration**: Production API keys and email settings

## Security & Configuration

### Secrets Management

- **GitHub Secrets**: Store sensitive Cloudflare credentials
- **Environment Variables**: Configure via Cloudflare Dashboard
- **API Keys**: SMTP2GO and other service credentials

### Required Configuration

- `CLOUDFLARE_API_TOKEN`: Deployment authentication
- `CLOUDFLARE_ACCOUNT_ID`: Target Cloudflare account
- `SMTP2GO_API_KEY`: Email service authentication
- `TO_EMAIL`: Recipient email address

## Monitoring & Maintenance

### Deployment Verification

- Automatic deployment status updates
- Worker health checks post-deployment
- Error notifications for failed deployments

### Operational Monitoring

- Cloudflare Dashboard analytics
- Request volume and response time metrics
- Error rate and success rate tracking