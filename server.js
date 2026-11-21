import { createMockServer } from 'mockflow-api';

const PORT = process.env.PORT || 3000;

const server = createMockServer({
  port: PORT,
  prefix: '/api',
  schema: {
    users: {
      count: 20,
      fields: {
        name: 'fullName',
        email: 'email',
        age: { type: 'integer', min: 18, max: 60 },
        city: 'city'
      }
    },
    products: {
      count: 30,
      fields: {
        name: 'productName',
        price: 'price',
        category: {
          type: 'string',
          values: ['Electronics', 'Clothing', 'Books']
        },
        inStock: 'boolean'
      }
    },
    posts: {
      count: 25,
      fields: {
        title: 'sentence',
        content: 'paragraph',
        published: 'boolean'
      }
    }
  }
});

try {
  const result = await server.start(PORT);

  console.log('MockFlow API Demo is running!');
  console.log(`http://localhost:${result.port}/api`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
