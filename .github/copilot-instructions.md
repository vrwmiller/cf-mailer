# GitHub Copilot Instructions for CF-Mailer

## Project Overview
cf-mailer is a configurable Cloudflare Worker that handles contact form submissions and sends emails via SMTP2GO. It provides a secure, scalable solution for processing contact forms with proper validation, rate limiting, and CORS support.

## Architecture & Components

### Core Structure
- **Main Handler**: `src/index.js` - Single-file Cloudflare Worker
- **Email Integration**: SMTP2GO API for reliable email delivery
- **Configuration**: Environment variables for flexible deployment
- **Deployment**: GitHub Actions with Wrangler for CI/CD

### Key Features
- Multi-format form data support (JSON, form-encoded, multipart)
- HTML and text email templates with website identification
- Configurable CORS and rate limiting
- Input validation and sanitization
- Reply-To header support for direct responses
- XSS protection and security measures

## Development Guidelines

### Code Style & Standards
- Use ES6+ features and modern JavaScript
- Follow functional programming patterns where appropriate
- Implement proper error handling with try-catch blocks
- Use descriptive function and variable names
- Add JSDoc comments for all functions
- Maintain consistent indentation and formatting
- Don't use emojis in code or comments

### Security Principles
- Always validate and sanitize user input
- Use HTML escaping to prevent XSS attacks
- Implement rate limiting for abuse prevention
- Validate content types before processing
- Use environment variables for sensitive data
- Never log sensitive information

### Configuration Management
- All configuration should be environment-variable driven
- Provide sensible defaults for optional settings
- Required variables: `SMTP2GO_API_KEY`, `TO_EMAIL`
- Support comma-separated values for multi-value configs
- Use type conversion for numeric environment variables

## Component Patterns

### Email Template Generation
When modifying email templates:
- Support both HTML and text formats
- Include website identification via Referer header
- Escape all user input to prevent XSS
- Maintain responsive HTML design
- Include timestamp and source information
- Preserve Reply-To functionality

### Form Data Processing
For handling form submissions:
- Support multiple content types (JSON, form-encoded, multipart)
- Use progressive fallback parsing
- Validate required fields based on configuration
- Sanitize and trim input values
- Limit message length to prevent abuse

### Error Handling
Implement comprehensive error responses:
- Return structured JSON responses
- Include appropriate HTTP status codes
- Provide user-friendly error messages
- Log detailed errors for debugging
- Handle SMTP2GO API errors gracefully

## API Design Patterns

### Request/Response Structure
- Accept POST requests only for submissions
- Support OPTIONS for CORS preflight
- Return consistent JSON response format:
  ```javascript
  { success: boolean, message?: string, error?: string, details?: array }
  ```

### CORS Implementation
- Use configurable origin allowlist
- Support wildcard origins for development
- Include proper CORS headers in all responses
- Handle preflight requests correctly

## Testing & Quality Assurance

### Testing Approach
- Test form data parsing with various content types
- Validate email template generation
- Verify CORS header functionality
- Test rate limiting behavior
- Check error handling paths

### Deployment Considerations
- Use Wrangler for local development and deployment
- Set up GitHub Actions for automated deployment
- Configure environment variables in Cloudflare dashboard
- Test with actual SMTP2GO integration
- Verify DNS records for email authentication

## Integration Guidelines

### Frontend Integration
When integrating with websites:
- Use fetch API with proper error handling
- Support both JSON and FormData submission methods
- Implement loading states and user feedback
- Handle CORS configuration properly
- Provide fallback error messages

### Email Service Setup
For SMTP2GO configuration:
- Set up sender domain verification
- Configure SPF, DKIM, and DMARC records
- Use API keys with appropriate permissions
- Monitor email delivery rates and errors

## Common Patterns & Examples

### Environment Variable Processing
```javascript
// Pattern for configuration with fallbacks
const config = {
  setting: env.SETTING || DEFAULT_VALUE,
  list_setting: env.LIST_SETTING ? env.LIST_SETTING.split(',') : [],
  numeric_setting: parseInt(env.NUMERIC_SETTING) || DEFAULT_NUMBER
};
```

### Form Validation Pattern
```javascript
// Validation with error collection
const errors = [];
if (!data.field || data.field.trim() === '') {
  errors.push('field is required');
}
// Return validation results
return { errors, data: sanitizedData };
```

### Response Creation Pattern
```javascript
// Consistent response format with CORS
return new Response(JSON.stringify(data), {
  status: statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders
  }
});
```

## File Organization

### Project Structure
- `/src/index.js` - Main worker code
- `/examples/` - Integration examples for different use cases
- `/docs/` - API documentation and setup guides
- `/.github/workflows/` - CI/CD configuration
- `/wrangler.toml` - Cloudflare Worker configuration

### Documentation Standards
- Maintain comprehensive README with setup instructions
- Provide working examples for common integrations
- Include troubleshooting guides for common issues
- Document all environment variables and their purposes
- Keep API documentation up-to-date with code changes
- Don't use emojis in documents or comments

## Best Practices

### Performance Considerations
- Minimize external API calls
- Use efficient parsing methods
- Implement proper caching where appropriate
- Optimize email template generation
- Handle concurrent requests efficiently

### Maintainability
- Keep functions focused and single-purpose
- Use consistent naming conventions
- Maintain backward compatibility when possible
- Version environment variable changes carefully
- Document breaking changes clearly

When working on this project, prioritize security, reliability, and ease of deployment. Always test changes with actual form submissions and verify email delivery functionality.
