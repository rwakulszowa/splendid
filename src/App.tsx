import { useState, useEffect } from "react";

import { DashboardProps, Dashboard } from "./Dashboard";
import { Db, DbBuildError } from "./lib/Db";
import { TableProps } from "./Table";
import { withSpinner } from "./withSpinner";

export function App() {
  // State of the DB.
  const [dbState, setDbState] = useState<Db | DbBuildError | null>(null);

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
        setDbState(dbResult);
      }
    }
    connectDb();
  }, []);

  const props = dbState
    ? dbState instanceof DbBuildError
      ? dbState
      : {
          db: dbState,
          onQueryChange: (query: string) => {
            try {
              const result = dbState.exec(query) as TableProps;
              setQResult(result);
            } catch (e) {
              console.error(e);
            }
          },
          mostRecentQueryResult: qResult,
        }
    : null;
  return DashboardOrErrorWithSpinner(props);
}

const DashboardOrError = (props: DashboardProps | DbBuildError) =>
  !(props instanceof DbBuildError) ? <Dashboard {...props} /> : <ErrorScreen />;

const DashboardOrErrorWithSpinner = withSpinner(DashboardOrError);

const ErrorScreen = () => <p>Failed to initialize the database.</p>;
