import { guess } from "./src/schema.ts";

const data = [
	[1, 2],
	[3, 4, 5],
];
console.log(data, guess(data));
