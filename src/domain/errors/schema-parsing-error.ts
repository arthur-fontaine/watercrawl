import type { StandardSchemaV1 } from "@standard-schema/spec";

export class SchemaParsingError extends Error {
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(`Schema parsing error: ${issues.map((issue) => issue.message).join(", ")}`);
  }
}
