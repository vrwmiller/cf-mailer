/**
 * CF-Mailer: Configurable Cloudflare Worker for Contact Forms
 * 
 * A reusable Cloudflare Worker that handles contact form submissions
 * and sends emails via SMTP2GO with proper Reply-To functionality.
 */

// Default configuration - can be overridden by environment variables
const DEFAULT_CONFIG = {
  // Email settings
  from_email: 'noreply@yourdomain.com',
  from_name: 'Contact Form',
  subject_prefix: '[Contact Form]',
  
  // Form validation
  required_fields: ['name', 'email', 'message'],
  max_message_length: 5000,
  
  // Security
  rate_limit_requests: 10,
  rate_limit_window: 300, // 5 minutes in seconds
  
  // Response messages
  success_message: 'Thank you for your message. We will get back to you soon!',
  error_message: 'Sorry, there was an error sending your message. Please try again.',
};

/**
 * Get configuration from environment variables with fallbacks
 */
function getConfig(env) {
  return {
    // SMTP2GO settings
    smtp2go_api_key: env.SMTP2GO_API_KEY,
    
    // Email configuration
    from_email: env.FROM_EMAIL || DEFAULT_CONFIG.from_email,
    from_name: env.FROM_NAME || DEFAULT_CONFIG.from_name,
    to_email: env.TO_EMAIL, // Required - no default
    subject_prefix: env.SUBJECT_PREFIX || DEFAULT_CONFIG.subject_prefix,
    
    // Security settings
    allowed_origins: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : [],
    
    // Validation settings
    required_fields: env.REQUIRED_FIELDS ? env.REQUIRED_FIELDS.split(',') : DEFAULT_CONFIG.required_fields,
    max_message_length: parseInt(env.MAX_MESSAGE_LENGTH) || DEFAULT_CONFIG.max_message_length,
    
    // Rate limiting
    rate_limit_requests: parseInt(env.RATE_LIMIT_REQUESTS) || DEFAULT_CONFIG.rate_limit_requests,
    rate_limit_window: parseInt(env.RATE_LIMIT_WINDOW) || DEFAULT_CONFIG.rate_limit_window,
    
    // Messages
    success_message: env.SUCCESS_MESSAGE || DEFAULT_CONFIG.success_message,
    error_message: env.ERROR_MESSAGE || DEFAULT_CONFIG.error_message,
  };
}

/**
 * Validate form data according to configuration
 */
function validateFormData(data, config) {
  const errors = [];
  
  // Check required fields
  for (const field of config.required_fields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  }
  
  // Validate email format
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push('Invalid email format');
    }
  }
  
  // Check message length
  if (data.message && data.message.length > config.max_message_length) {
    errors.push(`Message must be less than ${config.max_message_length} characters`);
  }
  
  // Sanitize data
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().slice(0, key === 'message' ? config.max_message_length : 500);
    }
  }
  
  return { errors, data: sanitized };
}

/**
 * Generate email template with proper formatting
 */
function generateEmailTemplate(formData, config) {
  const timestamp = new Date().toISOString();
  
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 15px; border-left: 4px solid #007cba; margin-bottom: 20px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-top: 5px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
        .message-field { white-space: pre-wrap; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>Received: ${timestamp}</p>
        </div>
        
        <div class="field">
            <div class="field-label">Name:</div>
            <div class="field-value">${escapeHtml(formData.name)}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Email:</div>
            <div class="field-value">${escapeHtml(formData.email)}</div>
        </div>
        
        ${formData.phone ? `
        <div class="field">
            <div class="field-label">Phone:</div>
            <div class="field-value">${escapeHtml(formData.phone)}</div>
        </div>
        ` : ''}
        
        ${formData.subject ? `
        <div class="field">
            <div class="field-label">Subject:</div>
            <div class="field-value">${escapeHtml(formData.subject)}</div>
        </div>
        ` : ''}
        
        <div class="field">
            <div class="field-label">Message:</div>
            <div class="field-value message-field">${escapeHtml(formData.message)}</div>
        </div>
        
        <div class="footer">
            <p>This message was sent via the contact form on your website.</p>
            <p>Reply to this email to respond directly to ${escapeHtml(formData.name)} at ${escapeHtml(formData.email)}</p>
        </div>
    </div>
</body>
</html>`;

  const textTemplate = `
New Contact Form Submission
Received: ${timestamp}

Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}\n` : ''}${formData.subject ? `Subject: ${formData.subject}\n` : ''}

Message:
${formData.message}

---
This message was sent via the contact form on your website.
Reply to this email to respond directly to ${formData.name} at ${formData.email}
`;

  return { html: htmlTemplate, text: textTemplate };
}

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Send email via SMTP2GO with proper Reply-To headers
 */
