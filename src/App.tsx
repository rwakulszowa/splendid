import { useState, useEffect } from "react";

import initSqlJs from "sql.js";
import wasmURL from "url:sql.js/dist/sql-wasm.wasm";

import { Editor } from "./Editor";
import { Table, TableProps } from "./Table";

type DbResult = string | any;

export function App() {
  // State of the DB.
  const [dbState, setDbState] = useState<DbResult>("Loading");

  // Most recent query result.
  const [qResult, setQResult] = useState<TableProps | null>(null);

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
      <div className="flex flex-row gap-4 p-4 h-screen">
        <div
          id="editor-container"
          className="basis-1/2 w-full h-3/4 flex flex-col"
        >
          <label htmlFor="editor" className="font-light">
            Query Editor
          </label>
          <div id="query-editor" className="grow border-4 rounded">
            <Editor
              initialContent={"SELECT * FROM pets"}
              onContentUpdate={onQueryChange}
            />
          </div>
        </div>
        <div
          id="result-container"
          className="basis-1/2 w-full h-full flex flex-col"
        >
          <label htmlFor="result" className="font-light">
            Result
          </label>
          <div id="query-result" className="grow">
            <pre>
              <MaybeTable maybeTable={qResult} />
            </pre>
          </div>
        </div>
      </div>
    );
  }
}

function MaybeTable({
  maybeTable,
}: {
  maybeTable: TableProps | null | undefined;
}) {
  if (maybeTable === null || maybeTable === undefined) {
    return <p>No data</p>;
  } else {
    return <Table table={maybeTable} />;
  }
}
