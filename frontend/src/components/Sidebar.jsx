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

                // // ── Stale-user guard ──────────────────────────────────────────
                // // The server always returns workspaces owned by the current user.
                // // If Redux still holds a workspace ID that isn't in this list,
                // // it means a previous user's state was never cleared on logout.
                // // Forcing a reload destroys the Redux store and rebuilds it clean.
                // if (activeWorkspace) {
                //     const currentUserWorkspaceIds = data.map(ws => ws.id);
                //     const isStaleWorkspace = !currentUserWorkspaceIds.includes(activeWorkspace);
                //     if (isStaleWorkspace) {
                //         window.location.reload();
                //         return; // stop further execution while reload is pending
                //     }
                // }
                // // ─────────────────────────────────────────────────────────────

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
        <div className="w-64 bg-gray-800 text-white p-5 h-full flex flex-col">
            <div >
                <h2 className="text-xl font-bold mb-4">Workspaces</h2>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {workspaces.map(ws => (
                        <div key={ws.id} className="flex gap-1 justify-between">
                            <button
                                onClick={() => setActiveWorkspace(ws.id)}
                                className={`text-left w-full p-2 rounded ${activeWorkspace === ws.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {ws.name}
                            </button>
                            <button onClick={() => handleDeleteWorkspace(ws.id)} className="bg-red-500 p-2 rounded hover:bg-red-600 transition">X</button>
                        </div>
                    ))}
                    {workspaces.length === 0 && !showInput && (
                        <p className="text-gray-400 text-sm">No workspaces yet.</p>
                    )}
                </div>
                {showInput ? (
                    <div className="mt-4 flex flex-col gap-2">
                        <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Workspace Name"
                            className="bg-white p-1 px-2 text-black rounded text-sm "
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCreateWorkspace} className="bg-white p-1 border border-black rounded text-sm text-black hover:bg-gray-100">Save</button>
                            <button onClick={() => setShowInput(false)} className="bg-white p-1 border border-black rounded text-sm text-black hover:bg-gray-100">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowInput(true)} className="mt-4 w-full bg-white p-1 text-black text-sm rounded font-medium hover:bg-gray-200">
                        + New Workspace
                    </button>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Datasets</h2>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-4">
                    {datasets.map(ds => {
                        const isSelected = activeDataset === `ds_${ds.id}`;
                        return (
                            <div key={`ds-${ds.id}`} className="flex gap-1 group">
                                <button
                                    onClick={() => dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: `ds_${ds.id}` }))}
                                    className={`flex-1 text-left w-full p-2 truncate rounded transition ${isSelected ? 'bg-blue-600 border border-blue-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    title={ds.name}
                                >
                                    {ds.name}
                                </button>
                                <button
                                    onClick={(e) => handleDeleteDataset(e, ds.id)}
                                    className="bg-red-500 p-2 rounded hover:bg-red-600 transition"
                                    title="Delete Dataset"
                                >
                                    X
                                </button>
                            </div>
                        );
                    })}
                    {/* {datasets.length === 0 && (
                        <p className="text-gray-400 text-sm">No datasets here.</p>
                    )} */}
                </div>
                <div className="flex flex-col gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".csv, .xlsx" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!activeWorkspace || isUploading}
                        className={`w-full bg-white  p-2 text-black text-sm rounded font-medium  ${(!activeWorkspace || isUploading) && 'opacity-50 cursor-not-allowed'}`}
                    >
                        {isUploading ? "Uploading..." : "Upload File (.csv/xlsx)"}
                    </button>
                </div>
            </div>



            <div className="mt-auto">
                <h2 className="text-xl font-bold mb-4">Charts</h2>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setChartType("bar")}
                        className="bg-gray-700 p-2 rounded hover:bg-blue-500 transition font-medium"
                    >
                        Bar Chart
                    </button>
                    <button
                        onClick={() => setChartType("line")}
                        className="bg-gray-700 p-2 rounded hover:bg-blue-500 transition font-medium"
                    >
                        Line Chart
                    </button>
                    <button
                        onClick={() => setChartType("pie")}
                        className="bg-gray-700 p-2 rounded hover:bg-blue-500 transition font-medium"
                    >
                        Pie Chart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;