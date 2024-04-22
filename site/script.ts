import * as schema from "../src/schema";

declare let window: { [key: string]: unknown };

window['handleInput'] = function handleInput(input: string): string {
	return schema
		.guess([JSON.parse(input)])
		.map((x) => x.toString())
		.join("\n");
};
