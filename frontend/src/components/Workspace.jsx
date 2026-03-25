import sampleData from "../data/sampleData"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line,
    PieChart, Pie, Cell
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const Workspace = ({ chartType }) => {
    return (
        <div className="flex-1 p-10">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {chartType === "bar" && (
                <BarChart width={500} height={300} data={sampleData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
            )}

            {chartType === "line" && (
                <LineChart width={500} height={300} data={sampleData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                </LineChart>
            )}

            {chartType === "pie" && (
                <PieChart width={400} height={400}>
                    <Pie
                        data={sampleData}
                        dataKey="sales"
                        nameKey="month"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                    >
                        {sampleData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            )}
        </div>
    )
}

export default Workspace