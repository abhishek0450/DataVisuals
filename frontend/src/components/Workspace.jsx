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
            <div className="scroll-soft flex h-full flex-1 flex-col overflow-y-auto p-7 md:p-8">
                <div className="mb-8 flex items-center justify-between">
                    {/* <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workspace Dashboard</h1> */}
                </div>

                {loadingDashboard ? (
                    <div className="flex flex-1 items-center justify-center">
                        <h2 className="animate-pulse text-xl font-semibold text-slate-500">Loading Dashboard...</h2>
                    </div>
                ) : savedCharts.length === 0 ? (
                    <div className="soft-card flex flex-1 flex-col items-center justify-center p-12 md:p-16">
                        <div className="text-6xl mb-6 opacity-80 backdrop-blur"></div>
                        <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">Your Dashboard is Empty</h2>
                        <p className="mb-8 max-w-md text-center text-base leading-relaxed text-slate-600 md:text-lg">
                            Start building your dashboard by uploading a dataset from the sidebar. Customize your axis mapping, and click <b>Add to Dashboard</b>.
                        </p>

                        <div className="my-8 w-full border-t-2 border-[#d8cab4]"></div>

                        <div className="mb-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Or try sample data</div>
                        <div className="flex flex-wrap gap-4 justify-center w-full max-w-2xl px-4">
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'sample' }))} className="flex-1 border border-[#c9b9a2] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-1 hover:bg-[#f5eee3] hover:shadow-md">Sample Data</button>
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'category' }))} className="flex-1 border border-[#c9b9a2] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-1 hover:bg-[#f5eee3] hover:shadow-md">Sales by Category</button>
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'performance' }))} className="flex-1 border border-[#c9b9a2] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-1 hover:bg-[#f5eee3] hover:shadow-md">Sales Performance</button>
                            <button onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'revenue' }))} className="flex-1 border border-[#c9b9a2] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-1 hover:bg-[#f5eee3] hover:shadow-md">Monthly Revenue</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-2">
                        {savedCharts.map(chart => {
                            const conf = typeof chart.config === 'string' ? JSON.parse(chart.config) : chart.config;
                            const type = chart.chart_type;
                            const dataRaw = typeof chart.raw_data === 'string' ? JSON.parse(chart.raw_data) : chart.raw_data;

                            return (
                                <div key={`chart-${chart.chart_id}`} className="soft-card group flex h-[390px] flex-col p-6">
                                    <h3 className="mb-2 truncate text-xl font-bold text-slate-900" title={chart.chart_name}>{chart.chart_name}</h3>
                                    <div className="mb-6 text-xs font-semibold uppercase tracking-wider text-blue-700/80">Data: {chart.dataset_name}</div>
                                    <div className="flex-1 min-h-0 w-full">
                                        {/* DYNAMIC DASHBOARD CHARTS */}
                                        {type === 'bar' && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={dataRaw}>
                                                    <XAxis dataKey={conf.xAxisKey} tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip cursor={{ fill: '#f2f6fc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #d8e2f1', boxShadow: '0 14px 24px -18px rgb(0 0 0 / 0.35)' }} />
                                                    <Bar dataKey={conf.yAxisKey} fill="#185adb" radius={[4, 4, 0, 0]} />
                                                    <Brush dataKey={conf.xAxisKey} height={20} stroke="#185adb" fill="#f3f6fc" travellerWidth={10} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                        {type === 'line' && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={dataRaw}>
                                                    <XAxis dataKey={conf.xAxisKey} tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d8e2f1', boxShadow: '0 14px 24px -18px rgb(0 0 0 / 0.35)' }} />
                                                    <Line type="monotone" dataKey={conf.yAxisKey} stroke="#0aa5a1" strokeWidth={2.5} dot={dataRaw.length > 50 ? false : { r: 4 }} activeDot={{ r: 6 }} />
                                                    <Brush dataKey={conf.xAxisKey} height={20} stroke="#0aa5a1" fill="#f3f6fc" travellerWidth={10} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                        {type === 'pie' && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={dataRaw} dataKey={conf.yAxisKey} nameKey={conf.xAxisKey} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} label>
                                                        {dataRaw.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d8e2f1', boxShadow: '0 14px 24px -18px rgb(0 0 0 / 0.35)' }} />
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
        return <div className="flex flex-1 items-center justify-center p-10"><h2 className="text-xl text-slate-600 animate-pulse">Loading preview...</h2></div>;
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
        <div className="scroll-soft flex h-full flex-1 flex-col overflow-y-auto p-7 md:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: null }))}
                        className="flex items-center gap-2 border border-[#c9b9a2] bg-[#fffdf8] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#f5eee3] hover:text-slate-900"
                    >
                        <span>Back </span>
                    </button>
                    <h1 className="ml-2 text-2xl font-bold text-slate-900">Previewing: <span className="font-semibold text-blue-700">{config.title}</span></h1>
                </div>

                {dynamicData && selectedXAxis && selectedYAxis && (
                    <button
                        onClick={handlePinChart}
                        className="brand-button flex items-center gap-2 px-6 py-2.5 font-bold shadow-md transition hover:-translate-y-[1px] hover:shadow-lg active:translate-y-[1px]"
                    >
                        Add to Dashboard
                    </button>
                )}
            </div>

            {dynamicData && (
                <div className="soft-card mb-6 flex flex-wrap items-center gap-4 p-5 md:gap-6">
                    <div className="flex items-center gap-3">
                        <label className="bg-[#f5eee3] px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-500">X-Axis</label>
                        <select
                            value={selectedXAxis}
                            onChange={e => setSelectedXAxis(e.target.value)}
                            className="cursor-pointer border-b-2 border-transparent bg-transparent py-1 text-sm font-semibold text-slate-800 transition hover:border-blue-300 focus:border-blue-600 focus:outline-none"
                        >
                            {(typeof dynamicData.columns_schema === 'string' ? JSON.parse(dynamicData.columns_schema) : dynamicData.columns_schema).map(col => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="hidden h-6 w-px bg-slate-200 md:block"></div>

                    <div className="flex items-center gap-3">
                        <label className="bg-[#f5eee3] px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-500">Y-Axis</label>
                        <select
                            value={selectedYAxis}
                            onChange={e => setSelectedYAxis(e.target.value)}
                            className="cursor-pointer border-b-2 border-transparent bg-transparent py-1 text-sm font-semibold text-slate-800 transition hover:border-blue-300 focus:border-blue-600 focus:outline-none"
                        >
                            {(typeof dynamicData.columns_schema === 'string' ? JSON.parse(dynamicData.columns_schema) : dynamicData.columns_schema).map(col => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="soft-card min-h-0 flex-1 p-6">
                {chartType === "bar" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={config.data}>
                            <XAxis dataKey={config.xAxisKey} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f2f6fc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #d8e2f1', boxShadow: '0 14px 24px -18px rgb(0 0 0 / 0.35)' }} />
                            <Bar dataKey={config.yAxisKey} fill="#185adb" radius={[4, 4, 0, 0]} />
                            <Brush dataKey={config.xAxisKey} height={25} stroke="#185adb" fill="#f3f6fc" travellerWidth={12} />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {chartType === "line" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={config.data}>
                            <XAxis dataKey={config.xAxisKey} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d8e2f1', boxShadow: '0 14px 24px -18px rgb(0 0 0 / 0.35)' }} />
                            <Line type="monotone" dataKey={config.yAxisKey} stroke="#0aa5a1" strokeWidth={2.5} dot={config.data?.length > 50 ? false : { r: 4 }} activeDot={{ r: 6 }} />
                            <Brush dataKey={config.xAxisKey} height={25} stroke="#0aa5a1" fill="#f3f6fc" travellerWidth={12} />
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
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d8e2f1', boxShadow: '0 14px 24px -18px rgb(0 0 0 / 0.35)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default Workspace;