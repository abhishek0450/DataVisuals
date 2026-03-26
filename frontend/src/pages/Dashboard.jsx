import { useState, useContext } from "react"
import Workspace from "../components/Workspace"
import Sidebar from "../components/Sidebar"
import { WorkspaceContext } from "../context/WorkspaceContext"

const Dashboard = () => {
    const [chartType, setChartType] = useState("bar");
    const { activeWorkspace, setActiveWorkspace } = useContext(WorkspaceContext);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar setChartType={setChartType} activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} />
            <div className="flex-1 overflow-y-auto">
                {activeWorkspace ? (
                    <Workspace chartType={chartType} activeWorkspace={activeWorkspace} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                        Please create or select a workspace from the sidebar.
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard