const Sidebar = ({ setChartType }) => {
    return (
        <div className="w-64 bg-gray-800 text-white p-5">
            <h2 className="text-xl font-bold mb-6">Charts</h2>

            <div className="flex flex-col gap-4">
                <button
                    onClick={() => setChartType("bar")}
                    className="bg-gray-700 p-2 rounded hover:bg-blue-500"
                >
                    Bar Chart
                </button>

                <button
                    onClick={() => setChartType("line")}
                    className="bg-gray-700 p-2 rounded hover:bg-blue-500"
                >
                    Line Chart
                </button>

                <button
                    onClick={() => setChartType("pie")}
                    className="bg-gray-700 p-2 rounded hover:bg-blue-500"
                >
                    Pie Chart
                </button>
            </div>
        </div>
    )
}

export default Sidebar