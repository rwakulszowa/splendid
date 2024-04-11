abstract class Schema {}

class NumberSchema extends Schema {}

class TextSchema extends Schema {}

class ContainerSchema extends Schema {
	constructor(public readonly item: Schema) {
		super();
	}
}

class ProductSchema extends Schema {
	constructor(public readonly items: Schema[]) {
		super();
	}
}

// @ts-ignore
class SumSchema extends Schema {
	constructor(public readonly options: Schema[]) {
		super();
	}
}

export function guess(input: unknown[]): Schema[] {
	const jsTypes = new Set(input.map(jsType));
	// Let's ignore nulls for now.
	jsTypes.delete("null");

	if (jsTypes.size === 0) {
		throw new Error("Cannot guess from an empty input.");
	}
	if (jsTypes.size > 1) {
		// FIXME: handle by grouping and adding a SumSchema.
		throw new Error(`Non uniform types found. types=${jsTypes}`);
	}
	const jsType_: JsType = jsTypes.values().next().value;

	switch (jsType_) {
		case "number":
			return [new NumberSchema()];
		case "string":
			return [new TextSchema()];
		case "object": {
			// Map.
			const items = guess(input.flatMap((x) => Object.values(x as object)));
			const containerSchemas = items.map((item) => new ContainerSchema(item));

			// Object.
			const productItems = transpose(
				transpose(input.map((x) => Object.values(x as object))).map(guess),
			) as Schema[][];
			const productSchemas = productItems.map(
				(items) => new ProductSchema(items),
			);

			return ([] as Schema[]).concat(containerSchemas, productSchemas);
		}
		case "array": {
			// Sequence.
			const containerItems = guess(input.flat());
			const containerSchemas = containerItems.map(
				(item) => new ContainerSchema(item),
			);

			// Tuple.
			const tupleItems = transpose(
				transpose(input as unknown[][]).map(guess),
			) as Schema[][];
			const tupleSchemas = tupleItems.map((items) => new ProductSchema(items));

			return ([] as Schema[]).concat(containerSchemas, tupleSchemas);
		}
		case "null":
			throw new Error("Cannot infer from null.");
	}
}

type JsType = "number" | "string" | "array" | "object" | "null";

function jsType(x: unknown): JsType {
	if (typeof x === "number") {
		return "number";
	}
	if (typeof x === "string") {
		return "string";
	}
	if (Array.isArray(x)) {
		return "array";
	}
	if (typeof x === "object" && x !== null) {
		return "object";
	}
	if (x === null) {
		return "null";
	}
	throw new Error(`Cannot infer JS type. x=${x}`);
}

function transpose<T>(xs: T[][]): (T | null)[][] {
	if (xs.length === 0) {
		return [];
	}
	const rows = xs.length;
	const cols = Math.max(...xs.map((x) => x.length));
	const ret: (T | null)[][] = new Array(cols)
		.fill(null)
		.map(() => new Array(rows).fill(null));
	for (let iRow = 0; iRow < rows; iRow++) {
		for (let iCol = 0; iCol < cols; iCol++) {
			// biome-ignore lint/style/noNonNullAssertion: safe
			ret[iCol]![iRow] = xs[iRow]![iCol] || null;
		}
	}
	return ret;
}
