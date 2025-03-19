import { select, text } from "@clack/prompts";

interface Type {
  getClackChoice(): {
    label: string;
    value: Type;
    hint: string;
  }
  nextStep(promptType: (path: string[]) => Promise<Type>, path: string[]): Promise<string>;
}

class StringType implements Type {
  getClackChoice() {
    return {
      label: 'Text',
      value: new StringType(),
      hint: 'string',
    };
  }

  async nextStep() {
    return 'z.string()';
  }
}

class NumberType implements Type {
  getClackChoice() {
    return {
      label: 'Number',
      value: new NumberType(),
      hint: 'number',
    };
  }

  async nextStep() {
    return 'z.number()';
  }
}

class BooleanType implements Type {
  getClackChoice() {
    return {
      label: 'Yes/No',
      value: new BooleanType(),
      hint: 'boolean',
    };
  }

  async nextStep() {
    return 'z.boolean()';
  }
}

class ListType implements Type {
  getClackChoice() {
    return {
      label: 'List',
      value: new ListType(),
      hint: 'array',
    };
  }

  async nextStep(promptType: (path: string[]) => Promise<Type>, path: string[]) {
    const newPath = [...path, '0'];
    const type = await promptType(newPath);
    return `z.array(${await type.nextStep(promptType, newPath)})`;
  }
}

class ObjectType implements Type {
  getClackChoice() {
    return {
      label: 'Nested Schema',
      value: new ObjectType(),
      hint: 'object',
    };
  }

  async nextStep(promptType: (path: string[]) => Promise<Type>, path: string[]) {
    let schema = 'z.object({\n';
    do {
      const propertyName = await text({
        message: `${getPromptPrefix(path)}What is the property name? (Press Enter if you're done)`,
        placeholder: 'e.g. "name"',
        validate(value) {
          if (value.includes(' ')) return 'The property name cannot contain spaces.';
          if (value.includes('"')) return 'The property name cannot contain quotes.';
        }
      });
      if (typeof propertyName === 'symbol' || propertyName === undefined || propertyName.length === 0) {
        break;
      }
      const newPath = [...path, propertyName];
      const indentation = '  '.repeat(path.length + 2);
      const type = await promptType(newPath);
      schema += `${indentation}${propertyName}: ${await type.nextStep(promptType, newPath)},\n`;
    } while (true);
    schema += `${'  '.repeat(path.length + 1)}})`;
    return schema;
  }
}

const types = [
  StringType,
  NumberType,
  BooleanType,
  ListType,
  ObjectType,
];

function getPromptPrefix(path: string[]) {
  return path.length === 0 ? '' : `\`${path.join('.')}\` `;
}

async function promptType(path: string[]): Promise<Type> {
  const type = await select({
    message: `${getPromptPrefix(path)}What type is this property?`,
    options: types.map(type => new type().getClackChoice()),
  });

  if (typeof type === 'symbol') {
    throw new Error(type.description);
  }

  return type;
}

export async function createZodSchemaWithClack() {
  const schema = await new ObjectType().nextStep(promptType, []);
  return schema.replace('z.object({', 'z.object({\n    urls: z.array(z.string()),');
}
