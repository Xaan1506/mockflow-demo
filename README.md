# MockFlow API Demo

A working demonstration of [MockFlow API](https://github.com/Xaan1506/mockflow-api), a schema-driven mock REST API generator built with Node.js and Express.

## Features

- Automatically generated REST API endpoints
- Realistic mock data using Faker
- Users, products and posts collections
- CRUD operations (GET, POST, PUT, PATCH, DELETE)
- Filtering, searching and sorting
- Pagination
- In-memory database

## Tech Stack

- Node.js
- Express.js
- MockFlow API
- JavaScript (ES Modules)

## Installation

Clone the repository:

\`\`\`bash
git clone https://github.com/Xaan1506/mockflow-demo.git
cd mockflow-demo
\`\`\`

Install dependencies:

\`\`\`bash
npm install
\`\`\`

## Run the Demo

\`\`\`bash
node server.js
\`\`\`

The API runs locally at:

\`\`\`
http://localhost:3000/api
\`\`\`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api | API overview |
| GET | /api/users | List users |
| GET | /api/users/:id | Get a user |
| POST | /api/users | Create a user |
| PUT | /api/users/:id | Replace a user |
| PATCH | /api/users/:id | Update a user |
| DELETE | /api/users/:id | Delete a user |
| GET | /api/products | List products |
| GET | /api/posts | List posts |

## Query Examples

Pagination:

\`\`\`
/api/users?page=1&limit=5
\`\`\`

Filtering:

\`\`\`
/api/users?age_gte=25
\`\`\`

Sorting:

\`\`\`
/api/users?sort=age&order=desc
\`\`\`

Searching:

\`\`\`
/api/users?search=alex
\`\`\`

## Main Package

GitHub: https://github.com/Xaan1506/mockflow-api

## Author

Xaan1506
