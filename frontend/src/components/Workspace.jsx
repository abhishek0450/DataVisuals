import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setDatasetForWorkspace } from "../store/workspaceSlice"
import { salesByCategory } from "../data/salesByCategory"
import { salesPerformance } from "../data/salesPerformance"
import { monthlyRevenue } from "../data/monthlyRevenue"
import sampleData from "../data/sampleData"

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Brush,
    LineChart, Line,
    PieChart, Pie, Cell, ResponsiveContainer
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF3366", "#33CC99"]

const Workspace = () => {
    const dispatch = useDispatch();
    const activeWorkspace = useSelector(state => state.workspace.activeWorkspace);
    const datasetMap = useSelector(state => state.workspace.datasetMap);
    const chartMap = useSelector(state => state.workspace.chartMap);

    const selectedSource = datasetMap[activeWorkspace];
    const chartType = chartMap[activeWorkspace] || "bar";

    const [dynamicData, setDynamicData] = useState(null);
    const [loadingDataset, setLoadingDataset] = useState(false);

    // Axis selections for preview
    const [selectedXAxis, setSelectedXAxis] = useState("");
    const [selectedYAxis, setSelectedYAxis] = useState("");

    // Dashboard state
    const [savedCharts, setSavedCharts] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(false);

    // Fetch dynamic dataset if selected
    useEffect(() => {
        if (selectedSource && selectedSource.startsWith('ds_')) {
            const id = selectedSource.replace('ds_', '');
            fetchDynamicDataset(id);
        } else {
            setDynamicData(null);
        }
    }, [selectedSource]);

    // Fetch dashboard charts if NO dataset is selected
    useEffect(() => {
        if (!selectedSource && activeWorkspace) {
            fetchSavedCharts();
        }
    }, [selectedSource, activeWorkspace]);

    const fetchDynamicDataset = async (id) => {
        setLoadingDataset(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/datasets/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDynamicData(data.dataset);
                const schema = typeof data.dataset.columns_schema === 'string' ? JSON.parse(data.dataset.columns_schema) : data.dataset.columns_schema;
                const stringCol = schema.find(c => c.type === 'string' || c.type === 'date')?.key || schema[0]?.key;
                const numberCol = schema.find(c => c.type === 'number')?.key || schema[1]?.key || schema[0]?.key;
                setSelectedXAxis(stringCol || "");
                setSelectedYAxis(numberCol || "");
            }
        } catch (error) {
            console.error("Failed to fetch dynamic dataset", error);
        } finally {
            setLoadingDataset(false);
        }
    };

    const fetchSavedCharts = async () => {
        setLoadingDashboard(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/charts/workspace/${activeWorkspace}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSavedCharts(data.charts);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard charts", error);
        } finally {
            setLoadingDashboard(false);
        }
    };

    const handlePinChart = async () => {
        if (!dynamicData) return;
        try {
            const token = localStorage.getItem("token");
            const chartName = prompt("Enter a name for this pinned chart:", `${dynamicData.name} (${chartType})`);
            if (!chartName) return;

            const payload = {
                workspace_id: activeWorkspace,
                dataset_id: dynamicData.id,
                name: chartName,
                type: chartType,
                config: {
                    xAxisKey: selectedXAxis,
                    yAxisKey: selectedYAxis
                }
            };

            const res = await fetch("/api/charts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                // Clear selection to return to Dashboard view, which will automatically refetch
                dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: null }));
            } else {
                alert(data.message || "Failed to pin chart");
            }
        } catch (err) {
            console.error(err);
            alert("Error pinning chart");
        }
    };

    // ----- DASHBOARD VIEW (No Dataset Selected) -----
    if (!selectedSource) {
        return (
            <div className="flex-1 p-8 h-full overflow-y-auto bg-gray-50 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    {/* <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workspace Dashboard</h1> */}
                </div>

                {loadingDashboard ? (
                    <div className="flex items-center justify-center flex-1">
                        <h2 className="text-xl text-gray-500 animate-pulse font-medium">Loading Dashboard...</h2>
                    </div>
                ) : savedCharts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white p-16 rounded-2xl shadow-sm border border-gray-100 flex-1">
                        <div className="text-6xl mb-6 opacity-80 backdrop-blur"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">Your Dashboard is Empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md text-center text-lg leading-relaxed">
                            Start building your dashboard by uploading a dataset from the sidebar. Customize your axis mapping, and click <b>Add to Dashboard</b>.
                        </p>

                        <div className="w-full border-t border-gray-100 my-8"></div>

                        <div className="text-sm tracking-wide text-gray-400 font-semibold uppercase mb-6">Or try sample data</div>
                        <div className="flex flex-wrap gap-4 justify-center w-full max-w-2xl px-4">
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'sample' }))} className="flex-1 bg-white border border-gray-200 py-3 px-4 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md transition duration-200 hover:-translate-y-1">Sample Data</button>
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'category' }))} className="flex-1 bg-white border border-gray-200 py-3 px-4 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md transition duration-200 hover:-translate-y-1">Sales by Category</button>
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'performance' }))} className="flex-1 bg-white border border-gray-200 py-3 px-4 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md transition duration-200 hover:-translate-y-1">Sales Performance</button>
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'revenue' }))} className="flex-1 bg-white border border-gray-200 py-3 px-4 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md transition duration-200 hover:-translate-y-1">Monthly Revenue</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 pb-10">
                        {savedCharts.map(chart => {
                            const conf = typeof chart.config === 'string' ? JSON.parse(chart.config) : chart.config;
                            const type = chart.chart_type;
                            const dataRaw = typeof chart.raw_data === 'string' ? JSON.parse(chart.raw_data) : chart.raw_data;

                            return (
                                <div key={`chart-${chart.chart_id}`} className="bg-white p-6 rounded-xl  border border-gray-100 flex flex-col h-[400px] shadow-sm group">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{chart.chart_name}</h3>
                                    <div className="text-xs text-blue-500 font-medium tracking-wider uppercase mb-6 opacity-70">DATA: {chart.dataset_name}</div>
                                    <div className="flex-1 min-h-0 w-full">
                                        {/* DYNAMIC DASHBOARD CHARTS */}
                                        {type === 'bar' && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={dataRaw}>
                                                    <XAxis dataKey={conf.xAxisKey} tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Bar dataKey={conf.yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    <Brush dataKey={conf.xAxisKey} height={20} stroke="#3b82f6" fill="#f8fafc" travellerWidth={10} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                        {type === 'line' && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={dataRaw}>
                                                    <XAxis dataKey={conf.xAxisKey} tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Line type="monotone" dataKey={conf.yAxisKey} stroke="#10b981" strokeWidth={2} dot={dataRaw.length > 50 ? false : { r: 4 }} activeDot={{ r: 6 }} />
                                                    <Brush dataKey={conf.xAxisKey} height={20} stroke="#10b981" fill="#f8fafc" travellerWidth={10} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                        {type === 'pie' && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={dataRaw} dataKey={conf.yAxisKey} nameKey={conf.xAxisKey} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} label>
                                                        {dataRaw.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ----- PREVIEW VIEW (Dataset is Selected) -----
    if (loadingDataset) {
        return <div className="flex-1 p-10 flex items-center justify-center"><h2 className="text-xl text-gray-600 animate-pulse">Loading preview...</h2></div>;
    }

    const getWorkspaceConfig = () => {
        if (dynamicData) {
            const dataRows = typeof dynamicData.raw_data === 'string' ? JSON.parse(dynamicData.raw_data) : dynamicData.raw_data;
            return {
                data: dataRows,
                xAxisKey: selectedXAxis,
                yAxisKey: selectedYAxis, // Renaming barKey/lineKey/pieKey to unified yAxisKey
                title: dynamicData.name
            };
        }

        switch (selectedSource) {
            case 'category':
                return { data: salesByCategory, xAxisKey: "category", yAxisKey: "sales", title: "Sales By Category (Template)" };
            case 'performance':
                return { data: salesPerformance, xAxisKey: "month", yAxisKey: "sales", title: "Sales Performance (Template)" };
            case 'revenue':
                return { data: monthlyRevenue, xAxisKey: "month", yAxisKey: "revenue", title: "Monthly Revenue (Template)" };
            case 'sample':
            default:
                return { data: sampleData, xAxisKey: "month", yAxisKey: "sales", title: "Sample Data (Template)" };
        }
    };

    const config = getWorkspaceConfig();

    return (
        <div className="flex-1 p-8 h-full flex flex-col bg-gray-50/50">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: null }))}
                        className="px-4 py-2 bg-white text-gray-600 font-semibold rounded-xl hover:bg-gray-100 hover:text-gray-900 transition flex items-center gap-2 border border-gray-200 outline-none"
                    >
                        <span>Back </span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 ml-2">Previewing: <span className="text-blue-600 font-medium">{config.title}</span></h1>
                </div>

                {dynamicData && selectedXAxis && selectedYAxis && (
                    <button
                        onClick={handlePinChart}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:-translate-y-[1px] active:translate-y-[1px] shadow-md flex items-center gap-2"
                    >
                        Add to Dashboard
                    </button>
                )}
            </div>

            {dynamicData && (
                <div className="flex items-center gap-6 mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">X-Axis</label>
                        <select
                            value={selectedXAxis}
                            onChange={e => setSelectedXAxis(e.target.value)}
                            className="border-b-2 border-transparent hover:border-blue-300 py-1 font-semibold text-gray-800 text-sm focus:border-blue-600 outline-none transition bg-transparent cursor-pointer"
                        >
                            {(typeof dynamicData.columns_schema === 'string' ? JSON.parse(dynamicData.columns_schema) : dynamicData.columns_schema).map(col => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">Y-Axis</label>
                        <select
                            value={selectedYAxis}
                            onChange={e => setSelectedYAxis(e.target.value)}
                            className="border-b-2 border-transparent hover:border-blue-300 py-1 font-semibold text-gray-800 text-sm focus:border-blue-600 outline-none transition bg-transparent cursor-pointer"
                        >
                            {(typeof dynamicData.columns_schema === 'string' ? JSON.parse(dynamicData.columns_schema) : dynamicData.columns_schema).map(col => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                {chartType === "bar" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={config.data}>
                            <XAxis dataKey={config.xAxisKey} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey={config.yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Brush dataKey={config.xAxisKey} height={25} stroke="#3b82f6" fill="#f8fafc" travellerWidth={12} />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {chartType === "line" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={config.data}>
                            <XAxis dataKey={config.xAxisKey} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey={config.yAxisKey} stroke="#10b981" strokeWidth={2} dot={config.data?.length > 50 ? false : { r: 4 }} activeDot={{ r: 6 }} />
                            <Brush dataKey={config.xAxisKey} height={25} stroke="#10b981" fill="#f8fafc" travellerWidth={12} />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {chartType === "pie" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={config.data}
                                dataKey={config.yAxisKey}
                                nameKey={config.xAxisKey}
                                cx="50%"
                                cy="50%"
                                innerRadius="50%"
                                outerRadius="80%"
                                paddingAngle={2}
                                label
                            >
                                {config.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default Workspace;