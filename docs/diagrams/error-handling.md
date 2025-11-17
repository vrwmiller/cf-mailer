# Error Handling States

This diagram shows the different error states and transitions in the cf-mailer request processing lifecycle.

```mermaid
stateDiagram-v2
    classDef errorState fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef successState fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef processState fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef warningState fill:#fff3e0,stroke:#ff6f00,stroke-width:2px

    [*] --> RequestReceived
    RequestReceived: Request Received
    
    RequestReceived --> MethodValidation
    MethodValidation: Validate HTTP Method
    
    MethodValidation --> MethodError: Non-POST/OPTIONS
    MethodValidation --> CORSPreflight: OPTIONS Request
    MethodValidation --> ContentTypeCheck: POST Request
    
    MethodError: 405 Method Not Allowed
    MethodError --> ErrorResponse
    
    CORSPreflight: Handle CORS Preflight
    CORSPreflight --> CORSSuccess
    CORSSuccess: 200 OK with CORS Headers
    CORSSuccess --> [*]
    
    ContentTypeCheck: Check Content-Type Header
    ContentTypeCheck --> UnsupportedType: Invalid Content-Type
    ContentTypeCheck --> DataParsing: Valid Content-Type
    
    UnsupportedType: 415 Unsupported Media Type
    UnsupportedType --> ErrorResponse
    
    DataParsing: Parse Request Body
    DataParsing --> ParseError: Malformed Data
    DataParsing --> ValidationCheck: Parse Success
    
    ParseError: 400 Bad Request - Parse Error
    ParseError --> ErrorResponse
    
    ValidationCheck: Validate Required Fields
    ValidationCheck --> ValidationError: Missing Fields
    ValidationCheck --> ProcessingData: All Fields Valid
    
    ValidationError: 400 Bad Request - Missing Fields
    ValidationError --> ErrorResponse
    
    ProcessingData: Process Form Data
    ProcessingData --> EmailGeneration: Processing Complete
    
    EmailGeneration: Generate Email Templates
    EmailGeneration --> SMTPCall: Templates Generated
    
    SMTPCall: Call SMTP2GO API
    SMTPCall --> SMTPError: API Failure
    SMTPCall --> DeliverySuccess: Email Sent
    
    SMTPError: 500 Internal Server Error
    SMTPError --> ErrorResponse
    
    DeliverySuccess: 200 OK - Email Sent
    DeliverySuccess --> [*]
    
    ErrorResponse: Return Error Response
    ErrorResponse --> [*]

    %% Apply styles to states
    class MethodError,UnsupportedType,ParseError,ValidationError,SMTPError,ErrorResponse errorState
    class CORSSuccess,DeliverySuccess successState
    class RequestReceived,MethodValidation,ContentTypeCheck,DataParsing,ValidationCheck,ProcessingData,EmailGeneration,SMTPCall processState
    class CORSPreflight warningState
```

## Error Categories

### Client Errors (4xx)

#### 400 Bad Request

- **Parse Error**: Malformed JSON, form data, or multipart data
- **Validation Error**: Missing required fields (name, email, message)
- **Data Error**: Invalid field values or excessive length

#### 405 Method Not Allowed

- **Trigger**: Request methods other than POST or OPTIONS
- **Response**: JSON error with allowed methods
- **Headers**: Includes CORS headers for cross-origin requests

#### 415 Unsupported Media Type

- **Trigger**: Content-Type not in supported list
- **Supported Types**: 
  - `application/json`
  - `application/x-www-form-urlencoded`
  - `multipart/form-data`

### Server Errors (5xx)

#### 500 Internal Server Error

- **SMTP API Failure**: SMTP2GO service unavailable or authentication error
- **Network Issues**: Connectivity problems with external services
- **Configuration Error**: Missing or invalid environment variables

### Success Responses (2xx)

#### 200 OK - CORS Preflight

- **Trigger**: OPTIONS request for CORS validation
- **Headers**: Access-Control-Allow-* headers
- **Purpose**: Browser preflight request handling

#### 200 OK - Email Sent

- **Trigger**: Successful email delivery via SMTP2GO
- **Response**: Success confirmation with message
- **Headers**: CORS headers for cross-origin requests

## Error Recovery Patterns

### Graceful Degradation

- All errors include CORS headers for browser compatibility
- Structured JSON responses for consistent client handling
- Descriptive error messages for debugging

### Input Validation Strategy

- Progressive validation (method → content-type → fields)
- Early return on validation failures
- Sanitization before processing

### External Service Resilience

- Timeout handling for SMTP2GO API calls
- Structured error responses for service failures
- Retry logic considerations for transient failures

## Monitoring & Alerting

### Error Rate Tracking

- Monitor 4xx rates for client integration issues
- Track 5xx rates for service reliability
- Alert on SMTP delivery failure spikes

### Common Error Patterns

- **High 405 rates**: Incorrect integration (using GET instead of POST)
- **High 415 rates**: Content-Type header issues
- **High 400 rates**: Form validation problems
- **High 500 rates**: SMTP2GO service or configuration issues