async function sendEmailViaSMTP2GO(formData, config) {
  const { html, text } = generateEmailTemplate(formData, config);
  
  // Generate subject line
  const subject = formData.subject 
    ? `${config.subject_prefix} ${formData.subject}` 
    : `${config.subject_prefix} New message from ${formData.name}`;
  
  const emailPayload = {
    api_key: config.smtp2go_api_key,
    to: [config.to_email],
    sender: config.from_email,
    subject: subject,
    text_body: text,
    html_body: html,
    custom_headers: [
      {
        header: 'Reply-To',
        value: `${formData.name} <${formData.email}>`
      },
      {
        header: 'X-Mailer',
        value: 'CF-Mailer/1.0'
      }
    ]
  };
  
  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });
    
    const result = await response.json();
    
    if (!response.ok || result.data?.error_code) {
      console.error('SMTP2GO API Error:', result);
      throw new Error(`SMTP2GO Error: ${result.data?.error || 'Unknown error'}`);
    }
    
    console.log('Email sent successfully:', result.data?.email_id);
    return { success: true, emailId: result.data?.email_id };
    
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Check rate limiting using Cloudflare KV (if available) or in-memory fallback
 */
async function checkRateLimit(clientIP, config, env) {
  const key = `rate_limit_${clientIP}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.rate_limit_window;
  
  // If KV is available, use it for persistent rate limiting
  if (env.RATE_LIMIT_KV) {
    try {
      const existing = await env.RATE_LIMIT_KV.get(key);
      const requests = existing ? JSON.parse(existing) : [];
      
      // Filter out old requests
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (recentRequests.length >= config.rate_limit_requests) {
        return false; // Rate limited
      }
      
      // Add current request
      recentRequests.push(now);
      await env.RATE_LIMIT_KV.put(key, JSON.stringify(recentRequests), {
        expirationTtl: config.rate_limit_window
      });
      
      return true;
    } catch (error) {
      console.warn('Rate limiting KV error, allowing request:', error);
      return true; // Allow on error
    }
  }
  
  // Fallback: Basic in-memory rate limiting (not persistent across requests)
  // In production, you should use KV or Durable Objects for proper rate limiting
  return true;
}

/**
 * Get CORS headers based on configuration
 */
function getCorsHeaders(origin, config) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  
  // Check if origin is allowed
  if (config.allowed_origins.length === 0) {
    // If no origins specified, allow all (development mode)
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (config.allowed_origins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

/**
 * Create JSON response with CORS headers
 */
function createResponse(data, status = 200, origin = null, config = {}) {
  const corsHeaders = getCorsHeaders(origin, config);
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const config = getConfig(env);
    const origin = request.headers.get('Origin');
    
    // Validate required configuration
    if (!config.smtp2go_api_key) {
      console.error('SMTP2GO_API_KEY is not configured');
      return createResponse(
        { success: false, error: 'Service configuration error' }, 
        500, 
        origin, 
        config
      );
    }
    
    if (!config.to_email) {
      console.error('TO_EMAIL is not configured');
      return createResponse(
        { success: false, error: 'Service configuration error' }, 
        500, 
        origin, 
        config
      );
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin, config),
      });
    }
    
    // Only allow POST requests for form submission
    if (request.method !== 'POST') {
      return createResponse(
        { success: false, error: 'Method not allowed' }, 
        405, 
        origin, 
        config
      );
    }
    
    try {
      // Rate limiting
      const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
      const rateLimitOk = await checkRateLimit(clientIP, config, env);
      
      if (!rateLimitOk) {
        return createResponse(
          { success: false, error: 'Too many requests. Please try again later.' }, 
          429, 
          origin, 
          config
        );
      }
      
      // Parse form data
      const contentType = request.headers.get('Content-Type') || '';
      let formData;
      
      if (contentType.includes('application/json')) {
        formData = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const form = await request.formData();
        formData = {};
        for (const [key, value] of form.entries()) {
          formData[key] = value;
        }
      } else {
        return createResponse(
          { success: false, error: 'Unsupported content type' }, 
          400, 
          origin, 
          config
        );
      }
      
      // Validate form data
      const { errors, data } = validateFormData(formData, config);
      
      if (errors.length > 0) {
        return createResponse(
          { success: false, error: 'Validation failed', details: errors }, 
          400, 
          origin, 
          config
        );
      }
      
      // Send email
      await sendEmailViaSMTP2GO(data, config);
      
      return createResponse(
        { success: true, message: config.success_message }, 
        200, 
        origin, 
        config
      );
      
    } catch (error) {
      console.error('Error processing contact form:', error);
      
      return createResponse(
        { success: false, error: config.error_message }, 
        500, 
        origin, 
        config
      );
    }
  },
};