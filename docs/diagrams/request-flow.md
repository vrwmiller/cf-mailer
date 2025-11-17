# Request Processing Flow

This diagram shows the complete flow of how cf-mailer processes contact form submissions from initial request to email delivery.

```mermaid
flowchart TD
    Start([Form Submission]) --> CheckMethod{Request Method?}
    
    CheckMethod -->|POST| ParseContentType{Content Type?}
    CheckMethod -->|OPTIONS| CORS[Set CORS Headers]
    CheckMethod -->|Other| MethodError[405 Method Not Allowed]
    
    CORS --> CORSResponse[Return 200 OK]
    MethodError --> ErrorResponse[Return Error Response]
    
    ParseContentType -->|application/json| ParseJSON[Parse JSON Body]
    ParseContentType -->|application/x-www-form-urlencoded| ParseForm[Parse Form Data]
    ParseContentType -->|multipart/form-data| ParseMultipart[Parse Multipart Data]
    ParseContentType -->|Other| UnsupportedType[415 Unsupported Media Type]
    
    UnsupportedType --> ErrorResponse
    
    ParseJSON --> ValidateData{Validate Required Fields}
    ParseForm --> ValidateData
    ParseMultipart --> ValidateData
    
    ValidateData -->|Valid| ExtractReferer[Extract Website Info from Referer]
    ValidateData -->|Invalid| ValidationError[400 Bad Request - Missing Fields]
    
    ValidationError --> ErrorResponse
    
    ExtractReferer --> SanitizeInput[Sanitize and Trim Input]
    SanitizeInput --> GenerateTemplates[Generate HTML & Text Email Templates]
    
    GenerateTemplates --> PrepareEmail[Prepare SMTP2GO Request]
    PrepareEmail --> SendEmail[Send to SMTP2GO API]
    
    SendEmail --> SMTPSuccess{SMTP2GO Response?}
    
    SMTPSuccess -->|Success| SuccessResponse[200 OK - Email Sent]
    SMTPSuccess -->|Error| SMTPError[500 Internal Server Error]
    
    SMTPError --> ErrorResponse
    SuccessResponse --> End([Complete])
    CORSResponse --> End
    ErrorResponse --> End

    %% Styling for different types of nodes
    classDef processNode fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef decisionNode fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef successNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef startEndNode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class ParseJSON,ParseForm,ParseMultipart,ExtractReferer,SanitizeInput,GenerateTemplates,PrepareEmail,SendEmail processNode
    class CheckMethod,ParseContentType,ValidateData,SMTPSuccess decisionNode
    class MethodError,UnsupportedType,ValidationError,SMTPError,ErrorResponse errorNode
    class SuccessResponse,CORS,CORSResponse successNode
    class Start,End startEndNode
```

## Key Process Steps

### 1. Request Method Validation

- Only POST requests are processed for form submissions
- OPTIONS requests return CORS headers for preflight
- Other methods return 405 Method Not Allowed

### 2. Content Type Processing

The worker supports multiple form submission formats:

- **JSON**: `application/json` - Direct JSON payload
- **Form Encoded**: `application/x-www-form-urlencoded` - Standard form submission  
- **Multipart**: `multipart/form-data` - File uploads and complex forms

### 3. Data Validation

Required fields are validated based on configuration:

- Default required fields: `name`, `email`, `message`
- Configurable via `REQUIRED_FIELDS` environment variable
- Returns 400 Bad Request if validation fails

### 4. Website Identification

- Extracts website information from `Referer` header
- Adds source identification to email templates
- Helps identify which website sent the form submission

### 5. Input Processing

- Sanitizes all user input to prevent XSS
- Trims whitespace from form fields
- Limits message length to prevent abuse

### 6. Email Generation

- Creates both HTML and plain text versions
- Includes website identification and timestamp
- Preserves Reply-To functionality for direct responses

### 7. SMTP2GO Integration

- Sends email via SMTP2GO REST API
- Handles authentication and delivery
- Returns appropriate success/error responses

## Error Handling

The system provides comprehensive error responses:

- **405**: Method not allowed (non-POST/OPTIONS)
- **415**: Unsupported content type
- **400**: Validation errors (missing fields)
- **500**: SMTP delivery errors

All error responses include CORS headers and structured JSON format.