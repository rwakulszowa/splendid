import { guess } from "./src/schema.ts";

const data = [
	{ x: [1, 2], y: [3] },
	{ a: [1, 2, 3], b: [] },
];
console.log(data, guess(data));
