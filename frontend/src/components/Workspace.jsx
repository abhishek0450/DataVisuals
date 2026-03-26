import { useSelector, useDispatch } from "react-redux"
import { setDatasetForWorkspace } from "../store/workspaceSlice"
import { salesByCategory } from "../data/salesByCategory"
import { salesPerformance } from "../data/salesPerformance"
import { monthlyRevenue } from "../data/monthlyRevenue"
import sampleData from "../data/sampleData"

import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line,
    PieChart, Pie, Cell
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

const Workspace = () => {
    const dispatch = useDispatch();
    const activeWorkspace = useSelector(state => state.workspace.activeWorkspace);
    const datasetMap = useSelector(state => state.workspace.datasetMap);
    const chartMap = useSelector(state => state.workspace.chartMap);

    const selectedSource = datasetMap[activeWorkspace];
    const chartType = chartMap[activeWorkspace] || "bar";

    if (!selectedSource) {
        return (
            <div className="flex-1 p-10 flex flex-col items-center justify-center min-h-[500px]">
                <h2 className="text-2xl mb-6">Select Data Source</h2>
                <div className="flex flex-wrap gap-4 justify-center">
                    <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'sample'}))} className="bg-white border-1 p-2 cursor-pointer hover:bg-gray-50">Sample Data</button>
                    <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'category'}))} className="bg-white border-1 p-2 cursor-pointer hover:bg-gray-50">Sales by Category</button>
                    <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'performance'}))} className="bg-white border-1 p-2 cursor-pointer hover:bg-gray-50">Sales Performance</button>
                    <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'revenue'}))} className="bg-white border-1 p-2 cursor-pointer hover:bg-gray-50">Monthly Revenue</button>
                </div>
            </div>
        )
    }

    const getWorkspaceConfig = () => {
        switch (selectedSource) {
            case 'category':
                return { data: salesByCategory, xAxisKey: "category", barKey: "sales", lineKey: "sales", pieKey: "sales", pieName: "category", title: "Sales By Category" };
            case 'performance':
                return { data: salesPerformance, xAxisKey: "month", barKey: "sales", lineKey: "profit", pieKey: "profit", pieName: "month", title: "Sales Performance" };
            case 'revenue':
                return { data: monthlyRevenue, xAxisKey: "month", barKey: "revenue", lineKey: "revenue", pieKey: "revenue", pieName: "month", title: "Monthly Revenue" };
            case 'sample':
            default:
                return { data: sampleData, xAxisKey: "month", barKey: "sales", lineKey: "users", pieKey: "sales", pieName: "month", title: "Sample Data" };
        }
    };

    const config = getWorkspaceConfig();

    return (
        <div className="flex-1 p-10">
            <h1 className="text-2xl font-bold mb-6">Workspace Data: {config.title}</h1>

            {chartType === "bar" && (
                <BarChart style={{ width: '100%', height: '50%' }} responsive data={config.data} >
                    <XAxis dataKey={config.xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={config.barKey} fill="#8884d8" />
                </BarChart>
            )}

            {chartType === "line" && (
                <LineChart style={{ width: '100%', height: '50%' }} responsive data={config.data}>
                    <XAxis dataKey={config.xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey={config.lineKey} stroke="#82ca9d" />
                </LineChart>
            )}

            {chartType === "pie" && (
                <PieChart style={{ width: '100%', height: '50%' }} responsive>
                    <Pie
                        data={config.data}
                        dataKey={config.pieKey}
                        nameKey={config.pieName}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                    >
                        {config.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            )}
        </div>
    )
}

export default Workspace;