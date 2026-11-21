# MockFlow (`mockflow-api`)

Instant mock REST API generator driven by a JSON schema. Automatically scaffolds in-memory CRUD endpoints, realistic seed generation via `@faker-js/faker`, rich filtering, multi-field sorting, pagination, and relational expansions (`?include=...`).

---

## Key Highlights

- **Zero Boilerplate Backend**: Define a JSON schema; obtain immediate standard REST routes.
- **Realistic Data**: Backed by `@faker-js/faker` with deterministic seeding support.
- **Relational Integrity**: Model `many-to-one` and `one-to-one` links with automatic foreign key injection and nested queries (`?include=...`).
- **Comprehensive Filtering**: Support for `=`, `_gt`, `_gte`, `_lt`, `_lte`, `_ne`, `_in`, and `_nin`.
- **Search & Sort**: Case-insensitive substring searches across fields and multi-column sorting.
- **Dual Interface**: Use via CLI binary (`mockflow`) or as a Node.js library (`createMockServer`).

---

## Installation

```bash
# Global CLI usage
npm install -g mockflow-api

# Or local project dependency
npm install mockflow-api
```

---

## CLI Usage

### 1. Initialize Schema
```bash
npx mockflow init
```
This generates a starter `mockflow.json` in your working directory.

### 2. Start the Mock Server
```bash
npx mockflow start --port 4000
```

Available flags:
- `-p, --port <number>`: Port number (default: `3000`).
- `-c, --config <file>`: Schema file path (default: `mockflow.json`).
- `--prefix <prefix>`: Route prefix (default: `/api`).
- `-d, --delay <ms>`: Artificial network latency in milliseconds.
- `-s, --seed <number>`: Deterministic seed value.

### 3. Generate Static Sample Data File
```bash
npx mockflow generate --output sample-data.json
```

---

## Schema Reference

Define collections and their fields within a JSON schema:

```json
{
  "users": {
    "count": 20,
    "fields": {
      "name": "fullName",
      "email": "email",
      "role": {
        "type": "string",
        "values": ["admin", "editor", "viewer"]
      },
      "age": {
        "type": "integer",
        "min": 18,
        "max": 65
      },
      "isActive": "boolean"
    }
  },
  "posts": {
    "count": 50,
    "fields": {
      "title": "sentence",
      "content": "paragraph",
      "createdAt": "date"
    },
    "relationships": {
      "userId": {
        "collection": "users",
        "type": "many-to-one"
      }
    }
  }
}
```

### Supported Built-in Types
- `string`, `word`, `sentence`, `paragraph`
- `number`, `integer`, `price`
- `boolean`
- `email`, `fullName`, `firstName`, `lastName`, `phoneNumber`
- `address`, `city`, `country`, `companyName`, `productName`
- `date`, `uuid`, `url`, `imageUrl`

---

## REST Endpoints

Given collection `users`, MockFlow exposes:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List records with pagination, filtering, searching, and sorting |
| `GET` | `/api/users/:id` | Retrieve record by identifier |
| `POST` | `/api/users` | Create a new record (201 Created) |
| `PUT` | `/api/users/:id` | Replace existing record |
| `PATCH`| `/api/users/:id` | Partially update fields of an existing record |
| `DELETE`| `/api/users/:id`| Remove record |
| `GET` | `/api` | Service metadata and collection status overview |

### Query Capabilities

- **Pagination**: `/api/users?page=2&limit=10`
- **Exact Match**: `/api/users?role=admin`
- **Operators**:
  - Greater than: `/api/users?age_gt=21`
  - Range: `/api/products?price_gte=10&price_lte=100`
  - In set: `/api/users?role_in=admin,editor`
- **Sorting**: `/api/users?sort=age&order=desc`
- **Searching**: `/api/users?search=alex`
- **Relations**: `/api/posts?include=user`

---

## Programmatic API

```javascript
import { createMockServer } from 'mockflow-api';

const server = createMockServer({
  port: 5000,
  prefix: '/api',
  schema: {
    users: {
      count: 10,
      fields: {
        name: 'fullName',
        tier: 'customTier'
      }
    }
  },
  customGenerators: {
    customTier: () => 'Gold'
  }
});

await server.start();
console.log('Mock server active on port 5000');
```

---

## Architecture

- **`src/core/schema.js`**: Parses and validates collection and relationship topologies.
- **`src/core/database.js`**: Low-overhead in-memory key-value storage engine with ID sequencing and cloning.
- **`src/generators/`**: Field and dataset resolution orchestrated with `@faker-js/faker`.
- **`src/routes/`**: Standardized routing modules for filtering, sorting, pagination, and CRUD actions.
- **`src/cli/`**: CLI command dispatchers implemented via Commander.js.

---

## License

MIT
