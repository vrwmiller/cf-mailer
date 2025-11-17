# cf-mailer

A configurable Cloudflare Worker for handling contact forms with SMTP2GO integration and proper email functionality.

## Features

- Configurable via environment variables
- SMTP2GO email integration with Reply-To support
- Built-in validation and security features
- Rate limiting and CORS support
- Supports both JSON and form-encoded data
- HTML email templates with fallback text
- Easy to customize and deploy

## Quick Start

### 1. Setup Project

```bash
git clone <your-repo-url>
cd cf-mailer
```

### 2. Configure Environment Variables

Set these in your Cloudflare dashboard or via `wrangler secret`:

**Required:**
```bash
wrangler secret put SMTP2GO_API_KEY
wrangler secret put TO_EMAIL
```

**Optional:**
```bash
wrangler secret put FROM_EMAIL
wrangler secret put FROM_NAME  
wrangler secret put ALLOWED_ORIGINS
```

### 3. Deploy

```bash
wrangler deploy
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP2GO_API_KEY` | Yes | - | Your SMTP2GO API key |
| `TO_EMAIL` | Yes | - | Email address to receive form submissions |
| `FROM_EMAIL` | No | `noreply@yourdomain.com` | Sender email address |
| `FROM_NAME` | No | `Contact Form` | Sender name |
| `ALLOWED_ORIGINS` | No | `*` (all) | Comma-separated list of allowed origins |
| `SUBJECT_PREFIX` | No | `[Contact Form]` | Email subject prefix |
| `REQUIRED_FIELDS` | No | `name,email,message` | Required form fields |
| `MAX_MESSAGE_LENGTH` | No | `5000` | Maximum message length |
| `RATE_LIMIT_REQUESTS` | No | `10` | Max requests per window |
| `RATE_LIMIT_WINDOW` | No | `300` | Rate limit window (seconds) |
| `SUCCESS_MESSAGE` | No | Default success text | Custom success message |
| `ERROR_MESSAGE` | No | Default error text | Custom error message |

### SMTP2GO Setup

1. Sign up at [SMTP2GO](https://www.smtp2go.com/)
2. Verify your sending domain
3. Get your API key from the dashboard
4. Set up SPF, DKIM, and DMARC records for your domain

## Usage

### Basic HTML Form

```html
<form id="contact-form">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <textarea name="message" placeholder="Your Message" required></textarea>
    <button type="submit">Send Message</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('https://your-worker.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            e.target.reset();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});
</script>
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "name is required",
    "Invalid email format"
  ]
}
```

## Development

### Using Wrangler (Recommended)

Development using Cloudflare's Wrangler CLI without local Node.js:

```bash
# Local development
wrangler dev

# Deploy to production
wrangler deploy

# View logs
wrangler tail

# Manage secrets
wrangler secret put SECRET_NAME
wrangler secret list
```

### Optional: Local Node.js Development

If you prefer local Node.js development, you can install dependencies:

```bash
npm install
npm run dev      # Start local development server  
npm run deploy   # Deploy to Cloudflare
npm test         # Run tests
npm run format   # Format code
npm run lint     # Lint code
```

## Advanced Configuration

### Rate Limiting with KV

For persistent rate limiting across requests, bind a KV namespace:

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id"
```

### Custom Validation

The worker supports custom validation by modifying the `validateFormData` function or setting custom required fields via environment variables.

### Email Templates

Email templates are automatically generated with both HTML and text versions. The templates include:

- Responsive HTML formatting
- All form field data
- Timestamp information  
- Proper Reply-To functionality
- XSS protection

## Security Features

- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Required field validation and sanitization
- **XSS Prevention**: HTML escaping in email templates
- **Content-Type Validation**: Only accepts JSON and form-encoded data

## Troubleshooting

### Common Issues

**Email not being sent:**
- Check your SMTP2GO API key
- Verify your sending domain is authenticated
- Check the Cloudflare Workers logs

**CORS errors:**
- Make sure your domain is in `ALLOWED_ORIGINS`
- Check that your frontend is sending the correct Origin header

**Rate limiting issues:**
- Adjust `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW`
- Consider implementing KV-based rate limiting for production

### Logs

Check your Cloudflare Workers logs in the dashboard for detailed error information.

## Examples

See the `/examples` directory for complete implementation examples:

- Basic contact form
- Advanced contact form with validation
- Integration with popular frameworks
- Custom styling examples

## License

MIT License - see LICENSE file for details.