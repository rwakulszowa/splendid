import { cartesian, groupBy, transpose, unifyObjects, zip } from "./data";

abstract class Schema {}

class NumberSchema extends Schema {
	override toString(): string {
		return "Number";
	}
}

type TextFormat = "date" | "number" | "json" | null;

class TextSchema extends Schema {
	constructor(public readonly format: TextFormat | null) {
		super();
	}

	override toString(): string {
		return `Text(${this.format || "_"})`;
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

class SumSchema extends Schema {
	constructor(public readonly options: Schema[]) {
		super();
	}

	override toString(): string {
		return `{${this.options.map((x) => x.toString()).join(" + ")}}`;
	}
}

export function guess(input: unknown[]): Schema[] {
	const groupedByType = groupBy(input, jsType);

	// Let's ignore nulls for now.
	groupedByType.delete("null");

	if (groupedByType.size === 0) {
		throw new Error("Cannot guess from an empty input.");
	}

	const guessedPerGroup: Schema[][] = [];
	for (const [type, inputGroup] of groupedByType.entries()) {
		const guessed = guessUniformType(type, inputGroup);
		guessedPerGroup.push(guessed);
	}

	// One group found - return directly.
	if (guessedPerGroup.length === 1) {
		const head = guessedPerGroup[0] as Schema[];
		return head;
	}

	// Multiple groups - combine into Sums.
	return cartesian(guessedPerGroup).map((options) => new SumSchema(options));
}

function guessUniformType<T>(type: JsType, input: T[]): Schema[] {
	switch (type) {
		case "number":
			return [new NumberSchema()];
		case "string":
			return [new TextSchema(guessTextFormat(input as string[]))];
		case "object": {
			// Map.
			const mapKeyFormat = guessTextFormat(
				input.flatMap((x) => Object.keys(x as object)),
			);
			const items = guess(input.flatMap((x) => Object.values(x as object)));
			const containerSchemas = items.map(
				(item) => new ContainerSchema(new TextSchema(mapKeyFormat), item),
			);

			// Object.
			const unifiedInput = unifyObjects(input as object[]);
			const keys = Object.keys(unifiedInput[0] as object);
			const values = unifiedInput.map((x) => Object.values(x));
			const productValues = transpose(transpose(values).map(guess));
			const productSchemas = productValues
				.filter((values) => values.every((x) => x !== null))
				.map(
					(values) =>
						new ProductSchema(
							zip(keys, values as Schema[]).map(([key, value]) => ({
								key,
								value,
							})),
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
			const tupleItems = transpose(transpose(input as unknown[][]).map(guess));
			const tupleSchemas = tupleItems
				.filter((values) => values.every((x) => x !== null))
				.map(
					(items) =>
						new ProductSchema(
							(items as Schema[]).map((item, index) => ({
								key: index,
								value: item,
							})),
						),
				);

			return ([] as Schema[]).concat(containerSchemas, tupleSchemas);
		}
		case "null":
			throw new Error("Cannot infer from null.");
	}
}

/**
 * If all `xs` follow the same pattern (e.g. `YYYY:MM:DD`), detect the format to allow parsing.
 * This function only detects very simple patterns, by design.
 * It does not replace a proper top level parser.
 *
 * TODO:
 *  - add more well known formats
 *  - fall back to grouping by position (detect constants at every position, group remaining parts into sections)
 *  - fall back to grouping by separators (detect common separators, group remaining parts into sections)
 *  - detect common encodings (e.g. base64)
 */
function guessTextFormat(xs: string[]): TextFormat {
	if (xs.length === 0) {
		return null;
	}
	const isDate = (x: string) => new Date(x).toString() !== "Invalid Date";
	if (xs.every(isDate)) {
		return "date";
	}
	const isNumber = (x: string) => !Number.isNaN(Number.parseFloat(x));
	if (xs.every(isNumber)) {
		return "number";
	}
	const isJson = (x: string) => {
		try {
			JSON.parse(x);
			return true;
		} catch (e) {
			if (e instanceof SyntaxError) {
				return false;
			}
			throw e;
		}
	};
	if (xs.every(isJson)) {
		return "json";
	}
	return null;
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
