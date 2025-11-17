# CF-Mailer Documentation Diagrams

This directory contains comprehensive Mermaid diagrams documenting the cf-mailer system architecture, processes, and integration patterns.

## Available Diagrams

### 1. [Request Processing Flow](./request-flow.md)
**Type**: Flowchart  
**Purpose**: Complete end-to-end flow of contact form submission processing

Shows the detailed path from initial form submission through validation, processing, and email delivery. Includes all error handling paths and decision points.

**Key Features Illustrated**:
- HTTP method validation (POST/OPTIONS/other)
- Multiple content-type support (JSON/form-encoded/multipart)
- Field validation and sanitization
- SMTP2GO integration
- Comprehensive error handling

### 2. [System Architecture](./system-architecture.md)
**Type**: Architecture Diagram  
**Purpose**: High-level system overview and component relationships

Displays the overall architecture showing how cf-mailer fits within the Cloudflare Workers ecosystem and integrates with external services.

**Components Covered**:
- Internet layer (browsers, websites)
- Cloudflare network (edge servers, workers)
- External services (SMTP2GO, email servers)
- Data flow between components

### 3. [Deployment Pipeline](./deployment-pipeline.md)
**Type**: Sequence Diagram  
**Purpose**: CI/CD process and deployment workflow

Illustrates the automated deployment process from code changes to production deployment via GitHub Actions and Wrangler.

**Process Steps**:
- Source control integration
- Automated testing and building
- Environment-specific deployments
- Configuration management
- Monitoring and maintenance

### 4. [Error Handling States](./error-handling.md)
**Type**: State Diagram  
**Purpose**: Error states and transitions throughout request lifecycle

Maps all possible error conditions, their triggers, and appropriate responses with proper HTTP status codes.

**Error Categories**:
- Client errors (4xx) - validation, method, content-type
- Server errors (5xx) - SMTP failures, configuration issues
- Success states (2xx) - CORS preflight, email sent
- Error recovery patterns

### 5. [Data Flow](./data-flow.md)
**Type**: Flowchart  
**Purpose**: Data transformation from form input to email delivery

Traces data movement and transformation at each stage of processing, including validation, sanitization, and template generation.

**Data Stages**:
- Input collection (form fields, HTTP context)
- Parsing and validation
- Security processing and sanitization
- Email template generation
- SMTP payload construction

### 6. [Security & Validation](./security-validation.md)
**Type**: Flowchart  
**Purpose**: Security measures and validation processes

Comprehensive overview of all security layers including CORS, input validation, XSS prevention, and external service security.

**Security Layers**:
- Request-level security (CORS, method validation)
- Data validation and sanitization
- External service security (TLS, authentication)
- Response security and error handling

### 7. [Integration Patterns](./integration-patterns.md)
**Type**: Flowchart  
**Purpose**: Common integration approaches for different platforms

Shows how various website types and frameworks can integrate with cf-mailer, including code examples and best practices.

**Integration Types**:
- Static websites (HTML, vanilla JS)
- Frontend frameworks (React, Vue, Angular)
- CMS platforms (WordPress, Drupal)
- Implementation methods and patterns

## How to Use These Diagrams

### For Developers
- **Start with [System Architecture](./system-architecture.md)** to understand overall system design
- **Review [Request Processing Flow](./request-flow.md)** to understand detailed request handling
- **Check [Integration Patterns](./integration-patterns.md)** for implementation guidance
- **Refer to [Security & Validation](./security-validation.md)** for security implementation

### For Operations
- **Use [Deployment Pipeline](./deployment-pipeline.md)** for CI/CD setup and management
- **Reference [Error Handling States](./error-handling.md)** for troubleshooting
- **Monitor using insights from [Data Flow](./data-flow.md)** for performance optimization

### For Security Review
- **Focus on [Security & Validation](./security-validation.md)** for comprehensive security analysis
- **Cross-reference [Data Flow](./data-flow.md)** for data handling security
- **Check [Error Handling States](./error-handling.md)** for information disclosure prevention

## Viewing the Diagrams

These diagrams use Mermaid syntax and can be viewed in several ways:

### GitHub (Recommended)
GitHub natively renders Mermaid diagrams in markdown files. Simply view any diagram file on GitHub to see the rendered visualization.

### VS Code
Install the "Mermaid Preview" extension to preview diagrams directly in VS Code.

### Mermaid Live Editor
Copy diagram code to [mermaid.live](https://mermaid.live) for online viewing and editing.

### Local Rendering
Use the Mermaid CLI or integrate with your documentation build process:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.md -o diagram.png
```

## Maintenance Notes

### Keeping Diagrams Current
- Update diagrams when system architecture changes
- Verify diagram accuracy after major feature additions
- Include diagram updates in code review process
- Test diagram rendering after syntax updates

### Contributing Updates
1. Edit diagram source code in the markdown files
2. Validate syntax using Mermaid tools
3. Test rendering in multiple environments
4. Update this index if adding new diagrams
5. Include diagram changes in pull requests

### Diagram Conventions
- Use consistent color schemes across related diagrams
- Include comprehensive legends and explanations
- Keep node labels concise but descriptive
- Use standard flowchart shapes for consistent meaning
- Include error paths and edge cases

## Integration with Documentation

These diagrams complement the main project documentation:

- **[README.md](../../README.md)**: Quick start and basic usage
- **[API Documentation](../api.md)**: Detailed API reference
- **[Examples](../../examples/)**: Working integration samples
- **[Dashboard Setup](../../DASHBOARD_SETUP.md)**: Configuration guide

The diagrams provide visual context for the written documentation and help users understand complex system interactions at a glance.