import { useSelector, useDispatch } from "react-redux"
import { setActiveWorkspace, setChartForWorkspace } from "../store/workspaceSlice"
import Workspace from "../components/Workspace"
import Sidebar from "../components/Sidebar"

const Dashboard = () => {
    const dispatch = useDispatch();
    const activeWorkspace = useSelector(state => state.workspace.activeWorkspace);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar setChartType={(type) => dispatch(setChartForWorkspace({ workspaceId: activeWorkspace, chartType: type }))} activeWorkspace={activeWorkspace} setActiveWorkspace={(id) => dispatch(setActiveWorkspace(id))} />
            <div className="flex-1 overflow-y-auto">
                {activeWorkspace ? (
                    <Workspace />
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