// Result table type, as returned from Sql.js.
export type TableProps = { columns: [string]; values: [[string]] };

export function Table({ table }: { table: TableProps }) {
  const { columns, values } = table;
  return (
    <table className="table-auto w-full">
      <thead className="uppercase bg-zinc-50">
        <tr className="">
          {columns.map((columnName, i) => (
            <td key={i} className="p-3">
              {columnName}
            </td>
          ))}
        </tr>
      </thead>

      <tbody>
        {values.map((row, i) => (
          <tr key={i} className="border-b">
            {row.map((value, i) => (
              <td key={i} className="py-3 px-5">
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
