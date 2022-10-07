import { useState, useEffect } from "react";

import initSqlJs from "sql.js";
import wasmURL from "url:sql.js/dist/sql-wasm.wasm";

import { Editor } from "./Editor";

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

    // const result = db.exec("SELECT * FROM pets");
    return (
      <div>
        <Editor
          initialContent={"SELECT * FROM pets"}
          onContentUpdate={onQueryChange}
        />
        <pre>
          <MaybeResultsTable maybeTable={qResult} />
        </pre>
      </div>
    );
  }
}

function MaybeResultsTable({ maybeTable }) {
  if (maybeTable === null) {
    return <p>No data</p>;
  } else {
    return <ResultsTable table={maybeTable} />;
  }
}

function ResultsTable({ table }) {
  const { columns, values } = table;
  return (
    <table>
      <thead>
        <tr>
          {columns.map((columnName, i) => (
            <td key={i}>{columnName}</td>
          ))}
        </tr>
      </thead>

      <tbody>
        {values.map((row, i) => (
          <tr key={i}>
            {row.map((value, i) => (
              <td key={i}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
