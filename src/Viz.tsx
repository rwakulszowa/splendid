import {
  AreaChart,
  Area,
  LineChart,
  ReferenceLine,
  Line,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export type VizParams = {};

const data = [
  { name: "A", x: 10, y: 1 },
  { name: "B", x: 11, y: 4 },
  { name: "C", x: 12, y: 9 },
];
export function Viz({}: VizParams) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="x" stroke="#8884d8" />
        <Line type="monotone" dataKey="y" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
