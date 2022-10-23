import { ZodSchema, z } from "zod";
import { isEqual } from "lodash";

export type SchemaType = "Number" | "String";

type Schema = Record<string, SchemaType>;

export class DataOfSchema {
  constructor(
    public readonly schema: Schema,
    public readonly data: Array<Record<string, string>>
  ) {}

  static parse(
    data: Record<string, Array<string>>,
    schema: Schema
  ): DataOfSchema {
    const dataKeys = Object.keys(data);
    dataKeys.sort();

    const schemaKeys = Object.keys(schema);
    schemaKeys.sort();

    if (!isEqual(dataKeys, schemaKeys)) {
      throw Error(
        `Data doesn't match schema: ${JSON.stringify({ dataKeys, schemaKeys })}`
      );
    }

    // Unpack data to be able to iterate over rows, not cols.
    const orderedColumnNames = Object.keys(data);
    const rows = transpose(Object.values(data));

    const tabularData = rows.map((row) =>
      Object.fromEntries(row.map((d, i) => [orderedColumnNames[i], d]))
    );

    const parser = parserForSchemaObject(schema).array();
    const parsedData = parser.parse(tabularData);

    return new DataOfSchema(schema, parsedData);
  }
}

/**
 * Build a zod parser for a single row matching a schema.
 */
function parserForSchemaObject(s: Schema): ZodSchema {
  const fields = Array.from(Object.entries(s), ([k, v]) => [
    k,
    parserForSchemaType(v),
  ]);
  return z.object(Object.fromEntries(fields));
}

/**
 * Build a zod parser for one of basic schema types.
 */
function parserForSchemaType(t: SchemaType): ZodSchema {
  switch (t) {
    case "Number":
      return z.preprocess((x: unknown) => {
        if (typeof x === "string") {
          return parseInt(x, 10);
        }
        return null;
      }, z.number());
    case "String":
      return z.string();
  }
}

/**
 * Transpose an array of arrays. Missing fields are set to undefined.
 */
export function transpose<T>(data: Array<Array<T>>): Array<Array<T>> {
  if (data.length == 0) {
    return [];
  }

  const inputXsCount = data.length;
  const inputYsCount = data[0].length;

  const ret = Array(inputYsCount)
    .fill(null)
    .map((_) => Array(inputXsCount));

  for (let x = 0; x < inputXsCount; ++x) {
    for (let y = 0; y < inputYsCount; ++y) {
      ret[y][x] = data[x][y];
    }
  }

  return ret;
}
