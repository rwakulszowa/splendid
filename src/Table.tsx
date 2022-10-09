// Result table type, as returned from Sql.js.
export type TableProps = { columns: [string]; values: [[string]] };

export function Table({ table }: { table: TableProps }) {
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
