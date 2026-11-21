import { faker } from '@faker-js/faker';

/**
 * Generates single field value according to definition and options.
 */
export function generateFieldValue(fieldDef, customGenerators = {}) {
  const type = fieldDef.type;

  // Custom generator takes precedence
  if (customGenerators && typeof customGenerators[type] === 'function') {
    return customGenerators[type](fieldDef);
  }

  // Explicit values array choice
  if (Array.isArray(fieldDef.values) && fieldDef.values.length > 0) {
    return faker.helpers.arrayElement(fieldDef.values);
  }

  switch (type) {
    case 'string':
      return faker.lorem.word();

    case 'number': {
      const min = fieldDef.min !== undefined ? fieldDef.min : 0;
      const max = fieldDef.max !== undefined ? fieldDef.max : 1000;
      const precision = fieldDef.precision !== undefined ? fieldDef.precision : 2;
      return faker.number.float({ min, max, fractionDigits: precision });
    }

    case 'integer': {
      const min = fieldDef.min !== undefined ? fieldDef.min : 0;
      const max = fieldDef.max !== undefined ? fieldDef.max : 1000;
      return faker.number.int({ min, max });
    }

    case 'boolean':
      return faker.datatype.boolean();

    case 'email':
      return faker.internet.email().toLowerCase();

    case 'firstName':
      return faker.person.firstName();

    case 'lastName':
      return faker.person.lastName();

    case 'fullName':
      return faker.person.fullName();

    case 'phoneNumber':
      return faker.phone.number();

    case 'address':
      return faker.location.streetAddress();

    case 'city':
      return faker.location.city();

    case 'country':
      return faker.location.country();

    case 'companyName':
      return faker.company.name();

    case 'productName':
      return faker.commerce.productName();

    case 'price': {
      const min = fieldDef.min !== undefined ? fieldDef.min : 1;
      const max = fieldDef.max !== undefined ? fieldDef.max : 500;
      return Number(faker.commerce.price({ min, max, dec: 2 }));
    }

    case 'date':
      return faker.date.recent().toISOString();

    case 'uuid':
      return faker.string.uuid();

    case 'url':
      return faker.internet.url();

    case 'paragraph':
      return faker.lorem.paragraph();

    case 'sentence':
      return faker.lorem.sentence();

    case 'word':
      return faker.lorem.word();

    case 'imageUrl':
      return faker.image.url();

    default:
      return faker.lorem.word();
  }
}
