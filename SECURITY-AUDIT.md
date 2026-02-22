# Security Audit Summary

**Date:** 2025  
**Scope:** Exposed secrets, SQL injection, insecure data handling.

## Findings and Fixes

### 1. API keys / secrets
- **Finding:** No API keys or secrets are used in the codebase. No `process.env` usage for credentials. No `.env` file committed.
- **Action:** Added `.env.example` stating no secrets are required; when adding future features, use env vars and keep `.env.local` out of version control (already in `.gitignore`).

### 2. SQL injection
- **Finding:** Application does not use a SQL database. Data is stored in the browser via `localStorage` only. No SQL or other query language is executed from user input.
- **Action:** None required.

### 3. Insecure data handling – addressed

#### 3.1 Request body size (DoS)
- **Risk:** Large JSON bodies could cause high memory/CPU usage.
- **Fix:** Introduced `src/lib/apiSecurity.ts` with `MAX_BODY_BYTES` (512 KB) and `isBodySizeAcceptable(request)`. All API routes (`generate-plan`, `edit-plan`, `next-week`) now check body size and return **413 Payload Too Large** when exceeded.

#### 3.2 Input validation
- **generate-plan:** Profile is validated; **limitations** array is now restricted to allowed values only: `knee`, `lower_back`, `shoulder` (no arbitrary strings).
- **edit-plan:** Plan validation now enforces `plan.days.length` between 1 and 7, `versionId` string length ≤ 128. `removeDayIndexes` must be an array of non‑negative integers, length ≤ 7.
- **next-week:** Same plan validation as above (days 1–7, `versionId` length ≤ 128).

#### 3.3 Prototype pollution (localStorage completion map)
- **Risk:** `versionId` from the client (e.g. URL `?version=__proto__`) could be used as a key when reading/writing the completion map, leading to prototype pollution.
- **Fix:** In `src/lib/planRepository.ts`, added `isSafeStorageKey()` that rejects `__proto__`, `constructor`, `prototype`, empty string, and keys longer than 128 characters. `getCompletion` and `setCompletion` use it and ignore unsafe keys. When reading, the completion value is validated as an array of booleans.

#### 3.4 Safe parsing of completion state
- **Risk:** Corrupt or malicious JSON in `gymbuddy_completion` could throw or produce non-object values.
- **Fix:** Completion map is parsed and validated as a plain object; only keys passing `isSafeStorageKey` and values that are arrays of booleans are used. Invalid entries are skipped.

## Recommendations for future work

- Add authentication/authorization if plans or profile are ever stored server-side.
- If you introduce a database, use parameterized queries only; never concatenate user input into SQL.
- Keep dependencies updated and run `npm audit` regularly.
- For any PII or health-related data, consider encryption at rest and in transit (HTTPS is assumed in production).
