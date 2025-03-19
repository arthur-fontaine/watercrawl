import { Edge } from 'edge.js'
import { confirm, intro, multiselect, outro, select, text } from '@clack/prompts';
import path from "node:path";
import { createZodSchemaWithClack } from './clack-zod';

intro(`create-watercrawl`);

const features = await multiselect({
  message: 'Pick the features you want to include in your project.',
  options: [
    {
      label: 'Flow',
      value: 'flow',
    },
    {
      label: 'Docker',
      value: 'docker',
      hint: 'Run Watercrawl with a Docker Compose file.'
    },
  ],
  initialValues: ['flow', 'docker'] as const,
});

if (typeof features === 'symbol') {
  throw new Error(features.description);
}

if (features.includes('flow')) {
  const schemaName = await text({
    message: 'What type of object are you scraping?',
    placeholder: 'e.g. "product", "car", "person"',
    validate(value) {
      if (value.includes(' ')) return 'The schema name cannot contain spaces.';
      if (value.includes('"')) return 'The schema name cannot contain quotes.';
      if (value.length === 0) return 'Please enter a schema name.';
    },
  });

  if (typeof schemaName === 'symbol') {
    throw new Error(schemaName.description);
  }

  const schemaLib = await select({
    message: 'Which library would you like to use to define the schema?',
    options: [
      {
        label: 'Zod',
        value: 'zod',
      },
      {
        label: 'ArkType',
        value: 'arktype',
      },
      {
        label: 'Valibot',
        value: 'valibot',
      },
    ],
    initialValue: 'zod' as const,
  });

  if (typeof schemaLib === 'symbol') {
    throw new Error(schemaLib.description);
  }

  let flowWritten = false;

  if (schemaLib === 'zod') {
    const shouldDefineSchemaInteractively = await confirm({
      message: 'Do you want to interactively define the schema?',
      initialValue: true,
    });

    if (shouldDefineSchemaInteractively === true) {
      const schema = await createZodSchemaWithClack();

      await writeTemplate('flow', { schemaName, schemaLib, schema });
      flowWritten = true;
    }
  }

  if (!flowWritten) {
    await writeTemplate('flow', { schemaName, schemaLib });
  }
}

if (features.includes('docker')) {
  await writeTemplate('docker', {});
}

outro(`Start scraping!`);

async function writeTemplate(type: string, data: Record<string, any>) {
  const templates = new Bun.Glob(`${import.meta.dirname}/templates/${type}/**/*`);
  const edge = Edge.create()
  edge.mount(new URL('./templates', import.meta.url))

  for await (const template of templates.scan({
    onlyFiles: true,
  })) {
    let content = await Bun.file(template).text();
    let filename = path.relative(`${import.meta.dirname}/templates/${type}`, template).replace(/\.edge$/, '');

    if (template.endsWith('.edge')) {
      content = await edge.render(`${type}/${filename}`, data) + '\n';
    }

    await Bun.write(`./${filename}`, content);
  }
}
