import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDatasetForWorkspace } from "../store/workspaceSlice";

const Sidebar = ({ setChartType, activeWorkspace, setActiveWorkspace }) => {
    const dispatch = useDispatch();
    const [workspaces, setWorkspaces] = useState([]);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [showInput, setShowInput] = useState(false);

    const [datasets, setDatasets] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const activeDataset = useSelector(state => state.workspace.datasetMap[activeWorkspace]);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (activeWorkspace) {
            fetchDatasets();
        } else {
            setDatasets([]);
        }
    }, [activeWorkspace]);

    const fetchWorkspaces = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/workspaces", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data && Array.isArray(data)) {
                setWorkspaces(data);

                // ── Stale-user guard ──────────────────────────────────────────
                // The server always returns workspaces owned by the current user.
                // If Redux still holds a workspace ID that isn't in this list,
                // it means a previous user's state was never cleared on logout.
                // Forcing a reload destroys the Redux store and rebuilds it clean.
                if (activeWorkspace) {
                    const currentUserWorkspaceIds = data.map(ws => ws.id);
                    const isStaleWorkspace = !currentUserWorkspaceIds.includes(activeWorkspace);
                    if (isStaleWorkspace) {
                        window.location.reload();
                        return; // stop further execution while reload is pending
                    }
                }
                //---------------------------------
                if (data.length > 0 && !activeWorkspace) {
                    setActiveWorkspace(data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        }
    };

    const handleCreateWorkspace = async () => {
        if (!newWorkspaceName.trim()) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/workspaces", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newWorkspaceName })
            });
            const data = await res.json();
            if (data.id) {
                setWorkspaces([...workspaces, data]);
                setActiveWorkspace(data.id);
                setNewWorkspaceName("");
                setShowInput(false);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteWorkspace = async (id) => {
        if (!confirm("delete this workspace?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/workspaces/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const newWorkspaces = workspaces.filter(ws => ws.id !== id);
                setWorkspaces(newWorkspaces);
                if (activeWorkspace === id) {
                    setActiveWorkspace(newWorkspaces.length > 0 ? newWorkspaces[0].id : null);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchDatasets = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/datasets/workspace/${activeWorkspace}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDatasets(data.datasets);
            }
        } catch (error) {
            console.error("Failed to fetch datasets", error);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeWorkspace) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspace_id", activeWorkspace);

        setIsUploading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/datasets/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setDatasets([...datasets, data.dataset]);
                dispatch(setDatasetForWorkspace({
                    workspaceId: activeWorkspace,
                    datasetName: `ds_${data.dataset.id}`
                }));
            } else {
                alert(data.message || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteDataset = async (e, datasetId) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this dataset? This will also permanently remove any pinned charts using this dataset from your dashboard.")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/datasets/${datasetId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDatasets(datasets.filter(d => d.id !== datasetId));
                if (activeDataset === `ds_${datasetId}`) {
                    dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: null }));
                }
            } else {
                alert(data.message || "Failed to delete dataset");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <aside className="soft-card panel-tint flex h-full w-72 flex-col gap-3 p-3 text-slate-800">
            <div className="border-l-4 border-[#0e6758] pl-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Control Center</div>

            <section className="soft-card flex max-h-56 min-h-36 shrink-0 flex-col p-3">
                <h2 className="mb-2 text-lg font-bold tracking-tight">Workspaces</h2>
                <div className="scroll-soft min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {workspaces.map(ws => (
                        <div key={ws.id} className="flex justify-between gap-1.5">
                            <button
                                onClick={() => setActiveWorkspace(ws.id)}
                                className={`w-full border px-3 py-2 text-left text-sm font-semibold transition ${activeWorkspace === ws.id ? 'border-teal-900 bg-teal-700 text-white' : 'border-[#d4c5af] bg-[#f5eee3] text-slate-700 hover:bg-[#eee4d4]'}`}
                            >
                                {ws.name}
                            </button>
                            <button onClick={() => handleDeleteWorkspace(ws.id)} className="border border-red-300 bg-red-100 px-2.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200">X</button>
                        </div>
                    ))}
                    {workspaces.length === 0 && !showInput && (
                        <p className="text-sm text-slate-500">No workspaces yet.</p>
                    )}
                </div>
                {showInput ? (
                    <div className="mt-4 flex flex-col gap-2">
                        <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Workspace Name"
                            className="border border-[#c9b9a2] bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCreateWorkspace} className="border-2 border-teal-900 bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-800">Save</button>
                            <button onClick={() => setShowInput(false)} className="border border-[#c9b9a2] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f6f1e7]">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowInput(true)} className="mt-3 w-full border border-[#c9b9a2] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f6f1e7]">
                        + New Workspace
                    </button>
                )}
            </section>

            <section className="soft-card flex min-h-0 flex-1 flex-col p-3">
                <h2 className="mb-2 text-lg font-bold tracking-tight">Datasets</h2>
                <div className="scroll-soft mb-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {datasets.map(ds => {
                        const isSelected = activeDataset === `ds_${ds.id}`;
                        return (
                            <div key={`ds-${ds.id}`} className="group flex gap-1.5">
                                <button
                                    onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: `ds_${ds.id}` }))}
                                    className={`w-full flex-1 truncate border px-3 py-2 text-left text-sm font-semibold transition ${isSelected ? 'border-teal-900 bg-teal-700 text-white' : 'border-[#d4c5af] bg-[#f5eee3] text-slate-700 hover:bg-[#eee4d4]'}`}
                                    title={ds.name}
                                >
                                    {ds.name}
                                </button>
                                <button
                                    onClick={(e) => handleDeleteDataset(e, ds.id)}
                                    className="border border-red-300 bg-red-100 px-2.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200"
                                    title="Delete Dataset"
                                >
                                    X
                                </button>
                            </div>
                        );
                    })}
                    {datasets.length === 0 && (
                        <p className="text-sm text-slate-500">No datasets uploaded for this workspace.</p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".csv, .xlsx" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!activeWorkspace || isUploading}
                        className={`w-full border-2 border-[#1b2735] bg-[#0d1f36] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#162945] ${(!activeWorkspace || isUploading) && 'cursor-not-allowed opacity-50'}`}
                    >
                        {isUploading ? "Uploading..." : "Upload File (.csv/xlsx)"}
                    </button>
                </div>
            </section>

            <section className="soft-card shrink-0 p-3">
                <h2 className="mb-2 text-lg font-bold tracking-tight">Charts</h2>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setChartType("bar")}
                        className="border border-[#d4c5af] bg-[#f5eee3] px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#eee4d4]"
                    >
                        Bar Chart
                    </button>
                    <button
                        onClick={() => setChartType("line")}
                        className="border border-[#d4c5af] bg-[#f5eee3] px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#eee4d4]"
                    >
                        Line Chart
                    </button>
                    <button
                        onClick={() => setChartType("pie")}
                        className="border border-[#d4c5af] bg-[#f5eee3] px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#eee4d4]"
                    >
                        Pie Chart
                    </button>
                </div>
            </section>
        </aside>
    )
}

export default Sidebar;