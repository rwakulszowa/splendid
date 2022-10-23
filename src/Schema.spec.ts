import { DataOfSchema, transpose } from "./Schema";

describe("DataOfSchema", () => {
  describe("parse", () => {
    it("valid input", () => {
      const schema = { a: "String" as const, b: "Number" as const };
      const data = { a: ["abc", "def", "ghi"], b: ["1", "2", "3"] };
      const parsed = DataOfSchema.parse(data, schema);
      expect(parsed.data).toEqual([
        { a: "abc", b: 1 },
        { a: "def", b: 2 },
        { a: "ghi", b: 3 },
      ]);
    });
  });
});

describe("transpose", () => {
  it("valid input", () => {
    const data = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(transpose(data)).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });
});
