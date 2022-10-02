import { useState, useEffect } from "react";

import initSqlJs from "sql.js";
import wasmURL from "url:sql.js/dist/sql-wasm.wasm";

type DbResult = string | SQL.Database;

export function App() {
  const [dbResult, setDbResult] = useState<DbResult>("Loading");

  useEffect(() => {
    async function connectDb() {
      try {
        const SQL = await initSqlJs({ locateFile: () => wasmURL });
        setDbResult(new SQL.Database());
      } catch (err) {
        setDbResult(err);
      }
    }
    connectDb();
  }, []);

  if (typeof dbResult === "string") {
    const error = dbResult;
    return <pre>{error.toString()}</pre>;
  } else {
    const db = dbResult;
    db.run(`
        CREATE TABLE pets (name string, size int);
        INSERT INTO pets VALUES ("Azor", 15), ("Bonifacy", 5);
      `);

    const result = db.exec("SELECT * FROM pets");
    return (
      <pre>
        <ResultsTable table={result[0]} />
      </pre>
    );
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
        {
          values.map((row, i) => (
            <tr key={i}>
              {row.map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}
