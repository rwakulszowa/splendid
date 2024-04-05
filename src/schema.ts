abstract class Schema {}

class NumberSchema extends Schema {}

class TextSchema extends Schema {}

class ContainerSchema extends Schema {
	constructor(public readonly item: Schema) {
		super();
	}
}

// @ts-ignore
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
	if (input.length === 0) {
		throw new Error("Cannot guess from an empty input.");
	}
	const jsTypes = new Set(input.map(jsType));
	if (jsTypes.size !== 1) {
		// FIXME: handle by grouping and adding a SumSchema.
		throw new Error(`Non uniform types found. types=${jsTypes}`);
	}

	const jsType_: JsType = jsTypes.values().next().value;
	switch (jsType_) {
		case "number":
			return [new NumberSchema()];
		case "string":
			return [new TextSchema()];
		case "object":
			throw new Error("Objects are not yet supported.");
		case "array": {
			const itemType = guess(input.flat());
			// TODO: handle tuples as well.
			return [new ContainerSchema(itemType)];
		}
	}
}

type JsType = "number" | "string" | "array" | "object";

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
	throw new Error(`Cannot infer JS type. x=${x}`);
}
