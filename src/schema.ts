abstract class Schema {}

class NumberSchema extends Schema {
	override toString(): string {
		return "Number";
	}
}

class TextSchema extends Schema {
	override toString(): string {
		return "Text";
	}
}

class ContainerSchema extends Schema {
	constructor(
		public readonly key: NumberSchema | TextSchema,
		public readonly value: Schema,
	) {
		super();
	}

	override toString(): string {
		return `{[${this.key.toString()}]: ${this.value.toString()}}`;
	}
}

class ProductSchema extends Schema {
	constructor(
		public readonly items: { key: number | string; value: Schema }[],
	) {
		super();
	}

	override toString(): string {
		return `{${this.items
			.map(({ key, value }) => `${key}: ${value.toString()}`)
			.join(" * ")}}`;
	}
}

// @ts-ignore
class SumSchema extends Schema {
	constructor(public readonly options: Schema[]) {
		super();
	}

	override toString(): string {
		return `{${this.options.map((x) => x.toString()).join(" + ")}}`;
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
			const containerSchemas = items.map(
				(item) => new ContainerSchema(new TextSchema(), item),
			);

			// Object.
			const unifiedInput = unifyObjects(input as object[]);
			// biome-ignore lint/style/noNonNullAssertion: safe
			const keys = Object.keys(unifiedInput[0]!);
			const values = unifiedInput.map((x) => Object.values(x));
			const productValues = transpose(
				transpose(values).map(guess),
			) as Schema[][];
			const productSchemas = productValues.map(
				(values) =>
					new ProductSchema(
						zip(keys, values).map(([key, value]) => ({ key, value })),
					),
			);

			return ([] as Schema[]).concat(containerSchemas, productSchemas);
		}
		case "array": {
			// Sequence.
			const containerItems = guess(input.flat());
			const containerSchemas = containerItems.map(
				(item) => new ContainerSchema(new NumberSchema(), item),
			);

			// Tuple.
			const tupleItems = transpose(
				transpose(input as unknown[][]).map(guess),
			) as Schema[][];
			const tupleSchemas = tupleItems.map(
				(items) =>
					new ProductSchema(
						items.map((item, index) => ({ key: index, value: item })),
					),
			);

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

function zip<T, U>(ts: T[], us: U[]): [T, U][] {
	if (ts.length !== us.length) {
		throw new Error("Cannot zip lists of different lengths.");
	}
	return ts.map((t, i) => [t, us[i] as U]);
}

/**
 * Given a list of objects with potentially different sets of keys,
 * return a list of the same objects, but all with the same sets of keys.
 * Missing values are set to `null`.
 */
function unifyObjects(xs: object[]): object[] {
	const emptiedXs = xs.map((x) =>
		Object.fromEntries(Object.keys(x).map((k) => [k, null])),
	);
	const prototype = Object.assign({}, ...emptiedXs);
	return xs.map((x) => ({ ...prototype, ...x }));
}
