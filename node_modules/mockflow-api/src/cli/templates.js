export const DEFAULT_SCHEMA_TEMPLATE = {
  "users": {
    "count": 25,
    "fields": {
      "name": "fullName",
      "email": "email",
      "age": {
        "type": "integer",
        "min": 18,
        "max": 65
      },
      "role": {
        "type": "string",
        "values": ["admin", "editor", "user"]
      },
      "isActive": "boolean",
      "city": "city"
    }
  },
  "posts": {
    "count": 50,
    "fields": {
      "title": "sentence",
      "content": "paragraph",
      "published": "boolean",
      "createdAt": "date"
    },
    "relationships": {
      "userId": {
        "collection": "users",
        "type": "many-to-one"
      }
    }
  },
  "products": {
    "count": 30,
    "fields": {
      "name": "productName",
      "price": "price",
      "category": {
        "type": "string",
        "values": ["electronics", "clothing", "home", "books", "sports"]
      },
      "inStock": "boolean"
    }
  }
};
