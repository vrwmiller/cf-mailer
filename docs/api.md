# API Documentation

## Endpoint

```
POST https://your-worker.workers.dev
```

## Request Format

### Headers

```
Content-Type: application/json
# OR
Content-Type: application/x-www-form-urlencoded
```

### Request Body

#### JSON Format (Recommended)

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, this is a test message.",
  "subject": "Test Subject",
  "phone": "+1-555-123-4567"
}
```

#### Form-Encoded Format

```
name=John+Doe&email=john%40example.com&message=Hello%2C+this+is+a+test+message.
```

### Required Fields

By default, these fields are required:
- `name`: Sender's name
- `email`: Sender's email address
- `message`: Message content

Customize required fields via the `REQUIRED_FIELDS` environment variable.

### Optional Fields

- `subject`: Email subject (will be prefixed with `SUBJECT_PREFIX`)
- `phone`: Sender's phone number
- Any other custom fields you want to include in the email

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!"
}
```

**Status Code:** `200 OK`

### Error Responses

#### Validation Error

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

**Status Code:** `400 Bad Request`

#### Rate Limiting

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

**Status Code:** `429 Too Many Requests`

#### Server Error

```json
{
  "success": false,
  "error": "Sorry, there was an error sending your message. Please try again."
}
```

**Status Code:** `500 Internal Server Error`

## Security Features

- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Required field validation and sanitization
- **XSS Prevention**: HTML escaping in email templates
- **Content-Type Validation**: Only accepts JSON and form-encoded data

## Example Implementations

### JavaScript Fetch

```javascript
async function submitForm(formData) {
  try {
    const response = await fetch('https://your-worker.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Message sent successfully!');
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### cURL

```bash
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello from cURL"
  }'
```