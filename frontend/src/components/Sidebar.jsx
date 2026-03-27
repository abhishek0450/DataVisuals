import { useState, useEffect } from "react";

const Sidebar = ({ setChartType, activeWorkspace, setActiveWorkspace }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/workspaces", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data && Array.isArray(data)) {
                setWorkspaces(data);
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
        if (!confirm("Are you sure you want to delete this workspace?")) return;
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

    return (
        <div className="w-64 bg-gray-800 text-white p-5 h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Workspaces</h2>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {workspaces.map(ws => (
                        <div className="flex gap-1 justify-between">
                            <button
                                key={ws.id}
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
                            className="bg-white p-1  px-2 text-black rounded text-sm "
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCreateWorkspace} className="bg-white p-1 border-1 border-black rounded text-sm text-black ">Save</button>
                            <button onClick={() => setShowInput(false)} className="bg-white p-1 border-1 border-black rounded text-sm text-black ">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowInput(true)} className="mt-4 w-full bg-white p-1 text-black text-sm rounded ">
                        + New Workspace
                    </button>
                )}
            </div>

            <div className="mt-auto">
                <h2 className="text-xl font-bold mb-4">Charts</h2>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setChartType("bar")}
                        className="bg-gray-700 p-2 rounded hover:bg-blue-500 transition"
                    >
                        Bar Chart
                    </button>
                    <button
                        onClick={() => setChartType("line")}
                        className="bg-gray-700 p-2 rounded hover:bg-blue-500 transition"
                    >
                        Line Chart
                    </button>
                    <button
                        onClick={() => setChartType("pie")}
                        className="bg-gray-700 p-2 rounded hover:bg-blue-500 transition"
                    >
                        Pie Chart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;