import { Editor } from "./Editor";
import { Table, TableProps } from "./Table";
import { Viz } from "./Viz";
import { Db } from "./lib/Db";

export type DashboardProps = {
  db: Db;
  onQueryChange: (query: string) => void;
  mostRecentQueryResult: TableProps | null;
};

export const Dashboard = ({
  db,
  onQueryChange,
  mostRecentQueryResult,
}: DashboardProps) => (
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
          {mostRecentQueryResult ? (
            <Table table={mostRecentQueryResult} />
          ) : (
            <p>No data</p>
          )}
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
