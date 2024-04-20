import { describe, expect, test } from "bun:test";
import { guess } from "./schema";

describe("guess", () => {
	test("[1, 2, 3]", () => {
		const guessed = guess([1, 2, 3]).map((x) => x.toString());
		expect(guessed).toContain("Number");
	});
	test('[{"x": [1, 2], "y": [3, 4]}]', () => {
		const guessed = guess([{ x: [1, 2], y: [3, 4] }]).map((x) => x.toString());
		expect(guessed).toContain("{[Text(_)]: {[Number]: Number}}");
	});
});
