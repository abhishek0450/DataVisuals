import { useSelector, useDispatch } from "react-redux"
import { setActiveWorkspace, setChartForWorkspace } from "../store/workspaceSlice"
import Workspace from "../components/Workspace"
import Sidebar from "../components/Sidebar"

const Dashboard = () => {
    const dispatch = useDispatch();
    const activeWorkspace = useSelector(state => state.workspace.activeWorkspace);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-3 px-4 pb-4 md:px-6 md:pb-6">
            <Sidebar setChartType={(type) => dispatch(setChartForWorkspace({ workspaceId: activeWorkspace, chartType: type }))} activeWorkspace={activeWorkspace} setActiveWorkspace={(id) => dispatch(setActiveWorkspace(id))} />
            <div className="glass-panel panel-tint scroll-soft flex-1 overflow-y-auto border-2">
                {activeWorkspace ? (
                    <Workspace />
                ) : (
                    <div className="flex h-full items-center justify-center p-8">
                        <div className="soft-card max-w-xl rounded-2xl p-10 text-center">
                            <h2 className="mb-2 text-2xl font-bold text-slate-900">No workspace selected</h2>
                            <p className="text-base text-slate-600">Create or choose a workspace from the left panel to start analyzing data.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard