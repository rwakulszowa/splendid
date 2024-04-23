import { expect, test } from "bun:test";
import { cartesian, transpose } from "./data";

test("transpose([[1, 2], [3]])", () => {
	expect(transpose([[1, 2], [3]])).toEqual([
		[1, 3],
		[2, null],
	]);
});

test("cartesian([[1, 2], [3], [4, 5]])", () => {
	expect(cartesian([[1, 2], [3], [4, 5]])).toEqual([
		[1, 3, 4],
		[1, 3, 5],
		[2, 3, 4],
		[2, 3, 5],
	]);
});
