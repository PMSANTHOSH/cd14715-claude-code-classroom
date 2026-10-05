# Security Analysis

## Purpose

Provide focused guidance for reviewing code for security vulnerabilities, unsafe data handling, and common application-security risks.

## Review Areas

### 1. Input Validation

Look for:
- Unvalidated user or external input
- Missing type or format validation
- Trusting request parameters without checks
- Unsafe assumptions about external data

Prefer validating input at system boundaries.

### 2. Injection Risks

Check for:
- SQL injection
- Command injection
- Code injection
- Shell command construction from untrusted input
- Unsafe template evaluation

Prefer parameterized queries and safe APIs.

### 3. Authentication and Authorization

Review:
- Authentication checks
- Authorization boundaries
- Missing permission checks
- Privilege escalation risks
- Insecure direct object references

Verify that sensitive operations require appropriate authorization.

### 4. Secrets and Credentials

Look for:
- Hard-coded passwords
- API keys
- Access tokens
- Private keys
- Secrets committed to source code
- Sensitive values written to logs

Use environment variables or an appropriate secret-management mechanism.

### 5. Data Exposure

Check for:
- Sensitive information in logs
- Excessive error details
- Exposed credentials
- Personally identifiable information
- Sensitive data returned unnecessarily by APIs

Return only information required by the caller.

### 6. File and Path Security

Look for:
- Path traversal
- Unsafe file paths
- Arbitrary file access
- Unrestricted file uploads
- Missing file-type or size validation

Validate paths and restrict filesystem access to intended locations.

### 7. Network and External Requests

Review:
- Server-side requests using untrusted URLs
- Missing URL validation
- SSRF risks
- Insecure HTTP connections
- Missing request timeouts

Prefer allowlists and safe URL handling where appropriate.

### 8. Dependency and Configuration Security

Check for:
- Unsafe dependency usage
- Disabled security protections
- Insecure default configuration
- Debug settings enabled in production
- Excessive permissions

### 9. Error Handling

Ensure errors do not expose:
- Stack traces to untrusted users
- Credentials
- Internal filesystem paths
- Database details
- Other sensitive implementation information

### 10. Cryptography

Look for:
- Weak or obsolete algorithms
- Hard-coded encryption keys
- Predictable random values
- Incorrect password hashing
- Improper handling of cryptographic material

Use established cryptographic libraries rather than custom implementations.

## Common Findings

Prioritize concrete security issues such as:
- Critical injection vulnerabilities
- Authentication or authorization bypasses
- Secret exposure
- Arbitrary file access
- SSRF
- Sensitive information disclosure
- Unsafe command execution

## Severity Guidance

- Critical: Vulnerability can enable severe compromise, remote code execution, authentication bypass, or major data exposure.
- High: Significant security vulnerability with realistic exploitation potential.
- Medium: Security weakness requiring additional conditions or having limited impact.
- Low: Defense-in-depth issue or low-impact weakness.
- Info: Security observation without a demonstrated vulnerability.

## Review Principle

Report security findings only when supported by the code and available evidence. Do not claim a vulnerability merely because a risky pattern is theoretically possible. Explain the affected code, attack path, impact, and practical remediation when evidence supports it.
