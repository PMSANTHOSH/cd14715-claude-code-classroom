# TypeScript Patterns

## Purpose

Provide focused guidance for reviewing TypeScript code for type safety, maintainability, and correct use of the TypeScript type system.

## Review Areas

### 1. Type Safety

Look for:
- any used without a clear reason
- unsafe type assertions
- non-null assertions
- missing return types on important public functions
- incorrect or overly broad types
- nullable values without appropriate checks
- unsafe object or array indexing

Prefer precise types and validation at the source.

### 2. Union Types and Narrowing

Look for opportunities to use union types, discriminated unions, type guards, and control-flow narrowing.

Avoid unnecessary type assertions when TypeScript can narrow the value safely.

### 3. Interfaces and Type Aliases

Use interfaces for extensible object contracts where appropriate.

Use type aliases for unions, intersections, function types, and complex type compositions.

Keep public contracts clear and focused.

### 4. Generics

Check whether generic types preserve type information, avoid duplication, have meaningful constraints, and actually improve reuse.

Avoid adding generics when they do not improve type safety.

### 5. Async Code

Review Promise return types, missing await, unhandled rejected promises, incorrect error handling, and unnecessarily sequential asynchronous operations.

Ensure asynchronous functions have predictable behavior.

### 6. Null and Undefined Handling

Look for unsafe access to nullable values, missing null checks, incorrect optional chaining, incorrect nullish coalescing, and unnecessary non-null assertions.

Prefer explicit and safe handling of nullable data.

### 7. Enums and Literal Types

Consider literal types or unions when they provide a simpler representation than enums.

Example:

type Status = 'pending' | 'active' | 'completed';

### 8. Readonly and Immutability

Use readonly where mutation is not intended.

Look for unnecessary mutation, mutable shared state, and functions that unexpectedly modify their inputs.

### 9. Error Types

Check that errors are handled safely.

Avoid assuming caught values have a specific shape without validation.

Prefer handling caught values as unknown and checking them before accessing properties.

## Common Findings

Prioritize concrete issues such as:
- runtime bugs caused by incorrect types
- unsafe assertions
- missing null checks
- incorrect async handling
- weak public API contracts
- unnecessary any
- type definitions that hide invalid states

## Severity Guidance

- Critical: Type issue likely to cause severe security, data integrity, or production failure.
- High: Type issue likely to cause runtime failures or significant incorrect behavior.
- Medium: Maintainability or correctness issue with realistic impact.
- Low: Minor type-quality or readability improvement.
- Info: Useful observation without a significant defect.

## Review Principle

Report concrete TypeScript issues supported by the code. Do not recommend type complexity merely for its own sake. Prefer simple, explicit, type-safe solutions.
