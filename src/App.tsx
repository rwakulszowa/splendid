import { useState, useEffect } from "react";

import initSqlJs from "sql.js";
import wasmURL from "url:sql.js/dist/sql-wasm.wasm";

import { Editor } from "./Editor";
import { Table } from "./Table";

type DbResult = string | SQL.Database;
type Table = { columns: [string]; values: [string] };

export function App() {
  // State of the DB.
  const [dbState, setDbState] = useState<DbResult>("Loading");

  // Most recent query result.
  const [qResult, setQResult] = useState<Table | null>(null);

  useEffect(() => {
    async function connectDb() {
      try {
        const SQL = await initSqlJs({ locateFile: () => wasmURL });
        const db = new SQL.Database();

        // Insert some initial data.
        db.run(`
          CREATE TABLE pets (name string, size int);
          INSERT INTO pets VALUES ("Azor", 15), ("Bonifacy", 5);
        `);

        setDbState(db);
      } catch (err) {
        setDbState(err);
      }
    }
    connectDb();
  }, []);

  if (typeof dbState === "string") {
    const error = dbState;
    return <pre>{error.toString()}</pre>;
  } else {
    const db = dbState;

    const onQueryChange = (query: string) => {
      try {
        const result = db.exec(query)[0];
        setQResult(result);
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <div>
        <Editor
          initialContent={"SELECT * FROM pets"}
          onContentUpdate={onQueryChange}
        />
        <pre>
          <MaybeTable maybeTable={qResult} />
        </pre>
      </div>
    );
  }
}

function MaybeTable({ maybeTable }) {
  if (maybeTable === null || maybeTable === undefined) {
    return <p>No data</p>;
  } else {
    return <Table table={maybeTable} />;
  }
}
