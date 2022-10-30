import { useState, useEffect } from "react";

import initSqlJs from "sql.js";
import wasmURL from "url:sql.js/dist/sql-wasm.wasm";

import { Db, DbBuildError } from "./lib/Db";
import { Editor } from "./Editor";
import { Table, TableProps } from "./Table";
import { Viz } from "./Viz";

type DbResult = Db | string;

export function App() {
  // State of the DB.
  const [dbState, setDbState] = useState<DbResult>("Loading");

  // Most recent query result.
  const [qResult, setQResult] = useState<TableProps | null>(null);

  useEffect(() => {
    async function connectDb() {
      const dbResult = await Db.build();
      if (dbResult instanceof Db) {
        const db = dbResult;
        db.exec("CREATE TABLE pets (name string, size int);");
        db.exec(`INSERT INTO pets VALUES ("Azor", 15), ("Bonifacy", 5);`);
        setDbState(db);
      } else {
        setDbState(dbResult.toString());
      }
    }
    connectDb();
  }, []);

  if (!(dbState instanceof Db)) {
    const error = dbState;
    return <pre>{error.toString()}</pre>;
  } else {
    const db = dbState;

    const onQueryChange = (query: string) => {
      try {
        const result = db.exec(query);
        setQResult(result);
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-4 p-4 h-screen w-full">
        <div
          id="editor-container"
          className="col-span-1 row-span-2 w-full h-3/4 flex flex-col"
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
          className="col-span-1 col-start-2 row-span-1 w-full h-full flex flex-col"
        >
          <label htmlFor="query-result" className="font-light">
            Result
          </label>
          <div id="query-result" className="grow">
            <pre>
              <MaybeTable maybeTable={qResult} />
            </pre>
          </div>
        </div>
        <div
          id="viz-container"
          className="col-span-1 col-start-2 row-span-1 row-start-2 w-full h-full flex flex-col"
        >
          <label htmlFor="query-viz" className="font-light">
            Result Visualization
          </label>
          <div id="query-viz" className="grow">
            <Viz />
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
