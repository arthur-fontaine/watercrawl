import { select, text } from "@clack/prompts";
import * as picocolors from "picocolors";

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

  async nextStep(_promptType: (path: string[]) => Promise<Type>, path: string[]) {
    const description = await promptDescription(path);
    const zodDescription = description ? `.describe(${JSON.stringify(description)})` : '';
    return `z.string()${zodDescription}`;
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

  async nextStep(_promptType: (path: string[]) => Promise<Type>, path: string[]) {
    const description = await promptDescription(path);
    const zodDescription = description ? `.describe(${JSON.stringify(description)})` : '';
    return `z.number()${zodDescription}`;
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

  async nextStep(_promptType: (path: string[]) => Promise<Type>, path: string[]) {
    const description = await promptDescription(path);
    const zodDescription = description ? `.describe(${JSON.stringify(description)})` : '';
    return `z.boolean()${zodDescription}`;
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
    const description = await promptDescription(newPath);
    const zodDescription = description ? `.describe(${JSON.stringify(description)})` : '';
    const type = await promptType(newPath);
    return `z.array(\n${'  '.repeat(path.length + 2)}${await type.nextStep(promptType, newPath)},\n${'  '.repeat(path.length + 1)})${zodDescription}`;
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
    const description = path.length === 0 ? '' : await promptDescription(path);
    const zodDescription = description ? `.describe(${JSON.stringify(description)})` : '';

    let schema = 'z.object({\n';
    do {
      const propertyName = await text({
        message: `${getPromptPrefix([...path])}${path.length > 0 ? `Under ${picocolors.magenta(formatPath(path))}, what` : 'What'} do you want to name the property? (Press Enter if you're done)`,
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
    schema += `${'  '.repeat(path.length + 1)}})${zodDescription}`;
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
  return ''
}

async function promptType(path: string[]): Promise<Type> {
  const type = await select({
    message: `${getPromptPrefix(path)}What type is ${picocolors.magenta(formatPath(path))}?`,
    options: types.map(type => new type().getClackChoice()),
  });

  if (typeof type === 'symbol') {
    throw new Error(type.description);
  }

  return type;
}

async function promptDescription(path: string[]) {
  const description = await text({
    message: `${getPromptPrefix(path)}How would you describe ${picocolors.magenta(formatPath(path))}? This will be used as an hint for the AI.`,
    placeholder: 'e.g. "The name of the user", "The price of the product in USD"',
  });

  if (typeof description === 'symbol') {
    return '';
  }

  return description;
}

function formatPath(path: string[]) {
  return path.join('.').replaceAll(".0", "[].element");
}

export async function createZodSchemaWithClack() {
  const schema = await new ObjectType().nextStep(promptType, []);
  return schema.replace('z.object({', 'z.object({\n    urls: z.array(z.string()),');
}
