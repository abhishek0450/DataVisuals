import { createSlice } from '@reduxjs/toolkit';

const loadSavedMap = (key) => {
    const saved = localStorage.getItem(key);
    if (saved) {
        return JSON.parse(saved);
    } else {
        return {};
    }
};

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState: {
        activeWorkspace: null,
        datasetMap: loadSavedMap('workspaceDataMap'),
        chartMap: loadSavedMap('workspaceChartMap'),
    },
    reducers: {
        setActiveWorkspace: (state, action) => {
            state.activeWorkspace = action.payload;
        },
        setDatasetForWorkspace: (state, action) => {
            const { workspaceId, datasetName } = action.payload;
            state.datasetMap[workspaceId] = datasetName;
            localStorage.setItem('workspaceDataMap', JSON.stringify(state.datasetMap));
        },
        setChartForWorkspace: (state, action) => {
            const { workspaceId, chartType } = action.payload;
            state.chartMap[workspaceId] = chartType;
            localStorage.setItem('workspaceChartMap', JSON.stringify(state.chartMap));
        }
    }
});

export const { setActiveWorkspace, setDatasetForWorkspace, setChartForWorkspace } = workspaceSlice.actions;

export default workspaceSlice.reducer;
