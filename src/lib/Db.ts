import initSqlJs from "sql.js";
import wasmURL from "url:sql.js/dist/sql-wasm.wasm";

/**
 * Type of the SqlJs object.
 */
export type SqlDb = any;

/**
 * Sql native types.
 */
export type DbColumnType = "string" | "int";

/**
 * Error raised on failed DB initialization
 */
export class DbBuildError {
  constructor(private readonly message: string) {}
}

/**
 * Entrypoint to the database.
 */
export class Db {
  constructor(private readonly db: SqlDb) {}

  static async build(): Db | DbBuildError {
    try {
      const SQL = await initSqlJs({ locateFile: () => wasmURL });
      const db = new SQL.Database();
      return new Db(db);
    } catch (err) {
      return new DbBuildError(err);
    }
  }

  /**
   * Schemas of all known tables.
   */
  schemas(): Map<string, Map<string, DbColumnType>> {
    const query = "select sql from sqlite_schema;";
    const result = this.db.exec(query)[0];
    // TODO: actually parse the result and convert it to a map.
    return result;
  }

  /**
   * Execute a user provided read-only query.
   */
  exec(query: string): unknown {
    return this.db.exec(query)[0];
  }
}
