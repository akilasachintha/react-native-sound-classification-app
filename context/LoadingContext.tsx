import React, {createContext, ReactNode, useContext, useState} from 'react';

type LoadingContextType = {
    loading: boolean;
    showLoading: () => void;
    hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

type LoadingProviderProps = {
    children: ReactNode;
};

export const useLoadingContext = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoadingContext must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({children}) => {
    const [loading, setLoading] = useState(false);

    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);

    return (
        <LoadingContext.Provider value={{loading, showLoading, hideLoading}}>
            {children}
        </LoadingContext.Provider>
    );
};
