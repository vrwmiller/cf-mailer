# Data Flow Diagram

This diagram shows how data flows through the cf-mailer system from form submission to email delivery.

```mermaid
flowchart TD
    subgraph "Browser"
        FormData[Form Data<br/>- name<br/>- email<br/>- message<br/>- subject (optional)]
        Browser[Web Browser]
    end
    
    subgraph "Request Processing"
        Headers[HTTP Headers<br/>- Content-Type<br/>- Referer<br/>- Origin]
        Body[Request Body<br/>JSON/FormData/Multipart]
    end
    
    subgraph "cf-mailer Worker"
        Parse[Data Parser<br/>- JSON.parse()<br/>- FormData.entries()<br/>- Multipart parsing]
        
        Validate[Field Validation<br/>- Required fields check<br/>- Email format validation<br/>- Length limits]
        
        Sanitize[Input Sanitization<br/>- HTML escape<br/>- XSS prevention<br/>- Trim whitespace]
        
        Website[Website Identification<br/>- Extract from Referer<br/>- Parse hostname<br/>- Default fallback]
        
        Templates[Template Generation<br/>- HTML email template<br/>- Plain text version<br/>- Include metadata]
    end
    
    subgraph "Email Payload"
        SMTPData[SMTP2GO Payload<br/>- to: recipient<br/>- from: sender<br/>- subject: form subject<br/>- html_body: template<br/>- text_body: plain text<br/>- reply_to: form email]
    end
    
    subgraph "SMTP2GO Service"
        API[SMTP2GO API<br/>- Authenticate request<br/>- Queue for delivery<br/>- Return response]
        
        Delivery[Email Delivery<br/>- SMTP transmission<br/>- Recipient server<br/>- Delivery confirmation]
    end
    
    subgraph "Response Data"
        Success[Success Response<br/>- 200 OK<br/>- JSON confirmation<br/>- CORS headers]
        
        Error[Error Response<br/>- 4xx/5xx status<br/>- Error description<br/>- CORS headers]
    end

    %% Data flow arrows
    FormData --> Browser
    Browser -->|POST Request| Headers
    Browser -->|Request Body| Body
    
    Headers --> Parse
    Body --> Parse
    Parse --> Validate
    Validate --> Sanitize
    Headers --> Website
    
    Sanitize --> Templates
    Website --> Templates
    Templates --> SMTPData
    
    SMTPData --> API
    API --> Delivery
    
    API -->|Success| Success
    API -->|Error| Error
    Parse -->|Parse Error| Error
    Validate -->|Validation Error| Error
    
    Success --> Browser
    Error --> Browser

    %% Styling
    classDef inputData fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef processing fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef output fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    
    class FormData,Headers,Body inputData
    class Parse,Validate,Sanitize,Website,Templates processing
    class SMTPData,API,Delivery external
    class Success output
    class Error error
```

## Data Transformation Stages

### 1. Input Data Collection

#### Form Fields
- **name**: Contact person's name (required)
- **email**: Contact email address (required, validated)
- **message**: Message content (required, length limited)
- **subject**: Email subject line (optional, defaults to "Contact Form Submission")

#### HTTP Context
- **Content-Type**: Determines parsing strategy
- **Referer**: Identifies source website
- **Origin**: CORS validation reference

### 2. Data Parsing & Extraction

#### Content Type Handling
- **JSON**: Direct object property access
- **Form Encoded**: URL decode and parse key-value pairs
- **Multipart**: Parse boundaries and extract field data

#### Error Cases
- Malformed JSON syntax
- Invalid URL encoding
- Corrupted multipart boundaries

### 3. Validation & Sanitization

#### Field Validation
- Required field presence check
- Email format validation using regex
- Message length limits (configurable)

#### Security Processing
- HTML entity encoding for XSS prevention
- Whitespace trimming and normalization
- Input length restrictions

### 4. Metadata Enrichment

#### Website Identification
- Extract hostname from Referer header
- Parse full URL for context
- Fallback to "Unknown Website" if unavailable

#### Timestamp Addition
- Current datetime in readable format
- Timezone handling (UTC default)

### 5. Email Template Generation

#### HTML Template
```html
<h2>New Contact Form Submission</h2>
<p><strong>Website:</strong> {website}</p>
<p><strong>Name:</strong> {name}</p>
<p><strong>Email:</strong> {email}</p>
<p><strong>Subject:</strong> {subject}</p>
<p><strong>Message:</strong><br>{message}</p>
<p><em>Submitted: {timestamp}</em></p>
```

#### Plain Text Template
```text
New Contact Form Submission

Website: {website}
Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}

Submitted: {timestamp}
```

### 6. SMTP Payload Construction

#### SMTP2GO API Format
```json
{
  "api_key": "{{SMTP2GO_API_KEY}}",
  "to": ["{{TO_EMAIL}}"],
  "sender": "{{FROM_EMAIL}}",
  "subject": "{{subject}}",
  "html_body": "{{html_template}}",
  "text_body": "{{text_template}}",
  "custom_headers": [
    {
      "header": "Reply-To",
      "value": "{{email}}"
    }
  ]
}
```

## Data Security Measures

### Input Sanitization
- HTML entity encoding prevents XSS attacks
- Length limits prevent resource exhaustion
- Type validation ensures data integrity

### Content Security
- No user data stored permanently
- Minimal data retention in memory
- Secure transmission to SMTP service

### Privacy Protection
- No logging of personal information
- Direct relay without intermediate storage
- Configurable recipient restriction