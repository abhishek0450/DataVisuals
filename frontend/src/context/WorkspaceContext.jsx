import React, { createContext, useState, useEffect } from 'react';

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [datasetMap, setDatasetMap] = useState(() => {
        const saved = localStorage.getItem('workspaceDataMap');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('workspaceDataMap', JSON.stringify(datasetMap));
    }, [datasetMap]);

    const setDatasetForWorkspace = (workspaceId, datasetName) => {
        setDatasetMap(prev => ({ ...prev, [workspaceId]: datasetName }));
    };

    return (
        <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace, datasetMap, setDatasetForWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
