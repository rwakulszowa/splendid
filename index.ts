const BASE_PATH = "./site";

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		let path = new URL(req.url).pathname;
		if (path === "/") {
			path = "/index.html";
		}
		if (path === "/script.js") {
			const result = await Bun.build({
				entrypoints: ["./site/script.ts"],
			});
			if (!result.success) {
				throw new Error(`Bundling failed: ${result.logs}`);
			}
			const [script] = result.outputs;
			return new Response(script);
		}
		const file = Bun.file(BASE_PATH + path);
		return new Response(file);
	},
	error(err) {
		return new Response(err.message, { status: 404 });
	},
});
console.log("Listening: ", server.url.href);
