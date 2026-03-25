import { useState } from "react"
import Workspace from "../components/Workspace"
import Sidebar from "../components/Sidebar"

const Dashboard = () => {
    const [chartType, setChartType] = useState("bar")

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar setChartType={setChartType} />
            <Workspace chartType={chartType} />
        </div>
    )
}

export default Dashboard