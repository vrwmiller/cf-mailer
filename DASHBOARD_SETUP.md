# Dashboard-Only Setup Guide

Deploy CF-Mailer using only the Cloudflare dashboard - no local tools required.

## Prerequisites

- Cloudflare account
- SMTP2GO account (free tier available)
- Domain with DNS access (for email authentication)

## 1. Setup SMTP2GO

1. Sign up at [SMTP2GO](https://www.smtp2go.com/)
2. Go to Settings > Sender Domains and add your domain
3. Add the provided DNS records (SPF, DKIM, DMARC) to your domain
4. Go to Settings > API Keys and create a new API key
5. Copy the API key for later use

## 2. Create Worker in Cloudflare Dashboard

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to Workers & Pages

2. **Create New Worker**
   - Click "Create application"
   - Select "Create Worker"
   - Give it a name like `cf-mailer` or `contact-form`
   - Click "Deploy"

3. **Edit Worker Code**
   - Click "Edit code" on the worker overview page
   - Delete the default code
   - Copy and paste the entire contents of `src/index.js` from this repository
   - Click "Save and deploy"

## 3. Configure Environment Variables

1. **Go to Worker Settings**
   - In your worker dashboard, click "Settings"
   - Click "Variables" tab

2. **Add Required Secrets**
   - Click "Add variable" and select "Encrypt"
   - Add these encrypted variables:
     - `SMTP2GO_API_KEY`: Your SMTP2GO API key
     - `TO_EMAIL`: Email address to receive form submissions

3. **Add Optional Variables** (as plain text or encrypted):
   - `FROM_EMAIL`: `noreply@yourdomain.com`
   - `FROM_NAME`: `Contact Form`
   - `ALLOWED_ORIGINS`: `https://yourdomain.com,https://www.yourdomain.com`
   - `SUBJECT_PREFIX`: `[Contact Form]`

4. **Save Configuration**
   - Click "Save and deploy" after adding variables

## 4. Test Your Worker

1. **Get Worker URL**
   - Copy the worker URL from the dashboard (e.g., `https://cf-mailer.your-subdomain.workers.dev`)

2. **Test with Browser**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Run this test:
   ```javascript
   fetch('https://cf-mailer.your-subdomain.workers.dev', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Test User',
       email: 'test@example.com',
       message: 'Hello from dashboard setup!'
     })
   }).then(r => r.json()).then(console.log)
   ```

3. **Expected Response**
   ```javascript
   {success: true, message: "Thank you for your message. We will get back to you soon!"}
   ```

## 5. Setup Custom Domain (Optional)

1. **Add Route**
   - In worker settings, go to "Triggers" tab
   - Click "Add Custom Domain" or "Add Route"
   - Add route: `contact.yourdomain.com/*`

2. **DNS Configuration**
   - In your domain's DNS settings, add:
   ```
   Type: CNAME
   Name: contact
   Target: cf-mailer.your-subdomain.workers.dev
   ```

## 6. DNS Records for Email (Required)

Add these DNS records to your domain (values from SMTP2GO):

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:smtp2go.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: s1._domainkey
Value: [provided by SMTP2GO]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

## 7. Integration with Your Website

Update your HTML forms to use your worker URL:

```html
<script>
const WORKER_URL = 'https://cf-mailer.your-subdomain.workers.dev';
// or your custom domain: https://contact.yourdomain.com

// Rest of your form handling code...
</script>
```

## Management Through Dashboard

### View Logs
1. Go to your worker in the dashboard
2. Click "Logs" tab
3. View real-time logs and errors

### Update Configuration
1. Go to worker "Settings" > "Variables"
2. Edit or add new variables
3. Click "Save and deploy"

### Update Code
1. Click "Edit code" from worker overview
2. Make changes to the code
3. Click "Save and deploy"

### Monitor Usage
1. Go to "Analytics" tab in worker dashboard
2. View request volume, errors, and performance metrics

## Troubleshooting

**Worker not receiving requests:**
- Check the worker URL is correct
- Verify CORS settings if calling from browser
- Check browser developer tools for errors

**Email not being sent:**
- Verify `SMTP2GO_API_KEY` and `TO_EMAIL` are set correctly
- Check worker logs for SMTP errors
- Ensure DNS records are configured for your domain

**Configuration errors:**
- All required variables must be set as encrypted variables
- Variable names are case-sensitive
- Redeploy after making changes to variables

## Security Notes

- Always use encrypted variables for sensitive data (API keys, emails)
- Set `ALLOWED_ORIGINS` to restrict which domains can use your form
- Monitor worker logs for abuse or errors
- Consider rate limiting if you experience spam

This setup requires no local development tools - everything is managed through the Cloudflare dashboard!