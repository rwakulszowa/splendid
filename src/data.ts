export function transpose<T>(xs: T[][]): (T | null)[][] {
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

export function zip<T, U>(ts: T[], us: U[]): [T, U][] {
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
export function unifyObjects(xs: object[]): object[] {
	const emptiedXs = xs.map((x) =>
		Object.fromEntries(Object.keys(x).map((k) => [k, null])),
	);
	const prototype = Object.assign({}, ...emptiedXs);
	return xs.map((x) => ({ ...prototype, ...x }));
}

export function groupBy<K, V>(xs: V[], key: (v: V) => K): Map<K, V[]> {
	const ret: Map<K, V[]> = new Map();
	for (const x of xs) {
		const k = key(x);
		const row = ret.get(k);
		if (row) {
			row.push(x);
		} else {
			ret.set(k, [x]);
		}
	}
	return ret;
}

// Based on https://stackoverflow.com/a/43053803.
// Added a fix for singleton arguments.
export function cartesian<A>(rows: Array<Array<A>>): Array<Array<A>> {
	return rows.reduce(
		(acc: A[][], xs: A[]) => acc.flatMap((a) => xs.map((x) => [...a, x])),
		[[]],
	);
}
