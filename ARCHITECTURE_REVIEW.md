# Architecture Review: buckpal-ts vs "Get Your Hands Dirty on Clean Architecture"

A comparison of this repository against the recommendations in Tom Hombergs' book
*Get Your Hands Dirty on Clean Architecture*.

## Where buckpal-ts Falls Short

### 1. No Tests (Chapter 7 — the biggest gap)

The book dedicates an entire chapter to a testing strategy for hexagonal architecture, prescribing:

- **Unit tests** for domain entities (`Account`, `Money`, `ActivityWindow`)
- **Unit tests** for use cases (`SendMoneyService`) with mocked ports
- **Integration tests** for web adapters (controller + HTTP mapping)
- **Integration tests** for persistence adapters (adapter + real DB)
- **System tests** for end-to-end paths through the full stack

The repo has **essentially zero meaningful tests**. The only test file (`test/app.e2e-spec.ts`) tests `GET /` expecting "Hello World!" — a placeholder that doesn't even correspond to a real endpoint. None of the domain model, services, ports, or adapters are tested.

### 2. Missing Transaction Management (Chapter 6, p.57)

The book explicitly states that **transaction boundaries belong on the use case services** — the service orchestrates multiple persistence calls, so it must wrap them in a transaction. The Java version uses `@Transactional` on `SendMoneyService`.

`send-money.service.ts` has no transaction management at all. If `updateActivities(sourceAccount)` succeeds but `updateActivities(targetAccount)` fails, you get an inconsistent state — money withdrawn from source but never deposited to target.

### 3. Package Structure: `domain` vs `application/domain` (Chapter 3, p.21)

The book's recommended structure places `domain` as a **sibling** to `application`:

```
account/
  ├── adapter/
  ├── domain/        ← domain entities here
  └── application/   ← services and ports here
```

The repo nests the domain **inside** `application`:

```
account/
  ├── adapter/
  └── application/
        ├── domain/    ← buried one level too deep
        └── port/
```

This conflates the domain layer with the application layer, making the domain's independence less architecturally visible. The book's structure makes it immediately obvious that the domain has no dependency on the application layer.

### 4. No Architecture Boundary Enforcement (Chapter 10)

The book recommends at least one of:

- **Visibility modifiers** (Java's package-private — not directly available in TypeScript, but barrel exports/index files can approximate it)
- **Post-compile checks** (like ArchUnit — e.g. `eslint-plugin-boundaries` or `dependency-cruiser` in the TS world)
- **Separate build artefacts** (separate packages for domain, application, adapters)

The repo has **none** of these. Nothing prevents an adapter from importing directly from the domain's internal files or a service from importing an ORM entity. The architecture is purely conventional, relying on developer discipline alone.

### 5. NestJS `@Injectable()` Leaks into Domain Services (Chapter 9, p.81–83)

The book warns about framework annotations polluting the application core. It advocates keeping the application/domain layers free of framework dependencies, preferring configuration-class-based assembly (Spring's `@Configuration` / `@Bean`).

`SendMoneyService` is decorated with `@Injectable()` — a NestJS-specific decorator. The book would prefer the service to be a plain class, with the wiring done entirely in `account.module.ts`. Since NestJS does support factory-based provider registration (which `account.module.ts` already uses for some providers), the `@Injectable()` on the service is unnecessary framework coupling in the domain.

### 6. Missing Web Adapter Input Validation / Error Handling (Chapter 5, p.41)

The book outlines 7 responsibilities of a web adapter, including **input validation** and **error-to-HTTP mapping**. The `SendMoneyController`:

- Does basic type coercion via `ParseIntPipe`, but has no error handling
- Returns `void` instead of a meaningful HTTP response
- Doesn't handle `ThresholdExceededException` or withdrawal failures (the service returns `false` but the controller ignores the return value)
- Has no exception filter to translate domain exceptions to proper HTTP status codes

### 7. Controller Does Not Return Proper HTTP Responses (Chapter 5, p.41)

The book shows the Java controller returning appropriate HTTP statuses. The TS controller returns `Promise<void>` and **silently ignores the boolean result** from `sendMoneyUseCase.sendMoney()`. A failed withdrawal (insufficient funds) returns HTTP 200 with no body, indistinguishable from success.

### 8. Domain Model Fields Are `readonly` but Publicly Accessible (Chapter 4, p.26–27, 52)

The book's Java `Account` has **private fields** with controlled access through getters and factory methods (`withId`, `withoutId`). The TS `Account` declares fields as `readonly` but they're directly on the constructor, making `account.id`, `account.baselineBalance`, and `account.activityWindow` publicly readable by anyone — including adapters that shouldn't be reaching into the domain internals. While TypeScript `readonly` prevents reassignment, the book's intent is encapsulation: fields should be `private readonly` with explicit getter methods where access is needed.

### 9. No `GetAccountBalanceController` / Missing Read Use Case Web Adapter (Chapter 4, p.37–38)

The book implements the `GetAccountBalanceQuery` read use case with its own dedicated controller (following the "slice controllers" principle from Chapter 5). The repo defines `GetAccountBalanceService` and `GetAccountBalanceUseCase` but **has no web adapter** to expose it. It's an orphaned use case with no entry point.

### 10. `SendMoneyCommand` Validates After Assignment (Chapter 4, p.30–31)

The book's `SendMoneyCommand` validates in the constructor and **refuses object creation** if invalid. The TS version does validate, but the pattern is slightly off — it assigns fields first, then validates:

```typescript
// Current: assigns then checks
this.sourceAccountId = sourceAccountId;
// ...
if (!sourceAccountId) throw ...
```

The book's approach (and the `SelfValidating` pattern) ensures the object can never exist in an invalid state. While functionally similar in this case, the ordering convention matters for signalling intent.

### 11. No `SelfValidating` Base Class (Chapter 4, p.31–32)

The book introduces a `SelfValidating<T>` abstract class that leverages Bean Validation annotations for declarative validation. The TS equivalent would be using `class-validator` decorators with a self-validating base class. Despite `class-validator` being a project dependency, it's not used in any command or query object — all validation is manual.

## Summary

| Area | Book's Recommendation | Repo Status |
|------|----------------------|-------------|
| Testing strategy | Unit + integration + system tests | Essentially none |
| Transactions | `@Transactional` on services | Missing entirely |
| Package structure | `domain/` sibling to `application/` | `domain/` nested inside `application/` |
| Boundary enforcement | ArchUnit / visibility / build modules | None |
| Framework in core | Keep application layer framework-free | `@Injectable()` on services |
| Web adapter responses | Proper HTTP status codes + error handling | Returns void, ignores failures |
| Controller slicing | One controller per use case | Missing controller for GetAccountBalance |
| Input validation | `SelfValidating` with declarative rules | Manual checks, no class-validator |
| Domain encapsulation | Private fields + getters | Readonly but publicly accessible |

## Conclusion

The structural skeleton is sound — the directory layout, port/adapter separation, and dependency inversion via DI are all there. The gaps are in **testing, transaction safety, boundary enforcement, and the polish** that turns an architectural skeleton into a production-ready implementation.
