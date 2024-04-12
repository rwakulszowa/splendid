import { guess } from "./src/schema.ts";

async function readStdIn(): Promise<unknown> {
	return await Bun.stdin.json();
}

async function main() {
	const input = await readStdIn();
	if (!Array.isArray(input)) {
		throw new Error("Input must be an array.");
	}
	for (const schema of guess(input)) {
		console.log(schema.toString());
	}
}

await main();
