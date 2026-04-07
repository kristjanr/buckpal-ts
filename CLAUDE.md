# buckpal-ts

A NestJS/TypeScript port of the [buckpal](https://github.com/thombergs/buckpal) hexagonal architecture reference project, companion to *Get Your Hands Dirty on Clean Architecture* by Tom Hombergs.

## Running

```bash
npm run start        # start the server (port 3000)
npm run start:dev    # start in watch mode
npm run test         # run unit tests
```

## Architecture

Hexagonal (Ports & Adapters) architecture. All dependencies point inward: adapters → ports → domain.

```
src/account/
  ├── adapter/in/web/           # incoming adapters (controllers)
  ├── adapter/out/persistence/  # outgoing adapters (TypeORM)
  └── application/
        ├── domain/model/       # entities and value objects
        ├── domain/service/     # use case implementations
        └── port/in/ & port/out/ # incoming and outgoing ports
```

## Mapping Strategy Guidelines (Chapter 9)

No single mapping strategy applies globally. Choose per use case, per boundary. These are the agreed defaults for this project:

### Web ↔ Application boundary

| Use case type | Strategy | Rationale |
|---------------|----------|-----------|
| **Modifying** (e.g. SendMoney) | **Full** mapping — dedicated command object per operation | Decouples web input from domain; each command carries only the fields it needs with its own validation |
| **Query** (e.g. GetAccountBalance) | **No Mapping** — return domain objects directly | Queries are simple reads; adding a separate web model is overhead with no benefit until the response shape diverges from the domain |

### Application ↔ Persistence boundary

| Use case type | Strategy | Rationale |
|---------------|----------|-----------|
| **Both** | **Two-Way** mapping — separate ORM entities + `AccountMapper` | The domain model (Account with ActivityWindow + computed baseline) is structurally different from the flat persistence model; "No Mapping" would force ORM concerns into the domain |

### When to evolve

- If a query response starts needing fields not on the domain model, promote it from "No Mapping" to "Two-Way" at the web boundary.
- If a new use case is pure CRUD with identical structure across all layers, start with "No Mapping" everywhere and evolve later.
- Document any deviation from these defaults as an ADR or inline comment explaining why.
